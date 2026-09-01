import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ForgotPasswordRequestOtpDto {
  @ApiProperty({
    example: 'saharrr@example.com',
  })
  @IsEmail()
  email!: string;
}
