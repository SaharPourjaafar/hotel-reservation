import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNumber, IsString, Min } from 'class-validator';
import { RoomType } from '../../enums/room-type.enum';
import { RoomStatus } from '../../enums/room-status.enum';

export class CreateRoomDto {
  @ApiProperty({
    example: '101',
    description: 'Room number',
  })
  @IsString()
  roomNumber!: string;

  @ApiProperty({
    enum: RoomType,
    example: RoomType.DOUBLE,
  })
  @IsEnum(RoomType)
  type!: RoomType;

  @ApiProperty({
    example: 2,
    description: 'Maximum number of guests',
  })
  @IsInt()
  @Min(1)
  capacity!: number;

  @ApiProperty({
    example: 150,
    description: 'Room price per night',
  })
  @IsNumber()
  @Min(0)
  price!: number;

  @ApiProperty({
    enum: RoomStatus,
    example: RoomStatus.AVAILABLE,
  })
  @IsEnum(RoomStatus)
  status!: RoomStatus;

  @ApiProperty({
    example: 1,
    description: 'ID of the hotel that owns this room',
  })
  @IsInt()
  hotelId!: number;
}
