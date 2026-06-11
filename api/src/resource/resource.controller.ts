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
import { ResourceService } from './resource.service';
import { Public } from '@/auth/jwt/public.decorator';
import {
  CreateResourceCommentDTO,
  CreateResourceDTO,
  ListResourceQueryDTO,
  SelectResourceQueryDTO,
  UpdateResourceDTO,
} from './resource.dto';
import { selectTransformer } from '@/common/transformers/select.transformer';
import { UuidValidatorPipe } from '@/common/pipes/uuid-validator/uuid-validator.pipe';
import type { RequestAuthorized } from '@/auth/auth.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('resource')
@Controller('resource')
export class ResourceController {
  constructor(private readonly service: ResourceService) {}

  @ApiOperation({
    summary: 'Get all resources ordered by createdAt descendant',
  })
  @ApiResponse({
    status: 200,
    description: 'Arrays of resources',
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
  @Get('all')
  @Public()
  async getAllResources(@Query() query: ListResourceQueryDTO) {
    const select = query.select ? selectTransformer(query.select) : undefined;
    return this.service.findAll({ ...query, select });
  }

  @ApiOperation({
    summary: 'Get one resource',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Resource id',
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
    description: 'Resource with id obtained',
  })
  @Get(':id')
  @Public()
  async getResource(
    @Param('id', UuidValidatorPipe) id: string,
    @Query() query: SelectResourceQueryDTO,
  ) {
    const select = query.select ? selectTransformer(query.select) : undefined;
    return this.service.findOne(id, select);
  }

  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Create a new resource publication',
  })
  @ApiResponse({
    status: 201,
    description: 'Resource created',
  })
  async createResource(
    @Req() req: RequestAuthorized,
    @Body() data: CreateResourceDTO,
  ) {
    return this.service.create(req.user.sub, data);
  }

  @Put(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update a resource publication',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Resource id',
    example: '1c4493e0-62ff-4b16-a46e-153c9376567c',
  })
  @ApiResponse({
    status: 200,
    description: 'Resource updated',
  })
  async updateResource(
    @Param('id', UuidValidatorPipe) id: string,
    @Req() req: RequestAuthorized,
    @Body() data: UpdateResourceDTO,
  ) {
    return this.service.update({ id, authorId: req.user.sub, data });
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a resource',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Resource id',
    example: '1c4493e0-62ff-4b16-a46e-153c9376567c',
  })
  async deleteResource(
    @Param('id', UuidValidatorPipe) id: string,
    @Req() req: RequestAuthorized,
  ) {
    return this.service.delete({
      id,
      authorId: req.user.sub,
      role: req.user.role,
    });
  }

  @Patch(':id/like')
  @ApiOperation({
    summary: 'Toggle like',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Resource id',
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
      state: await this.service.toggleLike(id, req.user.sub),
    };
  }

  @Patch(':id/bookmark')
  @ApiBearerAuth('JWT-auth')
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Resource id',
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
      state: await this.service.toggleBookmark(id, req.user.sub),
    };
  }

  @Post(':id/comments')
  @ApiBearerAuth('JWT-auth')
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Resource id',
    example: '1c4493e0-62ff-4b16-a46e-153c9376567c',
  })
  @ApiResponse({
    status: 200,
    description: 'Comment created',
  })
  async createComment(
    @Param('id', UuidValidatorPipe) id: string,
    @Req() req: RequestAuthorized,
    @Body() data: CreateResourceCommentDTO,
  ) {
    return this.service.comment({ resourceId: id, userId: req.user.sub, data });
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
    return this.service.deleteComment({
      commentId,
      userId: req.user.sub,
      role: req.user.role,
    });
  }
}
