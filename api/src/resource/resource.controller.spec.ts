import { Test, TestingModule } from '@nestjs/testing';
import { ResourceController } from './resource.controller';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { ResourceService } from './resource.service';
import { JwtGuard } from '@/auth/jwt/jwt.guard';
import { RolesGuard } from '@/auth/roles/role.guard';
import { JwtService } from '@nestjs/jwt';
import {
  createResourceMock,
  id,
  resourceMock,
  resourceMockWithSelection,
} from '@/__mocks__/resource/resource.mock';
import { requestAuthorizedMock } from '@/__mocks__/common/request.mock';
import {
  createResourceCommentMock,
  resourceCommentMock,
} from '@/__mocks__/resource/resourceInteractions.mock';

describe('ResourceController', () => {
  let controller: ResourceController;
  let serviceMock: DeepMockProxy<ResourceService>;

  beforeEach(async () => {
    serviceMock = mockDeep<ResourceService>();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ResourceController],
      providers: [
        { provide: ResourceService, useValue: serviceMock },
        { provide: JwtGuard, useValue: { canActive: () => true } },
        { provide: RolesGuard, useValue: { canActive: () => true } },
        JwtService,
      ],
    }).compile();

    controller = module.get<ResourceController>(ResourceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllResources', () => {
    it('should get all resources', async () => {
      serviceMock.findAll.mockResolvedValue([]);
      const result = await controller.getAllResources({});
      expect(result).toEqual([]);
      expect(serviceMock.findAll).toHaveBeenCalledWith({
        lastIndex: undefined,
        limit: undefined,
        select: undefined,
      });
    });

    it('should get all resources with query params', async () => {
      serviceMock.findAll.mockResolvedValue([]);
      const result = await controller.getAllResources({
        lastIndex: id,
        limit: '80',
        select: ['comments'],
      });
      expect(result).toEqual([]);
      expect(serviceMock.findAll).toHaveBeenCalledWith({
        lastIndex: id,
        limit: '80',
        select: {
          comments: true,
        },
      });
    });
  });

  describe('getResource', () => {
    it('should get one resource', async () => {
      serviceMock.findOne.mockResolvedValue(resourceMockWithSelection);
      const result = await controller.getResource(id, {});
      expect(result).toEqual(resourceMockWithSelection);
      expect(serviceMock.findOne).toHaveBeenCalledWith(id, undefined);
    });

    it('should get one resource with selection', async () => {
      serviceMock.findOne.mockResolvedValue(resourceMockWithSelection);
      const result = await controller.getResource(id, { select: ['author'] });
      expect(result).toEqual(resourceMockWithSelection);
      expect(serviceMock.findOne).toHaveBeenCalledWith(id, { author: true });
    });
  });

  it('should create a resource', async () => {
    serviceMock.create.mockResolvedValue(resourceMock);
    const result = await controller.createResource(
      requestAuthorizedMock,
      createResourceMock,
    );
    expect(result).toEqual(resourceMock);
    expect(serviceMock.create).toHaveBeenCalledWith(
      requestAuthorizedMock.user.sub,
      createResourceMock,
    );
  });

  it('should update a resource', async () => {
    serviceMock.update.mockResolvedValue(resourceMock);
    const result = await controller.updateResource(id, requestAuthorizedMock, {
      title: 'new title',
    });
    expect(result).toEqual(resourceMock);
    expect(serviceMock.update).toHaveBeenCalledWith({
      id,
      authorId: requestAuthorizedMock.user.sub,
      data: { title: 'new title' },
    });
  });

  it('should delete a resource', async () => {
    serviceMock.delete.mockResolvedValue(resourceMock);
    const result = await controller.deleteResource(id, requestAuthorizedMock);
    expect(result).toEqual(resourceMock);
    expect(serviceMock.delete).toHaveBeenCalledWith({
      id,
      authorId: requestAuthorizedMock.user.sub,
      role: requestAuthorizedMock.user.role,
    });
  });

  describe('toggleLike', () => {
    it('should return CREATED', async () => {
      serviceMock.toggleLike.mockResolvedValue('CREATED');
      const result = await controller.toggleLike(id, requestAuthorizedMock);
      expect(result).toEqual({ state: 'CREATED' });
      expect(serviceMock.toggleLike).toHaveBeenCalledWith(
        id,
        requestAuthorizedMock.user.sub,
      );
    });

    it('should return DELETE', async () => {
      serviceMock.toggleLike.mockResolvedValue('DELETED');
      const result = await controller.toggleLike(id, requestAuthorizedMock);
      expect(result).toEqual({ state: 'DELETED' });
      expect(serviceMock.toggleLike).toHaveBeenCalledWith(
        id,
        requestAuthorizedMock.user.sub,
      );
    });
  });

  describe('toggleBookmark', () => {
    it('should return CREATED', async () => {
      serviceMock.toggleBookmark.mockResolvedValue('CREATED');
      const result = await controller.toggleBookmark(id, requestAuthorizedMock);
      expect(result).toEqual({ state: 'CREATED' });
      expect(serviceMock.toggleBookmark).toHaveBeenCalledWith(
        id,
        requestAuthorizedMock.user.sub,
      );
    });

    it('should return DELETE', async () => {
      serviceMock.toggleBookmark.mockResolvedValue('DELETED');
      const result = await controller.toggleBookmark(id, requestAuthorizedMock);
      expect(result).toEqual({ state: 'DELETED' });
      expect(serviceMock.toggleBookmark).toHaveBeenCalledWith(
        id,
        requestAuthorizedMock.user.sub,
      );
    });
  });

  it('should create a comment', async () => {
    serviceMock.comment.mockResolvedValue(resourceCommentMock);
    const result = await controller.createComment(
      id,
      requestAuthorizedMock,
      createResourceCommentMock,
    );
    expect(result).toEqual(resourceCommentMock);
    expect(serviceMock.comment).toHaveBeenCalledWith({
      resourceId: id,
      userId: requestAuthorizedMock.user.sub,
      data: createResourceCommentMock,
    });
  });

  it('should delete a comment', async () => {
    serviceMock.deleteComment.mockResolvedValue(resourceCommentMock);
    const result = await controller.deleteComment(
      resourceCommentMock.id,
      requestAuthorizedMock,
    );
    expect(result).toEqual(resourceCommentMock);
    expect(serviceMock.deleteComment).toHaveBeenCalledWith({
      id: resourceCommentMock.id,
      authorId: requestAuthorizedMock.user.sub,
      role: requestAuthorizedMock.user.role,
    });
  });
});
