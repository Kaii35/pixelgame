import { createHash, randomBytes, randomUUID } from 'node:crypto';

import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';


import { loadApiEnv } from '../../config/env.validation';

import { parseTtlSeconds } from './lib/parse-ttl';

import type { User } from '@prisma/client';

export interface MintedAccessToken {
  accessToken: string;
  expiresIn: number;
}

export interface MintedRefreshToken {
  token: string;
  hash: string;
  familyId: string;
  expiresAt: Date;
}

@Injectable()
export class TokensService {
  private readonly accessTtlSeconds: number;
  private readonly refreshTtlSeconds: number;
  private readonly issuer: string;
  private readonly audience: string;

  constructor(private readonly jwt: JwtService) {
    const env = loadApiEnv();
    this.accessTtlSeconds = parseTtlSeconds(env.JWT_ACCESS_TTL);
    this.refreshTtlSeconds = parseTtlSeconds(env.JWT_REFRESH_TTL);
    this.issuer = env.JWT_ISSUER;
    this.audience = env.JWT_AUDIENCE;
  }

  async mintAccessToken(user: Pick<User, 'id' | 'username'>): Promise<MintedAccessToken> {
    const accessToken = await this.jwt.signAsync(
      { username: user.username },
      {
        subject: user.id,
        issuer: this.issuer,
        audience: this.audience,
        expiresIn: this.accessTtlSeconds,
        algorithm: 'RS256',
      },
    );
    return { accessToken, expiresIn: this.accessTtlSeconds };
  }

  mintRefreshToken(familyId?: string): MintedRefreshToken {
    const token = randomBytes(32).toString('hex');
    const hash = this.hashRefreshToken(token);
    const expiresAt = new Date(Date.now() + this.refreshTtlSeconds * 1000);
    return {
      token,
      hash,
      familyId: familyId ?? randomUUID(),
      expiresAt,
    };
  }

  hashRefreshToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  get accessTokenTtlSeconds(): number {
    return this.accessTtlSeconds;
  }
}
