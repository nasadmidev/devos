import { Test, TestingModule } from '@nestjs/testing';
import { AnswerService } from './answer.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaService } from '@/prisma/prisma.service';
import {
  answerMock,
  doubtId,
  userId,
  createAnswerMock,
  answerId,
} from '@/__mocks__/answer/answer.mock';
import { InvalidUUIDException } from '@/common/exceptions/uuid-validator.exceptions';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  answerCommentMock,
  commentId,
  createAnswerCommentMock,
} from '@/__mocks__/answer/answerInteractions.mock';

describe('AnswerService', () => {
  let service: AnswerService;
  let prismaMock: DeepMockProxy<PrismaService>;

  beforeEach(async () => {
    prismaMock = mockDeep<PrismaService>();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnswerService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<AnswerService>(AnswerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an answer', async () => {
      prismaMock.answer.create.mockResolvedValue(answerMock);
      const result = await service.create({
        doubtId,
        userId,
        data: createAnswerMock,
      });
      expect(result).toEqual(answerMock);
      expect(prismaMock.answer.create).toHaveBeenCalledWith({
        data: {
          ...createAnswerMock,
          doubtId,
          userId,
        },
      });
    });

    it('should throw InvalidUUIDException on invalid userId', async () => {
      await expect(
        service.create({
          doubtId,
          userId: 'invalid-uuid',
          data: createAnswerMock,
        }),
      ).rejects.toThrow(InvalidUUIDException);
    });

    it('should throw InvalidUUIDException on invalid doubtId', async () => {
      await expect(
        service.create({
          doubtId: 'invalid-uuid',
          userId,
          data: createAnswerMock,
        }),
      ).rejects.toThrow(InvalidUUIDException);
    });
  });

  describe('toggleCorrect', () => {
    it('should return correct for false correct answer with authorId', async () => {
      prismaMock.answer.findUnique.mockResolvedValue(answerMock);
      prismaMock.answer.update.mockResolvedValue(answerMock);
      const result = await service.toggleCorrect({
        id: answerId,
        userId,
        role: 'USER',
      });
      expect(result).toEqual('correct');
      expect(prismaMock.answer.update).toHaveBeenCalledWith({
        where: {
          id: answerId,
          doubt: {
            authorId: userId,
          },
        },
        data: {
          correct: !answerMock.correct,
        },
      });
    });

    it('should return incorrect for true correct answer with ADMIN', async () => {
      prismaMock.answer.findUnique.mockResolvedValue({
        ...answerMock,
        correct: true,
      });
      prismaMock.answer.update.mockResolvedValue(answerMock);
      const result = await service.toggleCorrect({
        id: answerId,
        userId,
        role: 'ADMIN',
      });
      expect(result).toEqual('incorrect');
      expect(prismaMock.answer.update).toHaveBeenCalledWith({
        where: {
          id: answerId,
        },
        data: {
          correct: false,
        },
      });
    });

    it('should throw InvalidUUIDException on invalid userId', async () => {
      await expect(
        service.toggleCorrect({
          id: answerId,
          userId: 'invalid-uuid',
          role: 'USER',
        }),
      ).rejects.toThrow(InvalidUUIDException);
    });

    it('should throw InvalidUUIDException on invalid answerId', async () => {
      await expect(
        service.toggleCorrect({
          id: 'invalid-uuid',
          userId,
          role: 'USER',
        }),
      ).rejects.toThrow(InvalidUUIDException);
    });
    it('should throw a NotFoundException on null answer', async () => {
      prismaMock.answer.findUnique.mockResolvedValue(null);
      await expect(
        service.toggleCorrect({ id: answerId, userId, role: 'USER' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete an answer when it is an administrator', async () => {
      prismaMock.answer.findUnique.mockResolvedValue(answerMock);
      prismaMock.answer.delete.mockResolvedValue(answerMock);
      const result = await service.delete({
        id: answerId,
        authorId: userId,
        role: 'ADMIN',
      });
      expect(result).toEqual(answerMock);
      expect(prismaMock.answer.delete).toHaveBeenCalledWith({
        where: { id: answerId },
      });
    });

    it('should delete an answer when it is the same userId', async () => {
      prismaMock.answer.findUnique.mockResolvedValue(answerMock);
      prismaMock.answer.delete.mockResolvedValue(answerMock);
      const result = await service.delete({
        id: answerId,
        authorId: userId,
        role: 'USER',
      });
      expect(result).toEqual(answerMock);
      expect(prismaMock.answer.delete).toHaveBeenCalledWith({
        where: { id: answerId, userId },
      });
    });

    it('should delete an answer when it is the same author doubt id', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      prismaMock.answer.findUnique.mockResolvedValue({
        ...answerMock,
        userId: randomUUID(),
        doubt: {
          authorId: userId,
        },
      } as any);
      prismaMock.answer.delete.mockResolvedValue(answerMock);
      const result = await service.delete({
        id: answerId,
        authorId: userId,
        role: 'USER',
      });
      expect(result).toEqual(answerMock);
      expect(prismaMock.answer.delete).toHaveBeenCalledWith({
        where: { id: answerId, doubt: { authorId: userId } },
      });
    });

    it('should throw a NotFoundException on answer null', async () => {
      prismaMock.answer.findUnique.mockResolvedValue(null);
      await expect(
        service.delete({ id: answerId, authorId: userId, role: 'USER' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw a ForbiddenException if all of the previous options failed', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      prismaMock.answer.findUnique.mockResolvedValue({
        ...answerMock,
        userId: randomUUID(),
        doubt: {
          authorId: randomUUID(),
        },
      } as any);
      await expect(
        service.delete({
          id: answerId,
          authorId: userId,
          role: 'USER',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw InvalidUUIDException on invalid userId', async () => {
      await expect(
        service.delete({
          id: answerId,
          authorId: 'invalid-uuid',
          role: 'USER',
        }),
      ).rejects.toThrow(InvalidUUIDException);
    });

    it('should throw InvalidUUIDException on invalid answerId', async () => {
      await expect(
        service.delete({
          id: 'invalid-uuid',
          authorId: userId,
          role: 'USER',
        }),
      ).rejects.toThrow(InvalidUUIDException);
    });
  });

  describe('comment', () => {
    it('should create a comment', async () => {
      prismaMock.answerComment.create.mockResolvedValue(answerCommentMock);
      const result = await service.comment({
        answerId,
        userId,
        data: createAnswerCommentMock,
      });
      expect(result).toEqual(answerCommentMock);
      expect(prismaMock.answerComment.create).toHaveBeenCalledWith({
        data: { ...createAnswerCommentMock, answerId, userId },
      });
    });

    it('should throw InvalidUUIDException on invalid userId', async () => {
      await expect(
        service.comment({
          answerId,
          userId: 'invalid-uuid',
          data: createAnswerCommentMock,
        }),
      ).rejects.toThrow(InvalidUUIDException);
    });

    it('should throw InvalidUUIDException on invalid answerId', async () => {
      await expect(
        service.comment({
          answerId: 'invalid-uuid',
          userId,
          data: createAnswerCommentMock,
        }),
      ).rejects.toThrow(InvalidUUIDException);
    });
  });

  describe('deleteComment', () => {
    it('should delete a comment', async () => {
      prismaMock.answerComment.delete.mockResolvedValue(answerCommentMock);
      const result = await service.deleteComment({
        id: commentId,
        authorId: userId,
        role: 'USER',
      });
      expect(result).toEqual(answerCommentMock);
      expect(prismaMock.answerComment.delete).toHaveBeenCalledWith({
        where: { id: commentId, userId },
      });
    });

    it('should delete a comment as administrator', async () => {
      prismaMock.answerComment.delete.mockResolvedValue(answerCommentMock);
      const result = await service.deleteComment({
        id: commentId,
        authorId: userId,
        role: 'ADMIN',
      });
      expect(result).toEqual(answerCommentMock);
      expect(prismaMock.answerComment.delete).toHaveBeenCalledWith({
        where: { id: commentId },
      });
    });

    it('should throw InvalidUUIDException on invalid userId', async () => {
      await expect(
        service.deleteComment({
          id: commentId,
          authorId: 'invalid-uuid',
          role: 'USER',
        }),
      ).rejects.toThrow(InvalidUUIDException);
    });

    it('should throw InvalidUUIDException on invalid commentId', async () => {
      await expect(
        service.deleteComment({
          id: 'invalid-uuid',
          authorId: userId,
          role: 'USER',
        }),
      ).rejects.toThrow(InvalidUUIDException);
    });
  });
});
