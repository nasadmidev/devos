import { Test, TestingModule } from '@nestjs/testing';
import { ResourceController } from './resource.controller';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { ResourceService } from './resource.service';
import { JwtGuard } from '@/auth/jwt/jwt.guard';
import { RolesGuard } from '@/auth/roles/role.guard';
import { JwtService } from '@nestjs/jwt';

describe('ResourceController', () => {
  let controller: ResourceController;
  let serviceMock: DeepMockProxy<ResourceService>;

  beforeEach(async () => {
    serviceMock = mockDeep<ResourceService>();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ResourceController],
      providers: [
        { provide: ResourceService, useValue: serviceMock },
        { provide: JwtGuard, useValue: { canActive: () => true } },
        { provide: RolesGuard, useValue: { canActive: () => true } },
        JwtService,
      ],
    }).compile();

    controller = module.get<ResourceController>(ResourceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
