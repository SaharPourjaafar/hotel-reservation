import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { ReservationStatus } from '../../enums/reservation-status.enum';

export class UpdateReservationDto {
  @ApiPropertyOptional({
    enum: ReservationStatus,
    example: ReservationStatus.CONFIRMED,
  })
  @IsEnum(ReservationStatus)
  status?: ReservationStatus;
}
