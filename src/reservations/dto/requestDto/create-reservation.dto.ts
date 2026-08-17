import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, Min } from 'class-validator';

export class CreateReservationDto {
  @ApiProperty({
    example: 1,
    description: 'User ID',
  })
  @IsInt()
  @Min(1)
  userId!: number;

  @ApiProperty({
    example: 3,
    description: 'Room ID',
  })
  @IsInt()
  @Min(1)
  roomId!: number;

  @ApiProperty({
    example: '2026-08-10',
  })
  @IsDateString()
  checkIn!: string;

  @ApiProperty({
    example: '2026-08-15',
  })
  @IsDateString()
  checkOut!: string;

  @ApiProperty({
    example: 2,
  })
  @IsInt()
  @Min(1)
  guestCount!: number;
}
