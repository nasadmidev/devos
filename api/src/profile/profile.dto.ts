import { IsNoSymbols } from '@/user/no-symbols.decorator';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreateProfileDTO {
  @ApiProperty({
    name: 'name',
    description: 'Profile name',
    maxLength: 255,
    type: 'string',
  })
  @IsString()
  @IsNotEmpty()
  @IsNoSymbols()
  @MaxLength(255)
  name!: string;

  @ApiProperty({
    name: 'description',
    description: 'Profile description',
    maxLength: 500,
    type: 'string',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  description!: string;

  @ApiPropertyOptional({
    name: 'picture',
    description: 'Profile picture (link to an image)',
    type: 'string',
  })
  @IsOptional()
  @IsUrl()
  picture?: string;

  @ApiProperty({
    name: 'interests',
    description: 'Array of profile interests',
    type: 'array',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => String)
  interests!: string[];
}

export class UpdateProfileDTO extends PartialType(CreateProfileDTO) {}
