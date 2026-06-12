import { Module } from '@nestjs/common';
import { AnswerService } from './answer.service';

@Module({
  providers: [AnswerService],
  exports: [AnswerService],
})
export class AnswerModule {}
