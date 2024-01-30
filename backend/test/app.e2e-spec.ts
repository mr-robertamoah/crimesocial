import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('/api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();

    prisma = app.get(PrismaService);

    await prisma.clearDB();
  });

  describe('Auth', () => {
    describe('Signup', () => {
      const data = {
        username: 'mr_robertamoah',
        password: 'fdajhhfafeaioada2342@',
      };

      it('/auth/signup (POST) fails without data', () => {
        return request(app.getHttpServer())
          .post('/auth/signup')
          .send({})
          .expect(402);
      });

      it('/auth/signup (POST) succeeds with strong password', async () => {
        const res = await request(app.getHttpServer())
          .post('/auth/signup')
          .send(data)
          .expect(201);

        expect(res.body).toHaveProperty('access_token');
        expect(res.body).toHaveProperty('refresh_token');
      });
    });

    describe('Signin', () => {
      it('/ (GET)', () => {
        return request(app.getHttpServer())
          .get('/')
          .expect(200)
          .expect('Hello World!');
      });
    });
  });
});
