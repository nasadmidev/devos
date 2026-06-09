import { randomUUID } from 'crypto';
import { Profile } from '@/generated/prisma/client';

export const id = randomUUID();
export const userId = randomUUID();

export const createProfile = {
  name: 'name',
  description: 'Profile description',
  interests: [],
};

export const profile: Profile = {
  id,
  userId,
  ...createProfile,
  picture: null,
};
