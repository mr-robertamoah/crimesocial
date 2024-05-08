import {
  Body,
  Controller,
  Delete,
  Get,
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
import { AddAgentsDTO } from './dto/add-agent.dto';

@Controller('agency')
export class AgencyController extends MulterConfigService {
  constructor(private service: AgencyService) {
    super();
  }

  @UseGuards(JwtGuard)
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

  @UseGuards(JwtGuard)
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

  @UseGuards(JwtGuard)
  @Delete(':agencyId')
  async deleteAgency(
    @GetRequestUser() user: User,
    @Param('agencyId', new ParseIntPipe()) agencyId: number,
  ) {
    return await this.service.deleteAgency(user, agencyId);
  }

  @Get(':agencyId')
  async getAgency(@Param('agencyId', new ParseIntPipe()) agencyId: number) {
    return await this.service.getAgency(agencyId);
  }

  @UseGuards(JwtGuard)
  @Post(':agencyId/verify')
  async verifyAgency(
    @GetRequestUser() user: User,
    @Param('agencyId', new ParseIntPipe()) agencyId: number,
  ) {
    return await this.service.verifyAgency(user, agencyId);
  }

  @UseGuards(JwtGuard)
  @Post(':agencyId/update-agents')
  async addOrRemoveAgents(
    @GetRequestUser() user: User,
    @Param('agencyId', new ParseIntPipe()) agencyId: number,
    @Body() dto: AddAgentsDTO,
  ) {
    return await this.service.addOrRemoveAgents(user, agencyId, dto);
  }
}
