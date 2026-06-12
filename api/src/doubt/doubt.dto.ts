import { AreAllTheseProperties } from '@/common/decorators/AreAllTheseProperties';
import { QueryListDTO } from '@/common/types/queryList.common.interface';
import { DoubtSelect } from '@/generated/prisma/models';
import { PartialType, PickType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateDoubtDTO {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  description!: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  code?: string;

  @IsArray()
  @ArrayMaxSize(5)
  @ArrayUnique()
  @IsString({ each: true })
  tags!: string[];
}

export class UpdateDoubtDTO extends PartialType(CreateDoubtDTO) {}

export class ListDoubtQueryDTO implements QueryListDTO<DoubtSelect> {
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
  @AreAllTheseProperties<DoubtSelect>(['author', 'answers', 'reports'])
  select?: Array<keyof DoubtSelect>;
}

export class SelectDoubtQueryDTO extends PickType(ListDoubtQueryDTO, [
  'select',
]) {}
