import { z } from 'zod';

export const ChatMessageSchema = z.object({
  body: z.string().min(1).max(280),
});
export type ChatMessageInput = z.infer<typeof ChatMessageSchema>;

export interface ChatMessage {
  id: string;
  authorId: string;
  authorName: string;
  body: string;
  sentAt: number;
}
