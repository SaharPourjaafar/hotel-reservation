import { ApiProperty } from '@nestjs/swagger';
import { ReservationResponseDto } from './reservation-response.dto';
import { ReservationMetaResponseDto } from './reservation-meta-response.dto';

export class ReservationListResponseDto {
  @ApiProperty({
    type: () => ReservationResponseDto,
    isArray: true,
  })
  data!: ReservationResponseDto[];

  @ApiProperty({
    type: () => ReservationMetaResponseDto,
  })
  meta!: ReservationMetaResponseDto;
}
