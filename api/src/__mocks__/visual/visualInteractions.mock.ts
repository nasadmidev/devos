import { randomUUID } from 'crypto';
import { authorId as userId, id as visualId } from './visual.mock';
import {
  VisualBookmark,
  VisualComment,
  VisualLike,
} from '@/generated/prisma/client';

export const visualLikeMock: VisualLike = {
  id: 777,
  visualId,
  userId,
};

export const visualBookmarkMock: VisualBookmark = {
  id: randomUUID(),
  visualId,
  userId,
};

export const createVisualCommentMock = {
  content: 'Comment content',
};

export const visualCommentMock: VisualComment = {
  id: randomUUID(),
  parentId: null,
  visualId,
  userId,
  content: createVisualCommentMock.content,
  createdAt: new Date(),
  updatedAt: new Date(),
};
