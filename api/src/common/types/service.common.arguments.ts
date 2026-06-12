import { Role } from '@/generated/prisma/enums';

export interface FindAllArguments<T> {
  lastIndex?: string;
  select?: T;
  limit?: string;
}

export interface UpdateArguments<T> {
  id: string;
  authorId: string;
  data: T;
}

export interface DeleteArguments {
  id: string;
  authorId: string;
  role: Role;
}
