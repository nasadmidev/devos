import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateProfileDTO, UpdateProfileDTO } from './profile.dto';
import {
  validateUUID,
  verifyUUIDs,
} from '@/common/pipes/uuid-validator/uuid-validator.pipe';
import { ProfileWhereUniqueInput } from '@/generated/prisma/models';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, data: CreateProfileDTO) {
    validateUUID(userId);
    return this.prisma.profile.create({ data: { ...data, userId } });
  }

  async update({ userId, data }: { userId: string; data: UpdateProfileDTO }) {
    validateUUID(userId);
    return this.prisma.profile.update({ where: { userId }, data });
  }

  async delete(id: string, userId: string) {
    verifyUUIDs([id, userId]);
    return this.prisma.profile.delete({ where: { id, userId } });
  }

  async findOne(where: ProfileWhereUniqueInput) {
    verifyUUIDs<ProfileWhereUniqueInput>(where, ['id', 'userId']);
    return this.prisma.profile.findUnique({ where });
  }
}
