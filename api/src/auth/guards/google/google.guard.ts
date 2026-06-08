import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleGuard extends AuthGuard('google') {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getAuthenticateOptions(_context: ExecutionContext) {
    return {
      prompt: 'select_account',
      accessType: 'offline',
    };
  }
}
