import { AreAllTheseProperties } from '@/common/decorators/AreAllTheseProperties';
import { ReportType, ResolutionType } from '@/generated/prisma/enums';
import {
  DoubtReportSelect,
  ResourceReportSelect,
  UserReportSelect,
  VisualReportSelect,
} from '@/generated/prisma/models';
import { ApiProperty, ApiPropertyOptional, PickType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export enum EntityType {
  USER = 'USER',
  VISUAL = 'VISUAL',
  RESOURCE = 'RESOURCE',
  DOUBT = 'DOUBT',
}

export type ReportSelect = VisualReportSelect &
  UserReportSelect &
  DoubtReportSelect &
  ResourceReportSelect;

export class CreateReportDTO {
  @ApiProperty({
    name: 'entityId',
    description: 'uuid of the entity reported',
    required: true,
    type: 'string',
    example: '822308d1-9d82-4d61-8d47-3aed5a4114bb',
  })
  @IsUUID('4')
  entityId!: string;
  @ApiProperty({
    name: 'entityType',
    description: 'type of entity reported',
    required: true,
    enum: EntityType,
  })
  @IsString()
  @IsEnum(EntityType)
  entityType!: EntityType;
  @ApiProperty({
    name: 'type',
    description: 'report type',
    required: true,
    enum: ReportType,
  })
  @IsString()
  @IsEnum(ReportType)
  type!: ReportType;
  @ApiProperty({
    name: 'reason',
    description: 'report reason',
    required: true,
    maxLength: 1000,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  reason!: string;
}

export class ListAllReportsQueryDTO {
  @ApiPropertyOptional({
    name: 'lastIndex',
    description: 'last id obtained by client for pagination',
    type: 'string',
    example: '822308d1-9d82-4d61-8d47-3aed5a4114bb',
    required: false,
  })
  @IsOptional()
  @IsUUID('4')
  lastIndex?: string;

  @ApiPropertyOptional({
    name: 'lastIndexType',
    description: 'entity type of lastIndex (required if lastIndex is defined)',
    required: false,
    enum: EntityType,
  })
  @IsOptional()
  @IsString()
  @IsEnum(EntityType)
  lastIndexType?: EntityType;

  @ApiPropertyOptional({
    name: 'limit',
    description: 'the limit of the records to be wanted (number string)',
    required: false,
    type: 'string',
  })
  @IsOptional()
  @IsNumberString()
  limit?: string;

  @ApiPropertyOptional({
    name: 'state',
    description: 'state of the report resolution',
    required: false,
    enum: ResolutionType,
  })
  @IsOptional()
  @IsString()
  @IsEnum(ResolutionType)
  state?: ResolutionType;

  @ApiPropertyOptional({
    name: 'fromEntity',
    description:
      'when is defined, get all entities from entity defined in this',
    required: false,
    enum: EntityType,
  })
  @IsOptional()
  @IsString()
  @IsEnum(EntityType)
  fromEntity?: EntityType;

  @ApiPropertyOptional({
    name: 'select',
    description: 'data that want to be selected',
    type: 'string',
    example: 'fromUser,toUser',
    enum: ['user', 'fromUser', 'toUser', 'visual', 'doubt', 'resource'],
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return [];
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return typeof value === 'string' ? value.split(',') : value;
  })
  @IsArray()
  @AreAllTheseProperties<ReportSelect>([
    'user',
    'fromUser',
    'toUser',
    'visual',
    'doubt',
    'resource',
  ])
  select?: Array<keyof ReportSelect>;
}

export class ListOneReportQueryDTO extends PickType(ListAllReportsQueryDTO, [
  'select',
]) {
  @ApiProperty({
    name: 'fromEntity',
    description: 'the entity where the data have to be extracted',
    required: true,
    enum: EntityType,
  })
  @IsString()
  @IsEnum(EntityType)
  fromEntity!: EntityType;
}

export class ResolveReportDTO {
  @ApiProperty({
    name: 'resolution',
    description: 'type of the resolution',
    required: true,
    enum: ResolutionType,
  })
  @IsString()
  @IsEnum(ResolutionType)
  resolution!: ResolutionType;
}
