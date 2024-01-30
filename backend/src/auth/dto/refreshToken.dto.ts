import { User } from '@prisma/client';

export class RefreshTokenDTO {
  user: User;
  refreshToken: string;
}
