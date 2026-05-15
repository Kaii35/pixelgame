import { Injectable } from '@nestjs/common';


import { PrismaService } from '../../database/prisma.service';

import type { UserWithAvatar } from './lib/user-mappers';
import type { User } from '@prisma/client';

export interface CreateUserInput {
  email: string;
  username: string;
  passwordHash: string;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  create(input: CreateUserInput): Promise<User> {
    return this.prisma.user.create({
      data: {
        email: input.email.toLowerCase(),
        username: input.username,
        passwordHash: input.passwordHash,
      },
    });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  }

  findById(id: string): Promise<UserWithAvatar | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: { avatar: true },
    });
  }
}
