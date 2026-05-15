/**
 * Furniture catalog — shared between client (rendering) and server
 * (validation). Items are 1×1 tile and use programmatic visuals defined by
 * `kind`. No assets shipped here.
 */

export type CatalogCategory = 'plant' | 'light' | 'seating' | 'surface' | 'rug' | 'storage';

export interface CatalogItem {
  /** Stable id used on the wire (PLACE_FURNITURE.kind). */
  kind: string;
  /** Human-facing label. */
  name: string;
  category: CatalogCategory;
  /** Hint glyph for UI (single character). */
  glyph: string;
}

export const CATALOG: readonly CatalogItem[] = [
  { kind: 'plant_fern', name: 'Helecho', category: 'plant', glyph: '✿' },
  { kind: 'lamp_floor', name: 'Lámpara', category: 'light', glyph: '✦' },
  { kind: 'sofa_soft', name: 'Sofá', category: 'seating', glyph: '╬' },
  { kind: 'table_round', name: 'Mesa', category: 'surface', glyph: '◯' },
  { kind: 'rug_woven', name: 'Alfombra', category: 'rug', glyph: '▦' },
  { kind: 'bookshelf', name: 'Librero', category: 'storage', glyph: '▤' },
] as const;

const CATALOG_BY_KIND = new Map(CATALOG.map((item) => [item.kind, item] as const));

export const getCatalogItem = (kind: string): CatalogItem | undefined => CATALOG_BY_KIND.get(kind);

export const isKnownKind = (kind: string): boolean => CATALOG_BY_KIND.has(kind);
