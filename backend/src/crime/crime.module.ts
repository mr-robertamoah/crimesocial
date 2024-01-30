import { Module } from '@nestjs/common';
import { CrimeService } from './crime.service';
import { CrimeController } from './crime.controller';

@Module({
  providers: [CrimeService],
  controllers: [CrimeController]
})
export class CrimeModule {}
