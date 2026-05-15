import { Module } from '@nestjs/common';

/**
 * AuthModule — register, login, refresh, logout.
 * Fase 1: implementar AuthService + AuthController.
 * Estrategia: argon2 password hash, JWT RS256, rotating refresh tokens stored hashed.
 */
@Module({})
export class AuthModule {}
