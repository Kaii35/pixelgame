import { ConflictException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as argon2 from 'argon2';

import { toPublicUser } from '../users/lib/user-mappers';
import { UsersService } from '../users/users.service';

import { RefreshTokenRepository } from './refresh-token.repository';
import { TokensService } from './tokens.service';

import type { LoginRequest, PublicUser, RegisterRequest } from '@pixelgame/shared-types';
import type { User } from '@prisma/client';

const ARGON2_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
} as const;

export interface AuthSuccess {
  user: PublicUser;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RefreshSuccess {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly users: UsersService,
    private readonly tokens: TokensService,
    private readonly refreshRepo: RefreshTokenRepository,
  ) {}

  async register(input: RegisterRequest): Promise<AuthSuccess> {
    const passwordHash = await argon2.hash(input.password, ARGON2_OPTIONS);
    let user: User;
    try {
      user = await this.users.create({
        email: input.email,
        username: input.username,
        passwordHash,
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new ConflictException('Email or username already in use');
      }
      throw err;
    }

    this.logger.log(`user registered id=${user.id}`);
    return this.issueTokens(user);
  }

  async login(input: LoginRequest): Promise<AuthSuccess> {
    const user = await this.users.findByEmail(input.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (user.bannedAt !== null) {
      throw new UnauthorizedException('Invalid credentials');
    }

    let ok = false;
    try {
      ok = await argon2.verify(user.passwordHash, input.password);
    } catch {
      this.logger.warn(`argon2.verify threw for user=${user.id}`);
      ok = false;
    }
    if (!ok) {
      throw new UnauthorizedException('Invalid credentials');
    }

    this.logger.log(`user login id=${user.id}`);
    return this.issueTokens(user);
  }

  async refresh(rawToken: string): Promise<RefreshSuccess> {
    const { userId, familyId } = await this.refreshRepo.rotate(rawToken);

    const user = await this.users.findById(userId);
    if (!user || user.bannedAt !== null) {
      throw new UnauthorizedException('Invalid token');
    }

    const access = await this.tokens.mintAccessToken(user);
    const next = this.tokens.mintRefreshToken(familyId);
    await this.refreshRepo.persist(user.id, next.hash, next.familyId, next.expiresAt);

    this.logger.log(`refresh rotated user=${user.id}`);
    return {
      accessToken: access.accessToken,
      refreshToken: next.token,
      expiresIn: access.expiresIn,
    };
  }

  async logout(userId: string): Promise<void> {
    await this.refreshRepo.revokeAllByUser(userId);
    this.logger.log(`user logout id=${userId}`);
  }

  private async issueTokens(user: User): Promise<AuthSuccess> {
    const access = await this.tokens.mintAccessToken(user);
    const refresh = this.tokens.mintRefreshToken();
    await this.refreshRepo.persist(user.id, refresh.hash, refresh.familyId, refresh.expiresAt);
    return {
      user: toPublicUser(user),
      accessToken: access.accessToken,
      refreshToken: refresh.token,
      expiresIn: access.expiresIn,
    };
  }
}
