import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export default class CreateCrimeTypeDTO {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  byType?: string;

  @IsOptional()
  @IsNumber()
  byId?: number;

  @IsNumber()
  @IsNumber()
  crimeCategoryId?: number;
}
