import { apiFetch } from './client';

import type {
  AuthTokens,
  LoginRequest,
  PrivateUser,
  PublicUser,
  RegisterRequest,
} from '@pixelgame/shared-types';


export interface AuthResponse {
  user: PublicUser;
  accessToken: AuthTokens['accessToken'];
  expiresIn: AuthTokens['expiresIn'];
}

export interface RefreshResponse {
  accessToken: AuthTokens['accessToken'];
  expiresIn: AuthTokens['expiresIn'];
}

export const register = (body: RegisterRequest): Promise<AuthResponse> =>
  apiFetch<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(body),
  });

export const login = (body: LoginRequest): Promise<AuthResponse> =>
  apiFetch<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(body),
  });

export const refresh = (): Promise<RefreshResponse> =>
  apiFetch<RefreshResponse>('/auth/refresh', {
    method: 'POST',
  });

export const logout = (accessToken: string): Promise<void> =>
  apiFetch<void>('/auth/logout', {
    method: 'POST',
    accessToken,
  });

export const fetchMe = (accessToken: string): Promise<PrivateUser> =>
  apiFetch<PrivateUser>('/users/me', {
    method: 'GET',
    accessToken,
  });
