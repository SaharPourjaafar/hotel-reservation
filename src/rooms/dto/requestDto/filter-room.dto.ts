import { ApiPropertyOptional } from '@nestjs/swagger';

import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

import { Type } from 'class-transformer';

import { RoomType } from '../../enums/room-type.enum';
import { RoomStatus } from '../../enums/room-status.enum';

import { RoomSortField } from 'src/rooms/enums/room-sortfield.enum';
import { SortOrder } from 'src/rooms/enums/room-sortorder.enum';

export class FilterRoomDto {
  @ApiPropertyOptional({
    description: 'Search by room number',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  hotelId?: number;

  @ApiPropertyOptional({
    enum: RoomType,
  })
  @IsOptional()
  @IsEnum(RoomType)
  type?: RoomType;

  @ApiPropertyOptional({
    enum: RoomStatus,
  })
  @IsOptional()
  @IsEnum(RoomStatus)
  status?: RoomStatus;

  @ApiPropertyOptional({
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minPrice?: number;

  @ApiPropertyOptional({
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxPrice?: number;

  @ApiPropertyOptional({
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  minCapacity?: number;

  @ApiPropertyOptional({
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  page?: number;

  @ApiPropertyOptional({
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  limit?: number;

  @ApiPropertyOptional({
    enum: RoomSortField,
  })
  @IsOptional()
  @IsEnum(RoomSortField)
  sortBy?: RoomSortField;

  @ApiPropertyOptional({
    enum: SortOrder,
  })
  @IsOptional()
  @IsEnum(SortOrder)
  order?: SortOrder;
}
