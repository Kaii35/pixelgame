import { readFileSync } from 'node:fs';

import { importSPKI, jwtVerify, type JWTPayload } from 'jose';

import { env } from '../config/env';

const publicKeyPem = readFileSync(env.JWT_PUBLIC_KEY_PATH, 'utf8');
const publicKeyPromise = importSPKI(publicKeyPem, 'RS256');

export interface VerifiedToken {
  userId: string;
  username: string;
}

export const verifyAccessToken = async (token: string): Promise<VerifiedToken> => {
  const publicKey = await publicKeyPromise;
  const { payload } = await jwtVerify(token, publicKey, {
    issuer: env.JWT_ISSUER,
    audience: env.JWT_AUDIENCE,
    algorithms: ['RS256'],
  });
  const { sub, username } = payload as JWTPayload & { username?: string };
  if (typeof sub !== 'string' || typeof username !== 'string') {
    throw new Error('invalid_token_payload');
  }
  return { userId: sub, username };
};
