import { randomUUID } from 'crypto';
import { Role, AuthType } from '@/generated/prisma/enums';
import { User } from '@/generated/prisma/client';

export const id = randomUUID();

export const createUser = {
  username: 'John Doe',
  email: 'john.doe@example.com',
  password: 'hashed-password',
  role: Role['USER'],
};

export const user = {
  id,
  oauthId: null,
  authType: AuthType['LOCAL'],
  ...createUser,
  updatedAt: new Date(),
  createdAt: new Date(),
};

export const mockUser: User = {
  id: '1',
  email: 'test@example.com',
  password: 'hashedpassword',
  role: 'ADMIN',
  authType: 'LOCAL',
  oauthId: null,
  updatedAt: new Date(),
  createdAt: new Date(),
};
