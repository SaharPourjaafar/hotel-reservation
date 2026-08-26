import { ApiProperty } from '@nestjs/swagger';

import { RoomType } from '../../../rooms/enums/room-type.enum';
import { RoomStatus } from '../../../rooms/enums/room-status.enum';

export class ReservationRoomResponseDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  roomNumber!: string;

  @ApiProperty({
    enum: RoomType,
  })
  type!: RoomType;

  @ApiProperty()
  capacity!: number;

  @ApiProperty()
  price!: number;

  @ApiProperty({
    enum: RoomStatus,
  })
  status!: RoomStatus;

  @ApiProperty()
  guestCount!: number;
}
