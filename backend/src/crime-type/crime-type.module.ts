import { Module } from '@nestjs/common';
import { CrimeTypeController } from './crime-type.controller';
import { CrimeTypeService } from './crime-type.service';

@Module({
  controllers: [CrimeTypeController],
  providers: [CrimeTypeService],
})
export class CrimeTypeModule {}
