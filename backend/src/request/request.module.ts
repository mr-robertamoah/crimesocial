import { Global, Module } from '@nestjs/common';
import { RequestService } from './request.service';
import { RequestController } from './request.controller';

@Global()
@Module({
  providers: [RequestService],
  exports: [RequestService],
  controllers: [RequestController],
})
export class RequestModule {}
