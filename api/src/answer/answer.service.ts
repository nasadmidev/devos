import { PrismaService } from '@/prisma/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAnswerDTO } from './answer.dto';
import { verifyUUIDs } from '@/common/pipes/uuid-validator/uuid-validator.pipe';
import { Role } from '@/generated/prisma/enums';
import { DeleteArguments } from '@/common/types/service.common.arguments';
import { CreateCommentDTO } from '@/common/dtos/comment.dto';

@Injectable()
export class AnswerService {
  constructor(private readonly prisma: PrismaService) {}

  async createAnswer({
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

  async toggleAnswer({
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

  async deleteAnswer({ id, authorId: userId, role }: DeleteArguments) {
    verifyUUIDs([id, userId]);
    return await this.prisma.answer.delete({
      where: { id, ...(role === 'USER' ? { userId } : {}) },
    });
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
