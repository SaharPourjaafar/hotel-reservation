import { ApiPropertyOptional } from '@nestjs/swagger';

import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

import { Type } from 'class-transformer';

import { UserRole } from '../../enums/user-role.enum';

export enum UserSortField {
  ID = 'id',

  FIRST_NAME = 'firstName',

  LAST_NAME = 'lastName',

  EMAIL = 'email',

  CREATED_AT = 'createdAt',
}

export enum SortOrder {
  ASC = 'ASC',

  DESC = 'DESC',
}

export class FilterUserDto {
  @ApiPropertyOptional({
    description: 'Search by first name or last name',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    enum: UserRole,
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({
    enum: UserSortField,
  })
  @IsOptional()
  @IsEnum(UserSortField)
  sortBy?: UserSortField;

  @ApiPropertyOptional({
    enum: SortOrder,
  })
  @IsOptional()
  @IsEnum(SortOrder)
  order?: SortOrder;
}
