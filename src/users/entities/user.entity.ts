import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Reservation } from '../../reservations/entities/reservation.entity';
import { UserRole } from '../enums/user-role.enum';
import { CancellationRequest } from '../../reservations/entities/cancellation-request.entity';
import { Exclude } from 'class-transformer';

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

  @Column()
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

  @OneToMany(() => Reservation, (reservation) => reservation.user)
  reservations!: Reservation[];

  @OneToMany(
    () => CancellationRequest,
    (cancellationRequest) => cancellationRequest.user,
  )
  cancellationRequests!: CancellationRequest[];
}
