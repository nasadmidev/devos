import { Test, TestingModule } from '@nestjs/testing';
import { DoubtController } from './doubt.controller';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { DoubtService } from './doubt.service';
import { JwtGuard } from '@/auth/jwt/jwt.guard';
import { RolesGuard } from '@/auth/roles/role.guard';
import { JwtService } from '@nestjs/jwt';
import { AnswerService } from '@/answer/answer.service';
import {
  createDoubtMock,
  doubtId,
  doubtMock,
  doubtMockWithSelection,
} from '@/__mocks__/doubt/doubt.mock';
import { requestAuthorizedMock } from '@/__mocks__/common/request.mock';
import {
  answerId,
  answerMock,
  createAnswerMock,
} from '@/__mocks__/answer/answer.mock';
import {
  answerCommentMock,
  commentId,
  createAnswerCommentMock,
} from '@/__mocks__/answer/answerInteractions.mock';

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

  describe('findAllDoubts', () => {
    it('should find all doubts without filters', async () => {
      serviceMock.findAll.mockResolvedValue([]);
      const result = await controller.findAllDoubts({});
      expect(result).toEqual([]);
      expect(serviceMock.findAll).toHaveBeenCalledWith({});
    });

    it('should find all doubts with filter', async () => {
      serviceMock.findAll.mockResolvedValue([]);
      const result = await controller.findAllDoubts({
        lastIndex: doubtId,
        limit: '35',
        select: ['code'],
      });
      expect(result).toEqual([]);
      expect(serviceMock.findAll).toHaveBeenCalledWith({
        lastIndex: doubtId,
        limit: '35',
        select: {
          code: true,
        },
      });
    });
  });

  describe('findOne', () => {
    it('should find one doubts without filters', async () => {
      serviceMock.findOne.mockResolvedValue(doubtMockWithSelection);
      const result = await controller.findOneDoubt(doubtId, {});
      expect(result).toEqual(doubtMockWithSelection);
      expect(serviceMock.findOne).toHaveBeenCalledWith(doubtId, undefined);
    });

    it('should find all doubts with selection', async () => {
      serviceMock.findOne.mockResolvedValue(doubtMockWithSelection);
      const result = await controller.findOneDoubt(doubtId, {
        select: ['author'],
      });
      expect(result).toEqual(doubtMockWithSelection);
      expect(serviceMock.findOne).toHaveBeenCalledWith(doubtId, {
        author: true,
      });
    });
  });

  describe('create/update/delete doubt', () => {
    it('should create a doubt', async () => {
      serviceMock.create.mockResolvedValue(doubtMock);
      const result = await controller.createDoubt(
        requestAuthorizedMock,
        createDoubtMock,
      );
      expect(result).toEqual(doubtMock);
      expect(serviceMock.create).toHaveBeenCalledWith(
        requestAuthorizedMock.user.sub,
        createDoubtMock,
      );
    });

    it('should update a doubt', async () => {
      serviceMock.update.mockResolvedValue(doubtMock);
      const result = await controller.updateDoubt(
        doubtId,
        requestAuthorizedMock,
        { title: 'new title' },
      );
      expect(result).toEqual(doubtMock);
      expect(serviceMock.update).toHaveBeenCalledWith({
        id: doubtId,
        authorId: requestAuthorizedMock.user.sub,
        data: { title: 'new title' },
      });
    });

    it('should delete a doubt', async () => {
      serviceMock.delete.mockResolvedValue(doubtMock);
      const result = await controller.deleteDoubt(
        doubtId,
        requestAuthorizedMock,
      );
      expect(result).toEqual(doubtMock);
      expect(serviceMock.delete).toHaveBeenCalledWith({
        id: doubtId,
        authorId: requestAuthorizedMock.user.sub,
        role: requestAuthorizedMock.user.role,
      });
    });
  });

  describe('answer operations', () => {
    it('should create an answer', async () => {
      answerServiceMock.create.mockResolvedValue(answerMock);
      const result = await controller.createAnswer(
        doubtId,
        requestAuthorizedMock,
        createAnswerMock,
      );
      expect(result).toEqual(answerMock);
      expect(answerServiceMock.create).toHaveBeenCalledWith({
        doubtId,
        userId: requestAuthorizedMock.user.sub,
        data: createAnswerMock,
      });
    });

    it('should mark answer as correct', async () => {
      answerServiceMock.toggleCorrect.mockResolvedValue('correct');
      const result = await controller.toggleCorrect(
        answerId,
        requestAuthorizedMock,
      );
      expect(result).toEqual({ markAs: 'correct' });
      expect(answerServiceMock.toggleCorrect).toHaveBeenCalledWith({
        id: answerId,
        userId: requestAuthorizedMock.user.sub,
        role: requestAuthorizedMock.user.role,
      });
    });

    it('should mark answer as incorrect', async () => {
      answerServiceMock.toggleCorrect.mockResolvedValue('incorrect');
      const result = await controller.toggleCorrect(
        answerId,
        requestAuthorizedMock,
      );
      expect(result).toEqual({ markAs: 'incorrect' });
      expect(answerServiceMock.toggleCorrect).toHaveBeenCalledWith({
        id: answerId,
        userId: requestAuthorizedMock.user.sub,
        role: requestAuthorizedMock.user.role,
      });
    });

    it('should delete an answer', async () => {
      answerServiceMock.delete.mockResolvedValue(answerMock);
      const result = await controller.deleteAnswer(
        answerId,
        requestAuthorizedMock,
      );
      expect(result).toEqual(answerMock);
      expect(answerServiceMock.delete).toHaveBeenCalledWith({
        id: answerId,
        authorId: requestAuthorizedMock.user.sub,
        role: requestAuthorizedMock.user.role,
      });
    });

    describe('answer comments operations', () => {
      it('should create an answer comment', async () => {
        answerServiceMock.comment.mockResolvedValue(answerCommentMock);
        const result = await controller.createAnswerComment(
          answerId,
          requestAuthorizedMock,
          createAnswerCommentMock,
        );
        expect(result).toEqual(answerCommentMock);
        expect(answerServiceMock.comment).toHaveBeenCalledWith({
          answerId,
          userId: requestAuthorizedMock.user.sub,
          data: createAnswerCommentMock,
        });
      });

      it('should delete an answer comment', async () => {
        answerServiceMock.deleteComment.mockResolvedValue(answerCommentMock);
        const result = await controller.deleteAnswerComment(
          commentId,
          requestAuthorizedMock,
        );
        expect(result).toEqual(answerCommentMock);
        expect(answerServiceMock.deleteComment).toHaveBeenCalledWith({
          id: commentId,
          authorId: requestAuthorizedMock.user.sub,
          role: requestAuthorizedMock.user.role,
        });
      });
    });
  });
});
