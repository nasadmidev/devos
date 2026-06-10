import { Test, TestingModule } from '@nestjs/testing';
import { VisualService } from './visual.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaService } from '@/prisma/prisma.service';

describe('VisualService', () => {
  let service: VisualService;
  let prismaMock: DeepMockProxy<PrismaService>;

  beforeEach(async () => {
    prismaMock = mockDeep<PrismaService>();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VisualService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<VisualService>(VisualService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
