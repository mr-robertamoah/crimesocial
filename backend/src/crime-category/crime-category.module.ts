import { Module } from '@nestjs/common';
import { CrimeCategoryController } from './crime-category.controller';
import { CrimeCategoryService } from './crime-category.service';

@Module({
  controllers: [CrimeCategoryController],
  providers: [CrimeCategoryService]
})
export class CrimeCategoryModule {}
