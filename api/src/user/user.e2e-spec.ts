import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import request from 'supertest';
import { UserService } from './user.service';
import { Test } from '@nestjs/testing';
import { UserModule } from './user.module';
import { PrismaService } from '@/prisma/prisma.service';
import TestAgent from 'supertest/lib/agent';
import { Server } from 'node:http';
import { JwtGuard } from '@/auth/jwt/jwt.guard';
import { RolesGuard } from '@/auth/roles/role.guard';
import { randomUUID } from 'node:crypto';
import { User } from '@/generated/prisma/client';

describe('Users', () => {
  let app: INestApplication;
  let userServiceMock: DeepMockProxy<UserService>;
  let req: TestAgent;

  beforeAll(async () => {
    userServiceMock = mockDeep<UserService>();
    const moduleRef = await Test.createTestingModule({
      imports: [UserModule],
      providers: [
        { provide: JwtGuard, useValue: { canActive: () => true } },
        { provide: RolesGuard, useValue: { canActive: () => true } },
      ],
    })
      .overrideProvider(PrismaService)
      .useValue({})
      .overrideProvider(UserService)
      .useValue(userServiceMock)
      .compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
  });

  const id = randomUUID();
  const createdAt = new Date(),
    updatedAt = new Date();

  const userMock: User = {
    id,
    email: 'test@test.com',
    authType: 'LOCAL',
    role: 'USER',
    oauthId: null,
    password: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const userMockResponse = {
    ...userMock,
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
  };

  beforeEach(() => {
    req = request(app.getHttpServer() as Server);
    jest.clearAllMocks();
  });

  describe('GET /all', () => {
    it('200: /all', async () => {
      userServiceMock.findAll.mockResolvedValue([]);
      await req.get('/user/all').expect(200).expect([]);
    });

    it('200: /all?lastIndex', async () => {
      userServiceMock.findAll.mockResolvedValue([]);
      await req.get(`/user/all?lastIndex=${id}`).expect(200).expect([]);
    });

    it('400: invalid UUID for lastIndex', async () => {
      await req.get(`/user/all?lastIndex=invalid-uuid`).expect(400);
    });
  });

  describe('GET /:id', () => {
    it('200: get user by id (positive)', async () => {
      userServiceMock.findOne.mockResolvedValue(userMock);
      const res = await req.get(`/user/${id}`).expect(200);
      expect(res.body).toEqual(userMockResponse);
    });

    it('400: get user by id (invalid uuid)', async () => {
      await req.get('/user/invalid-uuid').expect(400);
    });
  });

  describe('POST /', () => {
    it('201: create user (positive)', async () => {
      const payload = { email: 'new@user.com', password: 'Test1234' };
      const created = { ...userMockResponse, ...payload };
      userServiceMock.create.mockResolvedValue({ ...userMock, ...payload });
      const res = await req.post('/user').send(payload).expect(201);
      expect(res.body).toEqual(created);
    });

    it('400: create user validation error (invalid email)', async () => {
      const invalidPayload = { email: 'not-an-email' };
      await req.post('/user').send(invalidPayload).expect(400);
    });
  });

  describe('PUT /:id', () => {
    it('200: update user by id (positive)', async () => {
      const update = { email: 'updated@user.com' };
      const updated = { ...userMock, email: update.email };
      const updateResponse = { ...userMockResponse, email: update.email };
      userServiceMock.update.mockResolvedValue(updated);
      const res = await req.put(`/user/${id}`).send(update).expect(200);
      expect(res.body).toEqual(updateResponse);
    });

    it('400: update user by id (invalid uuid)', async () => {
      await req.put('/user/invalid-uuid').send({ email: 'x' }).expect(400);
    });

    it('400: update user validation error (invalid email format)', async () => {
      const invalidUpdate = { email: 'invalid-email' };
      await req.put(`/user/${id}`).send(invalidUpdate).expect(400);
    });
  });

  describe('DELETE /:id', () => {
    it('200: delete user by id (positive)', async () => {
      userServiceMock.delete.mockResolvedValue(userMock);
      const res = await req.delete(`/user/${id}`).expect(200);
      expect(res.body).toEqual(userMockResponse);
    });

    it('400: delete user by id (invalid uuid)', async () => {
      await req.delete('/user/invalid-uuid').expect(400);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
