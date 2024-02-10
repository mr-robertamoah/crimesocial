import { PostableType } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PostService {
  constructor(private prisma: PrismaService) {}

  async createPostFrom(data: {
    postableId: number;
    postableType: PostableType;
    userId: number;
  }) {
    return await this.prisma.post.create({
      data: { ...data },
    });
  }
}
