import { Controller, Get, NotFoundException, Req, UseGuards } from '@nestjs/common';


import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { toPrivateUser } from './lib/user-mappers';

import type { UsersService } from './users.service';
import type { PrivateUser } from '@pixelgame/shared-types';
import type { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user?: { id: string; username: string };
}

@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() req: AuthenticatedRequest): Promise<PrivateUser> {
    const principal = req.user;
    if (!principal) {
      throw new NotFoundException('User not found');
    }
    const user = await this.users.findById(principal.id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return toPrivateUser(user);
  }
}
