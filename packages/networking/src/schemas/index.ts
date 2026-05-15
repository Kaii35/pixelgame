import { ArraySchema, MapSchema, Schema, type } from '@colyseus/schema';

/** Replicated position on the tile grid. */
export class TileVec extends Schema {
  @type('uint16') x = 0;
  @type('uint16') y = 0;
}

/** Player state replicated to every client in the room. */
export class PlayerState extends Schema {
  @type('string') userId = '';
  @type('string') username = '';
  @type(TileVec) position = new TileVec();
  @type([TileVec]) path = new ArraySchema<TileVec>();
  @type('string') emote = 'idle';
  @type('number') lastUpdate = 0;
}

/**
 * Furniture piece placed in a room. `kind` is a catalog id resolved by both
 * client and server via @pixelgame/game-core/catalog.
 */
export class FurniturePiece extends Schema {
  @type('string') id = '';
  @type('string') kind = '';
  @type(TileVec) tile = new TileVec();
  @type('string') ownerId = '';
  @type('number') placedAt = 0;
}

/** Lightweight chat history kept in room state for late joiners. */
export class ChatEntry extends Schema {
  @type('string') id = '';
  @type('string') authorId = '';
  @type('string') authorName = '';
  @type('string') body = '';
  @type('number') sentAt = 0;
}

/** Authoritative room state, synced via Colyseus binary deltas. */
export class WorldRoomState extends Schema {
  @type('string') roomId = '';
  @type('string') name = '';
  @type({ map: PlayerState }) players = new MapSchema<PlayerState>();
  @type({ map: FurniturePiece }) furniture = new MapSchema<FurniturePiece>();
  @type([ChatEntry]) chatHistory = new ArraySchema<ChatEntry>();
  @type('number') tick = 0;
}

/** Lobby state — much smaller, no per-player movement. */
export class LobbyEntry extends Schema {
  @type('string') roomId = '';
  @type('string') name = '';
  @type('uint16') occupants = 0;
  @type('uint16') capacity = 0;
}

export class LobbyRoomState extends Schema {
  @type([LobbyEntry]) rooms = new ArraySchema<LobbyEntry>();
}
