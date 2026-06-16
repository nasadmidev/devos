import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { isEnum } from 'class-validator';
import { EntityType } from '../report.dto';

@Injectable()
export class FromEntityPipe implements PipeTransform {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  transform(value: string, _metadata: ArgumentMetadata) {
    if (!isEnum(value, EntityType)) {
      throw new BadRequestException(
        `fromEntity must be one of the following values: ${Object.keys(EntityType).join(',')}`,
      );
    }
  }
}
