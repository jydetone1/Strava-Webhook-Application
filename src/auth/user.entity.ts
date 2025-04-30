import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  stravaAthleteId: number;

  @Column()
  accessToken: string;
  @Column()
  refreshToken: string;

  @Column({ type: 'timestamp' })
  tokenExpiresAt: Date;
}
