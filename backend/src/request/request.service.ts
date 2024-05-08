import { User, RequestState, Agent, Agency } from '@prisma/client';
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AgentService } from 'src/agent/agent.service';

type RequestRelations = {
  agencies?: {
    connect: { id: number };
  };
};

type RequestType = {
  agencies?: Array<Agency>;
  fromUser?: User;
  toUser?: User;
  id: number;
  fromId: number;
  toId: number;
  message?: string;
  state: RequestState;
};

@Injectable()
export class RequestService {
  constructor(
    private prisma: PrismaService,
    private agentService: AgentService,
  ) {}

  async createRequestFor(data: {
    fromId: number;
    toId: number;
    message?: string;
    agencyId?: number;
  }) {
    const relations = this.getRelationship({ agencyId: data.agencyId });

    return await this.prisma.request.create({
      data: {
        fromId: data.fromId,
        toId: data.toId,
        message: data.message ?? '',
        ...relations,
      },
    });
  }

  async respondToRequest(
    user: User,
    requestId: number,
    response: RequestState,
  ) {
    const request = await this.ensureRequestIdIsValid(requestId);

    await this.ensureUserCanRespondTo(request, user);

    this.ensureResponseIsValid(response);

    await this.prisma.request.update({
      where: { id: request.id },
      data: {
        state: response,
      },
    });

    return await this.performActionBasedOnResponse(request, response);
  }

  async performActionBasedOnResponse(
    request: RequestType,
    response: RequestState,
  ): Promise<Agent | null> {
    if (response == RequestState.DECLINED) return null;

    if (request.agencies?.length) {
      return await this.agentService.createAgentFor(
        request.agencies[0],
        this.isRequestToAgency(request) ? request.fromUser : request.toUser,
      );
    }
  }

  private isRequestToAgency(request: RequestType) {
    return (
      request.agencies?.length && request.toId == request.agencies[0].userId
    );
  }

  async ensureUserCanRespondTo(request: RequestType, user: User) {
    if (
      user.id == request.toId ||
      (this.isRequestToAgency(request) &&
        (await this.agentService.isSuperAgentFor(request.agencies[0], user)))
    )
      return;

    throw new BadRequestException(
      'You are not authorized to respond to this request',
    );
  }

  ensureResponseIsValid(response: RequestState) {
    if (RequestState.ACCEPTED == response || RequestState.DECLINED == response)
      return;

    throw new BadRequestException(`${response} is not a valid response`);
  }

  async ensureRequestIdIsValid(requestId: string | number) {
    const request = await this.prisma.request.findFirst({
      where: { id: Number(requestId) },
      include: { agencies: true, fromUser: true, toUser: true },
    });

    if (request) return request;

    throw new BadRequestException(
      `Request with id of ${requestId} was not found.`,
    );
  }

  private getRelationship(modelData: {
    agencyId?: null | number;
  }): RequestRelations {
    const relations = modelData.agencyId
      ? { agencies: { connect: { id: modelData.agencyId } } }
      : {};

    return relations;
  }

  async getRequests(user: User, page: number, pageSize: number) {
    return await this.prisma.request.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
      where: {
        toId: user.id,
      },
    });
  }
}
