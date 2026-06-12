import { Test, TestingModule } from '@nestjs/testing';
import { DoubtController } from './doubt.controller';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { DoubtService } from './doubt.service';
import { JwtGuard } from '@/auth/jwt/jwt.guard';
import { RolesGuard } from '@/auth/roles/role.guard';
import { JwtService } from '@nestjs/jwt';
import { AnswerService } from '@/answer/answer.service';

describe('DoubtController', () => {
  let controller: DoubtController;
  let serviceMock: DeepMockProxy<DoubtService>;
  let answerServiceMock: DeepMockProxy<AnswerService>;

  beforeEach(async () => {
    serviceMock = mockDeep<DoubtService>();
    answerServiceMock = mockDeep<AnswerService>();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DoubtController],
      providers: [
        { provide: AnswerService, useValue: answerServiceMock },
        { provide: DoubtService, useValue: serviceMock },
        { provide: JwtGuard, useValue: { canActive: () => true } },
        { provide: RolesGuard, useValue: { canActive: () => true } },
        JwtService,
      ],
    }).compile();

    controller = module.get<DoubtController>(DoubtController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
