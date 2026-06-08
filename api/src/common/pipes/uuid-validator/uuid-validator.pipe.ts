import {
  ArgumentMetadata,
  Injectable,
  Optional,
  PipeTransform,
} from '@nestjs/common';
import { isUUID } from 'class-validator';
import { InvalidUUIDException } from '@/common/exceptions/uuid-validator.exceptions';

export const validateUUID = (id: string, fieldName = 'ID') => {
  if (!isUUID(id)) throw new InvalidUUIDException(id, fieldName);
};

/**
 * @example
 * // use like body pipe
 * new UUIDValidatorPipe<Object>(['property'])
 * // use like param pipe
 * new UUIDValidator()
 */

@Injectable()
export class UuidValidatorPipe<T = unknown> implements PipeTransform {
  constructor(@Optional() private readonly keys?: Array<keyof T>) {}

  transform(value: string | T, metadata: ArgumentMetadata) {
    if (metadata.type === 'param') {
      this.isUUIDParamValid(value as string);
    }

    if (metadata.type === 'query') {
      this.isUUIDQueryValid(value);
    }

    if (metadata.type === 'body') {
      this.isPropertyUUIDValid(value as T);
    }

    return value;
  }

  private isUUIDParamValid(value: string) {
    if (!isUUID(value)) {
      throw new InvalidUUIDException(value, 'param');
    }
  }

  private isPropertyUUIDValid(value: T) {
    if (this.keys) {
      for (const key of this.keys) {
        if (typeof value[key] === 'string' && !isUUID(value[key])) {
          throw new InvalidUUIDException(value[key], 'body');
        }
      }
    }
  }

  private isUUIDQueryValid(value: string | T | undefined) {
    if (typeof value === 'undefined') {
      return value;
    }

    if (typeof value === 'object') {
      return this.isPropertyUUIDValid(value);
    }

    if (typeof value === 'string' && !isUUID(value)) {
      throw new InvalidUUIDException(value, 'query');
    }

    return value;
  }
}
