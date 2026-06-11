import { AreAllTheseProperties } from '@/common/decorators/AreAllTheseProperties';
import { ResourceSelect } from '@/generated/prisma/models';
import {
  ApiProperty,
  ApiPropertyOptional,
  PartialType,
  PickType,
} from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateResourceDTO {
  @ApiProperty({
    name: 'title',
    description: 'Resource title',
    type: 'string',
    maxLength: 255,
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title!: string;

  @ApiProperty({
    name: 'description',
    description: 'Resource description',
    type: 'string',
    maxLength: 1000,
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  description!: string;

  @ApiPropertyOptional({
    name: 'url',
    description: 'External url to resource',
    type: 'string',
    example: 'http://github.com/nasadmidev',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  url?: string;
}

export class UpdateResourceDTO extends PartialType(CreateResourceDTO) {}

export class CreateResourceCommentDTO {
  @ApiPropertyOptional({
    name: 'parentId',
    description: 'ID of the parent comment',
    type: 'string',
    example: '1c4493e0-62ff-4b16-a46e-153c9376567c',
    required: false,
  })
  @IsOptional()
  @IsUUID('4')
  parentId?: string;

  @ApiProperty({
    name: 'content',
    description: 'Comment content',
    type: 'string',
    maxLength: 500,
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  content!: string;
}

export class ListResourceQueryDTO {
  @IsOptional()
  @IsUUID('4')
  lastIndex?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return [];
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return typeof value === 'string' ? value.split(',') : value;
  })
  @IsArray()
  @AreAllTheseProperties<ResourceSelect>([
    'author',
    'bookmarkedBy',
    'comments',
    'likes',
    'reports',
  ])
  select?: Array<keyof ResourceSelect>;
}

export class SelectResourceQueryDTO extends PickType(ListResourceQueryDTO, [
  'select',
]) {}
