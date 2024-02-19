import { Global, Module } from '@nestjs/common';
import { SuggestionService } from './suggestion.service';

@Global()
@Module({
  providers: [SuggestionService],
  exports: [SuggestionService],
})
export class SuggestionModule {}
