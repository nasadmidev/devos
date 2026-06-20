import {
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
  MaxLength,
} from 'class-validator';

import {
  PartialType,
  ApiProperty,
  PickType,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import { Role } from '@/generated/prisma/enums';
import { UserSelect } from '@/generated/prisma/models';
import { Transform } from 'class-transformer';
import { AreAllTheseProperties } from '@/common/decorators/AreAllTheseProperties';

export class CreateUserDTO {
  @ApiProperty({
    description: 'User email address',
    example: 'johndoe@example.com',
  })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(500)
  email!: string;

  @ApiProperty({
    description: 'User password (min 8 chars, uppercase, lowercase, number)',
    example: 'SecurePass123',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 0,
  })
  password!: string;
}

export class CreateUserByAdminDTO extends PickType(CreateUserDTO, [
  'email',
  'password',
]) {
  @ApiPropertyOptional({
    name: 'role',
    description: 'the new user role',
    enum: Role,
  })
  @IsOptional()
  @IsString()
  @IsEnum(Role)
  role?: Role;
}

export class UpdateUserDTO extends PartialType(CreateUserDTO) {}

export class SelectUserQueryDTO {
  @IsOptional()
  @IsArray()
  @Transform(({ value }) => {
    if (!value) return [];
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return typeof value === 'string' ? value.split(',') : value;
  })
  @AreAllTheseProperties<UserSelect>([
    'answersToDoubts',
    'bookmarkedResource',
    'bookmarkedVisual',
    'commentsToAnswer',
    'commentsToResources',
    'commentsToVisuals',
    'fromUserReports',
    'toUserReports',
    'likesToResources',
    'likesToVisuals',
    'profile',
    'reportsToDoubt',
    'reportsToResource',
    'reportsToVisual',
    'resources',
    'doubts',
    'visuals',
  ])
  select?: Array<keyof UserSelect>;
}
