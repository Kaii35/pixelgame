#!/usr/bin/env node
/**
 * Generates an RS256 keypair into ./keys/jwt-private.pem and ./keys/jwt-public.pem.
 * Idempotent: refuses to overwrite by default.
 * Usage: node scripts/gen-jwt-keys.mjs [--force]
 */
import { generateKeyPairSync } from 'node:crypto';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const KEYS_DIR = join(ROOT, 'keys');
const PRIVATE_PATH = join(KEYS_DIR, 'jwt-private.pem');
const PUBLIC_PATH = join(KEYS_DIR, 'jwt-public.pem');

const force = process.argv.includes('--force');

if (!existsSync(KEYS_DIR)) mkdirSync(KEYS_DIR, { recursive: true });

if (existsSync(PRIVATE_PATH) && !force) {
  console.error(`Refusing to overwrite ${PRIVATE_PATH}. Pass --force to regenerate.`);
  process.exit(1);
}

const { privateKey, publicKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  publicKeyEncoding: { type: 'spki', format: 'pem' },
});

writeFileSync(PRIVATE_PATH, privateKey, { mode: 0o600 });
writeFileSync(PUBLIC_PATH, publicKey, { mode: 0o644 });

console.log(`Wrote ${PRIVATE_PATH}`);
console.log(`Wrote ${PUBLIC_PATH}`);
console.log('Add to .env: JWT_PRIVATE_KEY_PATH=./keys/jwt-private.pem');
console.log('             JWT_PUBLIC_KEY_PATH=./keys/jwt-public.pem');
