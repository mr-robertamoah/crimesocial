import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as argon from 'argon2';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async updateToken(userId: number, refreshToken: string) {
    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: { refreshToken: await argon.hash(refreshToken) },
      });
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException(
        'Something went wrong. Try again later.',
      );
    }
  }

  async createUser(username: string, password: string) {
    let user = null;
    try {
      user = await this.prisma.user.create({
        data: { username, password },
      });
    } catch (err) {
      throw new InternalServerErrorException(
        'Something went wrong. Try again later.',
      );
    }

    return user;
  }
}
