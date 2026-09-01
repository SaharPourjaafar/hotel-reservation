import { Body, Controller, Post } from '@nestjs/common';

import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

import { RegisterRequestOtpDto } from './dto/register-request-otp.dto';
import { VerifyRegisterOtpDto } from './dto/verify-register-otp.dto';
import { ForgotPasswordRequestOtpDto } from './dto/forgot-password-request-otp.dto';
import { VerifyForgotPasswordOtpDto } from './dto/verify-forgot-password-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

import { Public } from '../common/decorators/public.decorator';
import { MailService } from '../mail/mail.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly mailService: MailService,
  ) {}

  @Public()
  @Post('test-email')
  async testEmail(): Promise<{ message: string }> {
    await this.mailService.sendOtp('saharp51022@gmail.com', '123456');

    return {
      message: 'Email sent successfully',
    };
  }

  @Public()
  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('register/request-otp')
  async requestRegisterOtp(@Body() dto: RegisterRequestOtpDto) {
    return this.authService.requestRegisterOtp(dto);
  }

  @Public()
  @Post('register/verify-otp')
  verifyRegisterOtp(@Body() dto: VerifyRegisterOtpDto) {
    return this.authService.verifyRegisterOtp(dto);
  }

  @Public()
  @Post('forgot-password/request-otp')
  async requestForgotPasswordOtp(
    @Body() dto: ForgotPasswordRequestOtpDto,
  ): Promise<{ message: string }> {
    return this.authService.requestForgotPasswordOtp(dto);
  }

  @Public()
  @Post('forgot-password/verify-otp')
  async verifyForgotPasswordOtp(
    @Body() dto: VerifyForgotPasswordOtpDto,
  ): Promise<{ message: string }> {
    return this.authService.verifyForgotPasswordOtp(dto);
  }

  @Public()
  @Post('reset-password')
  async resetPassword(
    @Body() dto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    return this.authService.resetPassword(dto);
  }
}
