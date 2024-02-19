import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { GetRequestUser } from '../auth/decorator';
import { CrimeTypeService } from './crime-type.service';
import { JwtGuard } from '../auth/guard';
import CreateCrimeTypeDTO from './dto/create-crime-type.dto';
import { User } from '@prisma/client';
import UpdateCrimeTypeDTO from './dto/update-crime-type.dto';

@Controller('crime-types')
export class CrimeTypeController {
  constructor(private service: CrimeTypeService) {}

  @UseGuards(JwtGuard)
  @Post()
  async createCrimeType(
    @GetRequestUser() user: User,
    @Body() dto: CreateCrimeTypeDTO,
  ) {
    return await this.service.createCrimeType(user, dto);
  }

  @UseGuards(JwtGuard)
  @Post(':crimeTypeId')
  async updateCrimeType(
    @GetRequestUser() user: User,
    @Param('crimeTypeId', ParseIntPipe) crimeTypeId: number,
    @Body() dto: UpdateCrimeTypeDTO,
  ) {
    return await this.service.updateCrimeType(user, crimeTypeId, dto);
  }

  @Get()
  async getCrimeTypes(@Param('name', new DefaultValuePipe('')) name: string) {
    return await this.service.getCrimeTypes(name);
  }
}
