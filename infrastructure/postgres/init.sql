-- Postgres bootstrap for Pixelgame.
-- Prisma owns the schema; this file only enables extensions Prisma cannot.
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
