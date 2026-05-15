import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';

import { AppModule } from './app.module';
import { loadApiEnv } from './config/env.validation';

async function bootstrap(): Promise<void> {
  const env = loadApiEnv();
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.use(helmet());
  app.enableCors({
    origin: env.API_CORS_ORIGIN.split(','),
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );
  app.setGlobalPrefix('api/v1');

  await app.listen(env.API_PORT, env.API_HOST);
  // eslint-disable-next-line no-console
  console.warn(`[api] listening on http://${env.API_HOST}:${env.API_PORT}/api/v1`);
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('[api] failed to bootstrap', err);
  process.exit(1);
});
