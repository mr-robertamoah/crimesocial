import {
  IsBooleanString,
  IsDateString,
  IsInt,
  IsJSON,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export default class CreateCrimeDTO {
  @IsOptional()
  @IsString()
  landmark?: string;

  @IsInt()
  severity: number;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  lat: number;

  @IsNumber()
  lon: number;

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
  @IsInt()
  crimeTypeId?: number;

  @IsOptional()
  @IsString()
  crimeTypeName?: string;
}
