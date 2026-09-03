import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum FileStatus {
  TEMP = 'temp',
  PERMANENT = 'permanent',
}

@Entity('files')
export class File {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  originalName!: string;

  @Column()
  fileName!: string;

  @Column()
  path!: string;

  @Column()
  mimeType!: string;

  @Column()
  size!: number;

  @Column({
    type: 'enum',
    enum: FileStatus,
    default: FileStatus.TEMP,
  })
  status!: FileStatus;

  @CreateDateColumn()
  createdAt!: Date;
}
