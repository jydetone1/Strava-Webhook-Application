import { Test, TestingModule } from '@nestjs/testing';
import { WebhookController } from '../../webhook/webhook.controller';
import { WebhookService } from '../../webhook/webhook.service';
import { ConfigService } from '../../common/config/config.service';
import { ActivityService } from '../../activity/activity.service';

describe('WebhookController', () => {
  let controller: WebhookController;
  let webhookService: WebhookService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WebhookController],
      providers: [
        {
          provide: WebhookService,
          useValue: {
            validateWebhook: jest.fn(),
            handleWebhookEvent: jest.fn(),
            createSubscription: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: { get: jest.fn() },
        },
        {
          provide: ActivityService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<WebhookController>(WebhookController);
    webhookService = module.get<WebhookService>(WebhookService);
  });

  it('should validate webhook', () => {
    const query = {
      'hub.mode': 'subscribe',
      'hub.verify_token': 'STRAVA',
      'hub.challenge': 'test_challenge',
    };
    (webhookService.validateWebhook as jest.Mock).mockReturnValue({
      'hub.challenge': 'test_challenge',
    });

    expect(controller.validate(query)).toEqual({
      'hub.challenge': 'test_challenge',
    });
  });
});
