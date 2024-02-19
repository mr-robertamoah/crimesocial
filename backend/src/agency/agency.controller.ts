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
import { FilesInterceptor } from '@nestjs/platform-express';
import { User } from '@prisma/client';
import { GetRequestUser } from '../auth/decorator';
import { CreateAgencyDTO, UpdateAgencyDTO } from './dto';
import { AgencyService } from './agency.service';
import { JwtGuard } from '../auth/guard';
import MulterConfigService from 'src/multer/multer-config.service';

@UseGuards(JwtGuard)
@Controller('agency')
export class AgencyController extends MulterConfigService {
  constructor(private service: AgencyService) {
    super();
  }

  @UseInterceptors(FilesInterceptor('files'))
  @Post()
  async createAgency(
    @GetRequestUser() user: User,
    @Body() dto: CreateAgencyDTO,
    @UploadedFiles(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({
          maxSize: 300000, // TODO replace with appropriate size
          message: 'Your image is too big. It should be below 30mb',
        })
        .build({
          fileIsRequired: false,
        }),
    )
    files: Array<Express.Multer.File>,
  ) {
    return await this.service.createAgency(user, dto, files);
  }

  @UseInterceptors(FilesInterceptor('files'))
  @Post(':agencyId')
  async updateAgency(
    @GetRequestUser() user: User,
    @Body() dto: UpdateAgencyDTO,
    @UploadedFiles(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({
          maxSize: 300000, // TODO replace with appropriate size
          message: 'Your image is too big. It should be below 30mb',
        })
        .build({
          fileIsRequired: false,
        }),
    )
    files: Array<Express.Multer.File>,
  ) {
    return await this.service.updateAgency(user, dto, files);
  }

  @Delete(':agencyId')
  async deleteAgency(
    @GetRequestUser() user: User,
    @Param('agencyId', new ParseIntPipe()) agencyId: number,
  ) {
    return await this.service.deleteAgency(user, agencyId);
  }

  @Post(':agencyId/verify')
  async verifyAgency(
    @GetRequestUser() user: User,
    @Param('agencyId', new ParseIntPipe()) agencyId: number,
  ) {
    return await this.service.verifyAgency(user, agencyId);
  }
}
