import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { UserService } from './user.service';
import { JwtGuard } from '@/auth/jwt/jwt.guard';
import { JwtService } from '@nestjs/jwt';
import { User } from '@/generated/prisma/client';
import { RolesGuard } from '@/auth/roles/role.guard';
import { RequestAuthorized } from '@/auth/auth.service';
import {
  user as mockUser,
  createUser as createUserDTO,
} from '@/__mocks__/user/user.mock';

describe('UserController', () => {
  let controller: UserController;
  let userServiceMock: DeepMockProxy<UserService>;

  beforeEach(async () => {
    userServiceMock = mockDeep<UserService>();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: userServiceMock,
        },
        {
          provide: JwtGuard,
          useValue: {
            canActivate: jest.fn().mockReturnValue(true),
          },
        },
        JwtService,
        {
          provide: RolesGuard,
          useValue: {
            canActivate: jest.fn().mockReturnValue(true),
          },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('admin operations', () => {
    it('should return all users for admin', async () => {
      const mockUsers: User[] = [mockUser, mockUser];
      userServiceMock.findAll.mockResolvedValue(mockUsers);
      const result = await controller.getAllUsers();
      expect(result).toEqual(mockUsers);
    });

    it('should return user by id for admin', async () => {
      userServiceMock.findOne.mockResolvedValue(mockUser);
      const result = await controller.getUserById('1');
      expect(result).toEqual(mockUser);
    });

    it('should create a new user', async () => {
      const createdUser = { ...mockUser, ...createUserDTO, id: '2' };
      userServiceMock.create.mockResolvedValue(createdUser);
      const result = await controller.createUser(createUserDTO);
      expect(result).toEqual(createdUser);
    });

    it('should update user by id for admin', async () => {
      const updateUserDTO = {
        email: 'updateduser',
      };
      const updatedUser = { ...mockUser, ...updateUserDTO };
      userServiceMock.update.mockResolvedValue(updatedUser);
      const result = await controller.updateUserById('1', updateUserDTO);
      expect(result).toEqual(updatedUser);
    });

    it('should delete user by id for admin', async () => {
      userServiceMock.delete.mockResolvedValue(mockUser);
      const result = await controller.deleteUserById('1');
      expect(result).toEqual(mockUser);
    });
  });

  describe('user operations', () => {
    it('should return user data for authenticated user', async () => {
      userServiceMock.findOne.mockResolvedValue(mockUser);
      const req = { user: { sub: '1' } } as RequestAuthorized;
      const result = await controller.getUser(req);
      expect(result).toEqual(mockUser);
    });

    it('should update user data for authenticated user', async () => {
      const updateUserDTO = {
        email: 'updateduser',
      };
      const updatedUser = { ...mockUser, ...updateUserDTO };
      userServiceMock.update.mockResolvedValue(updatedUser);
      const req = { user: { sub: '1' } } as RequestAuthorized;
      const result = await controller.updateUser(req, updateUserDTO);
      expect(result).toEqual(updatedUser);
    });

    it('should delete user for authenticated user', async () => {
      userServiceMock.delete.mockResolvedValue(mockUser);
      const req = { user: { sub: '1' } } as RequestAuthorized;
      const result = await controller.deleteUser(req);
      expect(result).toEqual(mockUser);
    });

    it('should delete user for authenticated user', async () => {
      userServiceMock.delete.mockResolvedValue(mockUser);
      const req = { user: { sub: '1' } } as RequestAuthorized;
      const result = await controller.deleteUser(req);
      expect(result).toEqual(mockUser);
    });
  });
});
