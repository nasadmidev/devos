import { Strategy } from 'passport-github2';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '@/user/user.service';
import { PrismaService } from '@/prisma/prisma.service';

interface GithubProfile {
  id: string;
  username: string;
  displayName: string;
  emails?: { value: string }[];
  _json: {
    id: number;
    login: string;
    avatar_url: string;
    name: string;
    email: string | null;
    bio: string;
  };
}

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(
    private readonly userService: UserService,
    private readonly prisma: PrismaService,
  ) {
    super({
      clientID: process.env.GITHUB_CLIENT_ID ?? '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? '',
      callbackURL: process.env.GITHUB_CALLBACK_URL ?? '',
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: GithubProfile,
  ) {
    if (!_accessToken) {
      throw new UnauthorizedException('No access token provided');
    }

    const email = profile.emails
      ? profile.emails[0].value
      : `${profile._json.login}@users.noreply.github.com`;

    let user = await this.userService.findOneByOAuthID(profile.id);

    if (!user) {
      user = await this.userService.findOneByEmail(email);
    }

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          authType: 'GITHUB',
          role: 'USER',
          oauthId: profile.id,
          profile: {
            create: {
              name: profile._json.login,
              description:
                profile._json.bio ?? `Hi!, my name is: ${profile._json.login}`,
              picture: profile._json.avatar_url,
              interests: [],
            },
          },
        },
      });
    }

    return user;
  }
}
