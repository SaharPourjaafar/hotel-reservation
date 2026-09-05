import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddRoomImagesDto {
  @ApiProperty({
    example: [11],
    description: 'IDs of the uploaded room image files',
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  @Type(() => Number)
  fileIds!: number[];
}
