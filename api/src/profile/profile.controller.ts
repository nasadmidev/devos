import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Req,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { Public } from '@/auth/jwt/public.decorator';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { RequestAuthorized } from '@/auth/auth.service';
import { CreateProfileDTO, UpdateProfileDTO } from './profile.dto';

@ApiTags('profile')
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('me')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get the profile of user by bearer token',
  })
  @ApiResponse({
    status: 200,
    description: 'Got profile',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getMyProfile(@Req() request: RequestAuthorized) {
    return this.profileService.findOne({ userId: request.user.sub });
  }

  @Get(':name')
  @Public()
  @ApiOperation({
    summary: 'Get profile by username',
  })
  @ApiResponse({
    status: 200,
    description: 'Profile by username',
  })
  @ApiParam({
    name: 'name',
    description: 'Name parameter',
    type: 'string',
    example: 'nasadmidev',
    required: true,
  })
  async getProfileByName(@Param('name') name: string) {
    if (!name) {
      throw new BadRequestException('Name parameter is required');
    }
    return this.profileService.findOne({ name });
  }

  @Put('me')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update a profile',
  })
  async updateProfile(
    @Req() request: RequestAuthorized,
    @Body() data: UpdateProfileDTO,
  ) {
    return this.profileService.update({ userId: request.user.sub, data });
  }

  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Create a profile',
  })
  async createProfile(
    @Req() request: RequestAuthorized,
    @Body() data: CreateProfileDTO,
  ) {
    return this.profileService.create(request.user.sub, data);
  }

  // TODO: /me/avatar
}
