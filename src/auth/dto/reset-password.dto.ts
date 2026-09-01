import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    example: 'saharp51022@gmail.com',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'newPassword@123',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  newPassword!: string;

  @ApiProperty({
    example: 'your-reset-token',
  })
  @IsString()
  @IsNotEmpty()
  resetToken!: string;
}
