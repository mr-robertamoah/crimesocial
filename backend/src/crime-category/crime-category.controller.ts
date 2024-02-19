import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CrimeCategoryService } from './crime-category.service';
import { JwtGuard } from '../auth/guard';
import CreateCrimeCategoryDTO from './dto/create-crime-category.dto';
import { GetRequestUser } from '../auth/decorator';
import { User } from '@prisma/client';
import UpdateCrimeCategoryDTO from './dto/update-crime-category.dto';

@Controller('crime-category')
export class CrimeCategoryController {
  constructor(private service: CrimeCategoryService) {}

  @UseGuards(JwtGuard)
  @Post()
  async createCrimeCategory(
    @GetRequestUser() user: User,
    @Body() dto: CreateCrimeCategoryDTO,
  ) {
    return await this.service.createCrimeCategory(user, dto);
  }

  @UseGuards(JwtGuard)
  @Post(':crimeCategoryId')
  async updateCrimeCategory(
    @GetRequestUser() user: User,
    @Param('crimeCategoryId', ParseIntPipe) crimeCategoryId: number,
    @Body() dto: UpdateCrimeCategoryDTO,
  ) {
    return await this.service.updateCrimeCategory(user, crimeCategoryId, dto);
  }
}
