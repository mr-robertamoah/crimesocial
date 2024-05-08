import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

type PostRelations = {
  agency?: {
    connect: { id: number };
  };
  crime?: {
    connect: { id: number };
  };
};
@Injectable()
export class PostService {
  constructor(private prisma: PrismaService) {}

  async getPosts(page: number = 1, pageSize: number = 10) {
    const posts = await this.prisma.post.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: {
        updatedAt: 'desc',
      },
      include: {
        crime: {
          include: {
            files: true,
            crimeType: true,
          },
        },
        agency: {
          include: {
            files: true,
            agents: {
              select: { userId: true, _count: true },
            },
          },
        },
        user: true,
      },
    });

    posts.map((post) => {
      if (!post.crime?.length) return post;
      post.crime[0].files = post.crime[0].files.map((file) => {
        delete file.path;
        return file;
      });

      delete post.user.password;
      delete post.user.refreshToken;

      return post;
    });

    return posts;
  }

  async createPostFrom(data: {
    agencyId?: number;
    crimeId?: number;
    userId: number;
  }) {
    const relations = this.getRelationship(
      data.agencyId ? { agencyId: data.agencyId } : { crimeId: data.crimeId },
    );

    return await this.prisma.post.create({
      data: {
        userId: data.userId,
        ...relations,
      },
      include: {
        crime: {
          include: {
            files: true,
            crimeType: true,
          },
        },
        agency: {
          include: {
            files: true,
            agents: {
              select: { userId: true, _count: true },
            },
          },
        },
        user: true,
      },
    });
  }

  private getRelationship(modelData: {
    agencyId?: null | number;
    crimeId?: null | number;
  }): PostRelations {
    const relations = modelData.agencyId
      ? { agency: { connect: { id: modelData.agencyId } } }
      : { crime: { connect: { id: modelData.crimeId } } };

    return relations;
  }

  async getPostFor(data: { postableType: string; postableId: number }) {
    const relation =
      data.postableType == 'crime'
        ? { crime: { some: { id: data.postableId } } }
        : { agency: { some: { id: data.postableId } } };
    return await this.prisma.post.findFirst({
      where: {
        ...relation,
      },
      include: {
        crime: {
          include: {
            files: true,
            crimeType: true,
          },
        },
        agency: {
          include: {
            files: true,
            agents: {
              select: { userId: true, _count: true },
            },
          },
        },
        user: true,
      },
    });
  }

  async deletePostFor(data: { postableType: string; postableId: number }) {
    const relation =
      data.postableType == 'crime'
        ? { crime: { some: { id: data.postableId } } }
        : { agency: { some: { id: data.postableId } } };
    const post = await this.prisma.post.findFirst({
      where: {
        ...relation,
      },
    });

    if (!post) return null;

    return await this.prisma.post.delete({
      where: {
        id: post.id,
      },
    });
  }
}
