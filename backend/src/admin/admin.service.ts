import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AdminType, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async isAdmin(userId: number) {
    const admin = await this.prisma.admin.findFirst({
      where: { userId },
    });

    return !!admin;
  }

  async isNotAdmin(userId: number) {
    return !(await this.isAdmin(userId));
  }

  async isSuperAdmin(userId: number) {
    const superAdmin = await this.prisma.admin.findFirst({
      where: { userId, type: AdminType.SUPERADMIN },
    });

    return !!superAdmin;
  }

  async isNotSuperAdmin(userId: number) {
    return !(await this.isSuperAdmin(userId));
  }

  async deleteAdmin(user: User) {
    const admin = await this.prisma.admin.findFirst({
      where: { userId: user.id },
    });

    if (!admin) return;

    return await this.prisma.admin.delete({
      where: { id: admin.id },
    });
  }

  async createAdmin(user: User, adminUserId: number) {
    if (this.isNotSuperAdmin(user.id))
      throw new UnauthorizedException(
        'You are not authorized to make a user an administrator.',
      );

    if (this.isAdmin(adminUserId))
      throw new BadRequestException('User is already an administrator.');

    return await this.prisma.admin.create({
      data: { userId: adminUserId, type: AdminType.ADMIN },
    });
  }
}
