import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Room } from '../../rooms/entities/room.entity';

@Entity()
export class Hotel {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  description!: string;

  @Column()
  address!: string;

  @Column()
  city!: string;

  @Column()
  star!: number;

  @OneToMany(() => Room, (room) => room.hotel)
  rooms!: Room[];
}
