import { PrismaService } from '@/prisma/prisma.service';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAnswerDTO } from './answer.dto';
import { verifyUUIDs } from '@/common/pipes/uuid-validator/uuid-validator.pipe';
import { Role } from '@/generated/prisma/enums';
import { DeleteArguments } from '@/common/types/service.common.arguments';
import { CreateCommentDTO } from '@/common/dtos/comment.dto';

@Injectable()
export class AnswerService {
  constructor(private readonly prisma: PrismaService) {}

  async create({
    doubtId,
    userId,
    data,
  }: {
    doubtId: string;
    userId: string;
    data: CreateAnswerDTO;
  }) {
    verifyUUIDs([doubtId, userId]);
    return this.prisma.answer.create({ data: { ...data, doubtId, userId } });
  }

  async toggleCorrect({
    id,
    userId,
    role,
  }: {
    id: string;
    userId: string;
    role: Role;
  }) {
    verifyUUIDs([id, userId]);
    const answer = await this.prisma.answer.findUnique({ where: { id } });
    if (!answer) throw new NotFoundException('Answer not found');
    await this.prisma.answer.update({
      where: {
        id,
        ...(role === 'USER' ? { doubt: { authorId: userId } } : {}),
      },
      data: { correct: !answer.correct },
    });
    return !answer.correct ? 'correct' : 'incorrect';
  }

  async delete({ id, authorId: userId, role }: DeleteArguments) {
    verifyUUIDs([id, userId]);
    const answer = await this.prisma.answer.findUnique({
      where: { id },
      select: {
        userId: true,
        doubt: true,
      },
    });

    if (!answer) {
      throw new NotFoundException('Answer not found');
    }

    if (role === 'ADMIN') {
      return await this.prisma.answer.delete({ where: { id } });
    }

    if (answer.userId === userId) {
      return await this.prisma.answer.delete({ where: { id, userId } });
    }

    if (answer.doubt.authorId === userId) {
      return await this.prisma.answer.delete({
        where: { id, doubt: { authorId: userId } },
      });
    }

    throw new ForbiddenException(
      'You must be admin, answer or doubt creator to perform this action.',
    );
  }

  async comment({
    answerId,
    userId,
    data,
  }: {
    answerId: string;
    userId: string;
    data: CreateCommentDTO;
  }) {
    verifyUUIDs([answerId, userId]);
    return this.prisma.answerComment.create({
      data: { ...data, answerId, userId },
    });
  }

  async deleteComment({
    id: commentId,
    authorId: userId,
    role,
  }: DeleteArguments) {
    verifyUUIDs([commentId, userId]);
    return this.prisma.answerComment.delete({
      where: { id: commentId, ...(role === 'USER' ? { userId } : {}) },
    });
  }
}
