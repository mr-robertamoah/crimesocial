import {
  IsBooleanString,
  IsDateString,
  IsInt,
  IsJSON,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';
import { Transform } from 'class-transformer';

export default class CreateCrimeDTO {
  @IsOptional()
  @IsString()
  landmark?: string;

  @IsNumberString()
  severity: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumberString()
  lat: string;

  @IsNumberString()
  lon: string;

  @IsDateString()
  occurredOn: string;

  @IsJSON()
  @IsOptional()
  victim?: string;

  @IsJSON()
  @IsOptional()
  suspect?: string;

  @IsBooleanString()
  anonymous: string;

  @IsOptional()
  @IsString()
  crimeTypeId?: string;

  @IsOptional()
  @IsString()
  crimeTypeName?: string;

  @IsOptional()
  files?: Array<File>;
}
