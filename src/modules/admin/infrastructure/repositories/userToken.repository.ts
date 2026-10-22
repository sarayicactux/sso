import { Injectable } from '@nestjs/common';

import { UserToken } from '../../domain/entities/adminToken.entity';
import { UserTokenRepositoryImpl } from '../../domain/repositories/adminToken.repository';
import { PrismaService } from '../../../../prisma/prisma.service';
import { CreateUserTokenInterface } from '../../domain/interfaces/admin_token/CreateAdminToken.interface';

@Injectable()
export class UserTokenRepository implements UserTokenRepositoryImpl {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateUserTokenInterface): Promise<UserToken> {
    const newToken = await this.prisma.userToken.create({
      data,
    });
    return newToken as UserToken;
  }

  async delete(access_token: string): Promise<boolean> {
    await this.prisma.forceDelete('userToken', { access_token });
    return true;
  }
}
