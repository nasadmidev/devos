import { Test, TestingModule } from '@nestjs/testing';
import { VisualService } from './visual.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaService } from '@/prisma/prisma.service';
import {
  authorId,
  createVisualMock,
  id,
  visualMock,
} from '@/__mocks__/visual/visual.mock';
import { InvalidUUIDException } from '@/common/exceptions/uuid-validator.exceptions';
import {
  createVisualCommentMock,
  visualBookmarkMock,
  visualCommentMock,
  visualLikeMock,
} from '@/__mocks__/visual/visualInteractions.mock';
import { InvalidNumberStingException } from '@/common/exceptions/invalid-number-string.exceptions';

describe('VisualService', () => {
  let service: VisualService;
  let prismaMock: DeepMockProxy<PrismaService>;

  beforeEach(async () => {
    prismaMock = mockDeep<PrismaService>();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VisualService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<VisualService>(VisualService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return array of visuals', async () => {
      prismaMock.visual.findMany.mockResolvedValue([]);
      const result = await service.findAll({});
      expect(result).toEqual([]);
      expect(prismaMock.visual.findMany).toHaveBeenCalledWith({
        take: 50,
        select: {
          id: true,
          title: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    });

    it('should throw InvalidNumberStringException on invalid limit type', async () => {
      await expect(service.findAll({ limit: 's' })).rejects.toThrow(
        InvalidNumberStingException,
      );
    });

    it('should throw InvalidUUIDException on invalid lastIndex', async () => {
      await expect(
        service.findAll({ lastIndex: 'invalid-uuid' }),
      ).rejects.toThrow(InvalidUUIDException);
    });
  });

  describe('findOne', () => {
    it('should find a unique visual', async () => {
      prismaMock.visual.findUnique.mockResolvedValue(visualMock);
      const result = await service.findOne(id);
      expect(result).toEqual(visualMock);
      expect(prismaMock.visual.findUnique).toHaveBeenCalledWith({
        where: { id },
        select: {
          title: true,
          description: true,
          url: true,
          id: true,
        },
      });
    });

    it('should throw InvalidUUIDException on invalid visual id', async () => {
      await expect(service.findOne('invalid-uuid')).rejects.toThrow(
        InvalidUUIDException,
      );
    });
  });

  describe('create', () => {
    it('should create a new visual', async () => {
      prismaMock.visual.create.mockResolvedValue(visualMock);
      const result = await service.create(authorId, createVisualMock);
      expect(result).toEqual(visualMock);
      expect(prismaMock.visual.create).toHaveBeenCalledWith({
        data: { ...createVisualMock, authorId },
      });
    });

    it('should throw InvalidUUIDException on invalid authorId', async () => {
      await expect(
        service.create('invalid-uuid', createVisualMock),
      ).rejects.toThrow(InvalidUUIDException);
    });
  });

  describe('update', () => {
    it('should update a visual', async () => {
      prismaMock.visual.update.mockResolvedValue(visualMock);
      const result = await service.update({
        id,
        authorId,
        data: { title: 'new title' },
      });
      expect(result).toEqual(visualMock);
      expect(prismaMock.visual.update).toHaveBeenCalledWith({
        data: { title: 'new title' },
        where: { id, authorId },
      });
    });

    it('should throw InvalidUUIDException on invalid authorId', async () => {
      await expect(
        service.update({
          id,
          authorId: 'invalid-uuid',
          data: { title: 'new title' },
        }),
      ).rejects.toThrow(InvalidUUIDException);
    });

    it('should throw InvalidUUIDException on invalid visualId', async () => {
      await expect(
        service.update({
          id: 'invalid-uuid',
          authorId,
          data: { title: 'new title' },
        }),
      ).rejects.toThrow(InvalidUUIDException);
    });
  });

  describe('delete', () => {
    it('should delete visual', async () => {
      prismaMock.visual.delete.mockResolvedValue(visualMock);
      const result = await service.delete({ id, authorId, role: 'USER' });
      expect(result).toEqual(visualMock);
      expect(prismaMock.visual.delete).toHaveBeenCalledWith({
        where: {
          id,
          authorId: authorId,
        },
      });
    });

    it('should delete visual as administrator', async () => {
      prismaMock.visual.delete.mockResolvedValue(visualMock);
      const result = await service.delete({ id, authorId, role: 'ADMIN' });
      expect(result).toEqual(visualMock);
      expect(prismaMock.visual.delete).toHaveBeenCalledWith({
        where: {
          id,
        },
      });
    });

    it('should throw InvalidUUIDException on invalid authorId', async () => {
      await expect(
        service.delete({ id, authorId: 'invalid-uuid', role: 'USER' }),
      ).rejects.toThrow(InvalidUUIDException);
    });

    it('should throw InvalidUUIDException on invalid visualId', async () => {
      await expect(
        service.delete({ id: 'invalid-uuid', authorId, role: 'USER' }),
      ).rejects.toThrow(InvalidUUIDException);
    });
  });

  describe('toggleLike', () => {
    it('should delete a like', async () => {
      prismaMock.visualLike.count.mockResolvedValue(1);
      prismaMock.visualLike.delete.mockResolvedValue(visualLikeMock);
      const result = await service.toggleLike(id, authorId);
      expect(result).toBe('DELETED');
      expect(prismaMock.visualLike.delete).toHaveBeenCalledWith({
        where: { userId_visualId: { visualId: id, userId: authorId } },
      });
    });

    it('should create a like', async () => {
      prismaMock.visualLike.count.mockResolvedValue(0);
      prismaMock.visualLike.create.mockResolvedValue(visualLikeMock);
      const result = await service.toggleLike(id, authorId);
      expect(result).toBe('CREATED');
      expect(prismaMock.visualLike.create).toHaveBeenCalledWith({
        data: {
          userId: authorId,
          visualId: id,
        },
      });
    });

    it('should throw InvalidUUIDException on invalid visualId', async () => {
      await expect(
        service.toggleLike('invalid-uuid', authorId),
      ).rejects.toThrow(InvalidUUIDException);
    });

    it('should throw InvalidUUIDException on invalid userId', async () => {
      await expect(service.toggleLike(id, 'invalid-uuid')).rejects.toThrow(
        InvalidUUIDException,
      );
    });
  });

  describe('toggleBookmark', () => {
    it('should delete from bookmark', async () => {
      prismaMock.visualBookmark.count.mockResolvedValue(1);
      prismaMock.visualBookmark.delete.mockResolvedValue(visualBookmarkMock);
      const result = await service.toggleBookmark(id, authorId);
      expect(result).toBe('DELETED');
      expect(prismaMock.visualBookmark.delete).toHaveBeenCalledWith({
        where: { userId_visualId: { visualId: id, userId: authorId } },
      });
    });

    it('should add to bookmark', async () => {
      prismaMock.visualBookmark.count.mockResolvedValue(0);
      prismaMock.visualBookmark.create.mockResolvedValue(visualBookmarkMock);
      const result = await service.toggleBookmark(id, authorId);
      expect(result).toBe('CREATED');
      expect(prismaMock.visualBookmark.create).toHaveBeenCalledWith({
        data: {
          userId: authorId,
          visualId: id,
        },
      });
    });

    it('should throw InvalidUUIDException on invalid visualId', async () => {
      await expect(
        service.toggleBookmark('invalid-uuid', authorId),
      ).rejects.toThrow(InvalidUUIDException);
    });

    it('should throw InvalidUUIDException on invalid userId', async () => {
      await expect(service.toggleBookmark(id, 'invalid-uuid')).rejects.toThrow(
        InvalidUUIDException,
      );
    });
  });

  describe('comment', () => {
    it('should create a comment', async () => {
      prismaMock.visualComment.create.mockResolvedValue(visualCommentMock);
      const result = await service.comment({
        visualId: id,
        userId: authorId,
        data: createVisualCommentMock,
      });
      expect(result).toEqual(visualCommentMock);
      expect(prismaMock.visualComment.create).toHaveBeenCalledWith({
        data: { visualId: id, userId: authorId, ...createVisualCommentMock },
      });
    });

    it('should throw InvalidUUIDException on invalid visualId', async () => {
      await expect(
        service.comment({
          visualId: 'invalid-uuid',
          userId: authorId,
          data: createVisualCommentMock,
        }),
      ).rejects.toThrow(InvalidUUIDException);
    });

    it('should throw InvalidUUIDException on invalid userId', async () => {
      await expect(
        service.comment({
          visualId: id,
          userId: 'invalid-uuid',
          data: createVisualCommentMock,
        }),
      ).rejects.toThrow(InvalidUUIDException);
    });
  });

  describe('deleteComment', () => {
    it('should delete a comment', async () => {
      prismaMock.visualComment.delete.mockResolvedValue(visualCommentMock);
      const result = await service.deleteComment({ id, userId: authorId });
      expect(result).toEqual(visualCommentMock);
      expect(prismaMock.visualComment.delete).toHaveBeenCalledWith({
        where: { id, userId: authorId },
      });
    });

    it('should throw InvalidUUIDException on invalid comment id', async () => {
      await expect(
        service.deleteComment({
          id: 'invalid-uuid',
          userId: authorId,
        }),
      ).rejects.toThrow(InvalidUUIDException);
    });

    it('should throw InvalidUUIDException on invalid userId', async () => {
      await expect(
        service.deleteComment({
          id: id,
          userId: 'invalid-uuid',
        }),
      ).rejects.toThrow(InvalidUUIDException);
    });
  });
});
