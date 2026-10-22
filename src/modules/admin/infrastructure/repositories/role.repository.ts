import { Injectable } from '@nestjs/common';

import { Role } from '../../domain/entities/role.entity';
import { RoleRepositoryImpl } from '../../domain/repositories/role.repository';
import { PrismaService } from '../../../../prisma/prisma.service';
import {
  CreateRoleDto,
  UpdateRoleDto,
  UpdateStatusRoleDto,
} from '../../presentation/dtos/role.dto';

@Injectable()
export class RoleRepository implements RoleRepositoryImpl {
  constructor(private readonly prisma: PrismaService) {}
  async findById(id: number): Promise<Role | null> {
    const role = await this.prisma.findByUnique('role', {
      where: { id },
      include: {
        Permissions: true,
        Users: true,
      },
    });
    return role as Role | null;
  }

  async findAll(page: number, limit: number): Promise<Role[]> {
    const roles = await this.prisma.findAll('role', {
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [
        {
          id: 'desc',
        },
      ],
    });
    return roles as Role[];
  }
  async findAllActive(page: number, limit: number): Promise<Role[]> {
    const roles = await this.prisma.findAll('role', {
      where: { isActive: true },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [
        {
          id: 'desc',
        },
      ],
    });
    return roles as Role[];
  }

  async create(data: CreateRoleDto): Promise<Role> {
    // const data: Prisma.RoleCreateInput = {
    //   name: dto.name,
    //   description: dto.description ?? null,
    //   isActive: true,
    // };
    // console.log({ data, dto });
    const newRole = await this.prisma.role.create({
      data,
    });
    return newRole as Role;
  }

  async update(updateRoleDto: UpdateRoleDto): Promise<boolean> {
    await this.prisma.role.update({
      where: { id: updateRoleDto.id },
      data: {
        name: updateRoleDto.name,
        description: updateRoleDto.description,
      },
    });
    return true;
  }
  async softDelete(id: number): Promise<boolean> {
    await this.prisma.role.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return true;
  }
  async delete(id: number): Promise<boolean> {
    await this.prisma.softDelete('role', {
      where: { id },
    });
    return true;
  }
  async activeDeactive(
    updateStatusRoleDto: UpdateStatusRoleDto,
  ): Promise<boolean> {
    const { id, status } = updateStatusRoleDto;
    await this.prisma.role.update({
      where: { id },
      data: {
        isActive: status,
      },
    });
    return true;
  }
  async restore(id: number): Promise<boolean> {
    await this.prisma.role.update({
      where: { id },
      data: { deletedAt: null },
    });
    return true;
  }
}
