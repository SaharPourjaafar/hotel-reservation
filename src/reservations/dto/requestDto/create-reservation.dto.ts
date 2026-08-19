import { ApiProperty } from '@nestjs/swagger';
import { ReservationRoomDto } from './reservation-room.dto';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  ArrayMinSize,
  ValidateNested,
} from 'class-validator';

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
  @IsDateString()
  checkIn!: string;

  @ApiProperty({
    example: '2026-08-15',
  })
  @IsDateString()
  checkOut!: string;
}
