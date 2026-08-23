import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { CancellationDecision } from '../../enums/cancellationDecision.enum';

export class HandleCancellationRequestDto {
  @ApiProperty({
    enum: CancellationDecision,
  })
  @IsEnum(CancellationDecision)
  action!: CancellationDecision;
}
