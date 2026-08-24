import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

import { CancellationRequestStatus } from '../../enums/cancellation-request-status.enum';

export class FilterCancellationRequestDto {
  @ApiPropertyOptional({
    enum: CancellationRequestStatus,
  })
  @IsOptional()
  @IsEnum(CancellationRequestStatus)
  status?: CancellationRequestStatus;
}
