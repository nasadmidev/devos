import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import request from 'supertest';
import TestAgent from 'supertest/lib/agent';
import { VisualService } from './visual.service';
import { Test } from '@nestjs/testing';
import { VisualModule } from './visual.module';
import { PrismaService } from '@/prisma/prisma.service';
import { JwtGuard } from '@/auth/jwt/jwt.guard';
import { RolesGuard } from '@/auth/roles/role.guard';
import { NextFunction, Request, Response } from 'express';
import {
  id,
  visualMock,
  visualMockWithSelection,
  createVisualMock,
  authorId,
} from '@/__mocks__/visual/visual.mock';
import { mockUser } from '@/__mocks__/user/user.mock';
import { Server } from 'http';
import {
  createVisualCommentMock,
  visualCommentMock,
} from '@/__mocks__/visual/visualInteractions.mock';

describe('VisualController', () => {
  let app: INestApplication;
  let visualServiceMock: DeepMockProxy<VisualService>;
  let req: TestAgent;

  beforeAll(async () => {
    visualServiceMock = mockDeep<VisualService>();
    const moduleRef = await Test.createTestingModule({
      imports: [VisualModule],
      providers: [
        { provide: JwtGuard, useValue: { canActive: () => true } },
        { provide: RolesGuard, useValue: { canActive: () => true } },
      ],
    })
      .overrideProvider(PrismaService)
      .useValue({})
      .overrideProvider(VisualService)
      .useValue(visualServiceMock)
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

  describe('GET /visual/all', () => {
    it('200: get all visuals without parameters', async () => {
      visualServiceMock.findAll.mockResolvedValue([]);
      await req.get('/visual/all').expect(200).expect([]);
    });

    it('200: get all visuals with lastIndex query', async () => {
      visualServiceMock.findAll.mockResolvedValue([]);
      await req.get(`/visual/all?lastIndex=${id}`).expect(200).expect([]);
    });

    it('400: invalid UUID for lastIndex', async () => {
      await req.get('/visual/all?lastIndex=invalid-uuid').expect(400);
    });
  });

  describe('GET /visual/:id', () => {
    it('200: get visual by id (positive)', async () => {
      visualServiceMock.findOne.mockResolvedValue(visualMockWithSelection);

      const expected = {
        ...visualMockWithSelection,
        createdAt: toIso(visualMock.createdAt),
        updatedAt: toIso(visualMock.updatedAt),
        author: {
          ...mockUser,
          createdAt: toIso(mockUser.createdAt),
          updatedAt: toIso(mockUser.updatedAt),
        },
      };

      const res = await req.get(`/visual/${id}`).expect(200);
      expect(res.body).toEqual(expected);
    });

    it('400: get visual by id (invalid uuid)', async () => {
      await req.get('/visual/invalid-uuid').expect(400);
    });
  });

  describe('POST /visual', () => {
    it('201: create visual (positive)', async () => {
      visualServiceMock.create.mockResolvedValue(visualMock);

      const expected = {
        ...visualMock,
        createdAt: toIso(visualMock.createdAt),
        updatedAt: toIso(visualMock.updatedAt),
      };

      const res = await req.post('/visual').send(createVisualMock).expect(201);
      expect(res.body).toEqual(expected);
    });

    it('400: create visual validation error (missing fields)', async () => {
      await req.post('/visual').send({}).expect(400);
    });
  });

  describe('PUT /visual/:id', () => {
    it('200: update visual by id (positive)', async () => {
      const update = { title: 'Updated title' };
      const updated = {
        ...visualMock,
        ...update,
        updatedAt: new Date(),
      };
      visualServiceMock.update.mockResolvedValue(updated);

      const expected = {
        ...updated,
        createdAt: toIso(visualMock.createdAt),
        updatedAt: toIso(updated.updatedAt),
      };

      const res = await req.put(`/visual/${id}`).send(update).expect(200);
      expect(res.body).toEqual(expected);
    });

    it('400: update visual by id (invalid uuid)', async () => {
      await req.put('/visual/invalid-uuid').send({ title: 'x' }).expect(400);
    });

    it('400: update validation error (invalid payload)', async () => {
      await req.put(`/visual/${id}`).send({ url: 'not-a-url' }).expect(400);
    });
  });

  describe('DELETE /visual/:id', () => {
    it('200: delete visual by id (positive)', async () => {
      visualServiceMock.delete.mockResolvedValue(visualMock);

      const expected = {
        ...visualMock,
        createdAt: toIso(visualMock.createdAt),
        updatedAt: toIso(visualMock.updatedAt),
      };

      const res = await req.delete(`/visual/${id}`).expect(200);
      expect(res.body).toEqual(expected);
    });

    it('400: delete visual by id (invalid uuid)', async () => {
      await req.delete('/visual/invalid-uuid').expect(400);
    });
  });

  describe('PATCH /visual/:id/like', () => {
    it('200: toggle like (positive)', async () => {
      visualServiceMock.toggleLike.mockResolvedValue('CREATED');
      const res = await req.patch(`/visual/${id}/like`).expect(200);
      expect(res.body).toEqual({
        state: 'CREATED',
      });
    });

    it('400: toggle like invalid id', async () => {
      await req.patch('/visual/invalid-uuid/like').expect(400);
    });
  });

  describe('PATCH /visual/:id/bookmark', () => {
    it('200: toggle bookmark (positive)', async () => {
      visualServiceMock.toggleBookmark.mockResolvedValue('CREATED');
      const res = await req.patch(`/visual/${id}/bookmark`).expect(200);
      expect(res.body).toEqual({
        state: 'CREATED',
      });
    });

    it('400: toggle bookmark invalid id', async () => {
      await req.patch('/visual/invalid-uuid/bookmark').expect(400);
    });
  });

  describe('POST /visual/:id/comments', () => {
    it('201: create comment (positive)', async () => {
      visualServiceMock.comment.mockResolvedValue(visualCommentMock);

      const expected = {
        ...visualCommentMock,
        updatedAt: toIso(visualCommentMock.updatedAt),
        createdAt: toIso(visualCommentMock.createdAt),
      };

      const res = await req
        .post(`/visual/${id}/comments`)
        .send(createVisualCommentMock)
        .expect(201);
      expect(res.body).toEqual(expected);
    });

    it('400: create comment validation error (missing text)', async () => {
      await req.post(`/visual/${id}/comments`).send({}).expect(400);
    });
  });

  describe('DELETE /visual/comments/:commentId', () => {
    it('200: delete comment by id (positive)', async () => {
      visualServiceMock.deleteComment.mockResolvedValue(visualCommentMock);
      const expected = {
        ...visualCommentMock,
        updatedAt: toIso(visualCommentMock.updatedAt),
        createdAt: toIso(visualCommentMock.createdAt),
      };
      const res = await req
        .delete(`/visual/comments/${visualCommentMock.id}`)
        .expect(200);
      expect(res.body).toEqual(expected);
    });

    it('400: delete comment invalid id', async () => {
      await req.delete('/visual/comments/invalid-uuid').expect(400);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
