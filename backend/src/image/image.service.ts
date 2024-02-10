import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { FileService } from 'src/file/file.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ImageService {
  constructor(
    private prisma: PrismaService,
    private fileService: FileService,
  ) {}

  async deleteImageUsingUrl(url: string | null) {
    if (!url) return;
    const avatar = await this.prisma.avatar.findFirst({
      where: { url },
    });

    if (!avatar) return;

    await this.fileService.deleteFileFromStorage(avatar.path);

    return await this.prisma.avatar.delete({
      where: { url },
    });
  }

  async deleteImageOfUser(user: User) {
    if (!user.avatarUrl) return;

    const avatar = await this.prisma.avatar.findFirst({
      where: { url: user.avatarUrl },
    });

    if (!avatar) return;

    return await this.prisma.avatar.delete({
      where: { id: avatar.id },
    });
  }

  async storeAndCreateImage(user: User, file: Express.Multer.File) {
    const { path, url } = await this.fileService.storeFileAndGetDetails(file);

    return await this.createImage(user, { path, url });
  }

  private async createImage(user: User, data: { path: string; url: string }) {
    return await this.prisma.avatar.create({
      data: { userId: user.id, ...data },
    });
  }
}
