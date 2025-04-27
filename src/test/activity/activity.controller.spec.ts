import { Test, TestingModule } from '@nestjs/testing';
import { ActivityController } from '../../activity/activity.controller';
import { ActivityService } from '../../activity/activity.service';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('ActivityController', () => {
  let controller: ActivityController;
  let service: ActivityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ActivityController],
      providers: [
        {
          provide: ActivityService,
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ActivityController>(ActivityController);
    service = module.get<ActivityService>(ActivityService);
  });

  describe('getActivity', () => {
    it('should return an activity when found', async () => {
      const activity = {
        id: 123,
        userId: 456,
        name: 'Test Run',
        totalTime: 3600,
        startTime: new Date('2023-01-01T00:00:00Z'),
        type: 'Run',
      };
      (service.findById as jest.Mock).mockResolvedValue(activity);

      const result = await controller.getActivity(123);
      expect(result).toEqual(activity);
      expect(service.findById).toHaveBeenCalledWith(123);
    });

    it('should throw 404 when activity is not found', async () => {
      (service.findById as jest.Mock).mockResolvedValue(null);

      await expect(controller.getActivity(123)).rejects.toThrow(
        new HttpException('Activity not found', HttpStatus.NOT_FOUND),
      );
      expect(service.findById).toHaveBeenCalledWith(123);
    });
  });
});
