import { Injectable } from '@nestjs/common';
import { Agency, User } from '@prisma/client';
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

  async deleteImageFor(data: {
    imageableType: string;
    imageable: User | Agency;
  }) {
    if (!data.imageable.avatarUrl) return;

    const avatar = await this.prisma.avatar.findFirst({
      where: { url: data.imageable.avatarUrl },
    });

    if (!avatar) return;

    return await this.prisma.avatar.delete({
      where: { id: avatar.id },
    });
  }

  async storeAndCreateImage(
    data: {
      imageableType: string;
      imageable: User | Agency;
    },
    file: Express.Multer.File,
  ) {
    const { path, url } = await this.fileService.storeFileAndGetDetails(file);

    return await this.createImage({
      path,
      url,
      imageableId: data.imageable.id,
      imageableType: data.imageableType,
    });
  }

  private async createImage(data: {
    path: string;
    url: string;
    imageableType: string;
    imageableId: number;
  }) {
    const relations =
      data.imageableType == 'user'
        ? { users: { connect: { id: data.imageableId } } }
        : { agencies: { connect: { id: data.imageableId } } };

    return await this.prisma.avatar.create({
      data: {
        ...data,
        ...relations,
      },
    });
  }
}
