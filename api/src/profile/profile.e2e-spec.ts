import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { ProfileService } from './profile.service';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import TestAgent from 'supertest/lib/agent';
import { Test } from '@nestjs/testing';
import { ProfileModule } from './profile.module';
import { JwtGuard } from '@/auth/jwt/jwt.guard';
import { RolesGuard } from '@/auth/roles/role.guard';
import { PrismaService } from '@/prisma/prisma.service';
import request from 'supertest';
import { Server } from 'http';
import {
  createProfile,
  profile,
  userId,
} from '@/__mocks__/profile/profile.mock';
import { NextFunction, Request, Response } from 'express';

describe('ProfileController', () => {
  let serviceMock: DeepMockProxy<ProfileService>;
  let app: INestApplication;
  let req: TestAgent;

  beforeAll(async () => {
    serviceMock = mockDeep<ProfileService>();
    const moduleRef = await Test.createTestingModule({
      imports: [ProfileModule],
      providers: [
        { provide: JwtGuard, useValue: { canActive: () => true } },
        { provide: RolesGuard, useValue: { canActive: () => true } },
      ],
    })
      .overrideProvider(ProfileService)
      .useValue(serviceMock)
      .overrideProvider(PrismaService)
      .useValue({})
      .compile();

    app = moduleRef.createNestApplication();
    app.use((req: Request, res: Response, next: NextFunction) => {
      req.user = {
        sub: userId,
      };
      next();
    });
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );

    await app.init();
  });

  beforeEach(() => {
    req = request(app.getHttpServer() as Server);
    jest.clearAllMocks();
  });

  describe('GET /me', () => {
    it('200: get my profile', async () => {
      serviceMock.findOne.mockResolvedValue(profile);
      await req.get('/profile/me').set('user', '').expect(200).expect(profile);
    });
  });

  describe('GET /:name', () => {
    it('200: get profile by name', async () => {
      serviceMock.findOne.mockResolvedValue(profile);
      await req.get('/profile/some').expect(200).expect(profile);
    });
  });

  describe('PUT /me', () => {
    it('200: update profile by me', async () => {
      const updatePayload = { description: 'updated bio' };
      serviceMock.update.mockResolvedValue(profile);
      const res = await req.put('/profile/me').send(updatePayload).expect(200);
      expect(res.body).toEqual(profile);
    });

    it('400: update profile validation error (invalid payload)', async () => {
      await req.put('/profile/me').send({ unknown: 'x' }).expect(400);
    });
  });

  describe('POST /', () => {
    it('201: create profile (positive)', async () => {
      const payload = createProfile;
      serviceMock.create.mockResolvedValue(profile);
      const res = await req.post('/profile').send(payload).expect(201);
      expect(res.body).toEqual(profile);
    });

    it('400: create profile validation error (invalid payload)', async () => {
      await req.post('/profile').send({}).expect(400);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
