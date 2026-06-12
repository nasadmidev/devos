import { RequestAuthorized } from '@/auth/auth.service';
import { randomUUID } from 'crypto';

export const requestAuthorizedMock = {
  user: {
    sub: randomUUID(),
    role: 'USER',
  },
} as RequestAuthorized;
