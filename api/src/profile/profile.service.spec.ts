import { Test, TestingModule } from '@nestjs/testing';
import { ProfileService } from './profile.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaService } from '@/prisma/prisma.service';

describe('ProfileService', () => {
  let service: ProfileService;
  let prismaMock: DeepMockProxy<PrismaService>;

  beforeEach(async () => {
    prismaMock = mockDeep<PrismaService>();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<ProfileService>(ProfileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
