import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { rmSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { File, FileableType } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

type FileDetailType = {
  url: string;
  path: string;
  mime: string;
  size: number;
};

@Injectable()
export class FileService {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  async deleteFilesUsingIds(
    ids: Array<string | number>,
    throwError: boolean = true,
  ) {
    const filesToDelete: Array<string> = [];

    ids.forEach(async (id) => {
      const file = await this.prisma.file.findFirst({
        where: { id: Number(id) },
      });

      if (!file && throwError)
        throw new BadRequestException(
          `Sorry the file with id: ${id} was not found.`,
        );

      filesToDelete.push(file.path);
    });

    this.deleteFiles(filesToDelete, throwError);
  }

  deleteFiles(filesToDelete: Array<string>, throwError: boolean = true) {
    filesToDelete.forEach((filePath) => {
      if (!existsSync(filePath) && throwError)
        throw new BadRequestException('Path to the file does not exits.');
    });

    filesToDelete.forEach((filePath) => {
      this.deleteFileFromStorage(filePath);
    });
  }

  async createAndStoreFilesFor(
    modelData: { userId: number; modelType: FileableType; modelId: number },
    files: Array<Express.Multer.File>,
  ) {
    let data: FileDetailType;
    let fileModels: Array<File>;

    files.forEach(async (file) => {
      data = await this.storeFileAndGetDetails(file);
      fileModels.push(await this.createFileFor(modelData, data));
    });

    return fileModels;
  }

  async createFileFor(
    modelData: { userId: number; modelType: FileableType; modelId: number },
    data: FileDetailType,
  ) {
    return await this.prisma.file.create({
      data: {
        fileableType: modelData.modelType,
        fileableId: modelData.modelId,
        userId: modelData.userId,
        ...data,
      },
    });
  }

  async deleteFileFromStorage(path: string) {
    try {
      rmSync(path, { force: true });
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException(
        'Something unusual happened while deleting a file. Please try again later.',
      );
    }
  }

  async storeFileAndGetDetails(
    file: Express.Multer.File,
  ): Promise<FileDetailType> {
    const { originalname, buffer, mimetype, size } = file;
    const date = new Date();
    const fileName = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}-${date.getTime()}-${originalname}`;
    const path = join(process.cwd(), 'uploads', fileName);
    const url = `${this.configService.get('APP_URL')}/api/uploads/${fileName}`;

    writeFileSync(path, buffer);

    return { url, path, mime: mimetype, size };
  }
}
