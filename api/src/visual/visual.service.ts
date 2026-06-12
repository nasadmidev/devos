import {
  validateUUID,
  verifyUUIDs,
} from '@/common/pipes/uuid-validator/uuid-validator.pipe';
import { VisualSelect } from '@/generated/prisma/models';
import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { isNumberString } from 'class-validator';
import {
  CreateVisualCommentDTO,
  CreateVisualDTO,
  UpdateVisualDTO,
} from './visual.dto';
import { FindAllArguments } from '@/common/types/service.common.arguments';
import { InvalidNumberStingException } from '@/common/exceptions/invalid-number-string.exceptions';

@Injectable()
export class VisualService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll({
    lastIndex,
    select,
    limit = '50',
  }: FindAllArguments<VisualSelect>) {
    if (lastIndex) validateUUID(lastIndex);
    if (!isNumberString(limit)) {
      throw new InvalidNumberStingException('limit');
    }

    return this.prisma.visual.findMany({
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
        id: true,
        title: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string, select?: VisualSelect) {
    validateUUID(id);
    return this.prisma.visual.findUnique({
      where: { id },
      select: {
        ...select,
        title: true,
        description: true,
        url: true,
        id: true,
      },
    });
  }

  async create(authorId: string, data: CreateVisualDTO) {
    validateUUID(authorId);
    return this.prisma.visual.create({ data: { ...data, authorId } });
  }

  async update({
    id,
    authorId,
    data,
  }: {
    id: string;
    authorId: string;
    data: UpdateVisualDTO;
  }) {
    verifyUUIDs([id, authorId]);
    return this.prisma.visual.update({
      where: { id, authorId },
      data,
    });
  }

  async delete(id: string, authorId: string) {
    verifyUUIDs([id, authorId]);
    return this.prisma.visual.delete({
      where: { id, authorId },
    });
  }

  async toggleLike(
    visualId: string,
    userId: string,
  ): Promise<'CREATED' | 'DELETED'> {
    verifyUUIDs([visualId, userId]);
    const isThereALike = await this.prisma.visualLike.count({
      where: { visualId, userId },
    });
    if (isThereALike >= 1) {
      await this.prisma.visualLike.delete({
        where: { userId_visualId: { userId, visualId } },
      });
      return 'DELETED';
    } else {
      await this.prisma.visualLike.create({
        data: { userId, visualId },
      });
      return 'CREATED';
    }
  }

  async toggleBookmark(visualId: string, userId: string) {
    verifyUUIDs([visualId, userId]);
    const isBookmarked = await this.prisma.visualBookmark.count({
      where: { visualId, userId },
    });
    if (isBookmarked >= 1) {
      await this.prisma.visualBookmark.delete({
        where: { userId_visualId: { userId, visualId } },
      });
      return 'DELETED';
    } else {
      await this.prisma.visualBookmark.create({
        data: { userId, visualId },
      });
      return 'CREATED';
    }
  }

  async comment({
    visualId,
    userId,
    data,
  }: {
    visualId: string;
    userId: string;
    data: CreateVisualCommentDTO;
  }) {
    verifyUUIDs([visualId, userId]);
    return this.prisma.visualComment.create({
      data: { visualId, userId, ...data },
    });
  }

  async deleteComment({ id, userId }: { id: string; userId: string }) {
    verifyUUIDs([id, userId]);
    return this.prisma.visualComment.delete({
      where: { id, userId },
    });
  }
}
