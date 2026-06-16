import { Test, TestingModule } from '@nestjs/testing';
import { ReportController } from './report.controller';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { ReportService } from './report.service';
import { JwtGuard } from '@/auth/jwt/jwt.guard';
import { RolesGuard } from '@/auth/roles/role.guard';
import { JwtService } from '@nestjs/jwt';

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
});
