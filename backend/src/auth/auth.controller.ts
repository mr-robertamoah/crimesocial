import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SigninDTO, SignupDTO } from './dto';
import { JwtGuard, JwtRefreshGuard } from './guard';
import { RefreshTokenDTO } from './dto/refreshToken.dto';
import { User } from '@prisma/client';
import { GetRequestUser } from './decorator';

@Controller('auth')
export class AuthController {
  constructor(private service: AuthService) {}

  @Post('signin')
  async signin(@Body() dto: SigninDTO) {
    return await this.service.signin(dto);
  }

  @Post('signup')
  async signup(@Body() dto: SignupDTO) {
    return await this.service.signup(dto);
  }

  @UseGuards(JwtRefreshGuard)
  @Post('refresh-token')
  async refreshToken(@GetRequestUser() dto: RefreshTokenDTO) {
    return await this.service.refreshToken(dto);
  }

  @UseGuards(JwtGuard)
  @Post('logout')
  async logout(@GetRequestUser() user: User) {
    return await this.service.logout(user);
  }
}
