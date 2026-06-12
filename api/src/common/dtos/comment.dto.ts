import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsUUID,
  IsString,
  IsNotEmpty,
  MaxLength,
} from 'class-validator';

export class CreateCommentDTO {
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
