import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Reservation } from './reservation.entity';
import { Room } from 'src/rooms/entities/room.entity';

@Entity()
export class ReservationRoom {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Reservation, (reservation) => reservation.reservationRooms)
  @JoinColumn({ name: 'reservationId' })
  reservation!: Reservation;

  @ManyToOne(() => Room, (room) => room.reservationRooms)
  @JoinColumn({ name: 'roomId' })
  room!: Room;

  @OneToMany(
    () => ReservationRoom,
    (reservationRoom) => reservationRoom.reservation,
  )
  rooms!: ReservationRoom[];

  @Column()
  guestCount!: number;
}
