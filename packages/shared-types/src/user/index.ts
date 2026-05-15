import { z } from 'zod';

export const UserIdSchema = z.string().uuid();
export type UserId = z.infer<typeof UserIdSchema>;

export interface PublicUser {
  id: UserId;
  username: string;
  avatarId: string | null;
  createdAt: string;
}

export interface PrivateUser extends PublicUser {
  email: string;
}

export const AvatarLookSchema = z.object({
  bodyColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  shirtColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  pantsColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
});
export type AvatarLook = z.infer<typeof AvatarLookSchema>;

export interface AvatarSnapshot {
  id: string;
  ownerId: UserId;
  look: AvatarLook;
  updatedAt: string;
}
