import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import ms from 'ms';

export const createRefreshToken = (jwtService: JwtService, configService: ConfigService, payload: any) : string => {
    const refresh_token = jwtService.sign(payload, {
        secret: configService.get<string>("JWT_REFRESH_TOKEN_SECRET"),
        expiresIn: ms(configService.get<string>("JWT_REFRESH_EXPIRE")) / 1000,
  });

  return refresh_token;
};
