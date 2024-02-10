import { AgencyType } from '@prisma/client';
import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAgencyDTO {
  @IsString()
  @IsNotEmpty()
  @IsIn([AgencyType.GOVERNMENT, AgencyType.NONPROFIT])
  type: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  about?: string;
}
