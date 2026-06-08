import { Strategy } from 'passport-google-oauth20';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '@/user/user.service';
import { PrismaService } from '@/prisma/prisma.service';

interface GoogleProfile {
  emails: { value: string; verified: boolean }[];
  _json: {
    sub: string;
    name: string;
    give_name: string;
    family_name: string;
    picture: string;
    locale: string;
  };
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly userService: UserService,
    private readonly prisma: PrismaService,
  ) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      callbackURL: process.env.GOOGLE_CALLBACK_URL ?? '',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: GoogleProfile,
  ) {
    if (!_accessToken) {
      throw new UnauthorizedException('No access token provided');
    }

    const verifiedEmails = profile.emails.filter(({ verified }) => verified);

    if (verifiedEmails.length === 0) {
      throw new UnauthorizedException('Emails are not verified');
    }

    const email = verifiedEmails[0].value;
    let user = await this.userService.findOneByOAuthID(profile._json.sub);

    if (!user) {
      user = await this.userService.findOneByEmail(email);
    }

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          oauthId: profile._json.sub,
          email,
          role: 'USER',
          authType: 'GOOGLE',
          profile: {
            create: {
              name: profile._json.name,
              description: `Hi!, my name is ${profile._json.name}`,
              picture: profile._json.picture,
              interests: [],
            },
          },
        },
      });
    }

    return user;
  }
}
