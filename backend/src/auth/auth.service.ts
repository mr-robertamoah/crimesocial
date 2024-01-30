import { User } from '@prisma/client';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SigninDTO, SignupDTO } from './dto';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { RefreshTokenDTO } from './dto/refreshToken.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private userService: UserService,
  ) {}

  async signin(dto: SigninDTO) {
    const data = {};

    if (dto.email) data['email'] = dto.email;
    if (dto.username) data['username'] = dto.username;

    const user = await this.prisma.user.findFirst({
      where: {
        ...data,
      },
    });

    if (!user) throw new ForbiddenException('Invalid email or username.');

    const passwordMatches = argon.verify(user.password, dto.password);

    if (!passwordMatches) throw new ForbiddenException('Wrong password.');

    const tokens = await this.signTokens(user);

    delete user.password;
    delete user.refreshToken;

    return { ...tokens, user };
  }

  async signup(dto: SignupDTO) {
    let user = await this.prisma.user.findFirst({
      where: {
        username: dto.username,
      },
    });

    if (user) throw new BadRequestException('Username has been taken.');

    if (dto.password !== dto.passwordConfirmation)
      throw new BadRequestException(
        'Password does not match with password confirmation.',
      );

    const password = await argon.hash(dto.password);

    user = await this.userService.createUser(dto.username, password);

    const tokens = await this.signTokens(user);

    delete user.password;
    delete user.refreshToken;

    return { ...tokens, user };
  }

  private async signTokens(user: User) {
    const payload = {
      sub: user.id,
      username: user.username,
    };

    const accessToken = await this.jwt.signAsync(payload, {
      expiresIn: '30m',
      secret: this.config.get('ACCESS_TOKEN_SECRET'),
    });

    const refreshToken = await this.jwt.signAsync(payload, {
      expiresIn: '7d',
      secret: this.config.get('REFRESH_TOKEN_SECRET'),
    });

    await this.userService.updateToken(user.id, refreshToken);

    return { access_token: accessToken, refresh_token: refreshToken };
  }

  async refreshToken(dto: RefreshTokenDTO) {
    if (dto.user.refreshToken)
      throw new ForbiddenException('Unauthorized. Login to application.');

    const tokenMatches = await argon.verify(
      dto.user.refreshToken,
      dto.refreshToken,
    );

    if (!tokenMatches) throw new ForbiddenException('');

    const tokens = await this.signTokens(dto.user);

    delete dto.user.password;
    delete dto.user.refreshToken;

    return { ...tokens, user: dto.user };
  }

  async logout(user: User) {
    console.log(user);
    await this.userService.updateToken(user.id, null);
  }
}
