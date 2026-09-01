import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class OtpService {
  constructor(private readonly redisService: RedisService) {}

  async generateOtp(type: string, email: string) {
    const otp = Math.floor(100000 + Math.random() * 900000);

    const key = `auth:otp:${type}:${email.trim().toLowerCase()}`;

    await this.redisService.set(key, otp.toString(), 120);

    return otp;
  }

  async verifyOtp(type: string, email: string, otp: string) {
    const key = `auth:otp:${type}:${email.trim().toLowerCase()}`;

    const storedOtp = await this.redisService.get(key);

    if (!storedOtp) {
      return false;
    }

    if (storedOtp !== otp) {
      return false;
    }

    await this.redisService.del(key);

    return true;
  }
}
