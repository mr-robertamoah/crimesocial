import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AgentService {
  constructor(private prisma: PrismaService) {}

  async isAgent(user: User) {
    const agent = await this.prisma.agent.findFirst({
      where: {
        userId: user.id,
      },
    });

    return !!agent;
  }

  async isNotAgent(user: User) {
    return !(await this.isAgent(user));
  }
}
