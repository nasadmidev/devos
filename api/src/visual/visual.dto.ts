import { AreAllTheseProperties } from '@/common/decorators/AreAllTheseProperties';
import { QueryListDTO } from '@/common/types/queryList.common.interface';
import { VisualSelect } from '@/generated/prisma/models';
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

export class CreateVisualDTO {
  @ApiProperty({
    name: 'title',
    description: 'Visual post title',
    type: 'string',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title!: string;

  @ApiProperty({
    name: 'url',
    description: 'External URL to the visual (image, video, etc.)',
    type: 'string',
  })
  @IsUrl()
  url!: string;

  @ApiProperty({
    name: 'description',
    description: 'Visual post description',
    type: 'string',
    maxLength: 1000,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  description!: string;
}

export class CreateVisualCommentDTO {
  @ApiPropertyOptional({
    name: 'parentId',
    description: 'Parent comment id reference',
    type: 'string',
  })
  @IsOptional()
  @IsUUID('4')
  parentId?: string;

  @ApiProperty({
    name: 'content',
    description: 'Comment content',
    type: 'string',
    maxLength: 500,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  content!: string;
}

export class ListQueryVisualDTO implements QueryListDTO<VisualSelect> {
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
  @AreAllTheseProperties<VisualSelect>([
    'likes',
    'author',
    'reports',
    'bookmarkedBy',
    'comments',
  ])
  select?: Array<keyof VisualSelect>;
}

export class SelectVisualQueryDTO extends PickType(ListQueryVisualDTO, [
  'select',
]) {}
export class UpdateVisualDTO extends PartialType(CreateVisualDTO) {}
