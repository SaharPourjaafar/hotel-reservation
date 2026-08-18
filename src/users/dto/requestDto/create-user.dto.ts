import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../enums/user-role.enum';
import { IsIranianPhone } from '../../../common/decorators/is-iranian-phone.decorator';
import { IsStrongPassword } from '../../../common/decorators/is-strong-password.decorator';

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
  @IsIranianPhone()
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
  @IsStrongPassword()
  @IsString()
  @IsNotEmpty()
  password!: string;

  @ApiProperty({
    example: 'admin',
  })
  @IsEnum(UserRole)
  role!: UserRole;
}
