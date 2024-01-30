import { IsNotEmpty, IsString, IsStrongPassword } from 'class-validator';

export class SignupDTO {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  @IsStrongPassword({
    minLength: 8,
    minNumbers: 1,
    minLowercase: 0,
    minSymbols: 1,
    minUppercase: 0,
  })
  password: string;

  @IsString()
  @IsNotEmpty()
  @IsStrongPassword({
    minLength: 8,
    minNumbers: 1,
    minLowercase: 0,
    minSymbols: 1,
    minUppercase: 0,
  })
  passwordConfirmation: string;
}
