import { Controller, Get, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { GetRequestUser } from 'src/auth/decorator';
import { JwtGuard } from 'src/auth/guard';

@Controller('user')
export class UserController {
  @UseGuards(JwtGuard)
  @Get()
  getUser(@GetRequestUser() user: User) {
    delete user.password;
    delete user.refreshToken;

    return user;
  }
}
