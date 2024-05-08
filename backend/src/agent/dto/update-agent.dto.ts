import { IsOptional, IsString } from 'class-validator';

export default class UpdateAgentDTO {
  @IsOptional()
  @IsString()
  position?: string;

  @IsOptional()
  @IsString()
  type?: string;
}
