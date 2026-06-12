import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import { VisualService } from './visual.service';
import {
  CreateVisualDTO,
  ListQueryVisualDTO,
  SelectVisualQueryDTO,
  UpdateVisualDTO,
} from './visual.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from '@/auth/jwt/public.decorator';
import { UuidValidatorPipe } from '@/common/pipes/uuid-validator/uuid-validator.pipe';
import type { RequestAuthorized } from '@/auth/auth.service';
import { selectTransformer } from '@/common/transformers/select.transformer';
import { VisualSelect } from '@/generated/prisma/models';
import { CreateCommentDTO } from '@/common/dtos/comment.dto';

@ApiTags('visual')
@Controller('visual')
export class VisualController {
  constructor(private readonly visualService: VisualService) {}

  @Get('all')
  @Public()
  @ApiOperation({
    summary: 'Get all visuals ordered',
  })
  @ApiQuery({
    name: 'lastIndex',
    required: false,
    description: 'Last index obtained for pagination',
    example: '1c4493e0-62ff-4b16-a46e-153c9376567c',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description:
      'The number of elements you want to get (must be a number string)',
  })
  @ApiQuery({
    name: 'select',
    required: false,
    description: 'The fields you want to include on the request',
    example: `likes,author,reports,bookmarkedBy,comments`,
  })
  @ApiResponse({
    status: 200,
    description: 'Get all visuals',
  })
  async getAllVisuals(@Query() query: ListQueryVisualDTO) {
    const { lastIndex, limit } = query;
    const select = query.select
      ? selectTransformer<VisualSelect>(query.select)
      : undefined;
    return this.visualService.findAll({
      lastIndex,
      limit,
      select,
    });
  }

  @Get(':id')
  @Public()
  @ApiOperation({
    summary: 'Get one visual publication',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Visual id',
    example: '1c4493e0-62ff-4b16-a46e-153c9376567c',
  })
  @ApiQuery({
    name: 'select',
    required: false,
    description: 'The fields you want to include on the request',
    example: `likes,author,reports,bookmarkedBy,comments`,
  })
  @ApiResponse({
    status: 200,
    description: 'Visual with id obtained',
  })
  async getOneVisual(
    @Param('id', UuidValidatorPipe) id: string,
    @Query() query: SelectVisualQueryDTO,
  ) {
    const select = query.select
      ? selectTransformer<VisualSelect>(query.select)
      : undefined;
    return this.visualService.findOne(id, select);
  }

  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Create a new visual publication',
  })
  @ApiResponse({
    status: 201,
    description: 'Visual created',
  })
  async createVisual(
    @Req() req: RequestAuthorized,
    @Body() data: CreateVisualDTO,
  ) {
    return this.visualService.create(req.user.sub, data);
  }

  @Put(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update a visual publication',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Visual id',
    example: '1c4493e0-62ff-4b16-a46e-153c9376567c',
  })
  @ApiResponse({
    status: 200,
    description: 'Visual updated',
  })
  async updateVisual(
    @Param('id', UuidValidatorPipe) id: string,
    @Req() req: RequestAuthorized,
    @Body() data: UpdateVisualDTO,
  ) {
    return this.visualService.update({ id, authorId: req.user.sub, data });
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a visual',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Visual id',
    example: '1c4493e0-62ff-4b16-a46e-153c9376567c',
  })
  async deleteVisual(
    @Param('id', UuidValidatorPipe) id: string,
    @Req() req: RequestAuthorized,
  ) {
    const { role, sub } = req.user;
    return this.visualService.delete({ id, authorId: sub, role });
  }

  @Patch(':id/like')
  @ApiOperation({
    summary: 'Toggle like',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Visual id',
    example: '1c4493e0-62ff-4b16-a46e-153c9376567c',
  })
  @ApiResponse({
    status: 200,
    schema: {
      enum: ['CREATED', 'DELETED'],
    },
  })
  async toggleLike(
    @Param('id', UuidValidatorPipe) id: string,
    @Req() req: RequestAuthorized,
  ) {
    return {
      state: await this.visualService.toggleLike(id, req.user.sub),
    };
  }

  @Patch(':id/bookmark')
  @ApiBearerAuth('JWT-auth')
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Visual id',
    example: '1c4493e0-62ff-4b16-a46e-153c9376567c',
  })
  @ApiResponse({
    status: 200,
    schema: {
      enum: ['CREATED', 'DELETED'],
    },
  })
  async toggleBookmark(
    @Param('id', UuidValidatorPipe) id: string,
    @Req() req: RequestAuthorized,
  ) {
    return {
      state: await this.visualService.toggleBookmark(id, req.user.sub),
    };
  }

  @Post(':id/comments')
  @ApiBearerAuth('JWT-auth')
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Visual id',
    example: '1c4493e0-62ff-4b16-a46e-153c9376567c',
  })
  @ApiResponse({
    status: 200,
    description: 'Comment created',
  })
  async createComment(
    @Param('id', UuidValidatorPipe) id: string,
    @Req() req: RequestAuthorized,
    @Body() data: CreateCommentDTO,
  ) {
    return this.visualService.comment({
      visualId: id,
      userId: req.user.sub,
      data,
    });
  }

  @Delete('comments/:commentId')
  @ApiBearerAuth('JWT-auth')
  @ApiParam({
    name: 'commentId',
    required: true,
    description: 'Comment id',
    example: '1c4493e0-62ff-4b16-a46e-153c9376567c',
  })
  @ApiResponse({
    status: 200,
    description: 'Comment deleted',
  })
  async deleteComment(
    @Param('commentId', UuidValidatorPipe) commentId: string,
    @Req() req: RequestAuthorized,
  ) {
    return this.visualService.deleteComment({
      id: commentId,
      authorId: req.user.sub,
      role: 'USER',
    });
  }
}
