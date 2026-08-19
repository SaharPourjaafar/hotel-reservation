import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsPositive } from 'class-validator';

export class ReservationRoomDto {
  @ApiProperty({
    example: 1,
    description: 'Room ID',
  })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  roomId!: number;

  @ApiProperty({
    example: 2,
    description: 'Number of guests for this room',
  })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  guestCount!: number;
}
