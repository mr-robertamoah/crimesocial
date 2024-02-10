import { Body, Controller, Get, ParseFilePipeBuilder, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { User } from '@prisma/client';
import { GetRequestUser } from 'src/auth/decorator';
import { JwtGuard } from 'src/auth/guard';
import { UserService } from './user.service';
import { UpdateUserDTO } from './dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('user')
export class UserController {
  constructor(private service: UserService) {}

  @UseGuards(JwtGuard)
  @Get()
  getUser(@GetRequestUser() user: User) {
    delete user.password;
    delete user.refreshToken;

    return user;
  }

  @UseGuards(JwtGuard)
  @UseInterceptors(FileInterceptor('file'))
  @Post('/profile')
  async updateUser(
    @GetRequestUser() user: User,
    @Body() dto: UpdateUserDTO,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: 'image/*',
        })
        .addMaxSizeValidator({
          maxSize: 300000, // TODO replace with appropriate size
          message: 'Your image is too big. It should be below 30mb',
        })
        .build({
          fileIsRequired: false,
        }),
    )
    file?: Express.Multer.File,
  ) {
    return await this.service.updateUser(user, dto, file);
  }
}
