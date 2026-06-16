import { Test, TestingModule } from '@nestjs/testing';
import { ReportService } from './report.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaService } from '@/prisma/prisma.service';

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
});
