import { registerDecorator, ValidationOptions } from 'class-validator';

export function IsTodayOrFuture(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isTodayOrFuture',
      target: object.constructor,
      propertyName,
      options: validationOptions,

      validator: {
        validate(value: unknown): boolean {
          if (typeof value !== 'string') {
            return false;
          }

          const checkInDate = new Date(value);

          if (Number.isNaN(checkInDate.getTime())) {
            return false;
          }

          const today = new Date();

          checkInDate.setHours(0, 0, 0, 0);
          today.setHours(0, 0, 0, 0);

          return checkInDate >= today;
        },
      },
    });
  };
}
