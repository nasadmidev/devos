import { Test, TestingModule } from '@nestjs/testing';
import { VisualController } from './visual.controller';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { VisualService } from './visual.service';
import { JwtGuard } from '@/auth/jwt/jwt.guard';
import { RolesGuard } from '@/auth/roles/role.guard';
import { JwtService } from '@nestjs/jwt';
import {
  createVisualMock,
  id,
  visualMock,
  visualMockWithSelection,
} from '@/__mocks__/visual/visual.mock';
import { requestAuthorizedMock } from '@/__mocks__/common/request.mock';
import {
  createVisualCommentMock,
  visualCommentMock,
} from '@/__mocks__/visual/visualInteractions.mock';

describe('VisualController', () => {
  let controller: VisualController;
  let serviceMock: DeepMockProxy<VisualService>;

  beforeEach(async () => {
    serviceMock = mockDeep<VisualService>();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VisualController],
      providers: [
        { provide: VisualService, useValue: serviceMock },
        { provide: JwtGuard, useValue: { canActive: () => true } },
        { provide: RolesGuard, useValue: { canActive: () => true } },
        JwtService,
      ],
    }).compile();

    controller = module.get<VisualController>(VisualController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllVisuals', () => {
    it('should get all visuals', async () => {
      serviceMock.findAll.mockResolvedValue([]);
      const result = await controller.getAllVisuals({});
      expect(result).toEqual([]);
      expect(serviceMock.findAll).toHaveBeenCalledWith({
        lastIndex: undefined,
        limit: undefined,
        select: undefined,
      });
    });

    it('should get all visuals with query params', async () => {
      serviceMock.findAll.mockResolvedValue([]);
      const result = await controller.getAllVisuals({
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

  describe('getOneVisual', () => {
    it('should get one visual', async () => {
      serviceMock.findOne.mockResolvedValue(visualMockWithSelection);
      const result = await controller.getOneVisual(id, {});
      expect(result).toEqual(visualMockWithSelection);
      expect(serviceMock.findOne).toHaveBeenCalledWith(id, undefined);
    });

    it('should get one visual with selection', async () => {
      serviceMock.findOne.mockResolvedValue(visualMockWithSelection);
      const result = await controller.getOneVisual(id, { select: ['author'] });
      expect(result).toEqual(visualMockWithSelection);
      expect(serviceMock.findOne).toHaveBeenCalledWith(id, { author: true });
    });
  });

  it('should create a visual', async () => {
    serviceMock.create.mockResolvedValue(visualMock);
    const result = await controller.createVisual(
      requestAuthorizedMock,
      createVisualMock,
    );
    expect(result).toEqual(visualMock);
    expect(serviceMock.create).toHaveBeenCalledWith(
      requestAuthorizedMock.user.sub,
      createVisualMock,
    );
  });

  it('should update a visual', async () => {
    serviceMock.update.mockResolvedValue(visualMock);
    const result = await controller.updateVisual(id, requestAuthorizedMock, {
      title: 'new title',
    });
    expect(result).toEqual(visualMock);
    expect(serviceMock.update).toHaveBeenCalledWith({
      id,
      authorId: requestAuthorizedMock.user.sub,
      data: { title: 'new title' },
    });
  });

  it('should delete a visual', async () => {
    serviceMock.delete.mockResolvedValue(visualMock);
    const result = await controller.deleteVisual(id, requestAuthorizedMock);
    expect(result).toEqual(visualMock);
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
    serviceMock.comment.mockResolvedValue(visualCommentMock);
    const result = await controller.createComment(
      id,
      requestAuthorizedMock,
      createVisualCommentMock,
    );
    expect(result).toEqual(visualCommentMock);
    expect(serviceMock.comment).toHaveBeenCalledWith({
      visualId: id,
      userId: requestAuthorizedMock.user.sub,
      data: createVisualCommentMock,
    });
  });

  it('should delete a comment', async () => {
    serviceMock.deleteComment.mockResolvedValue(visualCommentMock);
    const result = await controller.deleteComment(id, requestAuthorizedMock);
    expect(result).toEqual(visualCommentMock);
    expect(serviceMock.deleteComment).toHaveBeenCalledWith({
      id,
      userId: requestAuthorizedMock.user.sub,
    });
  });
});
