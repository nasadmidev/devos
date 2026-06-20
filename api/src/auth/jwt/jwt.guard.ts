import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JsonWebTokenError, JwtService, TokenExpiredError } from '@nestjs/jwt';
import type { Request } from 'express';
import type { JwtPayload } from '@/auth/auth.service';
import { IS_PUBLIC_KEY } from './public.decorator';

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const token =
      this.extractTokenFromCookie(request) ??
      this.extractTokenFromHeader(request);
    if (!token) throw new UnauthorizedException('Missing token');
    try {
      const payload = await this.jwt.verifyAsync<JwtPayload>(token, {
        secret: process.env.JWT_SECRET,
      });
      request['user'] = payload;
      return true;
    } catch (e) {
      if (e instanceof TokenExpiredError) {
        throw new ForbiddenException(
          `Token expired: ${e.expiredAt.toISOString()}`,
        );
      }
      if (e instanceof JsonWebTokenError) {
        throw new ForbiddenException('Invalid token');
      }
      return false;
    }
  }

  extractTokenFromCookie(request: Request): string | null {
    const authCookie = request.cookies?.['access_token'] as string | undefined;
    if (!authCookie) return null;
    if (authCookie.startsWith('Bearer ')) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [_, token] = authCookie.split(' ');
      return token || null;
    }
    return authCookie;
  }

  extractTokenFromHeader(request: Request): string | null {
    const authHeader = request.headers['authorization'];
    if (!authHeader) return null;
    const [type, token] = authHeader ? authHeader.split(' ') : [];
    return type === 'Bearer' && token ? token : null;
  }
}
