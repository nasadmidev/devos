import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import request from 'supertest';
import TestAgent from 'supertest/lib/agent';
import { ResourceService } from './resource.service';
import { Test } from '@nestjs/testing';
import { ResourceModule } from './resource.module';
import { PrismaService } from '@/prisma/prisma.service';
import { JwtGuard } from '@/auth/jwt/jwt.guard';
import { RolesGuard } from '@/auth/roles/role.guard';
import { NextFunction, Request, Response } from 'express';
import {
  id,
  resourceMock,
  resourceMockWithSelection,
  createResourceMock,
  authorId,
} from '@/__mocks__/resource/resource.mock';
import { mockUser } from '@/__mocks__/user/user.mock';
import {
  createResourceCommentMock,
  resourceCommentMock,
} from '@/__mocks__/resource/resourceInteractions.mock';
import { Server } from 'http';
import { JwtService } from '@nestjs/jwt';

describe('ResourceController (e2e)', () => {
  let app: INestApplication;
  let resourceServiceMock: DeepMockProxy<ResourceService>;
  let req: TestAgent;

  beforeAll(async () => {
    resourceServiceMock = mockDeep<ResourceService>();
    const moduleRef = await Test.createTestingModule({
      imports: [ResourceModule],
      providers: [
        { provide: JwtGuard, useValue: { canActive: () => true } },
        { provide: RolesGuard, useValue: { canActive: () => true } },
        JwtService,
      ],
    })
      .overrideProvider(PrismaService)
      .useValue({})
      .overrideProvider(ResourceService)
      .useValue(resourceServiceMock)
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        forbidNonWhitelisted: true,
        whitelist: true,
      }),
    );

    // attach a fake authenticated user
    app.use((req: Request, res: Response, next: NextFunction) => {
      req.user = { sub: authorId };
      next();
    });

    await app.init();
  });

  beforeEach(() => {
    req = request(app.getHttpServer() as Server);
    jest.clearAllMocks();
  });

  const toIso = (d: Date) => d.toISOString();

  describe('GET /resource/all', () => {
    it('200: get all resources without parameters', async () => {
      resourceServiceMock.findAll.mockResolvedValue([]);
      await req.get('/resource/all').expect(200).expect([]);
    });

    it('200: get all resources with lastIndex query', async () => {
      resourceServiceMock.findAll.mockResolvedValue([]);
      await req.get(`/resource/all?lastIndex=${id}`).expect(200).expect([]);
    });

    it('400: invalid UUID for lastIndex', async () => {
      await req.get('/resource/all?lastIndex=invalid-uuid').expect(400);
    });

    it('400: invalid limit value (number string)', async () => {
      await req.get('/resource/all?limit=s').expect(400);
    });

    it('400: invalid select fields', async () => {
      await req.get('/resource/all?select=non-exists').expect(400);
    });
  });

  describe('GET /resource/:id', () => {
    it('200: get resource by id (positive)', async () => {
      resourceServiceMock.findOne.mockResolvedValue(resourceMockWithSelection);

      const expected = {
        ...resourceMockWithSelection,
        createdAt: toIso(resourceMock.createdAt),
        updatedAt: toIso(resourceMock.updatedAt),
        author: {
          ...mockUser,
          createdAt: toIso(mockUser.createdAt),
          updatedAt: toIso(mockUser.updatedAt),
        },
      };

      const res = await req.get(`/resource/${id}`).expect(200);
      expect(res.body).toEqual(expected);
    });

    it('400: get resource by id (invalid uuid)', async () => {
      await req.get('/resource/invalid-uuid').expect(400);
    });
  });

  describe('POST /resource', () => {
    it('201: create resource (positive)', async () => {
      resourceServiceMock.create.mockResolvedValue(resourceMock);

      const expected = {
        ...resourceMock,
        createdAt: toIso(resourceMock.createdAt),
        updatedAt: toIso(resourceMock.updatedAt),
      };

      const res = await req
        .post('/resource')
        .send(createResourceMock)
        .expect(201);
      expect(res.body).toEqual(expected);
    });

    it('400: create resource validation error (missing fields)', async () => {
      await req.post('/resource').send({}).expect(400);
    });
  });

  describe('PUT /resource/:id', () => {
    it('200: update resource by id (positive)', async () => {
      const update = { title: 'Updated title' };
      const updated = {
        ...resourceMock,
        ...update,
        updatedAt: new Date(),
      };
      resourceServiceMock.update.mockResolvedValue(updated);

      const expected = {
        ...updated,
        createdAt: toIso(resourceMock.createdAt),
        updatedAt: toIso(updated.updatedAt),
      };

      const res = await req.put(`/resource/${id}`).send(update).expect(200);
      expect(res.body).toEqual(expected);
    });

    it('400: update resource by id (invalid uuid)', async () => {
      await req.put('/resource/invalid-uuid').send({ title: 'x' }).expect(400);
    });

    it('400: update validation error (invalid payload)', async () => {
      await req.put(`/resource/${id}`).send({ url: 'not-a-url' }).expect(400);
    });
  });

  describe('DELETE /resource/:id', () => {
    it('200: delete resource by id (positive)', async () => {
      resourceServiceMock.delete.mockResolvedValue(resourceMock);

      const expected = {
        ...resourceMock,
        createdAt: toIso(resourceMock.createdAt),
        updatedAt: toIso(resourceMock.updatedAt),
      };

      const res = await req.delete(`/resource/${id}`).expect(200);
      expect(res.body).toEqual(expected);
    });

    it('400: delete resource by id (invalid uuid)', async () => {
      await req.delete('/resource/invalid-uuid').expect(400);
    });
  });

  describe('PATCH /resource/:id/like', () => {
    it('200: toggle like (positive)', async () => {
      resourceServiceMock.toggleLike.mockResolvedValue('CREATED');
      const res = await req.patch(`/resource/${id}/like`).expect(200);
      expect(res.body).toEqual({
        state: 'CREATED',
      });
    });

    it('400: toggle like invalid id', async () => {
      await req.patch('/resource/invalid-uuid/like').expect(400);
    });
  });

  describe('PATCH /resource/:id/bookmark', () => {
    it('200: toggle bookmark (positive)', async () => {
      resourceServiceMock.toggleBookmark.mockResolvedValue('CREATED');
      const res = await req.patch(`/resource/${id}/bookmark`).expect(200);
      expect(res.body).toEqual({
        state: 'CREATED',
      });
    });

    it('400: toggle bookmark invalid id', async () => {
      await req.patch('/resource/invalid-uuid/bookmark').expect(400);
    });
  });

  describe('POST /resource/:id/comments', () => {
    it('201: create comment (positive)', async () => {
      resourceServiceMock.comment.mockResolvedValue(resourceCommentMock);

      const expected = {
        ...resourceCommentMock,
        updatedAt: toIso(resourceCommentMock.updatedAt),
        createdAt: toIso(resourceCommentMock.createdAt),
      };

      const res = await req
        .post(`/resource/${id}/comments`)
        .send(createResourceCommentMock)
        .expect(201);
      expect(res.body).toEqual(expected);
    });

    it('400: create comment validation error (missing text)', async () => {
      await req.post(`/resource/${id}/comments`).send({}).expect(400);
    });
  });

  describe('DELETE /resource/comments/:commentId', () => {
    it('200: delete comment by id (positive)', async () => {
      resourceServiceMock.deleteComment.mockResolvedValue(resourceCommentMock);
      const expected = {
        ...resourceCommentMock,
        updatedAt: toIso(resourceCommentMock.updatedAt),
        createdAt: toIso(resourceCommentMock.createdAt),
      };
      const res = await req
        .delete(`/resource/comments/${resourceCommentMock.id}`)
        .expect(200);
      expect(res.body).toEqual(expected);
    });

    it('400: delete comment invalid id', async () => {
      await req.delete('/resource/comments/invalid-uuid').expect(400);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
