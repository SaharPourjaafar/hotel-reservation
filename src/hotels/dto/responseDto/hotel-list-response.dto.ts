import { ApiProperty } from '@nestjs/swagger';
import { HotelResponseDto } from './hotel-response.dto';
import { PaginationMetaDto } from './pagination-meta.dto';

export class HotelListResponseDto {
  @ApiProperty({
    type: [HotelResponseDto],
  })
  data!: HotelResponseDto[];

  @ApiProperty({
    type: PaginationMetaDto,
  })
  meta!: PaginationMetaDto;
}
