import { Doubt } from '@/generated/prisma/client';
import { randomUUID } from 'crypto';
import { user } from '../user/user.mock';

export const doubtId = randomUUID();
export const authorId = randomUUID();

export const createDoubtMock = {
  title: 'doubt title',
  description: 'doubt description',
  tags: [],
};

export const doubtMock: Doubt = {
  id: doubtId,
  authorId,
  ...createDoubtMock,
  code: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const doubtMockWithSelection = {
  ...doubtMock,
  author: user,
  answers: [],
  reports: [],
  _count: {
    author: 0,
    answers: 0,
    reports: 0,
  },
};
