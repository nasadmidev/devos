import { Module } from '@nestjs/common';
import { DoubtController } from './doubt.controller';
import { DoubtService } from './doubt.service';

@Module({
  controllers: [DoubtController],
  providers: [DoubtService]
})
export class DoubtModule {}
