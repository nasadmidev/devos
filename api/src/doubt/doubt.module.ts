import { Module } from '@nestjs/common';
import { DoubtController } from './doubt.controller';
import { DoubtService } from './doubt.service';
import { AnswerModule } from '@/answer/answer.module';

@Module({
  imports: [AnswerModule],
  controllers: [DoubtController],
  providers: [DoubtService],
})
export class DoubtModule {}
