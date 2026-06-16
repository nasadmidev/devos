import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { type StringValue } from 'ms';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { HealthModule } from './health/health.module';
import { JwtGuard } from './auth/jwt/jwt.guard';
import { RolesGuard } from './auth/roles/role.guard';
import { ProfileModule } from './profile/profile.module';
import { VisualModule } from './visual/visual.module';
import { ResourceModule } from './resource/resource.module';
import { DoubtModule } from './doubt/doubt.module';
import { AnswerModule } from './answer/answer.module';
import { ReportModule } from './report/report.module';

@Module({
  imports: [
    PrismaModule,
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: (process.env.JWT_EXPIRES as StringValue) ?? '1h',
      },
    }),
    AuthModule,
    UserModule,
    HealthModule,
    ProfileModule,
    VisualModule,
    ResourceModule,
    DoubtModule,
    AnswerModule,
    ReportModule,
  ],
  providers: [
    {
      provide: 'APP_GUARD',
      useClass: JwtGuard,
    },
    {
      provide: 'APP_GUARD',
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
