import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../activity/auth/auth.service';
import { ConfigService } from '../../activity/common/config/config.service';
import { UserRepository } from '../../activity/auth/user.repository';
import axios from 'axios';

jest.mock('axios');

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: UserRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('test') },
        },
        {
          provide: UserRepository,
          useValue: {
            findByStravaAthleteId: jest.fn(),
            findByRefreshToken: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<UserRepository>(UserRepository);
    jest.clearAllMocks();
  });

  describe('getAccessToken', () => {
    it('should exchange code for tokens and save user', async () => {
      const mockResponse = {
        data: {
          access_token: 'token123',
          refresh_token: 'refresh123',
          expires_at: 1234567890,
          athlete: { id: 456 },
        },
      };
      jest.spyOn(axios, 'post').mockResolvedValue(mockResponse);
      jest
        .spyOn(userRepository, 'findByStravaAthleteId')
        .mockResolvedValue(null);
      jest.spyOn(userRepository, 'save').mockResolvedValue({
        id: 1,
        stravaAthleteId: 456,
        accessToken: 'token123',
        refreshToken: 'refresh123',
        tokenExpiresAt: new Date(1234567890 * 1000),
      });

      const result = await service.getAccessToken('auth-code');
      expect(result).toEqual(mockResponse.data);
      expect(axios.post).toHaveBeenCalledWith(
        'https://www.strava.com/oauth/token',
        expect.any(Object),
      );
      expect(userRepository.save).toHaveBeenCalled();
    });
  });

  describe('getStoredAccessToken', () => {
    it('should return access token if valid', async () => {
      const user = {
        id: 1,
        stravaAthleteId: 456,
        accessToken: 'token123',
        refreshToken: 'refresh123',
        tokenExpiresAt: new Date(Date.now() + 10000),
      };
      jest
        .spyOn(userRepository, 'findByStravaAthleteId')
        .mockResolvedValue(user);

      const result = await service.getStoredAccessToken(456);
      expect(result).toBe('token123');
    });

    it('should refresh token if expired', async () => {
      const user = {
        id: 1,
        stravaAthleteId: 456,
        accessToken: 'old-token',
        refreshToken: 'refresh123',
        tokenExpiresAt: new Date(Date.now() - 10000),
      };
      const mockResponse = {
        data: {
          stravaAthleteId: 456,
          access_token: 'new-token',
          refresh_token: 'new-refresh',
          expires_at: 1234567890,
        },
      };
      jest
        .spyOn(userRepository, 'findByStravaAthleteId')
        .mockResolvedValue(user);
      jest.spyOn(axios, 'post').mockResolvedValue(mockResponse);
      jest.spyOn(userRepository, 'save').mockResolvedValue(user);

      const result = await service.getStoredAccessToken(456);
      expect(result).toBe('new-token');
      expect(axios.post).toHaveBeenCalledWith(
        'https://www.strava.com/oauth/token',
        expect.any(Object),
      );
    });
  });
});
