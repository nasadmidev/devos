import { BadRequestException } from '@nestjs/common';
import { FromEntityPipe } from './from-entity.pipe';

describe('FromEntityPipe', () => {
  it('should be defined', () => {
    expect(new FromEntityPipe()).toBeDefined();
  });

  const pipe = new FromEntityPipe();

  it('should throw BadRequestException on invalid EntityType', () => {
    expect(() => pipe.transform('invalid', { type: 'query' })).toThrow(
      BadRequestException,
    );
  });

  it('should return value', () => {
    expect(pipe.transform('USER', { type: 'query' })).toEqual('USER');
  });
});
