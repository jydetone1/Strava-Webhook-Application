import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Activity } from './entities/activity.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ActivityRepository {
  constructor(
    @InjectRepository(Activity)
    private repository: Repository<Activity>,
  ) {}

  async save(activity: Activity): Promise<Activity> {
    return this.repository.save(activity);
  }

  async findById(id: number): Promise<Activity | null> {
    return this.repository.findOne({ where: { id } });
  }
}
