import { IsOptional, IsString } from 'class-validator';

export default class UpdateCrimeTypeDTO {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}
