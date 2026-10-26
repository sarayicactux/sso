import { Injectable } from '@nestjs/common';

import { User } from '../../domain/entities/user.entity';
import {
  CreateUserData,
  UserRepositoryImpl,
  UserWithApps,
} from '../../domain/repositories/user.repository';
import { UpdateUserStatusInterface } from '../../domain/interfaces/user/UpdateUserStatus.interface';
import { PrismaService } from '../../../../prisma/prisma.service';
import { App } from '../../../app/domain/entities/app.entity';

@Injectable()
export class UserRepository implements UserRepositoryImpl {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateUserData): Promise<User> {
    const user = await this.prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        mobile: data.mobile,
        firstName: data.firstName,
        lastName: data.lastName,
        password: data.password,
        status: true,
      },
    });
    return user as User;
  }

  async findById(id: number): Promise<User | null> {
    const user = await this.prisma.findOne('user', {
      where: { id },
    });
    return user as User | null;
  }

  async findByMobile(mobile: string): Promise<User | null> {
    const user = await this.prisma.findOne('user', {
      where: { mobile },
    });
    return user as User | null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const user = await this.prisma.findOne('user', {
      where: { username },
    });
    return user as User | null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.findOne('user', {
      where: { email },
    });
    return user as User | null;
  }

  async findAllWithApps(): Promise<UserWithApps[]> {
    const rows = await this.prisma.user.findMany({
      where: { deletedAt: null },
      include: {
        UserApps: {
          include: {
            App: { include: { Media: true } },
          },
        },
      },
      orderBy: { id: 'asc' },
    });

    return rows.map((row) => {
      const apps = (row.UserApps || [])
        .map((link) => link.App)
        .filter(
          (app): app is NonNullable<typeof app> =>
            !!app && (app as App).deletedAt == null,
        );
      const { UserApps: _links, ...user } = row;
      void _links;
      return { ...(user as unknown as User), apps } as UserWithApps;
    });
  }

  async updatePassword(password: string, id: number): Promise<boolean> {
    await this.prisma.user.update({
      where: { id },
      data: { password },
    });
    return true;
  }

  async updateStatus(data: UpdateUserStatusInterface): Promise<User> {
    const user = await this.prisma.user.update({
      where: { id: data.id },
      data: { status: data.status },
    });
    return user as User;
  }
}
