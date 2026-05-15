import Redis from 'ioredis';

import { env } from '../config/env';

export const redis = new Redis(env.REDIS_URL, {
  lazyConnect: true,
  maxRetriesPerRequest: 3,
});

export const presenceKey = (userId: string): string => `presence:user:${userId}`;
export const roomOccupantsKey = (roomId: string): string => `room:${roomId}:occupants`;
