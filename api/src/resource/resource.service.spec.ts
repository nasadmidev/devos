import { Test, TestingModule } from '@nestjs/testing';
import { ResourceService } from './resource.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaService } from '@/prisma/prisma.service';
import {
  authorId,
  createResourceMock,
  id,
  resourceMock,
} from '@/__mocks__/resource/resource.mock';
import { InvalidUUIDException } from '@/common/exceptions/uuid-validator.exceptions';
import { randomUUID } from 'crypto';
import {
  ResourceBookmark,
  ResourceComment,
  ResourceLike,
} from '@/generated/prisma/client';
import { InvalidNumberStingException } from '@/common/exceptions/invalid-number-string.exceptions';

const userId = authorId;
const resourceId = id;

const resourceLikeMock: ResourceLike = {
  id: 777,
  resourceId,
  userId,
};

const resourceBookmarkMock: ResourceBookmark = {
  id: randomUUID(),
  resourceId,
  userId,
};

const createResourceCommentMock = {
  content: 'Comment content',
};

const resourceCommentMock: ResourceComment = {
  id: randomUUID(),
  parentId: null,
  resourceId,
  userId,
  content: createResourceCommentMock.content,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('ResourceService', () => {
  let service: ResourceService;
  let prismaMock: DeepMockProxy<PrismaService>;

  beforeEach(async () => {
    prismaMock = mockDeep<PrismaService>();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResourceService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<ResourceService>(ResourceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return array of resources', async () => {
      prismaMock.resource.findMany.mockResolvedValue([]);
      const result = await service.findAll({});
      expect(result).toEqual([]);
      expect(prismaMock.resource.findMany).toHaveBeenCalledWith({
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
    it('should find a unique resource', async () => {
      prismaMock.resource.findUnique.mockResolvedValue(resourceMock);
      const result = await service.findOne(resourceId);
      expect(result).toEqual(resourceMock);
      expect(prismaMock.resource.findUnique).toHaveBeenCalledWith({
        where: { id: resourceId },
        select: {
          title: true,
          description: true,
          url: true,
        },
      });
    });

    it('should throw InvalidUUIDException on invalid resource id', async () => {
      await expect(service.findOne('invalid-uuid')).rejects.toThrow(
        InvalidUUIDException,
      );
    });
  });

  describe('create', () => {
    it('should create a new resource', async () => {
      prismaMock.resource.create.mockResolvedValue(resourceMock);
      const result = await service.create(userId, createResourceMock);
      expect(result).toEqual(resourceMock);
      expect(prismaMock.resource.create).toHaveBeenCalledWith({
        data: { ...createResourceMock, authorId: userId },
      });
    });

    it('should throw InvalidUUIDException on invalid authorId', async () => {
      await expect(
        service.create('invalid-uuid', createResourceMock),
      ).rejects.toThrow(InvalidUUIDException);
    });
  });

  describe('update', () => {
    it('should update a resource', async () => {
      prismaMock.resource.update.mockResolvedValue(resourceMock);
      const result = await service.update({
        id: resourceId,
        authorId: userId,
        data: { title: 'new title' },
      });
      expect(result).toEqual(resourceMock);
      expect(prismaMock.resource.update).toHaveBeenCalledWith({
        where: { id: resourceId, authorId: userId },
        data: { title: 'new title' },
      });
    });

    it('should throw InvalidUUIDException on invalid authorId', async () => {
      await expect(
        service.update({
          id: resourceId,
          authorId: 'invalid-uuid',
          data: { title: 'new title' },
        }),
      ).rejects.toThrow(InvalidUUIDException);
    });

    it('should throw InvalidUUIDException on invalid resourceId', async () => {
      await expect(
        service.update({
          id: 'invalid-uuid',
          authorId: userId,
          data: { title: 'new title' },
        }),
      ).rejects.toThrow(InvalidUUIDException);
    });
  });

  describe('delete', () => {
    it('should delete resource for user role', async () => {
      prismaMock.resource.delete.mockResolvedValue(resourceMock);
      const result = await service.delete({
        id: resourceId,
        authorId: userId,
        role: 'USER',
      });
      expect(result).toEqual(resourceMock);
      expect(prismaMock.resource.delete).toHaveBeenCalledWith({
        where: { id: resourceId, authorId: userId },
      });
    });

    it('should delete resource for admin role', async () => {
      prismaMock.resource.delete.mockResolvedValue(resourceMock);
      const result = await service.delete({
        id: resourceId,
        authorId: userId,
        role: 'ADMIN',
      });
      expect(result).toEqual(resourceMock);
      expect(prismaMock.resource.delete).toHaveBeenCalledWith({
        where: { id: resourceId },
      });
    });

    it('should throw InvalidUUIDException on invalid authorId', async () => {
      await expect(
        service.delete({
          id: resourceId,
          authorId: 'invalid-uuid',
          role: 'USER',
        }),
      ).rejects.toThrow(InvalidUUIDException);
    });

    it('should throw InvalidUUIDException on invalid resourceId', async () => {
      await expect(
        service.delete({ id: 'invalid-uuid', authorId: userId, role: 'USER' }),
      ).rejects.toThrow(InvalidUUIDException);
    });
  });

  describe('toggleLike', () => {
    it('should delete a like', async () => {
      prismaMock.resourceLike.count.mockResolvedValue(1);
      prismaMock.resourceLike.delete.mockResolvedValue(resourceLikeMock);
      const result = await service.toggleLike(resourceId, userId);
      expect(result).toBe('DELETED');
      expect(prismaMock.resourceLike.delete).toHaveBeenCalledWith({
        where: { userId_resourceId: { resourceId, userId } },
      });
    });

    it('should create a like', async () => {
      prismaMock.resourceLike.count.mockResolvedValue(0);
      prismaMock.resourceLike.create.mockResolvedValue(resourceLikeMock);
      const result = await service.toggleLike(resourceId, userId);
      expect(result).toBe('CREATED');
      expect(prismaMock.resourceLike.create).toHaveBeenCalledWith({
        data: {
          userId,
          resourceId,
        },
      });
    });

    it('should throw InvalidUUIDException on invalid resourceId', async () => {
      await expect(service.toggleLike('invalid-uuid', userId)).rejects.toThrow(
        InvalidUUIDException,
      );
    });

    it('should throw InvalidUUIDException on invalid userId', async () => {
      await expect(
        service.toggleLike(resourceId, 'invalid-uuid'),
      ).rejects.toThrow(InvalidUUIDException);
    });
  });

  describe('toggleBookmark', () => {
    it('should delete from bookmark', async () => {
      prismaMock.resourceBookmark.count.mockResolvedValue(1);
      prismaMock.resourceBookmark.delete.mockResolvedValue(
        resourceBookmarkMock,
      );
      const result = await service.toggleBookmark(resourceId, userId);
      expect(result).toBe('DELETED');
      expect(prismaMock.resourceBookmark.delete).toHaveBeenCalledWith({
        where: { userId_resourceId: { resourceId, userId } },
      });
    });

    it('should add to bookmark', async () => {
      prismaMock.resourceBookmark.count.mockResolvedValue(0);
      prismaMock.resourceBookmark.create.mockResolvedValue(
        resourceBookmarkMock,
      );
      const result = await service.toggleBookmark(resourceId, userId);
      expect(result).toBe('CREATED');
      expect(prismaMock.resourceBookmark.create).toHaveBeenCalledWith({
        data: {
          userId,
          resourceId,
        },
      });
    });

    it('should throw InvalidUUIDException on invalid resourceId', async () => {
      await expect(
        service.toggleBookmark('invalid-uuid', userId),
      ).rejects.toThrow(InvalidUUIDException);
    });

    it('should throw InvalidUUIDException on invalid userId', async () => {
      await expect(
        service.toggleBookmark(resourceId, 'invalid-uuid'),
      ).rejects.toThrow(InvalidUUIDException);
    });
  });

  describe('comment', () => {
    it('should create a comment', async () => {
      prismaMock.resourceComment.create.mockResolvedValue(resourceCommentMock);
      const result = await service.comment({
        resourceId: resourceId,
        userId: userId,
        data: createResourceCommentMock,
      });
      expect(result).toEqual(resourceCommentMock);
      expect(prismaMock.resourceComment.create).toHaveBeenCalledWith({
        data: {
          resourceId: resourceId,
          userId: userId,
          ...createResourceCommentMock,
        },
      });
    });

    it('should throw InvalidUUIDException on invalid resourceId', async () => {
      await expect(
        service.comment({
          resourceId: 'invalid-uuid',
          userId: userId,
          data: createResourceCommentMock,
        }),
      ).rejects.toThrow(InvalidUUIDException);
    });

    it('should throw InvalidUUIDException on invalid userId', async () => {
      await expect(
        service.comment({
          resourceId: resourceId,
          userId: 'invalid-uuid',
          data: createResourceCommentMock,
        }),
      ).rejects.toThrow(InvalidUUIDException);
    });
  });

  describe('deleteComment', () => {
    it('should delete a comment for user role', async () => {
      prismaMock.resourceComment.delete.mockResolvedValue(resourceCommentMock);
      const result = await service.deleteComment({
        commentId: resourceCommentMock.id,
        userId: userId,
        role: 'USER',
      });
      expect(result).toEqual(resourceCommentMock);
      expect(prismaMock.resourceComment.delete).toHaveBeenCalledWith({
        where: { id: resourceCommentMock.id, userId },
      });
    });

    it('should delete a comment for admin role', async () => {
      prismaMock.resourceComment.delete.mockResolvedValue(resourceCommentMock);
      const result = await service.deleteComment({
        commentId: resourceCommentMock.id,
        userId: userId,
        role: 'ADMIN',
      });
      expect(result).toEqual(resourceCommentMock);
      expect(prismaMock.resourceComment.delete).toHaveBeenCalledWith({
        where: { id: resourceCommentMock.id },
      });
    });

    it('should throw InvalidUUIDException on invalid comment id', async () => {
      await expect(
        service.deleteComment({
          commentId: 'invalid-uuid',
          userId: userId,
          role: 'USER',
        }),
      ).rejects.toThrow(InvalidUUIDException);
    });

    it('should throw InvalidUUIDException on invalid userId', async () => {
      await expect(
        service.deleteComment({
          commentId: resourceCommentMock.id,
          userId: 'invalid-uuid',
          role: 'USER',
        }),
      ).rejects.toThrow(InvalidUUIDException);
    });
  });
});
