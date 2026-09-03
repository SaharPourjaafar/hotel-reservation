import {
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Room } from './room.entity';
import { File } from '../../file-storage/entities/file.entity';

@Entity('room_images')
export class RoomImage {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Room, (room) => room.images, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'roomId' })
  room!: Room;

  @OneToOne(() => File, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'fileId' })
  file!: File;
}
