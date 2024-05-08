import {
  Body,
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { AgentService } from './agent.service';
import { GetRequestUser } from 'src/auth/decorator';
import UpdateAgentDTO from './dto/update-agent.dto';

@Controller('agent')
export class AgentController {
  constructor(private service: AgentService) {}

  @Post(':agentId')
  async updateAgent(
    @GetRequestUser() user,
    @Param('agentId', ParseIntPipe) agentId: number,
    @Body() dto: UpdateAgentDTO,
  ) {
    return await this.service.updateAgent(user, agentId, dto);
  }

  @Delete(':agentId')
  async leaveAgency(
    @GetRequestUser() user,
    @Param('agentId', ParseIntPipe) agentId: number,
  ) {
    return await this.service.leaveAgency(user, agentId);
  }
}
