import { PostService } from '../post/post.service';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AgencyType, AgentType, Request, User } from '@prisma/client';
import { CreateAgencyDTO, UpdateAgencyDTO } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { FileService } from 'src/file/file.service';
import { AdminService } from 'src/admin/admin.service';
import { AddAgentsDTO } from './dto/add-agent.dto';
import { AgentService } from 'src/agent/agent.service';
import { RequestService } from 'src/request/request.service';
import { request } from 'http';

type AgencyDataType = {
  type?: AgencyType;
  name?: string;
  about?: string;
};
@Injectable()
export class AgencyService {
  constructor(
    private prisma: PrismaService,
    private fileService: FileService,
    private postService: PostService,
    private adminService: AdminService,
    private agentService: AgentService,
    private requestService: RequestService,
  ) {}

  async isAgent(user: User) {
    const agency = await this.prisma.agency.findFirst({
      where: {
        OR: [
          {
            userId: user.id,
          },
          {
            agents: {
              some: {
                userId: user.id,
              },
            },
          },
        ],
      },
    });

    return !!agency;
  }

  async isNotAgent(user: User) {
    return !(await this.isAgent(user));
  }

  async createAgency(
    user: User,
    dto: CreateAgencyDTO,
    files: Array<Express.Multer.File>,
  ) {
    const data = {
      type: dto.type,
      name: dto.name,
      about: dto.about,
    };

    const post = await this.prisma.$transaction(async () => {
      const agency = await this.prisma.agency.create({
        data: {
          ...data,
          userId: user.id,
          type:
            dto.type == AgencyType.GOVERNMENT
              ? AgencyType.GOVERNMENT
              : AgencyType.NONPROFIT,
        },
      });

      await this.fileService.createAndStoreFilesFor(
        { userId: user.id, agencyId: agency.id },
        files,
      );

      return await this.postService.createPostFrom({
        agencyId: agency.id,
        userId: user.id,
      });
    });

    post.agency[0].files = post.agency[0].files.map((file) => {
      delete file.path;
      return file;
    });

    delete post.user.password;
    delete post.user.refreshToken;

    return post;
  }

  async updateAgency(
    user: User,
    dto: UpdateAgencyDTO,
    files: Array<Express.Multer.File>,
  ) {
    let agency = await this.ensureAgencyIdIsValid(dto.agencyId);

    if (
      user.id !== agency.userId &&
      (await this.adminService.isNotAdmin(user.id))
    )
      throw new UnauthorizedException('You cannot update this agency.');

    const data: AgencyDataType = {};
    Object.keys(dto).forEach((key: string) => {
      if (!dto[key] || ['deletedFiles', 'agencyId'].includes(key)) return;

      data[key] = dto[key];
    });

    if (files && files.length)
      await this.fileService.createAndStoreFilesFor(
        {
          userId: user.id,
          agencyId: agency.id,
        },
        files,
      );

    if (dto.deletedFiles) {
      this.fileService.deleteFilesUsingIds(JSON.parse(dto.deletedFiles));
    }

    agency = await this.prisma.updateMultipleFields({
      field: 'agency',
      fieldId: agency.id,
      keyAndValuePairs: data,
      include: { files: true },
    });

    agency.files = agency.files.map((file) => {
      delete file.path;
      return file;
    });

    const post = await this.postService.getPostFor({
      postableType: 'agency',
      postableId: agency.id,
    });

    post.agency[0].files = post.agency[0].files.map((file) => {
      delete file.path;
      return file;
    });

    return post;
  }

  async ensureAgencyIdIsValid(agencyId: string | number) {
    const agency = await this.prisma.agency.findFirst({
      where: { id: Number(agencyId) },
      include: { files: true },
    });

    if (agency) return agency;

    throw new BadRequestException(
      `Agency with id of ${agencyId} was not found.`,
    );
  }

  async deleteAgency(user: User, agencyId: number) {
    const agency = await this.ensureAgencyIdIsValid(agencyId);

    if (
      user.id !== agency.userId &&
      (await this.adminService.isNotAdmin(user.id))
    )
      throw new UnauthorizedException('You cannot delete this agency.');

    if (agency?.files && agency.files?.length)
      await this.fileService.deleteFilesUsingIds(
        agency.files.map((file) => file.id),
      );

    await this.postService.getPostFor({
      postableType: 'agency',
      postableId: agency.id,
    });

    return await this.prisma.agency.delete({
      where: { id: agency.id },
    });
  }

  async verifyAgency(user: User, agencyId: number) {
    if (await this.adminService.isNotAdmin(user.id)) {
      throw new UnauthorizedException(
        'You are not authorized to verify this agency.',
      );
    }

    await this.prisma.agency.update({
      where: { id: agencyId },
      data: { verifiedAt: Date() },
    });
  }

  async getAgency(agencyId: number) {
    return await this.prisma.agency.findFirst({
      where: { id: agencyId },
      include: {
        files: {
          select: {
            url: true,
            name: true,
          },
        },
        user: {
          select: {
            username: true,
            avatarUrl: true,
            id: true,
          },
        },
        agents: {
          include: {
            user: {
              select: {
                username: true,
                avatarUrl: true,
                id: true,
              },
            },
          },
        },
      },
    });
  }

  async addOrRemoveAgents(user: User, agencyId: number, dto: AddAgentsDTO) {
    const agency = await this.ensureAgencyIdIsValid(agencyId);

    await this.agentService.ensureUserCanAddAgentTo(agency, user);

    await this.agentService.deleteAgentsUsingIds(dto.removedAgents);

    const requests: Array<Request> = [];

    dto.potentialAgents.forEach(async (potentialAgent) => {
      requests.push(
        await this.requestService.createRequestFor({
          fromId: user.id,
          toId: potentialAgent.userId,
          agencyId: agency.id,
          message: `become agent of ${agency.name} agency`,
        }),
      );
    });

    return requests;
  }
}
