import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findByStravaAthleteId(stravaAthleteId: number): Promise<User | null> {
    return this.userRepository.findOne({ where: { stravaAthleteId } });
  }

  async findByRefreshToken(refreshToken: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { refreshToken } });
  }

  async save(user: User): Promise<User> {
    return this.userRepository.save(user);
  }
}
