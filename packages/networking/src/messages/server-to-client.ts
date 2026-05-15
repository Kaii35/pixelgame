/** Server → Client messages. These are sent in addition to schema state sync. */

export interface ChatBroadcast {
  id: string;
  authorId: string;
  authorName: string;
  body: string;
  sentAt: number;
}

export interface SystemNotice {
  level: 'info' | 'warn' | 'error';
  body: string;
}

export interface ServerError {
  code: string;
  message: string;
}

export interface Pong {
  clientTime: number;
  serverTime: number;
}
