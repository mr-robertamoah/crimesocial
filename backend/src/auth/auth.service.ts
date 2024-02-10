import { User } from '@prisma/client';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ChangePasswordDTO, SigninDTO, SignupDTO } from './dto';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { RefreshTokenDTO } from './dto/refreshToken.dto';
import { AdminService } from 'src/admin/admin.service';
import { ImageService } from 'src/image/image.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private userService: UserService,
    private adminService: AdminService,
    private imageService: ImageService,
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
    if (!dto.user?.refreshToken)
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
    await this.userService.updateToken(user.id, null);
  }

  async changePassword(user: User, dto: ChangePasswordDTO) {
    const oldPasswordMatches = await argon.verify(
      user.password,
      dto.oldPassword,
    );
    if (!oldPasswordMatches)
      throw new UnauthorizedException('Wrong old password was given.');

    if (dto.newPassword !== dto.newPasswordConfirmation)
      throw new BadRequestException(
        'The new password does not match with confirmation password.',
      );

    user = await this.userService.updatePassword(user.id, dto.newPassword);

    delete user.password;
    delete user.refreshToken;

    return user;
  }

  async deleteAccount(user: User, userId: string | number) {
    const accountUser = await this.userService.ensureUserIdIsValid(userId);

    const isAdmin = await this.adminService.isAdmin(user.id);
    const isAccountAdmin = await this.adminService.isAdmin(Number(userId));
    const isSuperAdmin = await this.adminService.isSuperAdmin(user.id);

    if (
      !(
        user.id === Number(userId) ||
        (isAdmin && !isAccountAdmin) ||
        (isSuperAdmin && isAccountAdmin)
      )
    )
      throw new UnauthorizedException('You cannot Account.');

    try {
      // TODO delete other models regarding a user
      await this.adminService.deleteAdmin(accountUser);
      await this.imageService.deleteImageUsingUrl(accountUser.avatarUrl);
      return await this.prisma.user.delete({
        where: { id: accountUser.id },
      });
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException(
        'Sorry! Something unusual happened. Please try again later.',
      );
    }
  }
}
