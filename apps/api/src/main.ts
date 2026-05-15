import 'dotenv/config';

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

import { AppModule } from './app.module';
import { runSeed } from './bootstrap/seed';
import { loadApiEnv } from './config/env.validation';
import { PrismaService } from './database/prisma.service';

async function bootstrap(): Promise<void> {
  const env = loadApiEnv();
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const logger = new Logger('Bootstrap');

  app.use(helmet());
  app.use(cookieParser());
  app.enableCors({
    origin: env.API_CORS_ORIGIN.split(','),
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );
  app.setGlobalPrefix('api/v1');

  await app.listen(env.API_PORT, env.API_HOST);
  logger.log(`listening on http://${env.API_HOST}:${env.API_PORT}/api/v1`);

  try {
    const prisma = app.get(PrismaService);
    await runSeed(prisma);
  } catch (err) {
    logger.error('seed failed', err instanceof Error ? err.stack : String(err));
  }
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('[api] failed to bootstrap', err);
  process.exit(1);
});
