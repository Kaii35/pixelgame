/**
 * Wire protocol constants shared by client and server.
 * Increment PROTOCOL_VERSION on any breaking change to message shapes.
 */
export const PROTOCOL_VERSION = 2;

export const ROOM_NAMES = {
  LOBBY: 'lobby',
  WORLD: 'world',
} as const;
export type RoomName = (typeof ROOM_NAMES)[keyof typeof ROOM_NAMES];

export const CLIENT_MESSAGE = {
  MOVE_INTENT: 'move_intent',
  CHAT_SEND: 'chat_send',
  INTERACT: 'interact',
  CHANGE_EMOTE: 'change_emote',
  PLACE_FURNITURE: 'place_furniture',
  REMOVE_FURNITURE: 'remove_furniture',
  PING: 'ping',
} as const;
export type ClientMessageType = (typeof CLIENT_MESSAGE)[keyof typeof CLIENT_MESSAGE];

export const SERVER_MESSAGE = {
  CHAT_BROADCAST: 'chat_broadcast',
  SYSTEM_NOTICE: 'system_notice',
  ERROR: 'error',
  PONG: 'pong',
} as const;
export type ServerMessageType = (typeof SERVER_MESSAGE)[keyof typeof SERVER_MESSAGE];
