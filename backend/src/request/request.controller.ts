import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RequestService } from './request.service';
import { JwtGuard } from 'src/auth/guard';
import { GetRequestUser } from 'src/auth/decorator';
import { User } from '@prisma/client';
import ResponseDTO from 'src/user/dto/dto/response.dto';

@Controller('request')
export class RequestController {
  constructor(private service: RequestService) {}

  @UseGuards(JwtGuard)
  @Post(':requestId')
  async respondToRequest(
    @GetRequestUser() user: User,
    @Param('requestId', ParseIntPipe) requestId: number,
    @Body() dto: ResponseDTO,
  ) {
    return await this.service.respondToRequest(user, requestId, dto.response);
  }

  @UseGuards(JwtGuard)
  @Get()
  async getRequests(
    @GetRequestUser() user: User,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
  ) {
    return await this.service.getRequests(user, page, pageSize);
  }
}
