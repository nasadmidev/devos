import { Test, TestingModule } from '@nestjs/testing';
import { VisualController } from './visual.controller';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { VisualService } from './visual.service';
import { JwtGuard } from '@/auth/jwt/jwt.guard';
import { RolesGuard } from '@/auth/roles/role.guard';
import { JwtService } from '@nestjs/jwt';

describe('VisualController', () => {
  let controller: VisualController;
  let serviceMock: DeepMockProxy<VisualService>;

  beforeEach(async () => {
    serviceMock = mockDeep<VisualService>();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VisualController],
      providers: [
        { provide: VisualService, useValue: serviceMock },
        { provide: JwtGuard, useValue: { canActive: () => true } },
        { provide: RolesGuard, useValue: { canActive: () => true } },
        JwtService,
      ],
    }).compile();

    controller = module.get<VisualController>(VisualController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
