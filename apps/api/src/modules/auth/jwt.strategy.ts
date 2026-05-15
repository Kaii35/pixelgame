import { readFileSync } from 'node:fs';

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, type StrategyOptions } from 'passport-jwt';

import { loadApiEnv } from '../../config/env.validation';

export interface JwtPrincipal {
  id: string;
  username: string;
}

interface JwtTokenPayload {
  sub: string;
  username: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    const env = loadApiEnv();
    const publicKey = readFileSync(env.JWT_PUBLIC_KEY_PATH, 'utf8');

    const options: StrategyOptions = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: publicKey,
      algorithms: ['RS256'],
      issuer: env.JWT_ISSUER,
      audience: env.JWT_AUDIENCE,
      ignoreExpiration: false,
    };

    super(options);
  }

  validate(payload: JwtTokenPayload): JwtPrincipal {
    return { id: payload.sub, username: payload.username };
  }
}
