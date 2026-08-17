import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from './user-response.dto';
import { UserMetaResponseDto } from './user-meta-response.dto';

export class UserListResponseDto {
  @ApiProperty({
    type: () => UserResponseDto,
    isArray: true,
  })
  data!: UserResponseDto[];

  @ApiProperty({
    type: () => UserMetaResponseDto,
  })
  meta!: UserMetaResponseDto;
}
