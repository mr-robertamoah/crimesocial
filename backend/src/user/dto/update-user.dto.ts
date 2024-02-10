import { Gender } from '@prisma/client';
import {
  IsBooleanString,
  IsIn,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateUserDTO {
  @IsNumberString()
  @IsNotEmpty()
  userId: number;

  @IsString()
  @IsOptional()
  firstName: string;

  @IsString()
  @IsOptional()
  lastName: string;

  @IsString()
  @IsOptional()
  otherNames: string;

  @IsString()
  @IsOptional()
  email: string;

  @IsString()
  @IsOptional()
  country: string;

  @IsString()
  @IsOptional()
  @IsIn([Gender.FEMALE, Gender.MALE, Gender.UNDISCLOSED])
  gender: string;

  @IsBooleanString()
  @IsOptional()
  deleteAvatarUrl: boolean;
}
