import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Agency, AgentType, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import UpdateAgentDTO from './dto/update-agent.dto';
import { AdminService } from 'src/admin/admin.service';

@Injectable()
export class AgentService {
  constructor(
    private prisma: PrismaService,
    private adminService: AdminService,
  ) {}

  async leaveAgency(user: User, agentId: number) {
    const agent = await this.ensureAgentIdIsValid(agentId);

    if (
      agent.userId !== user.id ||
      (await this.adminService.isNotAdmin(user.id))
    )
      throw new UnauthorizedException(
        'You are not authorized to use this agent.',
      );

    return await this.prisma.agent.delete({
      where: { id: agent.id },
    });
  }

  async ensureUserCanAddAgentTo(agency: Agency, user: User) {
    if (agency.userId == user.id || (await this.adminService.isAdmin(user.id)))
      return;

    throw new UnauthorizedException(
      'You are not authorized to handle agents for this agency',
    );
  }

  async updateAgent(user: User, agentId: number, dto: UpdateAgentDTO) {
    const agent = await this.ensureAgentIdIsValid(agentId);

    await this.ensureUserCanAddAgentTo(agent.agency, user);

    const data: { position?: string; type?: AgentType } = {};
    Object.keys(dto).forEach((key: string) => {
      if (!dto[key]) return;

      data[key] = dto[key];
    });

    return await this.prisma.agent.update({
      where: { id: agentId },
      data: { ...data },
    });
  }

  async ensureAgentIdIsValid(agentId: string | number) {
    const agent = await this.prisma.agent.findFirst({
      where: { id: Number(agentId) },
      include: {
        agency: true,
      },
    });

    if (agent) return agent;

    throw new BadRequestException(`Agent with id of ${agentId} was not found.`);
  }

  async isAgent(user: User) {
    const agent = await this.prisma.agent.findFirst({
      where: {
        userId: user.id,
      },
    });

    return !!agent;
  }

  async isAgentFor(agency: Agency, user: User) {
    const agent = await this.prisma.agent.findFirst({
      where: {
        OR: [
          {
            userId: user.id,
            agencyId: agency.id,
          },
          {
            agency: {
              userId: user.id,
            },
          },
        ],
      },
    });

    return !!agent;
  }

  async isSuperAgentFor(agency: Agency, user: User) {
    const agent = await this.prisma.agent.findFirst({
      where: {
        OR: [
          {
            userId: user.id,
            agencyId: agency.id,
            type: AgentType.SUPER,
          },
          {
            agency: {
              userId: user.id,
            },
          },
        ],
      },
    });

    return !!agent;
  }

  async isNotAgent(user: User) {
    return !(await this.isAgent(user));
  }

  async isNotAgentFor(agency: Agency, user: User) {
    return !(await this.isAgentFor(agency, user));
  }

  async deleteAgentsUsingIds(ids: Array<number | string>) {
    const agentIds: Array<number> = ids.map((id) => Number(id));
    return await this.prisma.agent.deleteMany({
      where: {
        id: {
          in: agentIds,
        },
      },
    });
  }

  async createAgentFor(agency: Agency, user: User, type: string = 'NORMAL') {
    const data: {
      agencyId: number;
      userId: number;
      type: AgentType;
      position: string;
    } = {
      agencyId: agency.id,
      userId: user.id,
      type:
        AgentType.SUPER == type.toUpperCase()
          ? AgentType.SUPER
          : AgentType.NORMAL,
      position: '',
    };

    return await this.prisma.agent.create({
      data: { ...data },
    });
  }
}
