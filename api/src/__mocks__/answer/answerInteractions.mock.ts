import { AnswerComment } from '@/generated/prisma/client';
import { randomUUID } from 'crypto';
import { answerId, userId } from './answer.mock';

export const commentId = randomUUID();

export const createAnswerCommentMock = {
  content: 'Comment Content',
};

export const answerCommentMock: AnswerComment = {
  id: commentId,
  answerId: answerId,
  userId: userId,
  ...createAnswerCommentMock,
  parentId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};
