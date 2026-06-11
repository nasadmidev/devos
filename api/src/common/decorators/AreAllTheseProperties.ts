import { registerDecorator, ValidationOptions } from 'class-validator';

export function AreAllTheseProperties<T>(
  properties: Array<keyof T>,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value?: string | string[]) {
          if (!value) {
            return true;
          }

          const valuesArray =
            typeof value === 'string'
              ? value.split(',').map((item) => item.trim())
              : value;

          return valuesArray.every((value) =>
            properties.includes(value as keyof T),
          );
        },
        defaultMessage() {
          return `The field must contain at least one of the following parameters: ${properties.join(',')}`;
        },
      },
    });
  };
}
