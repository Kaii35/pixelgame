import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';

import type { TokensService } from './tokens.service';
import type { PrismaService } from '../../database/prisma.service';


export interface RotationResult {
  userId: string;
  familyId: string;
}

@Injectable()
export class RefreshTokenRepository {
  private readonly logger = new Logger(RefreshTokenRepository.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly tokens: TokensService,
  ) {}

  async persist(userId: string, hash: string, familyId: string, expiresAt: Date): Promise<void> {
    await this.prisma.refreshToken.create({
      data: { userId, tokenHash: hash, familyId, expiresAt },
    });
  }

  /**
   * Rotate a refresh token: validate, revoke the presented one, and prepare
   * the caller to mint and persist a new token in the same family.
   * On reuse detection (token already revoked), the entire family is revoked.
   */
  async rotate(rawToken: string): Promise<RotationResult> {
    const tokenHash = this.tokens.hashRefreshToken(rawToken);
    const record = await this.prisma.refreshToken.findUnique({ where: { tokenHash } });

    if (!record) {
      throw new UnauthorizedException('Invalid token');
    }

    if (record.revokedAt !== null) {
      this.logger.warn(`refresh token reuse detected for family=${record.familyId}`);
      await this.revokeFamily(record.familyId);
      throw new UnauthorizedException('Invalid token');
    }

    if (record.expiresAt.getTime() <= Date.now()) {
      throw new UnauthorizedException('Invalid token');
    }

    await this.prisma.refreshToken.update({
      where: { id: record.id },
      data: { revokedAt: new Date() },
    });

    return { userId: record.userId, familyId: record.familyId };
  }

  async revokeFamily(familyId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { familyId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async revokeAllByUser(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
}
