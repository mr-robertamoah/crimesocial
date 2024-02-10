import { IsNotEmpty, IsString, IsStrongPassword } from 'class-validator';

export class ChangePasswordDTO {
  @IsString()
  @IsNotEmpty()
  oldPassword: string;

  @IsString()
  @IsNotEmpty()
  @IsStrongPassword({
    minLength: 8,
    minNumbers: 1,
    minLowercase: 0,
    minSymbols: 1,
    minUppercase: 0,
  })
  newPassword: string;

  @IsString()
  @IsNotEmpty()
  @IsStrongPassword({
    minLength: 8,
    minNumbers: 1,
    minLowercase: 0,
    minSymbols: 1,
    minUppercase: 0,
  })
  newPasswordConfirmation: string;
}
