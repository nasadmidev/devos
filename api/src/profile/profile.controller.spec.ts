import { Test, TestingModule } from '@nestjs/testing';
import { ProfileController } from './profile.controller';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { ProfileService } from './profile.service';
import { JwtGuard } from '@/auth/jwt/jwt.guard';
import { RolesGuard } from '@/auth/roles/role.guard';
import { JwtService } from '@nestjs/jwt';

describe('ProfileController', () => {
  let controller: ProfileController;
  let serviceMock: DeepMockProxy<ProfileService>;

  beforeEach(async () => {
    serviceMock = mockDeep<ProfileService>();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfileController],
      providers: [
        { provide: ProfileService, useValue: serviceMock },
        { provide: JwtGuard, useValue: { canActive: () => true } },
        { provide: RolesGuard, useValue: { canActive: () => true } },
        JwtService,
      ],
    }).compile();

    controller = module.get<ProfileController>(ProfileController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
