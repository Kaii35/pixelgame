import type { PrivateUser, PublicUser } from '@pixelgame/shared-types';
import type { User, Avatar } from '@prisma/client';

export type UserWithAvatar = User & { avatar?: Avatar | null };

export const toPublicUser = (user: UserWithAvatar): PublicUser => ({
  id: user.id,
  username: user.username,
  avatarId: user.avatar?.id ?? null,
  createdAt: user.createdAt.toISOString(),
});

export const toPrivateUser = (user: UserWithAvatar): PrivateUser => ({
  ...toPublicUser(user),
  email: user.email,
});
