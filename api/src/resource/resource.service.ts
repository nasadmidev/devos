import {
  validateUUID,
  verifyUUIDs,
} from '@/common/pipes/uuid-validator/uuid-validator.pipe';
import { ResourceSelect } from '@/generated/prisma/models';
import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { isNumberString } from 'class-validator';
import {
  CreateResourceCommentDTO,
  CreateResourceDTO,
  UpdateResourceDTO,
} from './resource.dto';
import { Role } from '@/generated/prisma/enums';
import {
  DeleteArguments,
  FindAllArguments,
  UpdateArguments,
} from '@/common/types/service.common.arguments';
import { InvalidNumberStingException } from '@/common/exceptions/invalid-number-string.exceptions';

@Injectable()
export class ResourceService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll({
    lastIndex,
    limit = '50',
    select,
  }: FindAllArguments<ResourceSelect>) {
    if (lastIndex) validateUUID(lastIndex);
    if (!isNumberString(limit)) {
      throw new InvalidNumberStingException('limit');
    }
    return this.prisma.resource.findMany({
      take: parseInt(limit),
      ...(lastIndex
        ? {
            cursor: {
              id: lastIndex,
            },
            skip: 1,
          }
        : {}),
      select: {
        ...select,
        title: true,
        id: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string, select?: ResourceSelect) {
    validateUUID(id);
    return this.prisma.resource.findUnique({
      where: { id },
      select: { ...select, title: true, description: true, url: true },
    });
  }

  async create(authorId: string, data: CreateResourceDTO) {
    validateUUID(authorId);
    return this.prisma.resource.create({ data: { ...data, authorId } });
  }

  async update({ id, authorId, data }: UpdateArguments<UpdateResourceDTO>) {
    verifyUUIDs([id, authorId]);
    return this.prisma.resource.update({
      where: { id, authorId },
      data,
    });
  }

  async delete({ id, authorId, role }: DeleteArguments) {
    verifyUUIDs([id, authorId]);
    return this.prisma.resource.delete({
      where: {
        id,
        ...(role === 'USER' ? { authorId } : {}),
      },
    });
  }

  async toggleLike(
    resourceId: string,
    userId: string,
  ): Promise<'DELETED' | 'CREATED'> {
    verifyUUIDs([resourceId, userId]);
    const exists = await this.prisma.resourceLike.count({
      where: {
        userId,
        resourceId,
      },
    });

    if (exists >= 1) {
      await this.prisma.resourceLike.delete({
        where: { userId_resourceId: { userId, resourceId } },
      });
      return 'DELETED';
    } else {
      await this.prisma.resourceLike.create({
        data: { userId, resourceId },
      });
      return 'CREATED';
    }
  }

  async toggleBookmark(
    resourceId: string,
    userId: string,
  ): Promise<'DELETED' | 'CREATED'> {
    verifyUUIDs([resourceId, userId]);
    const exists = await this.prisma.resourceBookmark.count({
      where: {
        userId,
        resourceId,
      },
    });

    if (exists >= 1) {
      await this.prisma.resourceBookmark.delete({
        where: { userId_resourceId: { userId, resourceId } },
      });
      return 'DELETED';
    } else {
      await this.prisma.resourceBookmark.create({
        data: { userId, resourceId },
      });
      return 'CREATED';
    }
  }

  async comment({
    resourceId,
    userId,
    data,
  }: {
    resourceId: string;
    userId: string;
    data: CreateResourceCommentDTO;
  }) {
    verifyUUIDs([resourceId, userId]);
    return this.prisma.resourceComment.create({
      data: { ...data, resourceId, userId },
    });
  }

  async deleteComment({
    commentId,
    userId,
    role,
  }: {
    commentId: string;
    userId: string;
    role: Role;
  }) {
    verifyUUIDs([commentId, userId]);
    return this.prisma.resourceComment.delete({
      where: { id: commentId, ...(role === 'USER' ? { userId } : {}) },
    });
  }
}
