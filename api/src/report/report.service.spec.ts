import { Test, TestingModule } from '@nestjs/testing';
import { ReportService } from './report.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaService } from '@/prisma/prisma.service';
import {
  createReportMock,
  entityId,
  id,
  userId,
} from '@/__mocks__/report/report.mock';
import { EntityType } from './report.dto';
import {
  DoubtReport,
  ResourceReport,
  UserReport,
  VisualReport,
} from '@/generated/prisma/client';
import { InvalidUUIDException } from '@/common/exceptions/uuid-validator.exceptions';
import { BadRequestException } from '@nestjs/common';

describe('ReportService', () => {
  let service: ReportService;
  let prismaMock: DeepMockProxy<PrismaService>;

  beforeEach(async () => {
    prismaMock = mockDeep<PrismaService>();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<ReportService>(ReportService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create (using userReport model)', () => {
    const { mock, createMock } = createReportMock<UserReport>(
      EntityType['USER'],
    );
    it('should create a report', async () => {
      prismaMock.userReport.create.mockResolvedValue(mock);
      const result = await service.create(userId, createMock);
      expect(result).toEqual(mock);
      expect(prismaMock.userReport.create).toHaveBeenCalledWith({
        data: {
          reason: createMock.reason,
          type: createMock.type,
          toUserId: entityId,
          fromUserId: userId,
        },
      });
    });

    it('should throw InvalidUuidException', async () => {
      await expect(service.create('invalid-uuid', createMock)).rejects.toThrow(
        InvalidUUIDException,
      );
    });
  });

  describe('findAll (using visualReport model)', () => {
    const { mock } = createReportMock<VisualReport>(EntityType['VISUAL']);

    it('should return data from the entity pre-defined (using fromEntity)', async () => {
      prismaMock.visualReport.findMany.mockResolvedValue([]);
      const result = await service.findAll({
        fromEntity: EntityType['VISUAL'],
      });
      expect(result).toEqual([]);
      expect(prismaMock.visualReport.findMany).toHaveBeenCalledWith({
        orderBy: {
          createdAt: 'desc',
        },
        take: 50,
        select: {
          id: true,
          type: true,
          resolution: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    });

    it('should return data from all entities', async () => {
      prismaMock.$transaction.mockImplementation((promises) =>
        Promise.all(promises as unknown as Promise<unknown>[]),
      );
      prismaMock.userReport.findMany.mockResolvedValue([]);
      prismaMock.visualReport.findMany.mockResolvedValue([mock]);
      prismaMock.resourceReport.findMany.mockResolvedValue([]);
      prismaMock.doubtReport.findMany.mockResolvedValue([]);
      const result = await service.findAll({});
      expect(result).toEqual([{ ...mock, entity: 'VISUAL' }]);
      expect(prismaMock.visualReport.findMany).toHaveBeenCalledWith({
        orderBy: {
          createdAt: 'desc',
        },
        take: 50,
        select: {
          id: true,
          type: true,
          resolution: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    });

    it('should throw InvalidUUIDException', async () => {
      await expect(
        service.findAll({ lastIndex: 'invalid-uuid' }),
      ).rejects.toThrow(InvalidUUIDException);
    });

    it('should throw BadRequestException on lastIndexType undefined', async () => {
      await expect(service.findAll({ lastIndex: id })).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findOne (using resourceReport model)', () => {
    const { mock } = createReportMock<ResourceReport>(EntityType['RESOURCE']);

    it('should return one report', async () => {
      prismaMock.resourceReport.findUnique.mockResolvedValue(mock);
      const result = await service.findOne({
        id,
        fromEntity: EntityType['RESOURCE'],
      });
      expect(result).toEqual(mock);
      expect(prismaMock.resourceReport.findUnique).toHaveBeenCalledWith({
        where: {
          id,
        },
        select: {
          id: true,
          type: true,
          resolution: true,
          updatedAt: true,
          createdAt: true,
          reason: true,
        },
      });
    });

    it('should throw InvalidUUIDException on invalid id', async () => {
      await expect(
        service.findOne({
          id: 'invalid-uuid',
          fromEntity: EntityType['RESOURCE'],
        }),
      ).rejects.toThrow(InvalidUUIDException);
    });
  });

  describe('resolve (using doubtReport model)', () => {
    const { mock } = createReportMock<DoubtReport>(EntityType['DOUBT']);

    it('should resolve a doubt (resolution: ARCHIVED)', async () => {
      prismaMock.doubtReport.update.mockResolvedValue({
        ...mock,
        resolution: 'ARCHIVED',
      });
      const result = await service.resolve({
        id,
        fromEntity: EntityType['DOUBT'],
        data: { resolution: 'ARCHIVED' },
      });
      expect(result).toEqual({ ...mock, resolution: 'ARCHIVED' });
      expect(prismaMock.doubtReport.update).toHaveBeenCalledWith({
        where: {
          id,
        },
        data: {
          resolution: 'ARCHIVED',
        },
      });
    });

    it('should throw InvalidUUIDException on invalid id', async () => {
      await expect(
        service.resolve({
          id: 'invalid-uuid',
          fromEntity: EntityType['DOUBT'],
          data: {
            resolution: 'ARCHIVED',
          },
        }),
      ).rejects.toThrow(InvalidUUIDException);
    });
  });

  describe('delete (using userReport model)', () => {
    const { mock } = createReportMock<UserReport>(EntityType['USER']);

    it('should delete a report', async () => {
      prismaMock.userReport.delete.mockResolvedValue(mock);
      const result = await service.delete(id, EntityType['USER']);
      expect(result).toEqual(mock);
      expect(prismaMock.userReport.delete).toHaveBeenCalledWith({
        where: {
          id,
        },
      });
    });

    it('should throw InvalidUUIDException on invalid id', async () => {
      await expect(
        service.delete('invalid-uuid', EntityType['USER']),
      ).rejects.toThrow(InvalidUUIDException);
    });
  });
});
