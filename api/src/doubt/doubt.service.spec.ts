import { Test, TestingModule } from '@nestjs/testing';
import { DoubtService } from './doubt.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaService } from '@/prisma/prisma.service';
import { InvalidNumberStingException } from '@/common/exceptions/invalid-number-string.exceptions';
import { InvalidUUIDException } from '@/common/exceptions/uuid-validator.exceptions';
import {
  createDoubtMock,
  doubtId,
  doubtMock,
  authorId,
} from '@/__mocks__/doubt/doubt.mock';

describe('DoubtService', () => {
  let service: DoubtService;
  let prismaMock: DeepMockProxy<PrismaService>;

  beforeEach(async () => {
    prismaMock = mockDeep<PrismaService>();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DoubtService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<DoubtService>(DoubtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return array of resources', async () => {
      prismaMock.doubt.findMany.mockResolvedValue([]);
      const result = await service.findAll({});
      expect(result).toEqual([]);
      expect(prismaMock.doubt.findMany).toHaveBeenCalledWith({
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
      prismaMock.doubt.findUnique.mockResolvedValue(doubtMock);
      const result = await service.findOne(doubtId);
      expect(result).toEqual(doubtMock);
      expect(prismaMock.doubt.findUnique).toHaveBeenCalledWith({
        where: { id: doubtId },
        select: {
          id: true,
          title: true,
          description: true,
          code: true,
          tags: true,
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
      prismaMock.doubt.create.mockResolvedValue(doubtMock);
      const result = await service.create(authorId, createDoubtMock);
      expect(result).toEqual(doubtMock);
      expect(prismaMock.doubt.create).toHaveBeenCalledWith({
        data: { ...createDoubtMock, authorId },
      });
    });

    it('should throw InvalidUUIDException on invalid authorId', async () => {
      await expect(
        service.create('invalid-uuid', createDoubtMock),
      ).rejects.toThrow(InvalidUUIDException);
    });
  });

  describe('update', () => {
    it('should update a resource', async () => {
      prismaMock.doubt.update.mockResolvedValue(doubtMock);
      const result = await service.update({
        id: doubtId,
        authorId,
        data: { title: 'new title' },
      });
      expect(result).toEqual(doubtMock);
      expect(prismaMock.doubt.update).toHaveBeenCalledWith({
        where: { id: doubtId, authorId },
        data: { title: 'new title' },
      });
    });

    it('should throw InvalidUUIDException on invalid authorId', async () => {
      await expect(
        service.update({
          id: doubtId,
          authorId: 'invalid-uuid',
          data: { title: 'new title' },
        }),
      ).rejects.toThrow(InvalidUUIDException);
    });

    it('should throw InvalidUUIDException on invalid doubtId', async () => {
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
    it('should delete resource for user role', async () => {
      prismaMock.doubt.delete.mockResolvedValue(doubtMock);
      const result = await service.delete({
        id: doubtId,
        authorId,
        role: 'USER',
      });
      expect(result).toEqual(doubtMock);
      expect(prismaMock.doubt.delete).toHaveBeenCalledWith({
        where: { id: doubtId, authorId },
      });
    });

    it('should delete resource for admin role', async () => {
      prismaMock.doubt.delete.mockResolvedValue(doubtMock);
      const result = await service.delete({
        id: doubtId,
        authorId,
        role: 'ADMIN',
      });
      expect(result).toEqual(doubtMock);
      expect(prismaMock.doubt.delete).toHaveBeenCalledWith({
        where: { id: doubtId },
      });
    });

    it('should throw InvalidUUIDException on invalid authorId', async () => {
      await expect(
        service.delete({
          id: doubtId,
          authorId: 'invalid-uuid',
          role: 'USER',
        }),
      ).rejects.toThrow(InvalidUUIDException);
    });

    it('should throw InvalidUUIDException on invalid doubtId', async () => {
      await expect(
        service.delete({ id: 'invalid-uuid', authorId, role: 'USER' }),
      ).rejects.toThrow(InvalidUUIDException);
    });
  });
});
