import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { RefreshTokenDTO } from '../dto/refreshToken.dto';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    config: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get('REFRESH_TOKEN_SECRET'),
      passReqOnCallback: true,
    });
  }

  async validate(request: any, payload: { sub: number; email: string }) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: payload.sub,
      },
    });

    const dto: RefreshTokenDTO = {
      user,
      refreshToken: '',
    };

    if (request && typeof request.get === 'function')
      dto.refreshToken = request
        .get('Authorization')
        .replace('Bearer', '')
        .trim();

    return dto;
  }
}
