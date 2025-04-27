import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { ActivityService } from './activity.service';

@Controller('activities')
export class ActivityController {
  constructor(private activityService: ActivityService) {}

  @Get(':id')
  async getActivity(@Param('id') id: number) {
    const activity = await this.activityService.findById(id);
    if (!activity) {
      throw new HttpException('Activity not found', HttpStatus.NOT_FOUND);
    }
    return activity;
  }
}
