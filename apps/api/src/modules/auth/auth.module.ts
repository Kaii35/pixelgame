import { readFileSync } from 'node:fs';

import { Module, type DynamicModule } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { loadApiEnv } from '../../config/env.validation';
import { UsersModule } from '../users/users.module';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtStrategy } from './jwt.strategy';
import { parseTtlSeconds } from './lib/parse-ttl';
import { RefreshTokenRepository } from './refresh-token.repository';
import { TokensService } from './tokens.service';

const buildJwtModule = (): DynamicModule => {
  const env = loadApiEnv();
  const privateKey = readFileSync(env.JWT_PRIVATE_KEY_PATH, 'utf8');
  const publicKey = readFileSync(env.JWT_PUBLIC_KEY_PATH, 'utf8');
  return JwtModule.register({
    privateKey,
    publicKey,
    signOptions: {
      algorithm: 'RS256',
      issuer: env.JWT_ISSUER,
      audience: env.JWT_AUDIENCE,
      expiresIn: parseTtlSeconds(env.JWT_ACCESS_TTL),
    },
    verifyOptions: {
      algorithms: ['RS256'],
      issuer: env.JWT_ISSUER,
      audience: env.JWT_AUDIENCE,
    },
  });
};

/**
 * AuthModule — register, login, refresh, logout.
 * argon2id password hash, JWT RS256, rotating refresh tokens stored hashed.
 */
@Module({
  imports: [PassportModule, buildJwtModule(), UsersModule],
  controllers: [AuthController],
  providers: [AuthService, TokensService, RefreshTokenRepository, JwtStrategy, JwtAuthGuard],
  exports: [JwtAuthGuard],
})
export class AuthModule {}
