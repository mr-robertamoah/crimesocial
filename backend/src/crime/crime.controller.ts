import {
  Body,
  Controller,
  Delete,
  Param,
  ParseFilePipeBuilder,
  ParseIntPipe,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CrimeService } from './crime.service';
import { GetRequestUser } from '../auth/decorator';
import { User } from '@prisma/client';
import CreateCrimeDTO from './dto/create-crime.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import UpdateCrimeDTO from './dto/update-crime.dto';
import { JwtGuard } from '../auth/guard';

@UseGuards(JwtGuard)
@Controller('crime')
export class CrimeController {
  constructor(private service: CrimeService) {}

  @Post('')
  @UseInterceptors(FilesInterceptor('files'))
  async createCrime(
    @GetRequestUser() user: User,
    @Body() dto: CreateCrimeDTO,
    @UploadedFiles(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({
          maxSize: 300000, // TODO replace with appropriate size
          message: 'Your image/video is too big. It should be below 30mb',
        })
        .build({
          fileIsRequired: false,
        }),
    )
    files?: Array<Express.Multer.File>,
  ) {
    return await this.service.createCrime(user, dto, files ?? []);
  }

  @UseInterceptors(FilesInterceptor('files'))
  @Post(':crimeId')
  async updateCrime(
    @GetRequestUser() user: User,
    @Body() dto: UpdateCrimeDTO,
    @UploadedFiles(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: 'image/*', // TODO make it accept videos too
        })
        .addMaxSizeValidator({
          maxSize: 300000, // TODO replace with appropriate size
          message: 'Your image/video is too big. It should be below 30mb',
        })
        .build({
          fileIsRequired: false,
        }),
    )
    files?: Array<Express.Multer.File>,
  ) {
    return await this.service.updateCrime(user, dto, files ?? []);
  }

  @Delete(':crimeId')
  async deleteCrime(
    @GetRequestUser() user: User,
    @Param('crimeId', new ParseIntPipe()) crimeId: number,
  ) {
    return await this.service.deleteCrime(user, crimeId);
  }
}
