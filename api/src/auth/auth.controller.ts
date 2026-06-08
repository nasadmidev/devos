import {
  Controller,
  Post,
  Req,
  UseGuards,
  Put,
  Body,
  Get,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';
import { User } from '@/generated/prisma/client';
import { Public } from './jwt/public.decorator';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GoogleGuard } from './guards/google/google.guard';
import ms, { StringValue } from 'ms';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @UseGuards(AuthGuard('local'))
  @Post('login')
  @ApiOperation({ summary: 'Login with username and password' })
  @ApiResponse({
    status: 200,
    description: 'Login successful, returns JWT token',
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Req() req: Request & { user?: User }) {
    return await this.authService.login(req.user as User);
  }

  @Public()
  @UseGuards(GoogleGuard)
  @Get('google')
  async googleLogin() {}

  @Public()
  @UseGuards(AuthGuard('google'))
  @Get('callback/google')
  @ApiOperation({ summary: 'Google OAuth Callback' })
  async googleLoginCallback(@Req() req: Request, @Res() res: Response) {
    const token = await this.authService.login(req.user as User);
    res.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: ms(process.env.JWT_EXPIRES as StringValue),
    });
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    return res.redirect(`${frontendUrl}/dashboard`);
  }

  @Public()
  @UseGuards(AuthGuard('github'))
  @Get('github')
  async githubLogin() {}

  @Public()
  @UseGuards(AuthGuard('github'))
  @Get('callback/github')
  @ApiOperation({ summary: 'Github OAuth Callback' })
  async githubLoginCallback(@Req() req: Request, @Res() res: Response) {
    const token = await this.authService.login(req.user as User);
    res.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: ms(process.env.JWT_EXPIRES as StringValue),
    });
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    return res.redirect(`${frontendUrl}/dashboard`);
  }

  @Public()
  @Put('regenerate')
  @ApiOperation({ summary: 'Regenerate access token using refresh token' })
  @ApiResponse({ status: 200, description: 'New JWT token pair' })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  async regenerateToken(@Body('token') token: string) {
    return await this.authService.regenerateToken(token);
  }
}
