import { Test, TestingModule } from '@nestjs/testing';
import { DoubtService } from './doubt.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaService } from '@/prisma/prisma.service';

describe('DoubtService', () => {
  let service: DoubtService;
  let prismaMock: DeepMockProxy<PrismaService>;

  beforeEach(async () => {
    prismaMock = mockDeep<PrismaService>();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DoubtService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<DoubtService>(DoubtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
