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
import { DoubtService } from './doubt.service';
import {
  CreateDoubtDTO,
  ListDoubtQueryDTO,
  SelectDoubtQueryDTO,
  UpdateDoubtDTO,
} from './doubt.dto';
import { Public } from '@/auth/jwt/public.decorator';
import { selectTransformer } from '@/common/transformers/select.transformer';
import { UuidValidatorPipe } from '@/common/pipes/uuid-validator/uuid-validator.pipe';
import type { RequestAuthorized } from '@/auth/auth.service';
import { AnswerService } from '@/answer/answer.service';
import { CreateAnswerDTO } from '@/answer/answer.dto';
import { CreateCommentDTO } from '@/common/dtos/comment.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('doubt')
@Controller('doubt')
export class DoubtController {
  constructor(
    private readonly service: DoubtService,
    private readonly answerService: AnswerService,
  ) {}

  @ApiOperation({ summary: 'Get all doubts ordered and filtered' })
  @ApiQuery({
    name: 'lastIndex',
    required: false,
    description: 'UUID for cursor pagination',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Elements limit string',
  })
  @ApiQuery({
    name: 'select',
    required: false,
    description: 'Comma-separated relations',
    example: 'answers,author,reports',
  })
  @ApiResponse({ status: 200, description: 'Array of doubts' })
  @Public()
  @Get('all')
  async findAllDoubts(@Query() query: ListDoubtQueryDTO) {
    const select = query.select ? selectTransformer(query.select) : undefined;
    return this.service.findAll({ ...query, select });
  }

  @ApiOperation({ summary: 'Get one single doubt by its id' })
  @ApiParam({ name: 'id', required: true, description: 'Doubt UUID' })
  @ApiQuery({
    name: 'select',
    required: false,
    description: 'Relations to project',
  })
  @ApiResponse({ status: 200, description: 'Doubt data obtained' })
  @Public()
  @Get(':id')
  async findOneDoubt(
    @Param('id', UuidValidatorPipe) id: string,
    @Query() query: SelectDoubtQueryDTO,
  ) {
    const select = query.select ? selectTransformer(query.select) : undefined;
    return this.service.findOne(id, select);
  }

  @ApiOperation({ summary: 'Create a new technical doubt' })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({ status: 201, description: 'Doubt created successfully' })
  @Post()
  async createDoubt(
    @Req() req: RequestAuthorized,
    @Body() data: CreateDoubtDTO,
  ) {
    return this.service.create(req.user.sub, data);
  }

  @ApiOperation({ summary: 'Update a doubt publication' })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({ name: 'id', required: true, description: 'Doubt UUID' })
  @Put(':id')
  async updateDoubt(
    @Param('id', UuidValidatorPipe) id: string,
    @Req() req: RequestAuthorized,
    @Body() data: UpdateDoubtDTO,
  ) {
    return this.service.update({ id, authorId: req.user.sub, data });
  }

  @ApiOperation({ summary: 'Delete a doubt (Author or Admin only)' })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({ name: 'id', required: true, description: 'Doubt UUID' })
  @Delete(':id')
  async deleteDoubt(
    @Param('id', UuidValidatorPipe) id: string,
    @Req() req: RequestAuthorized,
  ) {
    const { role, sub } = req.user;
    return this.service.delete({ id, authorId: sub, role });
  }

  @ApiOperation({ summary: 'Post a proposed solution to a doubt' })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({ name: 'id', required: true, description: 'Doubt UUID' })
  @Post(':id/answers')
  async createAnswer(
    @Param('id', UuidValidatorPipe) doubtId: string,
    @Req() req: RequestAuthorized,
    @Body() data: CreateAnswerDTO,
  ) {
    return this.answerService.create({ doubtId, userId: req.user.sub, data });
  }

  @ApiOperation({
    summary: 'Toggle correct status of an answer (Doubt Author or Admin only)',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({ name: 'answerId', required: true, description: 'Answer UUID' })
  @ApiResponse({ status: 200, schema: { enum: ['correct', 'incorrect'] } })
  @Patch('answers/:answerId/correct')
  async toggleCorrect(
    @Param('answerId', UuidValidatorPipe) answerId: string,
    @Req() req: RequestAuthorized,
  ) {
    const { sub, role } = req.user;
    return this.answerService.toggleCorrect({
      id: answerId,
      userId: sub,
      role,
    });
  }

  @ApiOperation({
    summary: 'Delete an answer (Answer Author, Doubt Author or Admin)',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({ name: 'answerId', required: true, description: 'Answer UUID' })
  @Delete('answers/:answerId')
  async deleteAnswer(
    @Param('answerId', UuidValidatorPipe) answerId: string,
    @Req() req: RequestAuthorized,
  ) {
    const { sub, role } = req.user;
    return this.answerService.delete({ id: answerId, authorId: sub, role });
  }

  @ApiOperation({ summary: 'Add an inner comment to a specific answer' })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({ name: 'answerId', required: true, description: 'Answer UUID' })
  @Post('answers/:answerId/comments')
  async createAnswerComment(
    @Param('answerId', UuidValidatorPipe) answerId: string,
    @Req() req: RequestAuthorized,
    @Body() data: CreateCommentDTO,
  ) {
    return this.answerService.comment({ answerId, userId: req.user.sub, data });
  }

  @ApiOperation({ summary: 'Delete a comment from an answer' })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({ name: 'commentId', required: true, description: 'Comment UUID' })
  @Delete('answers/comments/:commentId')
  async deleteAnswerComment(
    @Param('commentId', UuidValidatorPipe) commentId: string,
    @Req() req: RequestAuthorized,
  ) {
    const { sub, role } = req.user;
    return this.answerService.deleteComment({
      id: commentId,
      authorId: sub,
      role,
    });
  }
}
