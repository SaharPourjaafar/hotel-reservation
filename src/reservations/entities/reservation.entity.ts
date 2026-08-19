import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';
import { Room } from '../../rooms/entities/room.entity';
import { ReservationStatus } from '../enums/reservation-status.enum';
import { CancellationRequest } from './cancellation-request.entity';

@Entity()
export class Reservation {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, (user) => user.reservations)
  @JoinColumn({ name: 'userId' })
  user!: User;

  @ManyToOne(() => Room, (room) => room.reservations)
  @JoinColumn({ name: 'roomId' })
  room!: Room;

  @OneToMany(
    () => CancellationRequest,
    (cancellationRequest) => cancellationRequest.reservation,
  )
  cancellationRequests!: CancellationRequest[];

  @Column({ type: 'date' })
  checkIn!: Date;

  @Column({ type: 'date' })
  checkOut!: Date;

  @Column()
  guestCount!: number;

  @Column({
    type: 'enum',
    enum: ReservationStatus,
  })
  status!: ReservationStatus;

  @Column('decimal')
  totalPrice!: number;
}
