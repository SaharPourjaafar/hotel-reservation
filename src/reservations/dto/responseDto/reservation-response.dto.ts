import { ApiProperty } from '@nestjs/swagger';
import { ReservationStatus } from '../../enums/reservation-status.enum';
import { ReservationUserResponseDto } from './reservation-user-response.dto';
import { ReservationRoomResponseDto } from './reservation-room-response.dto';

export class ReservationResponseDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  checkIn!: Date;

  @ApiProperty()
  checkOut!: Date;

  @ApiProperty({
    enum: ReservationStatus,
  })
  status!: ReservationStatus;

  @ApiProperty()
  totalPrice!: number;

  @ApiProperty({
    type: () => ReservationUserResponseDto,
  })
  user!: ReservationUserResponseDto;

  @ApiProperty({
    type: () => [ReservationRoomResponseDto],
  })
  rooms!: ReservationRoomResponseDto[];
}
