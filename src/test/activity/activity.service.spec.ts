import { Test, TestingModule } from '@nestjs/testing';
import { ActivityService } from '../../activity/activity.service';
import { ActivityRepository } from '../../activity/activity.repository';
import { ConfigService } from '../../common/config/config.service';
import { AuthService } from '../../auth/auth.service';
import { WebhookEventDto } from '../../webhook/dto/webhook-event.dto';
import { HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

jest.mock('axios');

describe('ActivityService', () => {
  let service: ActivityService;
  let repository: ActivityRepository;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActivityService,
        {
          provide: ActivityRepository,
          useValue: {
            findById: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
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

    service = module.get<ActivityService>(ActivityService);
    repository = module.get<ActivityRepository>(ActivityRepository);
    authService = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should return an activity when found', async () => {
      const activity = {
        id: 123,
        userId: 456,
        name: 'Test Run',
        totalTime: 3600,
        startTime: new Date('2023-01-01T00:00:00Z'),
        type: 'Run',
      };
      (repository.findById as jest.Mock).mockResolvedValue(activity);

      const result = await service.findById(123);
      expect(result).toEqual(activity);
      expect(repository.findById).toHaveBeenCalledWith(123);
    });

    it('should return null when activity is not found', async () => {
      (repository.findById as jest.Mock).mockResolvedValue(null);

      const result = await service.findById(123);
      expect(result).toBeNull();
      expect(repository.findById).toHaveBeenCalledWith(123);
    });
  });

  describe('processActivity', () => {
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
      (authService.getStoredAccessToken as jest.Mock).mockResolvedValue(
        'token',
      );
      (axios.get as jest.Mock).mockResolvedValue({ data: stravaActivity });
      (repository.save as jest.Mock).mockResolvedValue(expectedActivity);
    });

    it('should process and save an activity', async () => {
      await service.processActivity(event);

      expect(authService.getStoredAccessToken).toHaveBeenCalledWith(
        event.owner_id,
      );
      expect(axios.get).toHaveBeenCalledWith(
        `https://www.strava.com/api/v3/activities/${event.object_id}`,
        { headers: { Authorization: `Bearer token` } },
      );
      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining(expectedActivity),
      );
    });

    it('should throw an error if token retrieval fails', async () => {
      (authService.getStoredAccessToken as jest.Mock).mockRejectedValue(
        new HttpException('User not found', HttpStatus.NOT_FOUND),
      );

      await expect(service.processActivity(event)).rejects.toThrow(
        new HttpException('User not found', HttpStatus.NOT_FOUND),
      );
      expect(authService.getStoredAccessToken).toHaveBeenCalledWith(
        event.owner_id,
      );
      expect(axios.get).not.toHaveBeenCalled();
    });

    it('should throw an error if Strava API call fails', async () => {
      (axios.get as jest.Mock).mockRejectedValue({
        response: { data: { message: 'Invalid token' } },
      });

      await expect(service.processActivity(event)).rejects.toThrow(
        new HttpException(
          'Failed to fetch activity: Invalid token',
          HttpStatus.BAD_REQUEST,
        ),
      );
      expect(authService.getStoredAccessToken).toHaveBeenCalledWith(
        event.owner_id,
      );
      expect(axios.get).toHaveBeenCalled();
    });
  });
});
