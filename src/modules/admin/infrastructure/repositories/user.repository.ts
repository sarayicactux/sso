import { Injectable } from '@nestjs/common';

import { User } from '../../domain/entities/admin.entity';
import { UserRepositoryImpl } from '../../domain/repositories/admin.repository';
import { PrismaService } from '../../../../prisma/prisma.service';
import { RegisterDto } from '../../presentation/dtos/user.dto';
import { UserStatus } from '../../domain/enums/userStatus.enum';

@Injectable()
export class UserRepository implements UserRepositoryImpl {
  constructor(private readonly prisma: PrismaService) {}
  async findById(id: number): Promise<User | null> {
    const user = await this.prisma.findByUnique('user', {
      where: { id },
      include: {
        UserTokens: true,
        Role: {
          include: {
            Permissions: true,
          },
        },
      },
    });
    return user as User | null;
  }

  async findByMobile(mobile: string): Promise<User | null> {
    const user = await this.prisma.findByUnique('user', {
      where: { mobile },
      include: {
        UserTokens: true,
        Role: {
          include: {
            Permissions: true,
          },
        },
      },
    });
    return user as User | null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const user = await this.prisma.findByUnique('user', {
      where: { username },
    });
    return user as User | null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.findByUnique('user', { where: { email } });
    return user as User | null;
  }

  async findAll(page: number, limit: number): Promise<User[]> {
    const users = await this.prisma.findAll('user', {
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [
        {
          id: 'desc',
        },
      ],
    });
    return users as User[];
  }

  async allIncludingDeleted(): Promise<User[]> {
    const users = await this.prisma.findAll('user', {
      where: { deletedAt: { not: null } },
      orderBy: [
        {
          id: 'desc',
        },
      ],
    });
    return users as User[];
  }

  async create(data: RegisterDto): Promise<User> {
    const newUser = await this.prisma.user.create({
      data,
    });
    return newUser as User;
  }

  async updatePassword(password: string, id: number): Promise<boolean> {
    await this.prisma.user.update({
      where: { id },
      data: { password },
    });
    return true;
  }
  async softDelete(id: number): Promise<boolean> {
    await this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return true;
  }
  async delete(id: number): Promise<boolean> {
    await this.prisma.user.delete({
      where: { id },
    });
    return true;
  }
  async restore(id: number): Promise<boolean> {
    await this.prisma.user.update({
      where: { id },
      data: { deletedAt: null },
    });
    return true;
  }
  async updateStatus(id: number, status: UserStatus): Promise<boolean> {
    await this.prisma.user.update({
      where: { id },
      data: { isActive: status },
    });
    return true;
  }
}
