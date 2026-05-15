import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  LoginRequestSchema,
  RegisterRequestSchema,
  type LoginRequest,
  type PublicUser,
  type RegisterRequest,
} from '@pixelgame/shared-types';

import { loadApiEnv } from '../../config/env.validation';

import { ZodValidationPipe } from './dto/zod-validation.pipe';
import { JwtAuthGuard } from './jwt-auth.guard';
import {
  REFRESH_COOKIE_NAME,
  clearRefreshCookie,
  setRefreshCookie,
  type CookieEnv,
} from './lib/cookies';

import type { AuthService } from './auth.service';
import type { Request, Response } from 'express';

interface AuthResponseBody {
  user: PublicUser;
  accessToken: string;
  expiresIn: number;
}

interface RefreshResponseBody {
  accessToken: string;
  expiresIn: number;
}

interface AuthenticatedRequest extends Request {
  user?: { id: string; username: string };
}

@Controller('auth')
export class AuthController {
  private readonly cookieEnv: CookieEnv;

  constructor(private readonly auth: AuthService) {
    const env = loadApiEnv();
    this.cookieEnv = { nodeEnv: env.NODE_ENV, refreshTtl: env.JWT_REFRESH_TTL };
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body(new ZodValidationPipe(RegisterRequestSchema)) body: RegisterRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseBody> {
    const result = await this.auth.register(body);
    setRefreshCookie(res, result.refreshToken, this.cookieEnv);
    return {
      user: result.user,
      accessToken: result.accessToken,
      expiresIn: result.expiresIn,
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body(new ZodValidationPipe(LoginRequestSchema)) body: LoginRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseBody> {
    const result = await this.auth.login(body);
    setRefreshCookie(res, result.refreshToken, this.cookieEnv);
    return {
      user: result.user,
      accessToken: result.accessToken,
      expiresIn: result.expiresIn,
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<RefreshResponseBody> {
    const cookies = (req as Request & { cookies?: Record<string, string | undefined> }).cookies;
    const token = cookies?.[REFRESH_COOKIE_NAME];
    if (!token) {
      throw new BadRequestException('Missing refresh token');
    }
    const result = await this.auth.refresh(token);
    setRefreshCookie(res, result.refreshToken, this.cookieEnv);
    return {
      accessToken: result.accessToken,
      expiresIn: result.expiresIn,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @Req() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    if (req.user) {
      await this.auth.logout(req.user.id);
    }
    clearRefreshCookie(res, this.cookieEnv);
  }
}
