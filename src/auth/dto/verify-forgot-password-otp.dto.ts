import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class VerifyForgotPasswordOtpDto {
  @ApiProperty({
    example: 'saharp51022@gmail.com',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: '583921',
  })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  otp!: string;
}
