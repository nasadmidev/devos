import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ReportService } from './report.service';
import type { RequestAuthorized } from '@/auth/auth.service';
import {
  CreateReportDTO,
  EntityType,
  ListAllReportsQueryDTO,
  ListOneReportQueryDTO,
  ResolveReportDTO,
} from './report.dto';
import { Roles } from '@/auth/roles/role.decorator';
import { selectTransformer } from '@/common/transformers/select.transformer';
import { UuidValidatorPipe } from '@/common/pipes/uuid-validator/uuid-validator.pipe';
import { FromEntityPipe } from './from-entity/from-entity.pipe';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ResolutionType } from '@/generated/prisma/enums';

@ApiTags('report')
@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @ApiOperation({
    summary: 'Create a report',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    description: 'report created',
    status: 201,
  })
  @ApiResponse({
    description: 'class-validator has failed on CreateReportDTO',
    status: 400,
  })
  @ApiResponse({
    description: 'no token',
    status: 401,
  })
  @Post()
  async createReport(
    @Req() req: RequestAuthorized,
    @Body() data: CreateReportDTO,
  ) {
    return this.reportService.create(req.user.sub, data);
  }

  @ApiOperation({
    summary:
      'get all reports ordered on createdAt descendant or from an specific entity (defined by fromEntity query) (only administrators)',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: 200,
    description: 'return all reports or reports from a specific entity',
  })
  @ApiResponse({
    status: 403,
    description: 'you must be admin to perform this action',
  })
  @ApiQuery({
    name: 'lastIndex',
    description: 'last id obtained by client for pagination',
    type: 'string',
    example: '822308d1-9d82-4d61-8d47-3aed5a4114bb',
    required: false,
  })
  @ApiQuery({
    name: 'lastIndexType',
    description: 'entity type of lastIndex (required if lastIndex is defined)',
    required: false,
    enum: EntityType,
  })
  @ApiQuery({
    name: 'limit',
    description: 'the limit of the records to be wanted (number string)',
    required: false,
    type: 'string',
  })
  @ApiQuery({
    name: 'state',
    description: 'state of the report resolution',
    required: false,
    enum: ResolutionType,
  })
  @ApiQuery({
    name: 'fromEntity',
    description: 'when is defined, get all reports from the entity defined',
    required: false,
    enum: EntityType,
  })
  @ApiQuery({
    name: 'select',
    description: 'data that want to be selected',
    type: 'string',
    example: 'fromUser,toUser',
    enum: ['user', 'fromUser', 'toUser', 'visual', 'doubt', 'resource'],
    required: false,
  })
  @Roles('ADMIN')
  @Get('all')
  async getAllReports(@Query() query: ListAllReportsQueryDTO) {
    const select = query.select ? selectTransformer(query.select) : undefined;
    return this.reportService.findAll({ ...query, select });
  }

  @ApiOperation({
    summary:
      'get one report from a defined id and fromEntity query (only administrators)',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: 200,
    description: 'return all reports or reports from a specific entity',
  })
  @ApiResponse({
    status: 403,
    description: 'you must be admin to perform this action',
  })
  @ApiParam({
    name: 'id',
    description: 'index of the report',
    required: false,
    example: '822308d1-9d82-4d61-8d47-3aed5a4114bb',
  })
  @ApiQuery({
    name: 'fromEntity',
    description: 'the entity where the data have to be extracted',
    required: true,
    enum: EntityType,
  })
  @ApiQuery({
    name: 'select',
    description: 'data that want to be selected',
    type: 'string',
    example: 'fromUser,toUser',
    enum: ['user', 'fromUser', 'toUser', 'visual', 'doubt', 'resource'],
    required: false,
  })
  @Roles('ADMIN')
  @Get(':id')
  async getOneReport(
    @Param('id', UuidValidatorPipe) id: string,
    @Query() query: ListOneReportQueryDTO,
  ) {
    const select = query.select ? selectTransformer(query.select) : undefined;
    if (!query.fromEntity) {
      throw new BadRequestException('fromEntity query must be defined');
    }
    return this.reportService.findOne({
      id,
      fromEntity: query.fromEntity,
      select,
    });
  }

  @ApiOperation({
    summary: 'give to a report a resolution (only administrators)',
  })
  @ApiParam({
    name: 'id',
    description: 'index of the report that want to be resolved',
    required: false,
    example: '822308d1-9d82-4d61-8d47-3aed5a4114bb',
  })
  @ApiQuery({
    name: 'fromEntity',
    description: 'the entity of the id',
    required: true,
    enum: EntityType,
  })
  @Roles('ADMIN')
  @Patch(':id/resolve')
  async resolveReport(
    @Param('id', UuidValidatorPipe) id: string,
    @Body() data: ResolveReportDTO,
    @Query('fromEntity', FromEntityPipe) fromEntity: EntityType,
  ) {
    return this.reportService.resolve({ id, fromEntity, data });
  }

  @ApiOperation({
    summary: 'delete a report (only administrators)',
  })
  @ApiParam({
    name: 'id',
    description: 'index of the report that want to be deleted',
    required: false,
    example: '822308d1-9d82-4d61-8d47-3aed5a4114bb',
  })
  @ApiQuery({
    name: 'fromEntity',
    description: 'the entity of the id',
    required: true,
    enum: EntityType,
  })
  @Roles('ADMIN')
  @Delete(':id')
  async deleteReport(
    @Param('id', UuidValidatorPipe) id: string,
    @Query('fromEntity', FromEntityPipe) fromEntity: EntityType,
  ) {
    return this.reportService.delete(id, fromEntity);
  }
}
