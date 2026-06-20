import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { validateUUID } from '@/common/pipes/uuid-validator/uuid-validator.pipe';
import { CreateUserByAdminDTO, CreateUserDTO, UpdateUserDTO } from './user.dto';
import { hash } from 'bcrypt';
import { UserSelect } from '@/generated/prisma/models';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(lastIndex?: string) {
    if (lastIndex) validateUUID(lastIndex);
    return this.prisma.user.findMany({
      take: 50,
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

  async findOne(id: string, select?: UserSelect) {
    validateUUID(id);
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        ...select,
        id: true,
        email: true,
        oauthId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findOneByEmail(email: string) {
    return await this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findOneByOAuthID(oauthId: string) {
    return this.prisma.user.findUnique({ where: { oauthId } });
  }

  async create(data: CreateUserDTO | CreateUserByAdminDTO) {
    const parsedData = { ...data, password: await hash(data.password, 10) };
    return this.prisma.user.create({ data: parsedData });
  }

  async delete(id: string) {
    validateUUID(id);
    return this.prisma.user.delete({
      where: { id },
    });
  }

  async update(id: string, data: UpdateUserDTO) {
    validateUUID(id);
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }
}
