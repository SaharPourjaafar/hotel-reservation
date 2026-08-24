import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function IsAfter(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isAfter',
      target: object.constructor,
      propertyName,
      constraints: [property],
      options: validationOptions,

      validator: {
        validate(value: unknown, args: ValidationArguments): boolean {
          const relatedPropertyName = args.constraints[0] as string;

          const relatedValue = (args.object as Record<string, unknown>)[
            relatedPropertyName
          ];

          if (typeof value !== 'string' || typeof relatedValue !== 'string') {
            return false;
          }

          const currentDate = new Date(value);
          const relatedDate = new Date(relatedValue);

          if (
            Number.isNaN(currentDate.getTime()) ||
            Number.isNaN(relatedDate.getTime())
          ) {
            return false;
          }

          return currentDate > relatedDate;
        },
      },
    });
  };
}
