import { room as roomCore } from '@pixelgame/game-core';

import type { RoomLayout } from '@pixelgame/shared-types';

/**
 * Default room layout used until Postgres-backed rooms are wired in.
 * 12x12 walkable floor with spawn at the centre.
 */
export const defaultLayout = (): RoomLayout => roomCore.buildEmptyLayout(12, 12);
