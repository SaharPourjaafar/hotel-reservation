import { Body, Controller, Post, Res } from '@nestjs/common';
import type { Response } from 'express';

import { AuthService } from './auth.service';
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
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken } = await this.authService.login(loginDto);

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 1000,
    });

    return {
      message: 'Login successful',
    };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return {
      message: 'Logout successful',
    };
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
