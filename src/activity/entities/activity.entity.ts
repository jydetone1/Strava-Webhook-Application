import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity('activities')
export class Activity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column()
  @Index()
  userId: number;

  @Column()
  name: string;

  @Column()
  totalTime: number;

  @Column()
  startTime: Date;

  @Column()
  type: string;
}
