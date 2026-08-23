import {
  IsIn,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

import { Type } from 'class-transformer';

import { ApiPropertyOptional } from '@nestjs/swagger';

import { HotelSortField } from '../../enums/hotel-sort-field.enum';

export class FilterHotelDto {
  @ApiPropertyOptional({
    description: 'Search in hotel name and description',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by city',
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({
    minimum: 1,
    maximum: 5,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  minStar?: number;

  @ApiPropertyOptional({
    minimum: 1,
    maximum: 5,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  maxStar?: number;

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
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({
    enum: HotelSortField,
  })
  @IsOptional()
  @IsEnum(HotelSortField)
  sortBy?: HotelSortField;

  @ApiPropertyOptional({
    enum: ['ASC', 'DESC'],
  })
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  order?: 'ASC' | 'DESC';
}
