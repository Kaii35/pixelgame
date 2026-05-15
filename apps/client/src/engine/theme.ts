/**
 * Canonical visual theme for the Phaser layer. Every color & dimension used
 * by the engine flows from here so the room, avatars, and effects stay
 * coherent. UI (React/Tailwind) consumes the same logical tokens via
 * `tailwind.config.cjs`.
 *
 * Mood: "Neon Botanic" — cozy futuristic, dusk lighting, soft neon accents.
 */

const hex = (h: string): number => Number.parseInt(h.replace('#', ''), 16);

export const PALETTE = {
  void: hex('#0a0f1e'),
  ink: hex('#0f1729'),
  plum: hex('#1e1733'),

  slate: hex('#2f3a52'),
  slateLit: hex('#3d4a66'),
  plate: hex('#5b6a8c'),
  plateGlow: hex('#7587a8'),

  sun: hex('#ffb86b'),
  amberGlow: hex('#f5a25b'),
  cream: hex('#ffeacc'),

  cyan: hex('#7fdfff'),
  magenta: hex('#ff7fbf'),
  moss: hex('#4a8b6f'),
} as const;

export const HEX = {
  void: '#0a0f1e',
  ink: '#0f1729',
  plum: '#1e1733',
  slate: '#2f3a52',
  slateLit: '#3d4a66',
  plate: '#5b6a8c',
  plateGlow: '#7587a8',
  sun: '#ffb86b',
  amberGlow: '#f5a25b',
  cream: '#ffeacc',
  cyan: '#7fdfff',
  magenta: '#ff7fbf',
  moss: '#4a8b6f',
} as const;

/** Avatar geometry — in pixels, before iso projection. */
export const AVATAR = {
  bodyW: 24,
  bodyH: 32,
  headR: 9,
  headOffsetY: -36,
  bodyOffsetY: -16,
  shadowW: 28,
  shadowH: 8,
  haloW: 56,
  haloH: 32,
  labelOffsetY: -56,
} as const;

/** Camera and follow tuning. */
export const CAMERA = {
  followLerp: 0.12,
  zoom: 1,
} as const;

/**
 * Sun position in WORLD-LOCAL tile coordinates (relative to top-left of the
 * tile grid). Drives the baked light on floor tiles and the radial overlay.
 */
export const SUN = {
  /** Tile coords for falloff baking. */
  tile: { x: -2, y: -2 },
  /** Radial light overlay alpha. */
  overlayAlpha: 0.16,
  /** Falloff distance (in tiles) past which a tile is fully Slate. */
  falloffTiles: 12,
} as const;

/** Ambient multiply overlay color and alpha. */
export const AMBIENT = {
  color: hex('#1a2240'),
  alpha: 0.35,
} as const;

/** Vignette tuning. */
export const VIGNETTE = {
  color: hex('#05070f'),
  alphaCenter: 0,
  alphaEdge: 0.55,
} as const;

/** Click target ring tuning. */
export const CLICK_RING = {
  color: PALETTE.cyan,
  startRadius: 4,
  endRadius: 22,
  durationMs: 420,
} as const;
