import { PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateAnswerDTO {
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  content!: string;
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  code?: string;
}

export class UpdateAnswerDTO extends PartialType(CreateAnswerDTO) {}
