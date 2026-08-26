import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';
import { ReservationStatus } from '../enums/reservation-status.enum';
import { CancellationRequest } from './cancellation-request.entity';
import { ReservationRoom } from './reservation-room.entity';

@Entity()
export class Reservation {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, (user) => user.reservations)
  @JoinColumn({ name: 'userId' })
  user!: User;

  @OneToMany(
    () => ReservationRoom,
    (reservationRoom) => reservationRoom.reservation,
  )
  reservationRooms!: ReservationRoom[];

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
