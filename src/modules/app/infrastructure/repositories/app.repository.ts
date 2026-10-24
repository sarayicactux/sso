import { Injectable } from '@nestjs/common';

import { Admin } from '../../domain/entities/admin.entity';
import { AdminRepositoryImpl } from '../../domain/repositories/admin.repository';
import { PrismaService } from '../../../../prisma/prisma.service';
import { CreateAdminInterface } from '../../domain/interfaces/admin/CreateAdmin.interface';

@Injectable()
export class AdminRepository implements AdminRepositoryImpl {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateAdminInterface): Promise<Admin> {
    const admin = await this.prisma.admin.create({ data });
    return admin as Admin;
  }

  async findById(id: number): Promise<Admin | null> {
    const admin = await this.prisma.findByUnique('admin', {
      where: { id },
      include: {
        AdminTokens: true,
      },
    });
    return admin as Admin | null;
  }

  async findByMobile(mobile: string): Promise<Admin | null> {
    const admin = await this.prisma.findByUnique('admin', {
      where: { mobile },
      include: {
        AdminTokens: true,
      },
    });
    return admin as Admin | null;
  }

  async findByUsername(username: string): Promise<Admin | null> {
    const admin = await this.prisma.findByUnique('admin', {
      where: { username },
    });
    return admin as Admin | null;
  }

  async findByEmail(email: string): Promise<Admin | null> {
    const admin = await this.prisma.findByUnique('admin', { where: { email } });
    return admin as Admin | null;
  }

  async findAll(page: number, limit: number): Promise<Admin[]> {
    const admins = await this.prisma.findAll('admin', {
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [
        {
          id: 'desc',
        },
      ],
    });
    return admins as Admin[];
  }

  async allIncludingDeleted(): Promise<Admin[]> {
    const admins = await this.prisma.findAll('admin', {
      where: { deletedAt: { not: null } },
      orderBy: [
        {
          id: 'desc',
        },
      ],
    });
    return admins as Admin[];
  }

  async updatePassword(password: string, id: number): Promise<boolean> {
    await this.prisma.admin.update({
      where: { id },
      data: { password },
    });
    return true;
  }
}
