import { Injectable } from '@nestjs/common';

import { Permission } from '../../domain/entities/permission.entity';
import { PermissionRepositoryImpl } from '../../domain/repositories/permission.repository';
import { PrismaService } from '../../../../prisma/prisma.service';
import { CreatePermissionDto } from '../../presentation/dtos/permission.dto';

@Injectable()
export class PermissionRepository implements PermissionRepositoryImpl {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreatePermissionDto): Promise<Permission> {
    const newPermission = await this.prisma.permission.create({
      data,
    });
    return newPermission as Permission;
  }

  async delete(id: number): Promise<boolean> {
    await this.prisma.forceDelete('permission', { id });
    return true;
  }
  async findById(id: number): Promise<Permission | null> {
    const permission = await this.prisma.findByUnique('permission', {
      where: { id },
    });
    return permission as Permission | null;
  }
  async findByDetail(data: CreatePermissionDto): Promise<Permission | null> {
    const permission = await this.prisma.findOne('permission', {
      where: { operationId: data.operationId, roleId: data.roleId },
    });
    return permission as Permission | null;
  }
}
