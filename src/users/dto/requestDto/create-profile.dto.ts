import { IsInt, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProfileDto {
  @ApiPropertyOptional({
    example: 'I love traveling',
    description: 'User bio',
  })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({
    example: 10,
    description: 'ID of the uploaded avatar file',
  })
  @IsOptional()
  @IsInt()
  avatarFileId?: number;
}
