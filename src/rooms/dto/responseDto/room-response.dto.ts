import { ApiProperty } from '@nestjs/swagger';
import { RoomType } from '../../enums/room-type.enum';
import { RoomStatus } from '../../enums/room-status.enum';

export class RoomResponseDto {
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
  hotelId!: number;
}
