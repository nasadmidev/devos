import {
  DoubtReport,
  ResourceReport,
  UserReport,
  VisualReport,
} from '@/generated/prisma/client';
import { ReportType, ResolutionType } from '@/generated/prisma/enums';
import { CreateReportDTO, EntityType } from '@/report/report.dto';
import { randomUUID } from 'crypto';

export const userId = randomUUID();
export const entityId = randomUUID();
export const id = randomUUID();

type Report = UserReport | VisualReport | ResourceReport | DoubtReport;

const baseMock = {
  id,
  type: ReportType['SPAM'],
  reason: 'reason',
  resolution: ResolutionType['BANNED'],
  createdAt: new Date(),
  updatedAt: new Date(),
};

export function createReportMock<
  T = UserReport | VisualReport | ResourceReport | DoubtReport,
>(
  type: EntityType,
): {
  mock: T;
  createMock: CreateReportDTO;
} {
  let mock: Report;
  switch (type) {
    case EntityType.USER:
      mock = { ...baseMock, fromUserId: userId, toUserId: entityId };
      break;
    case EntityType.VISUAL:
      mock = { ...baseMock, userId, visualId: entityId };
      break;
    case EntityType.RESOURCE:
      mock = { ...baseMock, userId, resourceId: entityId };
      break;
    case EntityType.DOUBT:
      mock = { ...baseMock, userId, doubtId: entityId };
      break;
    default:
      throw new TypeError('Invalid entity type');
  }
  return {
    mock: mock as T,
    createMock: {
      entityId,
      entityType: type,
      type: baseMock.type,
      reason: baseMock.reason,
    },
  };
}
