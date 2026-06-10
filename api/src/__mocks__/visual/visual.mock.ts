import { Visual } from '@/generated/prisma/client';
import { randomUUID } from 'crypto';
import { mockUser } from '../user/user.mock';

export const id = randomUUID();
export const authorId = randomUUID();

export const createVisualMock = {
  title: 'Visual title',
  url: 'http://visual.url',
  description: 'Visual description',
};

export const visualMock: Visual = {
  id,
  authorId,
  ...createVisualMock,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const visualMockWithSelection = {
  ...visualMock,
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
