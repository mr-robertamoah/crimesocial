import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SigninDTO {
  @IsOptional()
  @IsString()
  username: string;

  @IsOptional()
  @IsString()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
