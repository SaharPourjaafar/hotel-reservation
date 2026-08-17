import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../enums/user-role.enum';

export class CreateUserDto {
  @ApiProperty({
    example: 'Sahar',
    description: 'User first name',
  })
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @ApiProperty({
    example: 'Purjafar',
  })
  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @ApiProperty({
    example: '09148726534',
  })
  @Matches(/^09\d{9}$/, {
    message: 'Phone number must be a valid Iranian phone number',
  })
  @IsString()
  @IsNotEmpty()
  phoneNumber!: string;

  @ApiProperty({
    example: 'sahar@test.com',
    description: 'User email address',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'Test@1234',
  })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message:
        'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character',
    },
  )
  @IsString()
  @IsNotEmpty()
  password!: string;

  @ApiProperty({
    example: 'admin',
  })
  @IsEnum(UserRole)
  role!: UserRole;
}
