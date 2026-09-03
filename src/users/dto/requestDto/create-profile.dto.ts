import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateProfileDto {
  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsInt()
  avatarFileId?: number;
}
