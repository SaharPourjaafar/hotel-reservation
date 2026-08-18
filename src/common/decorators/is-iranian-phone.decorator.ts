import { registerDecorator, ValidationOptions } from 'class-validator';

export function IsIranianPhone(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isIranianPhone',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          return typeof value === 'string' && /^09\d{9}$/.test(value);
        },

        defaultMessage() {
          return 'Phone number must be a valid Iranian phone number';
        },
      },
    });
  };
}
