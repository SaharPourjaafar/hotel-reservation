import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { IsIranianPhone } from '../../common/decorators/is-iranian-phone.decorator';
import { IsStrongPassword } from '../../common/decorators/is-strong-password.decorator';

export class RegisterRequestOtpDto {
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
  @IsIranianPhone()
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
    description: 'User password',
    minLength: 6,
  })
  @IsStrongPassword()
  @IsString()
  password!: string;
}
