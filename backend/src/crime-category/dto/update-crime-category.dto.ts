import { IsOptional, IsString } from 'class-validator';

export default class UpdateCrimeCategoryDTO {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}
