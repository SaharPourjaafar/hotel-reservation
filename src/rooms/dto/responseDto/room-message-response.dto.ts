import { ApiProperty } from '@nestjs/swagger';

export class RoomMessageResponseDto {
  @ApiProperty({
    example: 'Room created successfully',
  })
  message!: string;
}
