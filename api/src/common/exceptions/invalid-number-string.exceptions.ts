import { HttpException, HttpStatus } from '@nestjs/common';

export class InvalidNumberStingException extends HttpException {
  constructor(field?: string) {
    super(
      `${field ?? 'Field'} must be a number string`,
      HttpStatus['BAD_REQUEST'],
    );
  }
}
