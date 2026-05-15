import { parseTtlMs } from './parse-ttl';

import type { Response } from 'express';


export const REFRESH_COOKIE_NAME = 'refresh_token';
export const REFRESH_COOKIE_PATH = '/api/v1/auth';

export interface CookieEnv {
  nodeEnv: string;
  refreshTtl: string;
}

const baseOptions = (
  env: CookieEnv,
): {
  httpOnly: true;
  sameSite: 'strict' | 'lax';
  secure: boolean;
  path: string;
} => {
  const isProd = env.nodeEnv === 'production';
  return {
    httpOnly: true,
    sameSite: isProd ? 'strict' : 'lax',
    secure: isProd,
    path: REFRESH_COOKIE_PATH,
  };
};

export const setRefreshCookie = (res: Response, token: string, env: CookieEnv): void => {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    ...baseOptions(env),
    maxAge: parseTtlMs(env.refreshTtl),
  });
};

export const clearRefreshCookie = (res: Response, env: CookieEnv): void => {
  res.clearCookie(REFRESH_COOKIE_NAME, baseOptions(env));
};
