import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as argon from 'argon2';
import { RequestState, User } from '@prisma/client';
import { UpdateUserDTO } from './dto';
import { AdminService } from 'src/admin/admin.service';
import { ImageService } from 'src/image/image.service';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private adminService: AdminService,
    private imageService: ImageService,
  ) {}

  async getUsers(data: { page: number; pageSize: number; username: string }) {
    const users = await this.prisma.user.findMany({
      where: {
        username: {
          contains: data.username,
        },
      },
      select: {
        username: true,
        firstName: true,
        lastName: true,
        otherNames: true,
        id: true,
      },
      take: data.pageSize,
      skip: (data.page - 1) * data.pageSize,
      orderBy: {
        updatedAt: 'asc',
      },
    });

    return users;
  }

  async getUserProfile(userId: number) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId },
      include: {
        agencies: {
          where: {
            OR: [
              {
                userId: userId,
              },
              {
                agents: {
                  some: {
                    userId: userId,
                  },
                },
              },
            ],
          },
        },
        agents: {
          where: { userId: userId },
        },
        reportedCrimes: {
          where: { anonymous: false },
          select: {
            name: true,
            description: true,
          },
        },
        requestsTo: {
          where: { state: RequestState.PENDING },
          include: {
            fromUser: {
              select: {
                username: true,
                avatarUrl: true,
                id: true,
              },
            },
            agencies: {
              select: {
                name: true,
                about: true,
                avatarUrl: true,
                id: true,
              },
            },
          },
        },
      },
    });
    delete user.password;
    delete user.refreshToken;

    return {
      ...user,
      isAdmin: await this.adminService.isAdmin(userId),
    };
  }

  async getUser(user: User) {
    delete user.password;
    delete user.refreshToken;

    return {
      ...user,
      isAdmin: await this.adminService.isAdmin(user.id),
      requestsTo: await this.prisma.request.findMany({
        where: { toId: user.id, state: RequestState.PENDING },
        select: {
          id: true,
        },
      }),
    };
  }

  async updateToken(userId: number, refreshToken: string) {
    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          refreshToken: refreshToken ? await argon.hash(refreshToken) : null,
        },
      });
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException(
        'Something went wrong. Try again later.',
      );
    }
  }

  private async updateSingleField(
    userId: number,
    key: string,
    value: string | number,
  ) {
    try {
      return await this.prisma.user.update({
        where: { id: userId },
        data: {
          [key]: value,
        },
      });
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException(
        'Something went wrong. Try again later.',
      );
    }
  }

  private async updateMultipleFields(userId: number, keyAndValuePairs: object) {
    const userKeys = Object.keys(this.prisma.user.fields);

    Object.keys(keyAndValuePairs).forEach((key: string) => {
      if (!userKeys.includes(key)) delete keyAndValuePairs[key];
    });

    console.log('key value pairs', keyAndValuePairs);
    try {
      return await this.prisma.user.update({
        where: { id: userId },
        data: {
          ...keyAndValuePairs,
        },
      });
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException(
        'Something went wrong. Try again later.',
      );
    }
  }

  async updatePassword(userId: number, password: string): Promise<User> {
    return await this.updateSingleField(
      userId,
      'password',
      await argon.hash(password),
    );
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

  async updateUser(user: User, dto: UpdateUserDTO, file?: Express.Multer.File) {
    let accountUser = await this.ensureUserIdIsValid(dto.userId);

    dto.userId = Number(dto.userId);

    if (user.id !== dto.userId && (await this.adminService.isNotAdmin(user.id)))
      throw new UnauthorizedException('You cannot update this profile.');

    const data = {};
    Object.keys(dto).forEach((key: string) => {
      if (!dto[key] || ['deleteAvatarUrl', 'userId'].includes(key)) return;

      data[key] = dto[key];
    });

    let image = null;
    if (file)
      image = await this.imageService.storeAndCreateImage(
        {
          imageable: user,
          imageableType: 'user',
        },
        file,
      );

    if (
      (this.deleteAvatar(dto.deleteAvatarUrl) || image) &&
      accountUser.avatarUrl
    ) {
      this.imageService.deleteImageUsingUrl(accountUser.avatarUrl);
      data['avatarUrl'] = null;
    }

    if (image) data['avatarUrl'] = image.url;

    accountUser = await this.updateMultipleFields(accountUser.id, data);

    console.log(accountUser, data);
    delete accountUser.password;
    delete accountUser.refreshToken;

    return accountUser;
  }

  private deleteAvatar(deleteAvatarUrl: string | boolean) {
    if (typeof deleteAvatarUrl == 'boolean' && deleteAvatarUrl) return true;
    if (typeof deleteAvatarUrl == 'boolean' && !deleteAvatarUrl) return false;
    if (typeof deleteAvatarUrl == 'string' && deleteAvatarUrl == 'true')
      return true;

    return false;
  }

  async ensureUserIdIsValid(userId: string | number) {
    const accountUser = await this.prisma.user.findFirst({
      where: { id: Number(userId) },
    });

    if (accountUser) return accountUser;

    throw new BadRequestException(
      `User account with id of ${userId} was not found.`,
    );
  }
}
