import {
  validateUUID,
  verifyUUIDs,
} from '@/common/pipes/uuid-validator/uuid-validator.pipe';
import { DoubtSelect } from '@/generated/prisma/models';
import { PrismaService } from '@/prisma/prisma.service';
import {
  DeleteArguments,
  FindAllArguments,
  UpdateArguments,
} from '@/common/types/service.common.arguments';
import { Injectable } from '@nestjs/common';
import { isNumberString } from 'class-validator';
import { InvalidNumberStingException } from '@/common/exceptions/invalid-number-string.exceptions';
import { CreateDoubtDTO, UpdateDoubtDTO } from './doubt.dto';

@Injectable()
export class DoubtService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll({
    lastIndex,
    select,
    limit = '50',
  }: FindAllArguments<DoubtSelect>) {
    if (lastIndex) validateUUID(lastIndex);
    if (!isNumberString(limit)) {
      throw new InvalidNumberStingException('limit');
    }
    return this.prisma.doubt.findMany({
      take: parseInt(limit),
      select: {
        ...select,
        id: true,
        title: true,
      },
      ...(lastIndex
        ? {
            cursor: {
              id: lastIndex,
            },
            skip: 1,
          }
        : {}),
    });
  }

  async findOne(id: string, select?: DoubtSelect) {
    validateUUID(id);
    return this.prisma.doubt.findUnique({
      where: { id },
      select: {
        ...select,
        id: true,
        title: true,
        description: true,
        code: true,
        tags: true,
      },
    });
  }

  async create(authorId: string, data: CreateDoubtDTO) {
    validateUUID(authorId);
    return this.prisma.doubt.create({ data: { ...data, authorId } });
  }

  async update({ id, authorId, data }: UpdateArguments<UpdateDoubtDTO>) {
    verifyUUIDs([id, authorId]);
    return this.prisma.doubt.update({ where: { id, authorId }, data });
  }

  async delete({ id, authorId, role }: DeleteArguments) {
    verifyUUIDs([id, authorId]);
    return this.prisma.doubt.delete({
      where: { id, ...(role === 'USER' ? { authorId } : {}) },
    });
  }

  // ANSWER METHODS ON ANSWER SERVICE PROVIDER
}
