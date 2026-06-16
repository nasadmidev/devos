import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateAnswerDTO {
  @ApiProperty({
    name: 'content',
    description: 'answer content',
    type: 'string',
    maxLength: 1000,
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  content!: string;
  @ApiPropertyOptional({
    name: 'code',
    description: 'attached code to the answer',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  code?: string;
}

export class UpdateAnswerDTO extends PartialType(CreateAnswerDTO) {}
