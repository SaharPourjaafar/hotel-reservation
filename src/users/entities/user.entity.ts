import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Reservation } from '../../reservations/entities/reservation.entity';
import { UserRole } from '../enums/user-role.enum';
import { CancellationRequest } from '../../reservations/entities/cancellation-request.entity';
import { Exclude } from 'class-transformer';
import { File } from '../../file-storage/entities/file.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @Column()
  phoneNumber!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ select: false })
  password!: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role!: UserRole;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ type: 'text', nullable: true })
  bio!: string | null;

  @OneToMany(() => Reservation, (reservation) => reservation.user)
  reservations!: Reservation[];

  @OneToMany(
    () => CancellationRequest,
    (cancellationRequest) => cancellationRequest.user,
  )
  cancellationRequests!: CancellationRequest[];

  @Column({ nullable: true })
  avatarFileId!: number | null;

  @OneToOne(() => File, { nullable: true })
  @JoinColumn({ name: 'avatarFileId' })
  avatar!: File | null;
}
