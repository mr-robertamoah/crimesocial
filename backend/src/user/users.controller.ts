import {
  Controller,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';

@Controller('users')
export class UsersController {
  constructor(private service: UserService) {}

  @Get()
  async getUser(
    @Query('username', new DefaultValuePipe(''), ParseIntPipe) username: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe)
    pageSize: number = 10,
  ) {
    return await this.service.getUsers({
      page,
      pageSize,
      username,
    });
  }
}
