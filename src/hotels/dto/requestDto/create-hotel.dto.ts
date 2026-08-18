import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';

export class CreateHotelDto {
  @ApiProperty({
    example: 'Grand Hotel',
    description: 'Hotel name',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    example: 'A five-star hotel in the city center',
    description: 'Hotel description',
  })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({
    example: '123 Main Street',
    description: 'Hotel address',
  })
  @IsString()
  @IsNotEmpty()
  address!: string;

  @ApiProperty({
    example: 'Tehran',
    description: 'Hotel city',
  })
  @IsString()
  @IsNotEmpty()
  city!: string;

  @ApiProperty({
    example: 5,
    description: 'Hotel star rating',
  })
  @IsInt()
  @Min(1)
  @Max(5)
  star!: number;
}
