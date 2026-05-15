/**
 * Parse a short TTL string like "15m", "7d", "30s", "12h" into seconds.
 * Accepts integer values only. Throws if the input is invalid.
 */
export const parseTtlSeconds = (ttl: string): number => {
  const match = /^(\d+)([smhd])$/.exec(ttl.trim());
  if (!match) {
    throw new Error(`Invalid TTL format: "${ttl}" (expected like "15m", "7d")`);
  }
  const value = Number.parseInt(match[1] ?? '', 10);
  const unit = match[2];
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`Invalid TTL value: "${ttl}"`);
  }
  switch (unit) {
    case 's':
      return value;
    case 'm':
      return value * 60;
    case 'h':
      return value * 60 * 60;
    case 'd':
      return value * 60 * 60 * 24;
    default:
      throw new Error(`Invalid TTL unit: "${ttl}"`);
  }
};

export const parseTtlMs = (ttl: string): number => parseTtlSeconds(ttl) * 1000;
