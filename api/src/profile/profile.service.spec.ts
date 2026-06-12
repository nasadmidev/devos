import { Test, TestingModule } from '@nestjs/testing';
import { ProfileService } from './profile.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaService } from '@/prisma/prisma.service';
import {
  createProfile,
  profile,
  id,
  userId,
} from '@/__mocks__/profile/profile.mock';
import { InvalidUUIDException } from '@/common/exceptions/uuid-validator.exceptions';

describe('ProfileService', () => {
  let service: ProfileService;
  let prismaMock: DeepMockProxy<PrismaService>;

  beforeEach(async () => {
    prismaMock = mockDeep<PrismaService>();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<ProfileService>(ProfileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a profile', async () => {
      prismaMock.profile.create.mockResolvedValue(profile);
      const result = await service.create(userId, createProfile);
      expect(result).toEqual(profile);
      expect(prismaMock.profile.create).toHaveBeenCalledWith({
        data: { ...createProfile, userId },
      });
    });

    it('should throw InvalidUUIDException on invalid userId', async () => {
      await expect(
        service.create('invalid-uuid', createProfile),
      ).rejects.toThrow(InvalidUUIDException);
    });
  });

  describe('update', () => {
    it('should update a profile', async () => {
      prismaMock.profile.update.mockResolvedValue(profile);
      const result = await service.update({
        userId,
        data: { name: 'New name' },
      });
      expect(result).toEqual(profile);
      expect(prismaMock.profile.update).toHaveBeenCalledWith({
        where: { userId },
        data: { name: 'New name' },
      });
    });

    it('should throw InvalidUUIDException on invalid userId', async () => {
      await expect(
        service.update({ userId: 'invalid-uuid', data: { name: 'New name' } }),
      ).rejects.toThrow(InvalidUUIDException);
    });
  });

  describe('delete', () => {
    it('should delete a profile', async () => {
      prismaMock.profile.delete.mockResolvedValue(profile);
      const result = await service.delete(id, userId);
      expect(result).toEqual(profile);
      expect(prismaMock.profile.delete).toHaveBeenCalledWith({
        where: { userId, id },
      });
    });

    it('should throw InvalidUUIDException on invalid userId', async () => {
      await expect(service.delete('invalid-uuid', userId)).rejects.toThrow(
        InvalidUUIDException,
      );
    });

    it('should throw InvalidUUIDException on invalid id', async () => {
      await expect(service.delete(id, 'invalid-uuid')).rejects.toThrow(
        InvalidUUIDException,
      );
    });
  });

  describe('findOne', () => {
    it('should return a profile', async () => {
      prismaMock.profile.findUnique.mockResolvedValue(profile);
      const result = await service.findOne({ name: 'some' });
      expect(result).toEqual(profile);
      expect(prismaMock.profile.findUnique).toHaveBeenCalledWith({
        where: { name: 'some' },
      });
    });

    it('should throw InvalidUUIDException on invalid userId', async () => {
      await expect(service.findOne({ userId: 'invalid-uuid' })).rejects.toThrow(
        InvalidUUIDException,
      );
    });

    it('should throw InvalidUUIDException on invalid id', async () => {
      await expect(service.findOne({ id: 'invalid-uuid' })).rejects.toThrow(
        InvalidUUIDException,
      );
    });
  });
});
