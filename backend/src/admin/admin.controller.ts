import {
  Body,
  Controller,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtGuard } from '../auth/guard';
import { GetRequestUser } from 'src/auth/decorator';
import { User } from '@prisma/client';

@UseGuards(JwtGuard)
@Controller('admin')
export class AdminController {
  constructor(private service: AdminService) {}

  @Post()
  async createAdmin(
    @GetRequestUser() user: User,
    @Body('userId', new ParseIntPipe()) userId: number,
  ) {
    return await this.service.createAdmin(user, userId);
  }
}
