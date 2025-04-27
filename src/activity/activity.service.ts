import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ActivityRepository } from './activity.repository';
import { WebhookEventDto } from './webhook/dto/webhook-event.dto';
import axios from 'axios';
import { AuthService } from './auth/auth.service';
import { Activity } from './entities/activity.entity';

@Injectable()
export class ActivityService {
  constructor(
    private activityRepository: ActivityRepository,
    private authService: AuthService,
  ) {}

  async findById(id: number): Promise<Activity | null> {
    return this.activityRepository.findById(id);
  }

  async processActivity(event: WebhookEventDto): Promise<void> {
    const accessToken = await this.authService.getStoredAccessToken(
      event.owner_id,
    );

    const activity = await this.fetchActivity(event.object_id, accessToken);

    const activityEntity = new Activity();
    activityEntity.id = activity.id;
    activityEntity.userId = activity.athlete.id;
    activityEntity.name = activity.name;
    activityEntity.totalTime = activity.moving_time;
    activityEntity.startTime = new Date(activity.start_date);
    activityEntity.type = activity.type;

    await this.activityRepository.save(activityEntity);
  }

  private async fetchActivity(id: number, accessToken: string): Promise<any> {
    const url = `https://www.strava.com/api/v3/activities/${id}`;

    try {
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return response.data;
    } catch (error) {
      throw new HttpException(
        `Failed to fetch activity: ${error.response?.data?.message || error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
