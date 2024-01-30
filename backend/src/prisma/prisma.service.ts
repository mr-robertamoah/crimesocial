import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async clearDB() {
    if (process.env.NODE_ENV === 'production') return; // TODO change env variable to production

    const models = Reflect.ownKeys(this).filter((key) => key[0] !== '_');

    return Promise.all(
      models.map(async (modelKey) => {
        console.log(modelKey, this[modelKey]);
        if (this[modelKey] && typeof this[modelKey].deleteMany === 'function')
          return await this[modelKey].deleteMany();

        return this[modelKey];
      }),
    );
  }
}
