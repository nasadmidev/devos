/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { BadRequestException, Injectable } from '@nestjs/common';
import {
  CreateReportDTO,
  EntityType,
  ListAllReportsQueryDTO,
  ReportSelect,
  ResolveReportDTO,
} from './report.dto';
import { PrismaService } from '@/prisma/prisma.service';
import {
  DoubtReport,
  ResourceReport,
  UserReport,
  VisualReport,
} from '@/generated/prisma/client';
import { validateUUID } from '@/common/pipes/uuid-validator/uuid-validator.pipe';

type Report = UserReport | VisualReport | ResourceReport | DoubtReport;

@Injectable()
export class ReportService {
  constructor(private readonly prisma: PrismaService) {}

  private async executeByEntity<T>(
    key: EntityType,
    obj: Record<EntityType, (args: any) => Promise<any>>,
    args?: Record<string, any>,
  ) {
    return obj[key](args) as Promise<T>;
  }

  async create(userId: string, data: CreateReportDTO) {
    validateUUID(userId);
    const { entityType, entityId, reason, type } = data;
    return this.executeByEntity<Report>(
      entityType,
      {
        USER: (args) => this.prisma.userReport.create(args),
        VISUAL: (args) => this.prisma.visualReport.create(args),
        RESOURCE: (args) => this.prisma.resourceReport.create(args),
        DOUBT: (args) => this.prisma.doubtReport.create(args),
      },
      {
        data: {
          ...(entityType === EntityType.USER && {
            toUserId: entityId,
            fromUserId: userId,
          }),
          ...(entityType === EntityType.VISUAL && {
            visualId: entityId,
            userId,
          }),
          ...(entityType === EntityType.RESOURCE && {
            resourceId: entityId,
            userId,
          }),
          ...(entityType === EntityType.DOUBT && { doubtId: entityId, userId }),
          reason,
          type,
        },
      },
    );
  }

  async findAll({
    lastIndex,
    lastIndexType,
    limit = '50',
    state,
    fromEntity,
    select,
  }: Omit<ListAllReportsQueryDTO, 'select'> & { select?: ReportSelect }) {
    if (lastIndex) validateUUID(lastIndex);
    const parsedLimit = parseInt(limit, 10);
    const commonSelect = {
      id: true,
      type: true,
      resolution: true,
      createdAt: true,
      updatedAt: true,
    };

    const baseArgs = {
      ...(state ? { where: { resolution: state } } : {}),
      orderBy: { createdAt: 'desc' } as { createdAt: 'desc' | 'asc' },
    };

    if (fromEntity) {
      return this.executeByEntity<Report[]>(
        fromEntity,
        {
          USER: (args) => this.prisma.userReport.findMany(args),
          VISUAL: (args) => this.prisma.visualReport.findMany(args),
          RESOURCE: (args) => this.prisma.resourceReport.findMany(args),
          DOUBT: (args) => this.prisma.doubtReport.findMany(args),
        },
        {
          ...baseArgs,
          ...(lastIndex ? { cursor: { id: lastIndex }, skip: 1 } : {}),
          take: parsedLimit,
          select: { ...select, ...commonSelect },
        },
      );
    } else {
      if (lastIndex && !lastIndexType) {
        throw new BadRequestException(
          'If lastIndex is defined, lastIndexType must be defined',
        );
      }
      const findArguments = (type: EntityType) => ({
        ...baseArgs,
        ...(lastIndex && lastIndexType === type
          ? { cursor: { id: lastIndex }, skip: 1 }
          : {}),
        take: parsedLimit,
        select: commonSelect,
      });

      const [userReports, visualReports, resourceReports, doubtReports] =
        await this.prisma.$transaction([
          this.prisma.userReport.findMany(findArguments(EntityType.USER)),
          this.prisma.visualReport.findMany(findArguments(EntityType.VISUAL)),
          this.prisma.resourceReport.findMany(
            findArguments(EntityType.RESOURCE),
          ),
          this.prisma.doubtReport.findMany(findArguments(EntityType.DOUBT)),
        ]);

      const reports = [
        ...userReports.map((rest) => ({ ...rest, entity: 'USER' })),
        ...visualReports.map((rest) => ({ ...rest, entity: 'VISUAL' })),
        ...resourceReports.map((rest) => ({ ...rest, entity: 'RESOURCE' })),
        ...doubtReports.map((rest) => ({ ...rest, entity: 'DOUBT' })),
      ]
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, parsedLimit);

      return reports;
    }
  }

  async findOne({
    id,
    fromEntity,
    select,
  }: {
    id: string;
    fromEntity: EntityType;
    select?: ReportSelect;
  }) {
    validateUUID(id);
    return this.executeByEntity<Report>(
      fromEntity,
      {
        USER: (args) => this.prisma.userReport.findUnique(args),
        VISUAL: (args) => this.prisma.visualReport.findUnique(args),
        RESOURCE: (args) => this.prisma.resourceReport.findUnique(args),
        DOUBT: (args) => this.prisma.doubtReport.findUnique(args),
      },
      {
        where: {
          id,
        },
        select: {
          ...select,
          id: true,
          type: true,
          resolution: true,
          updatedAt: true,
          createdAt: true,
          reason: true,
        },
      },
    );
  }

  async resolve({
    id,
    fromEntity,
    data,
  }: {
    id: string;
    fromEntity: EntityType;
    data: ResolveReportDTO;
  }) {
    validateUUID(id);
    return this.executeByEntity<Report>(
      fromEntity,
      {
        USER: (args) => this.prisma.userReport.update(args),
        VISUAL: (args) => this.prisma.visualReport.update(args),
        RESOURCE: (args) => this.prisma.resourceReport.update(args),
        DOUBT: (args) => this.prisma.doubtReport.update(args),
      },
      {
        where: {
          id,
        },
        data,
      },
    );
  }

  async delete(id: string, fromEntity: EntityType) {
    validateUUID(id);
    return this.executeByEntity<Report>(
      fromEntity,
      {
        USER: (args) => this.prisma.userReport.delete(args),
        VISUAL: (args) => this.prisma.visualReport.delete(args),
        RESOURCE: (args) => this.prisma.resourceReport.delete(args),
        DOUBT: (args) => this.prisma.doubtReport.delete(args),
      },
      {
        where: {
          id,
        },
      },
    );
  }
}
