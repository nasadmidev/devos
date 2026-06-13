import { Answer } from '@/generated/prisma/client';
import { randomUUID } from 'crypto';

export const answerId = randomUUID();
export const userId = randomUUID();
export const doubtId = randomUUID();

export const createAnswerMock = {
  content: 'answer content',
};

export const answerMock: Answer = {
  id: answerId,
  userId,
  doubtId,
  ...createAnswerMock,
  code: null,
  correct: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};
