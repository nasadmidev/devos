import {
  ResourceBookmark,
  ResourceComment,
  ResourceLike,
} from '@/generated/prisma/client';
import { authorId as userId, id as resourceId } from './resource.mock';
import { randomUUID } from 'crypto';

export const resourceLikeMock: ResourceLike = {
  id: 999,
  userId,
  resourceId,
};

export const resourceBookmarkMock: ResourceBookmark = {
  id: randomUUID(),
  userId,
  resourceId,
};

export const createResourceCommentMock = {
  content: 'Comment content',
};

export const resourceCommentMock: ResourceComment = {
  id: randomUUID(),
  userId,
  resourceId,
  parentId: null,
  ...createResourceCommentMock,
  createdAt: new Date(),
  updatedAt: new Date(),
};
