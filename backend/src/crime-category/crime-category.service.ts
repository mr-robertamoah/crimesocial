import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import CreateCrimeCategoryDTO from './dto/create-crime-category.dto';
import { AgentService } from '../agent/agent.service';
import { AgencyService } from '../agency/agency.service';
import UpdateCrimeCategoryDTO from './dto/update-crime-category.dto';
import { AdminService } from '../admin/admin.service';

type CrimeCategoryRelations = {
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
export class CrimeCategoryService {
  constructor(
    private prisma: PrismaService,
    private agentService: AgentService,
    private agencyService: AgencyService,
    private adminService: AdminService,
  ) {}

  async createCrimeCategory(user: User, dto: CreateCrimeCategoryDTO) {
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

    return await this.prisma.crimeCategory.create({
      data: {
        name: dto.name,
        description: dto.description,
        ...relations,
      },
    });
  }

  private getRelationship(modelData: {
    agencyId?: null | number;
    agentId?: null | number;
    userId?: null | number;
  }): CrimeCategoryRelations {
    const relations = modelData.agencyId
      ? { agencies: { connect: { id: modelData.agencyId } } }
      : modelData.agentId
        ? { agents: { connect: { id: modelData.agentId } } }
        : { users: { connect: { id: modelData.userId } } };

    return relations;
  }

  async updateCrimeCategory(
    user: User,
    crimeCategoryId: number,
    dto: UpdateCrimeCategoryDTO,
  ) {
    const crimeCategory = await this.prisma.crimeCategory.findUnique({
      where: {
        id: crimeCategoryId,
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
      !(crimeCategory.users.length && crimeCategory.users[0].id == user.id) &&
      !(
        crimeCategory.agents.length && crimeCategory.agents[0].userId == user.id
      ) &&
      !(
        crimeCategory.agencies.length &&
        crimeCategory.agencies[0].agents.includes({ userId: user.id })
      )
    ) {
      throw new BadRequestException('You are not an agent.');
    }

    const data: { name?: string; description?: string } = {};
    Object.keys(dto).forEach((key) => {
      if (dto[key]) data[key] = dto[key];
    });

    return await this.prisma.crimeCategory.update({
      where: { id: crimeCategoryId },
      data: {
        ...data,
      },
    });
  }
}
