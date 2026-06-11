import { Resource } from '@/generated/prisma/client';
import { randomUUID } from 'crypto';
import { mockUser } from '../user/user.mock';

export const authorId = randomUUID();
export const id = randomUUID();

export const createResourceMock = {
  title: 'Resource title',
  description: 'Resource description',
  url: 'http://resource.resource/',
};

export const resourceMock: Resource = {
  id,
  authorId,
  ...createResourceMock,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const resourceMockWithSelection = {
  ...resourceMock,
  comments: [],
  likes: [],
  reports: [],
  bookmarkedBy: [],
  author: mockUser,
  _count: {
    likes: 0,
    reports: 0,
    bookmarkedBy: 0,
    comments: 0,
    author: 0,
  },
};
