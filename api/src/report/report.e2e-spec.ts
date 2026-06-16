import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import TestAgent from 'supertest/lib/agent';
import { ReportModule } from './report.module';
import { JwtGuard } from '@/auth/jwt/jwt.guard';
import { RolesGuard } from '@/auth/roles/role.guard';
import { PrismaModule } from '@/prisma/prisma.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import ms from 'ms';
import { PrismaService } from '@/prisma/prisma.service';
import { PrismaFilter } from '@/prisma/prisma.filter';
import { ResponseInterceptor } from '@/common/interceptors/response.interceptor';
import {
  Doubt,
  DoubtReport,
  User,
  UserReport,
} from '@/generated/prisma/client';
import request from 'supertest';
import { Server } from 'http';
import toIso from '@/__mocks__/common/toIso.util';
import { randomUUID } from 'crypto';

process.env.JWT_SECRET = 'secret';
process.env.JWT_EXPIRES = '1h';
process.env.DATABASE_URL =
  'postgresql://postgres:postgres@localhost:5432/devos?schema=public&connection_limit=5';

describe('ReportController (e2e)', () => {
  let app: INestApplication;
  let req: TestAgent;
  let prismaService: PrismaService;
  let jwtService: JwtService;
  let mockUser: User;
  let mockAdmin: User;
  let mockDoubt: Doubt;
  let userToken: string;
  let adminToken: string;
  let reportDoubt: DoubtReport;
  let reportUser: UserReport;
  let mockUserResponse: unknown;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ReportModule,
        PrismaModule,
        JwtModule.register({
          secret: 'secret',
          signOptions: { expiresIn: ms('1h') },
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
    app.useGlobalFilters(new PrismaFilter());
    app.useGlobalInterceptors(new ResponseInterceptor());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    prismaService = moduleRef.get<PrismaService>(PrismaService);
    jwtService = moduleRef.get<JwtService>(JwtService);

    mockUser = await prismaService.user.create({
      data: {
        email: 'test-e2e-user@devos.app',
        password: 'hashed_password',
        role: 'USER',
      },
    });

    mockAdmin = await prismaService.user.create({
      data: {
        email: 'admin-e2e-user@devos.app',
        password: 'hashed_password',
        role: 'ADMIN',
      },
    });

    mockDoubt = await prismaService.doubt.create({
      data: {
        authorId: mockUser.id,
        title: 'illegal doubt',
        description: 'some illegal description',
        tags: ['illegal tag'],
      },
    });

    mockUserResponse = toIso(mockUser, ['createdAt', 'updatedAt']);

    userToken = await jwtService.signAsync({
      sub: mockUser.id,
      role: mockUser.role,
    });
    adminToken = await jwtService.signAsync({
      sub: mockAdmin.id,
      role: mockAdmin.role,
    });

    await prismaService.$connect();
    await app.init();
  });

  beforeEach(() => {
    req = request(app.getHttpServer() as Server);
  });

  describe('POST /', () => {
    it('201: should create a report for a DOUBT entity', async () => {
      const res = await req
        .post('/report')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          entityId: mockDoubt.id,
          entityType: 'DOUBT',
          type: 'NOT_TECH_RELATED',
          reason: 'description no related to tech',
        })
        .expect(201);
      expect(res.body).toEqual(
        expect.objectContaining({
          data: {
            id: expect.any(String) as string,
            userId: mockUser.id,
            doubtId: mockDoubt.id,
            type: 'NOT_TECH_RELATED',
            reason: 'description no related to tech',
            resolution: 'WAITING',
            createdAt: expect.any(String) as string,
            updatedAt: expect.any(String) as string,
          },
          statusCode: 201,
          path: 'POST /report',
          date: expect.any(String) as string,
        }),
      );
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (res.status === 201) reportDoubt = res.body.data as DoubtReport;
    });

    it('201: should create a report for a USER entity (toUserId)', async () => {
      const res = await req
        .post('/report')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          entityId: mockAdmin.id,
          entityType: 'USER',
          type: 'SPAM',
          reason: 'false report to admin',
        })
        .expect(201);
      expect(res.body).toEqual(
        expect.objectContaining({
          data: {
            id: expect.any(String) as string,
            toUserId: mockAdmin.id,
            fromUserId: mockUser.id,
            type: 'SPAM',
            reason: 'false report to admin',
            resolution: 'WAITING',
            createdAt: expect.any(String) as string,
            updatedAt: expect.any(String) as string,
          },
          statusCode: 201,
          path: 'POST /report',
          date: expect.any(String) as string,
        }),
      );
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (res.status === 201) reportUser = res.body.data as UserReport;
    });

    it('401: should fail to create a report if unauthorized (no token)', async () => {
      await req
        .post('/report')
        .send({
          entityId: mockAdmin.id,
          entityType: 'USER',
          type: 'SPAM',
          reason: 'false report to admin',
        })
        .expect(401);
    });

    it('400: should fail to create a report with invalid UUID in entityId', async () => {
      await req
        .post('/report')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          entityId: 'invalid-uuid',
          entityType: 'USER',
          type: 'SPAM',
          reason: 'false report to admin',
        })
        .expect(400);
    });

    it('400: should fail if entityType is not a valid enum value', async () => {
      await req
        .post('/report')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          entityId: mockAdmin.id,
          entityType: 'INVALID_VALUE',
          type: 'SPAM',
          reason: 'false report to admin',
        })
        .expect(400);
    });
  });

  describe('GET /all', () => {
    beforeAll(async () => {
      if (!reportDoubt) {
        throw new Error('reportDoubt undefined, please check: POST /report');
      }
      await prismaService.doubtReport.update({
        where: { id: reportDoubt.id },
        data: {
          resolution: 'ARCHIVED',
        },
      });
    });

    it('200: should get all reports from all entities mixed chronologically', async () => {
      const res = await req
        .get('/report/all')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      expect(res.body).toEqual(
        expect.objectContaining({
          data: [
            {
              id: reportUser.id,
              type: reportUser.type,
              resolution: reportUser.resolution,
              entity: 'USER',
              createdAt: expect.any(String) as string,
              updatedAt: expect.any(String) as string,
            },
            {
              id: reportDoubt.id,
              type: reportDoubt.type,
              resolution: 'ARCHIVED',
              entity: 'DOUBT',
              createdAt: expect.any(String) as string,
              updatedAt: expect.any(String) as string,
            },
          ],
          statusCode: 200,
          path: 'GET /report/all',
          date: expect.any(String) as string,
        }),
      );
    });

    it('200: should get all reports filtered by fromEntity (e.g., only DOUBT)', async () => {
      const res = await req
        .get('/report/all?fromEntity=DOUBT')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      expect(res.body).toEqual(
        expect.objectContaining({
          data: [
            {
              id: reportDoubt.id,
              type: reportDoubt.type,
              resolution: 'ARCHIVED',
              createdAt: expect.any(String) as string,
              updatedAt: expect.any(String) as string,
            },
          ],
          statusCode: 200,
          path: 'GET /report/all',
          date: expect.any(String) as string,
        }),
      );
    });

    it('200: should get all reports filtered by state (e.g., WAITING)', async () => {
      const res = await req
        .get('/report/all?state=WAITING')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      expect(res.body).toEqual(
        expect.objectContaining({
          data: [
            {
              id: reportUser.id,
              type: reportUser.type,
              resolution: 'WAITING',
              entity: 'USER',
              createdAt: expect.any(String) as string,
              updatedAt: expect.any(String) as string,
            },
          ],
          statusCode: 200,
          path: 'GET /report/all',
          date: expect.any(String) as string,
        }),
      );
    });

    it('200: should paginate correctly using lastIndex and lastIndexType', async () => {
      const res = await req
        .get(`/report/all?lastIndex=${reportUser.id}&lastIndexType=USER`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      expect(res.body).toEqual(
        expect.objectContaining({
          data: [
            {
              id: reportDoubt.id,
              type: reportDoubt.type,
              resolution: 'ARCHIVED',
              entity: 'DOUBT',
              createdAt: expect.any(String) as string,
              updatedAt: expect.any(String) as string,
            },
          ],
          statusCode: 200,
          path: 'GET /report/all',
          date: expect.any(String) as string,
        }),
      );
    });

    it('403: should fail to get all reports if requested by a standard USER', async () => {
      await req
        .get(`/report/all`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('400: should fail if fromEntity query parameter is invalid', async () => {
      await req
        .get(`/report/all?fromEntity=INVALID_ENTITY`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);
    });
  });

  describe('GET /:id', () => {
    beforeAll(() => {
      if (!reportDoubt) {
        throw new Error('reportDoubt undefined, please check: POST /report');
      }
    });

    it('200: should get a single report by id providing the correct fromEntity', async () => {
      const res = await req
        .get(`/report/${reportDoubt.id}?fromEntity=DOUBT`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      expect(res.body).toEqual(
        expect.objectContaining({
          data: {
            id: reportDoubt.id,
            type: reportDoubt.type,
            reason: reportDoubt.reason,
            resolution: 'ARCHIVED',
            createdAt: expect.any(String) as string,
            updatedAt: expect.any(String) as string,
          },
          statusCode: 200,
          path: `GET /report/${reportDoubt.id}`,
          date: expect.any(String) as string,
        }),
      );
    });

    it('200: should get a single report applying dynamic select projection', async () => {
      const res = await req
        .get(`/report/${reportDoubt.id}?fromEntity=DOUBT&select=user`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      expect(res.body).toEqual(
        expect.objectContaining({
          data: {
            id: reportDoubt.id,
            type: reportDoubt.type,
            reason: reportDoubt.reason,
            user: mockUserResponse,
            resolution: 'ARCHIVED',
            createdAt: expect.any(String) as string,
            updatedAt: expect.any(String) as string,
          },
          statusCode: 200,
          path: `GET /report/${reportDoubt.id}`,
          date: expect.any(String) as string,
        }),
      );
    });

    it('400: should fail if fromEntity query parameter is missing', async () => {
      await req
        .get(`/report/${reportDoubt.id}?select=user`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);
    });

    it('403: should fail to get the report if requested by a standard USER', async () => {
      await req
        .get(`/report/${reportDoubt.id}?fromEntity=DOUBT&select=user`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('200 (data null): should return not found if the report id does not exist in that entity', async () => {
      const id = randomUUID();
      const res = await req
        .get(`/report/${id}?fromEntity=DOUBT&select=user`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      expect(res.body).toEqual(
        expect.objectContaining({
          data: null,
          statusCode: 200,
          path: `GET /report/${id}`,
          date: expect.any(String) as string,
        }),
      );
    });
  });

  describe('PATCH /report/:id/resolve', () => {
    beforeAll(() => {
      if (!reportDoubt) {
        throw new Error('reportDoubt undefined, please check: POST /report');
      }
    });

    it('200: should resolve a report changing its status and resolution details', async () => {
      const res = await req
        .patch(`/report/${reportDoubt.id}/resolve?fromEntity=DOUBT`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          resolution: 'BANNED',
        })
        .expect(200);
      expect(res.body).toEqual(
        expect.objectContaining({
          data: {
            id: reportDoubt.id,
            userId: mockUser.id,
            doubtId: mockDoubt.id,
            type: reportDoubt.type,
            reason: reportDoubt.reason,
            resolution: 'BANNED',
            createdAt: expect.any(String) as string,
            updatedAt: expect.any(String) as string,
          },
          statusCode: 200,
          path: `PATCH /report/${reportDoubt.id}/resolve`,
          date: expect.any(String) as string,
        }),
      );
    });

    it('400: should fail to resolve if fromEntity is missing or invalid', async () => {
      await req
        .patch(`/report/${reportDoubt.id}/resolve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          resolution: 'BANNED',
        })
        .expect(400);
    });

    it('403: should fail to resolve the report if requested by a standard USER', async () => {
      await req
        .patch(`/report/${reportDoubt.id}/resolve?fromEntity=DOUBT`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          resolution: 'BANNED',
        })
        .expect(403);
    });

    it('404: should return not found if trying to resolve a non-existent report', async () => {
      await req
        .patch(`/report/${randomUUID()}/resolve?fromEntity=DOUBT`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          resolution: 'BANNED',
        })
        .expect(404);
    });
  });

  describe('DELETE /report/:id', () => {
    it('200: should permanently delete the report record', async () => {
      const res = await req
        .delete(`/report/${reportDoubt.id}?fromEntity=DOUBT`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      expect(res.body).toEqual(
        expect.objectContaining({
          data: {
            id: reportDoubt.id,
            userId: mockUser.id,
            doubtId: mockDoubt.id,
            type: reportDoubt.type,
            reason: reportDoubt.reason,
            resolution: 'BANNED',
            createdAt: expect.any(String) as string,
            updatedAt: expect.any(String) as string,
          },
          statusCode: 200,
          path: `DELETE /report/${reportDoubt.id}`,
          date: expect.any(String) as string,
        }),
      );
    });

    it('400: should fail to delete if fromEntity query parameter is missing', async () => {
      await req
        .delete(`/report/${reportDoubt.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);
    });

    it('403: should fail to delete the report if requested by a standard USER', async () => {
      await req
        .delete(`/report/${reportDoubt.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('404: should return not found if the report id does not exist', async () => {
      await req
        .delete(`/report/${reportDoubt.id}?fromEntity=DOUBT`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  afterAll(async () => {
    if (mockUser || mockAdmin) {
      await prismaService.user.deleteMany({
        where: {
          email: {
            contains: 'e2e-user@devos.app',
          },
        },
      });
    }

    await prismaService.$disconnect();
    await app.close();
  });
});
