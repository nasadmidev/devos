import { Test, TestingModule } from '@nestjs/testing';
import { ReportController } from './report.controller';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { ReportService } from './report.service';
import { JwtGuard } from '@/auth/jwt/jwt.guard';
import { RolesGuard } from '@/auth/roles/role.guard';
import { JwtService } from '@nestjs/jwt';
import { createReportMock, id } from '@/__mocks__/report/report.mock';
import { EntityType } from './report.dto';
import { requestAuthorizedMock } from '@/__mocks__/common/request.mock';
import { BadRequestException } from '@nestjs/common';

describe('ReportController', () => {
  let controller: ReportController;
  let serviceMock: DeepMockProxy<ReportService>;

  beforeEach(async () => {
    serviceMock = mockDeep<ReportService>();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportController],
      providers: [
        { provide: ReportService, useValue: serviceMock },
        { provide: JwtGuard, useValue: { canActive: () => true } },
        { provide: RolesGuard, useValue: { canActive: () => true } },
        JwtService,
      ],
    }).compile();

    controller = module.get<ReportController>(ReportController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a report', async () => {
    const { mock, createMock } = createReportMock(EntityType['USER']);
    serviceMock.create.mockResolvedValue(mock);
    const result = await controller.createReport(
      requestAuthorizedMock,
      createMock,
    );
    expect(result).toEqual(mock);
    expect(serviceMock.create).toHaveBeenCalledWith(
      requestAuthorizedMock.user.sub,
      createMock,
    );
  });

  describe('getAllReports', () => {
    const { mock } = createReportMock(EntityType['RESOURCE']);
    it('should get all reports without select', async () => {
      serviceMock.findAll.mockResolvedValue([mock]);
      const result = await controller.getAllReports({});
      expect(result).toEqual([mock]);
      expect(serviceMock.findAll).toHaveBeenCalledWith({});
    });

    it('should get all reports with select', async () => {
      serviceMock.findAll.mockResolvedValue([mock]);
      const result = await controller.getAllReports({ select: ['resource'] });
      expect(result).toEqual([mock]);
      expect(serviceMock.findAll).toHaveBeenCalledWith({
        select: {
          resource: true,
        },
      });
    });
  });

  describe('getOneReport', () => {
    const { mock } = createReportMock(EntityType['VISUAL']);
    it('should get one report without select', async () => {
      serviceMock.findOne.mockResolvedValue(mock);
      const result = await controller.getOneReport(id, {
        fromEntity: EntityType['VISUAL'],
      });
      expect(result).toEqual(mock);
      expect(serviceMock.findOne).toHaveBeenCalledWith({
        id,
        fromEntity: EntityType['VISUAL'],
      });
    });

    it('should get one report with select', async () => {
      serviceMock.findOne.mockResolvedValue(mock);
      const result = await controller.getOneReport(id, {
        fromEntity: EntityType['VISUAL'],
        select: ['visual'],
      });
      expect(result).toEqual(mock);
      expect(serviceMock.findOne).toHaveBeenCalledWith({
        id,
        fromEntity: EntityType['VISUAL'],
        select: {
          visual: true,
        },
      });
    });

    it('should throw BadRequestException on non-defined fromEntity', async () => {
      await expect(
        controller.getOneReport(id, {
          fromEntity: undefined as unknown as EntityType,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  it('should resolve report', async () => {
    const { mock } = createReportMock(EntityType['DOUBT']);
    serviceMock.resolve.mockResolvedValue(mock);
    const result = await controller.resolveReport(
      id,
      { resolution: 'BANNED' },
      EntityType['DOUBT'],
    );
    expect(result).toEqual(mock);
    expect(serviceMock.resolve).toHaveBeenCalledWith({
      id,
      fromEntity: EntityType['DOUBT'],
      data: { resolution: 'BANNED' },
    });
  });

  it('should delete a report', async () => {
    const { mock } = createReportMock(EntityType['USER']);
    serviceMock.delete.mockResolvedValue(mock);
    const result = await controller.deleteReport(id, EntityType['USER']);
    expect(result).toEqual(mock);
    expect(serviceMock.delete).toHaveBeenCalledWith(id, EntityType['USER']);
  });
});
