import { Module } from '@nestjs/common';

/**
 * PresenceModule — exposes online presence stored in Redis by game-server.
 * API is read-only here; the game-server is the writer.
 * Fase 2+.
 */
@Module({})
export class PresenceModule {}
