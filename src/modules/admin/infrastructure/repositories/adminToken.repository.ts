import { Injectable } from '@nestjs/common';

import { AdminToken } from '../../domain/entities/adminToken.entity';
import { AdminTokenRepositoryImpl } from '../../domain/repositories/adminToken.repository';
import { PrismaService } from '../../../../prisma/prisma.service';
import { CreateAdminTokenInterface } from '../../domain/interfaces/admin_token/CreateAdminToken.interface';

@Injectable()
export class AdminTokenRepository implements AdminTokenRepositoryImpl {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateAdminTokenInterface): Promise<AdminToken> {
    const newToken = await this.prisma.adminToken.create({
      data,
    });
    return newToken as AdminToken;
  }

  async delete(access_token: string): Promise<boolean> {
    await this.prisma.forceDelete('adminToken', { access_token });
    return true;
  }
}
