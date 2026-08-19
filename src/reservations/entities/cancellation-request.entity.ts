import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';
import { Reservation } from './reservation.entity';
import { CancellationRequestStatus } from '../enums/cancellation-request-status.enum';

@Entity()
export class CancellationRequest {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, (user) => user.cancellationRequests)
  user!: User;

  @ManyToOne(
    () => Reservation,
    (reservation) => reservation.cancellationRequests,
  )
  reservation!: Reservation;
  @Column({
    type: 'enum',
    enum: CancellationRequestStatus,
    default: CancellationRequestStatus.PENDING,
  })
  status!: CancellationRequestStatus;

  @CreateDateColumn()
  createdAt!: Date;
}
