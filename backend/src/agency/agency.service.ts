import { PostService } from '../post/post.service';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AgencyType, FileableType, PostableType, User } from '@prisma/client';
import { CreateAgencyDTO, UpdateAgencyDTO } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { FileService } from 'src/file/file.service';
import { AdminService } from 'src/admin/admin.service';

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
  ) {}

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

    const fileModels = await this.fileService.createAndStoreFilesFor(
      { userId: user.id, modelId: agency.id, modelType: 'Crime' },
      files,
    );

    await this.postService.createPostFrom({
      postableId: agency.id,
      postableType: PostableType.Agency,
      userId: user.id,
    });

    return {
      ...agency,
      files: fileModels.map((f) => {
        delete f.path;
        delete f.fileableId;
        delete f.fileableType;
        return f;
      }),
    };
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
          modelType: FileableType.Agency,
          modelId: agency.id,
        },
        files,
      );

    if (dto.deletedFiles) {
      this.fileService.deleteFilesUsingIds(JSON.parse(dto.deletedFiles));
    }

    agency = await this.prisma.updateMultipleFields({
      field: 'crime',
      fieldId: agency.id,
      keyAndValuePairs: data,
      include: { files: true },
    });

    await this.fileService.createAndStoreFilesFor(
      { userId: user.id, modelId: agency.id, modelType: 'Agency' },
      files,
    );

    return agency;
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

    return await this.prisma.crime.delete({
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
}
