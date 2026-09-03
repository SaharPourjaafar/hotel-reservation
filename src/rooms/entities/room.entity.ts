import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Hotel } from '../../hotels/entities/hotel.entity';
import { RoomType } from '../enums/room-type.enum';
import { RoomStatus } from '../enums/room-status.enum';
import { ReservationRoom } from '../../reservations/entities/reservation-room.entity';
import { RoomImage } from './room-image.entity';

@Entity()
export class Room {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  roomNumber!: string;

  @Column({
    type: 'enum',
    enum: RoomType,
  })
  type!: RoomType;

  @Column()
  capacity!: number;

  @Column('decimal')
  price!: number;

  @Column({
    type: 'enum',
    enum: RoomStatus,
  })
  status!: RoomStatus;

  @OneToMany(() => RoomImage, (roomImage) => roomImage.room)
  images!: RoomImage[];

  @ManyToOne(() => Hotel, (hotel) => hotel.rooms)
  @JoinColumn({ name: 'hotelId' })
  hotel!: Hotel;

  @OneToMany(() => ReservationRoom, (reservationRoom) => reservationRoom.room)
  reservationRooms!: ReservationRoom[];
}
