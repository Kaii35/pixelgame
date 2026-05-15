import { z } from 'zod';

export const MoveIntentSchema = z.object({
  to: z.object({
    x: z.number().int().min(0).max(255),
    y: z.number().int().min(0).max(255),
  }),
  clientTime: z.number().int().nonnegative(),
});
export type MoveIntent = z.infer<typeof MoveIntentSchema>;

export const ChatSendSchema = z.object({
  body: z.string().min(1).max(280),
});
export type ChatSend = z.infer<typeof ChatSendSchema>;

export const InteractSchema = z.object({
  targetId: z.string().min(1),
  action: z.enum(['use', 'sit', 'wave']),
});
export type Interact = z.infer<typeof InteractSchema>;

export const ChangeEmoteSchema = z.object({
  emote: z.enum(['idle', 'wave', 'dance', 'sit']),
});
export type ChangeEmote = z.infer<typeof ChangeEmoteSchema>;

export const PlaceFurnitureSchema = z.object({
  kind: z.string().min(1).max(40),
  tile: z.object({
    x: z.number().int().min(0).max(255),
    y: z.number().int().min(0).max(255),
  }),
});
export type PlaceFurniture = z.infer<typeof PlaceFurnitureSchema>;

export const RemoveFurnitureSchema = z.object({
  furnitureId: z.string().min(1).max(64),
});
export type RemoveFurniture = z.infer<typeof RemoveFurnitureSchema>;

export const PingSchema = z.object({
  clientTime: z.number().int().nonnegative(),
});
export type Ping = z.infer<typeof PingSchema>;
