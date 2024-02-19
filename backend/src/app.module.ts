import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { CrimeModule } from './crime/crime.module';
import { ConfigModule } from '@nestjs/config';
import { ImageModule } from './image/image.module';
import { FileModule } from './file/file.module';
import { MulterModule } from '@nestjs/platform-express';
import { AgencyModule } from './agency/agency.module';
import { AgentModule } from './agent/agent.module';
import { PostModule } from './post/post.module';
import { SuggestionModule } from './suggestion/suggestion.module';
import { CrimeTypeModule } from './crime-type/crime-type.module';
import { CrimeCategoryModule } from './crime-category/crime-category.module';
import MulterConfigService from './multer/multer-config.service';

@Module({
  imports: [
    PrismaModule,
    UserModule,
    AuthModule,
    AdminModule,
    PostModule,
    CrimeModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ImageModule,
    FileModule,
    MulterModule.registerAsync({
      useClass: MulterConfigService,
    }),
    AgencyModule,
    AgentModule,
    SuggestionModule,
    CrimeTypeModule,
    CrimeCategoryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
