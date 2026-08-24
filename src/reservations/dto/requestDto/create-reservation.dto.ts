import { ApiProperty } from '@nestjs/swagger';
import { ReservationRoomDto } from './reservation-room.dto';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  ArrayMinSize,
  ValidateNested,
} from 'class-validator';

import { IsAfter } from 'src/common/validators/is-after.validator';
import { IsTodayOrFuture } from 'src/common/validators/is-today-or-future.validator';

export class CreateReservationDto {
  @ApiProperty({
    description: 'List of rooms to reserve',
    type: [ReservationRoomDto],
    example: [
      {
        roomId: 1,
        guestCount: 2,
      },
      {
        roomId: 3,
        guestCount: 3,
      },
    ],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ReservationRoomDto)
  rooms!: ReservationRoomDto[];

  @ApiProperty({
    example: '2026-08-10',
  })
  @IsTodayOrFuture({
    message: 'Check-in date cannot be in the past',
  })
  @IsDateString()
  checkIn!: string;

  @ApiProperty({
    example: '2026-08-15',
  })
  @IsAfter('checkIn', {
    message: 'Check-out date must be after check-in date',
  })
  @IsDateString()
  checkOut!: string;
}
