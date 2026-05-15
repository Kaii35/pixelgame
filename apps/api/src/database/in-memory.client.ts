import { randomUUID } from 'node:crypto';

import { Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import { Prisma, type Avatar, type RefreshToken, type Room, type User } from '@prisma/client';

/**
 * Drop-in replacement for `PrismaService` that holds all rows in memory.
 *
 * Used when `PIXEL_DB=memory` (default in dev). Lets the API run register/
 * login/refresh/logout and rooms list with zero infrastructure.
 *
 * Data lifetime: a single process. Server restart → empty DB.
 *
 * The shim mimics the subset of Prisma's query surface that our code uses;
 * anything else throws. TypeScript-wise, the DI provider casts this to
 * `PrismaService` — services only call the supported methods at runtime,
 * so the cast is safe in practice.
 */
@Injectable()
export class InMemoryDatabaseClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(InMemoryDatabaseClient.name);

  private readonly users = new Map<string, User>();
  private readonly avatars = new Map<string, Avatar>();
  private readonly refreshTokens = new Map<string, RefreshToken>();
  private readonly rooms = new Map<string, Room>();

  onModuleInit(): void {
    this.logger.log(
      'in-memory DB engaged (PIXEL_DB=memory) — data will not persist across restarts',
    );
  }
  onModuleDestroy(): void {}

  // ── user ──────────────────────────────────────────────────────────────
  readonly user = {
    create: async (args: {
      data: { email: string; username: string; passwordHash: string };
    }): Promise<User> => {
      const email = args.data.email.toLowerCase();
      const username = args.data.username;
      const conflict = this.findUserConflict(email, username);
      if (conflict) {
        throw this.uniqueViolation(conflict);
      }
      const now = new Date();
      const u: User = {
        id: randomUUID(),
        email,
        username,
        passwordHash: args.data.passwordHash,
        createdAt: now,
        updatedAt: now,
        bannedAt: null,
      };
      this.users.set(u.id, u);
      return u;
    },

    findUnique: async (args: {
      where: { id?: string; email?: string };
      include?: { avatar?: boolean };
    }): Promise<(User & { avatar?: Avatar | null }) | null> => {
      let found: User | null = null;
      if (args.where.id) {
        found = this.users.get(args.where.id) ?? null;
      } else if (args.where.email) {
        const needle = args.where.email.toLowerCase();
        for (const u of this.users.values()) {
          if (u.email === needle) {
            found = u;
            break;
          }
        }
      }
      if (!found) return null;
      if (args.include?.avatar) {
        const avatar = this.findAvatarByOwner(found.id);
        return { ...found, avatar };
      }
      return found;
    },
  };

  // ── refreshToken ──────────────────────────────────────────────────────
  readonly refreshToken = {
    create: async (args: {
      data: { userId: string; tokenHash: string; familyId: string; expiresAt: Date };
    }): Promise<RefreshToken> => {
      const now = new Date();
      const t: RefreshToken = {
        id: randomUUID(),
        userId: args.data.userId,
        tokenHash: args.data.tokenHash,
        familyId: args.data.familyId,
        expiresAt: args.data.expiresAt,
        revokedAt: null,
        createdAt: now,
      };
      this.refreshTokens.set(t.id, t);
      return t;
    },

    findUnique: async (args: { where: { tokenHash: string } }): Promise<RefreshToken | null> => {
      for (const t of this.refreshTokens.values()) {
        if (t.tokenHash === args.where.tokenHash) return t;
      }
      return null;
    },

    update: async (args: {
      where: { id: string };
      data: { revokedAt?: Date | null };
    }): Promise<RefreshToken> => {
      const t = this.refreshTokens.get(args.where.id);
      if (!t) throw new Error('refresh token not found');
      if ('revokedAt' in args.data) t.revokedAt = args.data.revokedAt ?? null;
      this.refreshTokens.set(t.id, t);
      return t;
    },

    updateMany: async (args: {
      where: { familyId?: string; userId?: string; revokedAt?: null };
      data: { revokedAt: Date };
    }): Promise<{ count: number }> => {
      let count = 0;
      for (const t of this.refreshTokens.values()) {
        if (args.where.familyId && t.familyId !== args.where.familyId) continue;
        if (args.where.userId && t.userId !== args.where.userId) continue;
        if (args.where.revokedAt === null && t.revokedAt !== null) continue;
        t.revokedAt = args.data.revokedAt;
        count++;
      }
      return { count };
    },
  };

  // ── room ──────────────────────────────────────────────────────────────
  readonly room = {
    findMany: async (_args?: { orderBy?: { createdAt?: 'asc' | 'desc' } }): Promise<Room[]> => {
      return [...this.rooms.values()].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    },

    count: async (): Promise<number> => this.rooms.size,

    create: async (args: {
      data: {
        name: string;
        capacity?: number;
        ownerId?: string | null;
        layout: Prisma.InputJsonValue;
      };
    }): Promise<Room> => {
      const now = new Date();
      const r: Room = {
        id: randomUUID(),
        name: args.data.name,
        ownerId: args.data.ownerId ?? null,
        capacity: args.data.capacity ?? 20,
        layout: args.data.layout as Prisma.JsonValue,
        createdAt: now,
        updatedAt: now,
      };
      this.rooms.set(r.id, r);
      return r;
    },
  };

  // Lifecycle stubs — match PrismaClient surface that NestJS or test code may call.
  async $connect(): Promise<void> {}
  async $disconnect(): Promise<void> {}

  // ── helpers ───────────────────────────────────────────────────────────
  private findUserConflict(email: string, username: string): 'email' | 'username' | null {
    for (const u of this.users.values()) {
      if (u.email === email) return 'email';
      if (u.username === username) return 'username';
    }
    return null;
  }

  private findAvatarByOwner(ownerId: string): Avatar | null {
    for (const a of this.avatars.values()) {
      if (a.ownerId === ownerId) return a;
    }
    return null;
  }

  /**
   * Construct a Prisma-shape unique-violation error so AuthService's existing
   * catch (which checks `err instanceof Prisma.PrismaClientKnownRequestError`
   * with code `P2002`) keeps working unchanged.
   */
  private uniqueViolation(target: 'email' | 'username'): Prisma.PrismaClientKnownRequestError {
    return new Prisma.PrismaClientKnownRequestError(
      `Unique constraint failed on the fields: (\`${target}\`)`,
      { code: 'P2002', clientVersion: 'in-memory', meta: { target: [target] } },
    );
  }
}
