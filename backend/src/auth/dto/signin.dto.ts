import { IsNotEmpty, IsString } from 'class-validator';

export class SigninDTO {
  @IsString()
  username: string;

  @IsString()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
