import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordRequestOtpDto } from './dto/forgot-password-request-otp.dto';
import { VerifyForgotPasswordOtpDto } from './dto/verify-forgot-password-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

import { RegisterRequestOtpDto } from './dto/register-request-otp.dto';
import { VerifyRegisterOtpDto } from './dto/verify-register-otp.dto';
import { OtpService } from '../otp/otp.service';
import { RedisService } from '../redis/redis.service';
import { MailService } from '../mail/mail.service';
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly otpService: OtpService,
    private readonly redisService: RedisService,
    private readonly mailService: MailService,
  ) {}

  private getRegisterKey(email: string): string {
    return `auth:register:${email.trim().toLowerCase()}`;
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      accessToken: await this.jwtService.signAsync(payload),
    };
  }

  async requestRegisterOtp(dto: RegisterRequestOtpDto) {
    const existingUser = await this.usersService.findByEmail(dto.email);

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const registerKey = this.getRegisterKey(dto.email);

    await this.redisService.set(registerKey, JSON.stringify(dto), 600);
    const otp = await this.otpService.generateOtp('register', dto.email);

    await this.mailService.sendOtp(dto.email, otp.toString());

    return {
      message: 'OTP sent successfully',
    };
  }

  async verifyRegisterOtp(
    dto: VerifyRegisterOtpDto,
  ): Promise<{ message: string }> {
    const key = `auth:otp:register:${dto.email.trim().toLowerCase()}`;

    const storedOtp = await this.redisService.get(key);

    if (!storedOtp) {
      throw new UnauthorizedException('OTP is invalid or expired');
    }

    if (storedOtp !== dto.otp) {
      throw new UnauthorizedException('Invalid OTP');
    }

    const registerKey = `auth:register:${dto.email.trim().toLowerCase()}`;

    const registerData = await this.redisService.get(registerKey);
    if (!registerData) {
      throw new BadRequestException('Registration data not found or expired');
    }

    const userData = JSON.parse(registerData) as {
      firstName: string;
      lastName: string;
      phoneNumber: string;
      email: string;
      password: string;
    };

    await this.usersService.create(userData);
    await this.redisService.del(key);
    await this.redisService.del(registerKey);

    return {
      message: 'OTP verified successfully',
    };
  }

  async requestForgotPasswordOtp(
    dto: ForgotPasswordRequestOtpDto,
  ): Promise<{ message: string }> {
    const email = dto.email.trim().toLowerCase();

    const user = await this.usersService.findByEmail(email);

    if (user) {
      const otp = await this.otpService.generateOtp('forgot-password', email);

      await this.mailService.sendOtp(email, otp.toString());
    }

    return {
      message: 'If the email exists, an OTP has been sent',
    };
  }

  async verifyForgotPasswordOtp(
    dto: VerifyForgotPasswordOtpDto,
  ): Promise<{ message: string; resetToken: string }> {
    const email = dto.email.trim().toLowerCase();

    const key = `auth:otp:forgot-password:${email}`;

    const storedOtp = await this.redisService.get(key);

    if (!storedOtp) {
      throw new UnauthorizedException('OTP is invalid or expired');
    }

    if (storedOtp !== dto.otp) {
      throw new UnauthorizedException('Invalid OTP');
    }
    await this.redisService.del(key);

    const resetToken = randomBytes(32).toString('hex');

    const resetKey = `auth:reset-password:${email}`;

    await this.redisService.set(resetKey, resetToken, 600);

    return {
      message: 'OTP verified successfully',
      resetToken,
    };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    const email = dto.email.trim().toLowerCase();

    const resetKey = `auth:reset-password:${email}`;

    const storedToken = await this.redisService.get(resetKey);

    if (!storedToken) {
      throw new UnauthorizedException('Reset token is invalid or expired');
    }

    if (storedToken !== dto.resetToken) {
      throw new UnauthorizedException('Invalid reset token');
    }

    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.usersService.updatePassword(user, dto.newPassword);

    await this.redisService.del(resetKey);

    return {
      message: 'Password reset successfully',
    };
  }
}
