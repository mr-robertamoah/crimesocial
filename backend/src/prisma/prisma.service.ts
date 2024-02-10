import {
  Injectable,
  InternalServerErrorException,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
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

  async updateMultipleFields(data: {
    field: string;
    fieldId: number;
    keyAndValuePairs: object;
    include: object;
  }) {
    if (!this[data.field]) {
      console.log(data.field, 'does not exist');
      throw new InternalServerErrorException(
        'Something went wrong. Try again later.',
      );
    }

    const fieldKeys = Object.keys(this[data.field].fields);

    Object.keys(data.keyAndValuePairs).forEach((key: string) => {
      if (!fieldKeys.includes(key)) delete data.keyAndValuePairs[key];
    });

    try {
      return await this[data.field].update({
        where: { id: data.fieldId },
        data: {
          ...data.keyAndValuePairs,
        },
        include: { ...data.include },
      });
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException(
        'Something went wrong. Try again later.',
      );
    }
  }
}
