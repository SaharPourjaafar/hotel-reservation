import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  Matches,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'Sahar',
    description: 'User first name',
  })
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @ApiProperty({
    example: 'Pourjaafar',
    description: 'User last name',
  })
  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @ApiProperty({
    example: '09123456789',
    description: 'User phone number',
  })
  @Matches(/^09\d{9}$/, {
    message: 'Phone number must be a valid Iranian phone number',
  })
  @IsString()
  @IsNotEmpty()
  phoneNumber!: string;

  @ApiProperty({
    example: 'sahar@example.com',
    description: 'User email address',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'Test@1234',
    description: 'User password (minimum 6 characters)',
    minLength: 6,
  })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message:
        'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character',
    },
  )
  @IsString()
  @MinLength(6)
  password!: string;
}
