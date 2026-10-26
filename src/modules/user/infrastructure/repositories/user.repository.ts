import { Injectable } from '@nestjs/common';

import { User } from '../../domain/entities/user.entity';
import {
  CreateUserData,
  UserRepositoryImpl,
} from '../../domain/repositories/user.repository';
import { PrismaService } from '../../../../prisma/prisma.service';

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

  async updatePassword(password: string, id: number): Promise<boolean> {
    await this.prisma.user.update({
      where: { id },
      data: { password },
    });
    return true;
  }
}
