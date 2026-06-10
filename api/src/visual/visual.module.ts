import { Module } from '@nestjs/common';
import { VisualService } from './visual.service';
import { VisualController } from './visual.controller';

@Module({
  providers: [VisualService],
  controllers: [VisualController],
})
export class VisualModule {}
