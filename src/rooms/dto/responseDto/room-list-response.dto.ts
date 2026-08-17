import { ApiProperty } from '@nestjs/swagger';
import { RoomResponseDto } from './room-response.dto';
import { RoomMetaResponseDto } from './room-meta-response.dto';

export class RoomListResponseDto {
  @ApiProperty({
    type: () => RoomResponseDto,
    isArray: true,
  })
  data!: RoomResponseDto[];

  @ApiProperty({
    type: () => RoomMetaResponseDto,
  })
  meta!: RoomMetaResponseDto;
}
