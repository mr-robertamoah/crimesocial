import { Outcome } from '@prisma/client';
import {
  IsBooleanString,
  IsDateString,
  IsIn,
  IsInt,
  IsJSON,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';

export default class UpdateCrimeDTO {
  @IsOptional()
  @IsNumberString()
  crimeId: string;

  @IsOptional()
  @IsString()
  landmark?: string;

  @IsOptional()
  @IsString()
  @IsIn([Outcome.ACQUITTAL, Outcome.CONVICTION, Outcome.PENDING])
  outcome?: string;

  @IsOptional()
  @IsInt()
  severity?: number;

  @IsOptional()
  @IsString()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  @IsNumber()
  lat?: number;

  @IsOptional()
  @IsNumber()
  lon?: number;

  @IsOptional()
  @IsDateString()
  occurredOn?: string;

  @IsJSON()
  @IsOptional()
  victim?: string;

  @IsJSON()
  @IsOptional()
  suspect?: string;

  @IsOptional()
  @IsBooleanString()
  anonymous?: string;

  @IsOptional()
  @IsInt()
  crimeTypeId?: number;

  @IsOptional()
  @IsString()
  crimeTypeName?: string;

  @IsOptional()
  @IsJSON()
  deletedFiles?: string;
}
