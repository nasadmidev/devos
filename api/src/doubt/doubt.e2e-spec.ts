import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import TestAgent from 'supertest/lib/agent';
import { DoubtModule } from './doubt.module';
import { AnswerModule } from '@/answer/answer.module';
import { JwtGuard } from '@/auth/jwt/jwt.guard';
import { RolesGuard } from '@/auth/roles/role.guard';
import { PrismaFilter } from '@/prisma/prisma.filter';
import { ResponseInterceptor } from '@/common/interceptors/response.interceptor';
import request from 'supertest';
import { Server } from 'http';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PrismaService } from '@/prisma/prisma.service';
import { User } from '@/generated/prisma/client';
import { JwtPayload } from '@/auth/auth.service';
import { PrismaModule } from '@/prisma/prisma.module';
import ms from 'ms';
import { randomUUID } from 'crypto';
import toIso from '@/__mocks__/common/toIso.util';

process.env.JWT_SECRET = 'secret';
process.env.JWT_EXPIRES = '1h';
process.env.DATABASE_URL =
  'postgresql://postgres:postgres@localhost:5432/devos?schema=public&connection_limit=5';

describe('DoubtController (e2e)', () => {
  let app: INestApplication;
  let req: TestAgent;
  let mockUser: User;
  let authToken: string;
  let prismaService: PrismaService;
  let mockUserResponse: unknown;
  let createdDoubtId: string;
  let fakeToken: string;
  let answerId: string;
  let adminToken: string;
  let commentId: string;
  let jwtService: JwtService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        DoubtModule,
        AnswerModule,
        PrismaModule,
        JwtModule.register({
          secret: 'secret',
          signOptions: {
            expiresIn: ms('1h'),
          },
        }),
      ],
      providers: [
        {
          provide: 'APP_GUARD',
          useClass: JwtGuard,
        },
        {
          provide: 'APP_GUARD',
          useClass: RolesGuard,
        },
        JwtService,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalInterceptors(new ResponseInterceptor());
    app.useGlobalFilters(new PrismaFilter());
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        forbidNonWhitelisted: true,
        whitelist: true,
      }),
    );
    prismaService = moduleRef.get<PrismaService>(PrismaService);
    jwtService = moduleRef.get<JwtService>(JwtService);

    mockUser = await prismaService.user.create({
      data: {
        email: 'e2e-test-user@devos.app',
        password: 'hashed_password',
        role: 'USER',
      },
    });

    if (mockUser) {
      mockUserResponse = toIso(mockUser, ['updatedAt', 'createdAt']);
    }

    const payload: JwtPayload = {
      sub: mockUser.id,
      role: mockUser.role,
    };

    const fakePayload: JwtPayload = {
      sub: randomUUID(),
      role: 'USER',
    };

    const adminPayload: JwtPayload = {
      sub: randomUUID(),
      role: 'ADMIN',
    };

    authToken = await jwtService.signAsync(payload);
    fakeToken = await jwtService.signAsync(fakePayload);
    adminToken = await jwtService.signAsync(adminPayload);

    await prismaService.$connect();
    await app.init();
  });

  beforeEach(() => {
    req = request(app.getHttpServer() as Server);
  });

  describe('POST /', () => {
    it('201: should create a new doubt', async () => {
      const res = await req
        .post('/doubt')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'new doubt',
          description: 'doubt description',
          tags: [],
        })
        .expect(201);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (res.status === 201) createdDoubtId = res.body.data.id as string;
    });

    it('401: should fail to create a doubt if unauthorized', async () => {
      await req
        .post('/doubt')
        .send({
          title: 'new doubt',
          description: 'doubt description',
          tags: [],
        })
        .expect(401);
    });

    it('400: should fail on invalid body', async () => {
      await req
        .post('/doubt')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'doubt title',
          tags: [],
        })
        .expect(400);
    });
  });

  describe('GET /', () => {
    it('200: should get all doubts', async () => {
      const res = await req.get(`/doubt/all?limit=2&select=author`).expect(200);
      expect(res.body).toEqual(
        expect.objectContaining({
          data: expect.arrayContaining([
            {
              id: expect.any(String) as string,
              title: 'new doubt',
              author: mockUserResponse,
            },
          ]) as [],
          date: expect.any(String) as string,
          path: 'GET /doubt/all',
          statusCode: 200,
        }),
      );
    });

    it('400: should fail if lastIndex is invalid', async () => {
      await req.get('/doubt/all?lastIndex=invalid-uuid').expect(400);
    });

    it('400: should fail if limit is not a number string', async () => {
      await req.get('/doubt/all?limit=s').expect(400);
    });

    it('400: should fail if the dynamic select has not a valid values', async () => {
      await req.get('/doubt/all?select=invalid').expect(400);
    });
  });

  describe('GET /:id', () => {
    beforeAll(() => {
      if (!createdDoubtId) {
        throw new Error(
          'Test skipped: createdDoubtId is undefined. Check if POST / failed.',
        );
      }
    });

    it('200: should get a single doubt by id with dynamic select', async () => {
      const res = await req
        .get(`/doubt/${createdDoubtId}?select=author`)
        .expect(200);
      expect(res.body).toEqual(
        expect.objectContaining({
          data: expect.objectContaining({
            id: createdDoubtId,
            title: 'new doubt',
            description: 'doubt description',
            code: null,
            tags: [],
            author: mockUserResponse,
          }) as object,
          date: expect.any(String) as string,
          path: `GET /doubt/${createdDoubtId}`,
          statusCode: 200,
        }),
      );
    });

    it('400: should fail if the id parameter is not a valid UUID', async () => {
      await req.get('/doubt/invalid-uuid?select=author').expect(400);
    });
  });

  describe('PUT /:id', () => {
    beforeAll(() => {
      if (!createdDoubtId) {
        throw new Error(
          'Test skipped: createdDoubtId is undefined. Check if POST / failed.',
        );
      }
    });

    it('200: should update the doubt if requested by the author', async () => {
      const res = await req
        .put(`/doubt/${createdDoubtId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'other doubt title',
        })
        .expect(200);
      expect(res.body).toEqual(
        expect.objectContaining({
          data: expect.objectContaining({
            id: createdDoubtId,
            title: 'other doubt title',
            description: 'doubt description',
            code: null,
            tags: [],
            authorId: mockUser.id,
            createdAt: expect.any(String) as string,
            updatedAt: expect.any(String) as string,
          }) as object,
          date: expect.any(String) as string,
          path: `PUT /doubt/${createdDoubtId}`,
          statusCode: 200,
        }),
      );
    });

    it('404: should fail to update the doubt if requested by another user', async () => {
      await req
        .put(`/doubt/${createdDoubtId}`)
        .set('Authorization', `Bearer ${fakeToken}`)
        .expect(404);
    });

    it('404: should return not found if updating a non-existent doubt', async () => {
      await req
        .put(`/doubt/${randomUUID()}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('POST :id/answers', () => {
    it('201: should create an answer for a specific doubt', async () => {
      const res = await req
        .post(`/doubt/${createdDoubtId}/answers`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'answer content',
          code: 'some code',
        })
        .expect(201);
      expect(res.body).toEqual(
        expect.objectContaining({
          data: expect.objectContaining({
            id: expect.any(String) as string,
            userId: mockUser.id,
            doubtId: createdDoubtId,
            content: 'answer content',
            code: 'some code',
            correct: false,
            createdAt: expect.any(String) as string,
            updatedAt: expect.any(String) as string,
          }) as object,
          date: expect.any(String) as string,
          path: `POST /doubt/${createdDoubtId}/answers`,
          statusCode: 201,
        }),
      );
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (res.status === 201) answerId = res.body.data.id as string;
    });

    it('400: should fail to create an answer if body data is invalid', async () => {
      await req
        .post(`/doubt/${createdDoubtId}/answers`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: '',
        })
        .expect(400);
    });

    it('400 (Unprocessable Entity): should return not found if the target doubt id does not exist', async () => {
      await req
        .post(`/doubt/${randomUUID()}/answers`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: '',
        })
        .expect(400);
    });
  });

  describe('PATCH /answers/:answerId/correct', () => {
    beforeAll(() => {
      if (!answerId) {
        throw new Error(
          'Test skipped: answerId is undefined. Check if POST :id/answers failed.',
        );
      }
    });

    it('200: should toggle correct status to true if requested by the doubt author', async () => {
      const res = await req
        .patch(`/doubt/answers/${answerId}/correct`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      expect(res.body).toEqual(
        expect.objectContaining({
          data: expect.objectContaining({
            markAs: 'correct',
          }) as object,
          date: expect.any(String) as string,
          path: `PATCH /doubt/answers/${answerId}/correct`,
          statusCode: 200,
        }),
      );
    });

    it('200: should toggle correct status to false if requested by an ADMIN', async () => {
      const res = await req
        .patch(`/doubt/answers/${answerId}/correct`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      expect(res.body).toEqual(
        expect.objectContaining({
          data: expect.objectContaining({
            markAs: 'incorrect',
          }) as object,
          date: expect.any(String) as string,
          path: `PATCH /doubt/answers/${answerId}/correct`,
          statusCode: 200,
        }),
      );
    });

    it('404 (Not found with fake user ID): should fail to toggle correct status if requested by a user who is not the doubt author', async () => {
      await req
        .patch(`/doubt/answers/${answerId}/correct`)
        .set('Authorization', `Bearer ${fakeToken}`)
        .expect(404);
    });

    it('404: should return not found if the answer id does not exist', async () => {
      await req
        .patch(`/doubt/answers/${randomUUID()}/correct`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('POST /answers/:answerId/comments', () => {
    beforeAll(() => {
      if (!answerId) {
        throw new Error(
          'Test skipped: answerId is undefined. Check if POST :id/answers failed.',
        );
      }
    });

    it('201: should create a comment inside a specific answer', async () => {
      const res = await req
        .post(`/doubt/answers/${answerId}/comments`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'comment content',
        })
        .expect(201);
      expect(res.body).toEqual(
        expect.objectContaining({
          data: expect.objectContaining({
            id: expect.any(String) as string,
            userId: mockUser.id,
            answerId,
            parentId: null,
            content: 'comment content',
            createdAt: expect.any(String) as string,
            updatedAt: expect.any(String) as string,
          }) as object,
          date: expect.any(String) as string,
          path: `POST /doubt/answers/${answerId}/comments`,
          statusCode: 201,
        }),
      );
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (res.status === 201) commentId = res.body.data.id as string;
    });

    it('400 (Unprocessable Entity): should return not found if the answer id does not exist', async () => {
      await req
        .post(`/doubt/answers/${randomUUID()}/comments`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'comment content',
        })
        .expect(400);
    });
  });

  describe('DELETE /answers/comments/:commentId', () => {
    beforeAll(() => {
      if (!commentId) {
        throw new Error(
          'Test skipped: commentId is undefined. Check if POST /answers/:answerId/comments failed.',
        );
      }
    });

    it('200: should delete the comment if requested by the comment author', async () => {
      const res = await req
        .delete(`/doubt/answers/comments/${commentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      expect(res.body).toEqual(
        expect.objectContaining({
          data: expect.objectContaining({
            id: commentId,
            userId: mockUser.id,
            answerId,
            parentId: null,
            content: 'comment content',
            createdAt: expect.any(String) as string,
            updatedAt: expect.any(String) as string,
          }) as object,
          date: expect.any(String) as string,
          path: `DELETE /doubt/answers/comments/${commentId}`,
          statusCode: 200,
        }),
      );
    });

    it('200: should delete the comment if requested by an ADMIN', async () => {
      const newComment = await prismaService.answerComment.create({
        data: {
          userId: mockUser.id,
          answerId,
          content: 'new comment content',
        },
      });
      const res = await req
        .delete(`/doubt/answers/comments/${newComment.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      expect(res.body).toEqual(
        expect.objectContaining({
          data: expect.objectContaining({
            id: newComment.id,
            userId: mockUser.id,
            answerId,
            parentId: null,
            content: 'new comment content',
            createdAt: expect.any(String) as string,
            updatedAt: expect.any(String) as string,
          }) as object,
          date: expect.any(String) as string,
          path: `DELETE /doubt/answers/comments/${newComment.id}`,
          statusCode: 200,
        }),
      );
    });

    it('404 (Not found comment with fake user ID): should fail to delete the comment if requested by another user', async () => {
      const newComment = await prismaService.answerComment.create({
        data: {
          userId: mockUser.id,
          answerId,
          content: 'new comment content',
        },
      });
      await req
        .delete(`/doubt/answers/comments/${newComment.id}`)
        .set('Authorization', `Bearer ${fakeToken}`)
        .expect(404);
    });
  });

  describe('DELETE /answers/:answerId', () => {
    beforeAll(() => {
      if (!answerId) {
        throw new Error(
          'Test skipped: answerId is undefined. Check if POST :id/answers failed.',
        );
      }
    });

    it('200: should delete the answer if requested by the answer author', async () => {
      const res = await req
        .delete(`/doubt/answers/${answerId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      expect(res.body).toEqual(
        expect.objectContaining({
          data: expect.objectContaining({
            id: answerId,
            userId: mockUser.id,
            doubtId: createdDoubtId,
            content: 'answer content',
            code: 'some code',
            correct: false,
            createdAt: expect.any(String) as string,
            updatedAt: expect.any(String) as string,
          }) as object,
          date: expect.any(String) as string,
          path: `DELETE /doubt/answers/${answerId}`,
          statusCode: 200,
        }),
      );
    });

    it('200: should delete the answer if requested by the doubt author (moderation)', async () => {
      const anotherUser = await prismaService.user.create({
        data: {
          email: 'another-e2e-test-user@devos.app',
          password: 'hashed_password',
          role: 'USER',
        },
      });

      const anotherToken = await jwtService.signAsync({
        sub: anotherUser.id,
        role: anotherUser.role,
      });

      const answerRes = await req
        .post(`/doubt/${createdDoubtId}/answers`)
        .set('Authorization', `Bearer ${anotherToken}`)
        .send({
          content: 'answer content',
          code: 'some code',
        })
        .expect(201);

      if (answerRes.status === 201) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const answerData = answerRes.body.data as { id: string };
        const res = await req
          .delete(`/doubt/answers/${answerData.id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);
        expect(res.body).toEqual(
          expect.objectContaining({
            data: expect.objectContaining({
              id: answerData.id,
              userId: anotherUser.id,
              doubtId: createdDoubtId,
              content: 'answer content',
              code: 'some code',
              correct: false,
              createdAt: expect.any(String) as string,
              updatedAt: expect.any(String) as string,
            }) as object,
            date: expect.any(String) as string,
            path: `DELETE /doubt/answers/${answerData.id}`,
            statusCode: 200,
          }),
        );
      }
    });

    it('200: should delete the answer if requested by an ADMIN', async () => {
      const answerRes = await req
        .post(`/doubt/${createdDoubtId}/answers`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'answer content',
          code: 'some code',
        })
        .expect(201);

      if (answerRes.status === 201) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const answerData = answerRes.body.data as { id: string };
        const res = await req
          .delete(`/doubt/answers/${answerData.id}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);
        expect(res.body).toEqual(
          expect.objectContaining({
            data: expect.objectContaining({
              id: answerData.id,
              userId: mockUser.id,
              doubtId: createdDoubtId,
              content: 'answer content',
              code: 'some code',
              correct: false,
              createdAt: expect.any(String) as string,
              updatedAt: expect.any(String) as string,
            }) as object,
            date: expect.any(String) as string,
            path: `DELETE /doubt/answers/${answerData.id}`,
            statusCode: 200,
          }),
        );
      }
    });

    it('403: should fail to delete the answer if requested by an intruder', async () => {
      const answerRes = await req
        .post(`/doubt/${createdDoubtId}/answers`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'answer content',
          code: 'some code',
        })
        .expect(201);

      if (answerRes.status === 201) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const answerData = answerRes.body.data as { id: string };
        await req
          .delete(`/doubt/answers/${answerData.id}`)
          .set('Authorization', `Bearer ${fakeToken}`)
          .expect(403);
      }
    });
  });

  describe('DELETE /:id', () => {
    beforeAll(() => {
      if (!createdDoubtId) {
        throw new Error(
          'Test skipped: createdDoubtId is undefined. Check if POST / failed.',
        );
      }
    });

    it('200: should delete the doubt if requested by the author', async () => {
      const res = await req
        .delete(`/doubt/${createdDoubtId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      expect(res.body).toEqual(
        expect.objectContaining({
          data: expect.objectContaining({
            id: createdDoubtId,
            title: 'other doubt title',
            description: 'doubt description',
            code: null,
            tags: [],
            authorId: mockUser.id,
            createdAt: expect.any(String) as string,
            updatedAt: expect.any(String) as string,
          }) as object,
          date: expect.any(String) as string,
          path: `DELETE /doubt/${createdDoubtId}`,
          statusCode: 200,
        }),
      );
    });

    it('200: should delete the doubt if requested by an ADMIN', async () => {
      const doubtRes = await req
        .post(`/doubt`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'new doubt',
          description: 'doubt description',
          tags: [],
        })
        .expect(201);

      if (doubtRes.status === 201) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const doubtData = doubtRes.body.data as { id: string };
        const res = await req
          .delete(`/doubt/${doubtData.id}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);
        expect(res.body).toEqual(
          expect.objectContaining({
            data: expect.objectContaining({
              id: doubtData.id,
              title: 'new doubt',
              description: 'doubt description',
              code: null,
              tags: [],
              authorId: mockUser.id,
              createdAt: expect.any(String) as string,
              updatedAt: expect.any(String) as string,
            }) as object,
            date: expect.any(String) as string,
            path: `DELETE /doubt/${doubtData.id}`,
            statusCode: 200,
          }),
        );
      }
    });

    it('404 (Not found with fake user ID): should fail to delete the doubt if requested by another user', async () => {
      const doubtRes = await req
        .post(`/doubt`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'new doubt',
          description: 'doubt description',
          tags: [],
        })
        .expect(201);

      if (doubtRes.status === 201) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const doubtData = doubtRes.body.data as { id: string };
        await req
          .delete(`/doubt/${doubtData.id}`)
          .set('Authorization', `Bearer ${fakeToken}`)
          .expect(404);
      }
    });
  });

  afterAll(async () => {
    if (mockUser) {
      await prismaService.user.deleteMany({
        where: { email: { contains: 'e2e-test-user@devos.app' } },
      });
    }
    await prismaService.$disconnect();
    await app.close();
  });
});
