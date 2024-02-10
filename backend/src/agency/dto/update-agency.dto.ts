import { AgencyType } from '@prisma/client';
import {
  IsIn,
  IsJSON,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateAgencyDTO {
  @IsNotEmpty()
  @IsNumberString()
  agencyId: string;

  @IsString()
  @IsOptional()
  @IsIn([AgencyType.GOVERNMENT, AgencyType.NONPROFIT])
  type: string;

  @IsOptional()
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  about?: string;

  @IsOptional()
  @IsJSON()
  deletedFiles?: string;
}
