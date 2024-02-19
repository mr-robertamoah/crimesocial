import { BadRequestException, Injectable } from '@nestjs/common';
import { AdminService } from '../admin/admin.service';
import { AgencyService } from '../agency/agency.service';
import { AgentService } from '../agent/agent.service';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import CreateCrimeTypeDTO from './dto/create-crime-type.dto';
import UpdateCrimeTypeDTO from './dto/update-crime-type.dto';

type CrimeTypeRelations = {
  agencies?: {
    connect: { id: number };
  };
  agents?: {
    connect: { id: number };
  };
  users?: {
    connect: { id: number };
  };
};

@Injectable()
export class CrimeTypeService {
  constructor(
    private prisma: PrismaService,
    private agentService: AgentService,
    private agencyService: AgencyService,
    private adminService: AdminService,
  ) {}

  async getCrimeTypes(name: string) {
    return await this.prisma.crimeType.findMany({
      where: {
        name: {
          contains: name,
        },
      },
    });
  }

  async createCrimeType(user: User, dto: CreateCrimeTypeDTO) {
    if (dto.byType == 'Agent' && (await this.agentService.isNotAgent(user))) {
      throw new BadRequestException('You are not an agent.');
    }

    if (dto.byType == 'Agency' && (await this.agencyService.isNotAgent(user))) {
      throw new BadRequestException('You are not an agent on the agency.');
    }

    if (
      !dto.byId &&
      !dto.byType &&
      (await this.adminService.isNotAdmin(user.id))
    ) {
      throw new BadRequestException('You are not an administrator.');
    }

    const relations = this.getRelationship({
      agencyId: dto.byType == 'Agency' ? dto.byId : null,
      agentId: dto.byType == 'Agent' ? dto.byId : null,
      userId: dto.byType == 'User' ? dto.byId : null,
    });

    return await this.prisma.crimeType.create({
      data: {
        name: dto.name,
        description: dto.description,
        ...relations,
        crimeCategoryId: dto.crimeCategoryId,
      },
    });
  }

  private getRelationship(modelData: {
    agencyId?: null | number;
    agentId?: null | number;
    userId?: null | number;
  }): CrimeTypeRelations {
    const relations = modelData.agencyId
      ? { agencies: { connect: { id: modelData.agencyId } } }
      : modelData.agentId
        ? { agents: { connect: { id: modelData.agentId } } }
        : { users: { connect: { id: modelData.userId } } };

    return relations;
  }

  async updateCrimeType(
    user: User,
    crimeTypeId: number,
    dto: UpdateCrimeTypeDTO,
  ) {
    const crimeType = await this.prisma.crimeType.findUnique({
      where: {
        id: crimeTypeId,
      },
      include: {
        agents: {
          select: { userId: true },
        },
        users: {
          select: { id: true },
        },
        agencies: {
          select: { agents: { select: { userId: true } } },
        },
      },
    });

    if (
      !(crimeType.users.length && crimeType.users[0].id == user.id) &&
      !(crimeType.agents.length && crimeType.agents[0].userId == user.id) &&
      !(
        crimeType.agencies.length &&
        crimeType.agencies[0].agents.includes({ userId: user.id })
      )
    ) {
      throw new BadRequestException('You are not an agent.');
    }

    const data: { name?: string; description?: string } = {};
    Object.keys(dto).forEach((key) => {
      if (dto[key]) data[key] = dto[key];
    });

    return await this.prisma.crimeType.update({
      where: { id: crimeTypeId },
      data: {
        ...data,
      },
    });
  }
}
