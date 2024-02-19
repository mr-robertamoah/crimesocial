import { Injectable } from '@nestjs/common';
import { SuggestionType } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

type SuggestionRelations = {
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
export class SuggestionService {
  constructor(private prisma: PrismaService) {}

  async createSuggestionFor(data: {
    byId: number;
    byType: string;
    type: SuggestionType;
    message: string;
  }) {
    const relations = this.getRelationship({
      agencyId: data.byType == 'Agency' ? data.byId : null,
      agentId: data.byType == 'Agent' ? data.byId : null,
      userId: data.byType == 'User' ? data.byId : null,
    });
    return await this.prisma.suggestion.create({
      data: {
        type: data.type,
        message: data.message,
        ...relations,
      },
    });
  }

  private getRelationship(modelData: {
    agencyId?: null | number;
    agentId?: null | number;
    userId?: null | number;
  }): SuggestionRelations {
    const relations = modelData.agencyId
      ? { agencies: { connect: { id: modelData.agencyId } } }
      : modelData.agentId
        ? { agents: { connect: { id: modelData.agentId } } }
        : { users: { connect: { id: modelData.userId } } };

    return relations;
  }
}
