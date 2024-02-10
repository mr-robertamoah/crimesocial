import { Global, Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';

@Global()
@Module({
  providers: [PostService],
  controllers: [PostController],
  exports: [PostService],
})
export class PostModule {}
