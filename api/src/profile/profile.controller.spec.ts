import { Test, TestingModule } from '@nestjs/testing';
import { ProfileController } from './profile.controller';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { ProfileService } from './profile.service';
import { JwtGuard } from '@/auth/jwt/jwt.guard';
import { RolesGuard } from '@/auth/roles/role.guard';
import { JwtService } from '@nestjs/jwt';
import { profile, createProfile } from '@/__mocks__/profile/profile.mock';
import { requestAuthorizedMock } from '@/__mocks__/common/request.mock';
import { BadRequestException } from '@nestjs/common';

describe('ProfileController', () => {
  let controller: ProfileController;
  let serviceMock: DeepMockProxy<ProfileService>;

  beforeEach(async () => {
    serviceMock = mockDeep<ProfileService>();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfileController],
      providers: [
        { provide: ProfileService, useValue: serviceMock },
        { provide: JwtGuard, useValue: { canActive: () => true } },
        { provide: RolesGuard, useValue: { canActive: () => true } },
        JwtService,
      ],
    }).compile();

    controller = module.get<ProfileController>(ProfileController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get my own profile', async () => {
    serviceMock.findOne.mockResolvedValue(profile);
    const result = await controller.getMyProfile(requestAuthorizedMock);
    expect(result).toEqual(profile);
    expect(serviceMock.findOne).toHaveBeenCalledWith({
      userId: requestAuthorizedMock.user.sub,
    });
  });

  describe('getProfileByName', () => {
    it('should get a profile by a name', async () => {
      serviceMock.findOne.mockResolvedValue(profile);
      const result = await controller.getProfileByName('name');
      expect(result).toEqual(profile);
      expect(serviceMock.findOne).toHaveBeenCalledWith({ name: 'name' });
    });

    it('should throw a BadRequestException on name undefined', async () => {
      await expect(
        controller.getProfileByName(undefined as unknown as string),
      ).rejects.toThrow(BadRequestException);
    });
  });

  it('should update profile', async () => {
    serviceMock.update.mockResolvedValue(profile);
    const result = await controller.updateProfile(requestAuthorizedMock, {
      name: 'some',
    });
    expect(result).toEqual(profile);
    expect(serviceMock.update).toHaveBeenCalledWith({
      userId: requestAuthorizedMock.user.sub,
      data: {
        name: 'some',
      },
    });
  });

  it('should create a profile', async () => {
    serviceMock.create.mockResolvedValue(profile);
    const result = await controller.createProfile(
      requestAuthorizedMock,
      createProfile,
    );
    expect(result).toEqual(profile);
    expect(serviceMock.create).toHaveBeenCalledWith(
      requestAuthorizedMock.user.sub,
      createProfile,
    );
  });
});
