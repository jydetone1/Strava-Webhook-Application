import { Test, TestingModule } from '@nestjs/testing';
import { WebhookService } from '../../activity/webhook/webhook.service';
import { ActivityService } from '../../activity/activity.service';
import { ActivityRepository } from '../../activity/activity.repository';
import { AuthService } from '../../activity/auth/auth.service';
import { ConfigModule } from '../../activity/common/config/config.module';
import { WebhookEventDto } from '../../activity/webhook/dto/webhook-event.dto';
import { HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

jest.mock('axios');

describe('WebhookService', () => {
  let service: WebhookService;
  let activityService: ActivityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [
        WebhookService,
        ActivityService,
        {
          provide: ActivityRepository,
          useValue: {
            findById: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: AuthService,
          useValue: {
            getStoredAccessToken: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<WebhookService>(WebhookService);
    activityService = module.get<ActivityService>(ActivityService);
    jest.clearAllMocks();
  });

  describe('handleWebhookEvent', () => {
    const event: WebhookEventDto = {
      object_type: 'activity',
      object_id: 123,
      aspect_type: 'create',
      updates: {},
      owner_id: 456,
      subscription_id: 789,
      event_time: 1234567890,
    };

    const stravaActivity = {
      id: 123,
      athlete: { id: 456 },
      name: 'Test Run',
      moving_time: 3600,
      start_date: '2023-01-01T00:00:00Z',
      type: 'Run',
    };

    const expectedActivity = {
      id: 123,
      userId: 456,
      name: 'Test Run',
      totalTime: 3600,
      startTime: new Date('2023-01-01T00:00:00Z'),
      type: 'Run',
    };

    beforeEach(() => {
      jest
        .spyOn(activityService, 'processActivity')
        .mockResolvedValue(undefined);
      jest
        .spyOn(activityService['authService'], 'getStoredAccessToken')
        .mockResolvedValue('token');
      jest
        .spyOn(activityService['activityRepository'], 'save')
        .mockResolvedValue(expectedActivity);
      (axios.get as jest.Mock).mockResolvedValue({ data: stravaActivity });
    });

    it('should process valid webhook event', async () => {
      await service.handleWebhookEvent(event);
      expect(activityService.processActivity).toHaveBeenCalledWith(event);
    }, 10000);

    it('should throw an error for invalid object_type', async () => {
      const invalidEvent = { ...event, object_type: 'invalid' };
      await expect(service.handleWebhookEvent(invalidEvent)).rejects.toThrow(
        new HttpException('Invalid webhook event', HttpStatus.BAD_REQUEST),
      );
      expect(activityService.processActivity).not.toHaveBeenCalled();
    });

    it('should throw an error for invalid aspect_type', async () => {
      const invalidEvent = { ...event, aspect_type: 'update' };
      await expect(service.handleWebhookEvent(invalidEvent)).rejects.toThrow(
        new HttpException('Invalid webhook event', HttpStatus.BAD_REQUEST),
      );
      expect(activityService.processActivity).not.toHaveBeenCalled();
    });

    it('should throw an error if processActivity fails', async () => {
      jest
        .spyOn(activityService, 'processActivity')
        .mockRejectedValue(
          new HttpException(
            'Failed to process activity',
            HttpStatus.INTERNAL_SERVER_ERROR,
          ),
        );

      await expect(service.handleWebhookEvent(event)).rejects.toThrow(
        new HttpException(
          'Failed to process activity',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
      expect(activityService.processActivity).toHaveBeenCalledWith(event);
    });
  });
});
