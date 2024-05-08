import { AgentType } from '@prisma/client';
import { IsArray, IsOptional } from 'class-validator';

export class AddAgentsDTO {
  @IsOptional()
  @IsArray()
  potentialAgents: Array<{ userId: number; type: AgentType }>;

  @IsOptional()
  @IsArray()
  removedAgents: Array<number>;
}
