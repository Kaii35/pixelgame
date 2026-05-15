import type { RoomLayout, TilePosition } from '@pixelgame/shared-types';

import { isWalkable } from '../tile';

interface Node {
  x: number;
  y: number;
  g: number;
  h: number;
  f: number;
  parent?: Node;
}

const heuristic = (a: TilePosition, b: TilePosition): number =>
  Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

const key = (x: number, y: number): string => `${x},${y}`;

const NEIGHBOURS: ReadonlyArray<readonly [number, number]> = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

/**
 * Classic A* on a 4-neighbour grid.
 * Returns the path INCLUDING the goal but EXCLUDING the start.
 * Empty array means no path.
 */
export const findPath = (
  layout: RoomLayout,
  start: TilePosition,
  goal: TilePosition,
): TilePosition[] => {
  if (!isWalkable(layout, goal.x, goal.y)) return [];
  if (start.x === goal.x && start.y === goal.y) return [];

  const open: Node[] = [];
  const closed = new Set<string>();
  const seen = new Map<string, Node>();

  const startNode: Node = { x: start.x, y: start.y, g: 0, h: heuristic(start, goal), f: 0 };
  startNode.f = startNode.g + startNode.h;
  open.push(startNode);
  seen.set(key(start.x, start.y), startNode);

  while (open.length > 0) {
    open.sort((a, b) => a.f - b.f);
    const current = open.shift();
    if (!current) break;
    const cKey = key(current.x, current.y);
    if (closed.has(cKey)) continue;
    closed.add(cKey);

    if (current.x === goal.x && current.y === goal.y) {
      const path: TilePosition[] = [];
      let n: Node | undefined = current;
      while (n && (n.x !== start.x || n.y !== start.y)) {
        path.unshift({ x: n.x, y: n.y });
        n = n.parent;
      }
      return path;
    }

    for (const [dx, dy] of NEIGHBOURS) {
      const nx = current.x + dx;
      const ny = current.y + dy;
      if (!isWalkable(layout, nx, ny)) continue;
      const nKey = key(nx, ny);
      if (closed.has(nKey)) continue;
      const tentativeG = current.g + 1;
      const existing = seen.get(nKey);
      if (!existing || tentativeG < existing.g) {
        const node: Node = {
          x: nx,
          y: ny,
          g: tentativeG,
          h: heuristic({ x: nx, y: ny }, goal),
          f: 0,
          parent: current,
        };
        node.f = node.g + node.h;
        seen.set(nKey, node);
        open.push(node);
      }
    }
  }
  return [];
};
