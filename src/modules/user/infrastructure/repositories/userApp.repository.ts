import { Injectable } from '@nestjs/common';

import { UserApp } from '../../domain/entities/userApp.entity';
import { UserAppRepositoryImpl } from '../../domain/repositories/userApp.repository';
import { CreateUserAppInterface } from '../../domain/interfaces/user_app/CreateUserApp.interface';
import { PrismaService } from '../../../../prisma/prisma.service';
import { App } from '../../../app/domain/entities/app.entity';

@Injectable()
export class UserAppRepository implements UserAppRepositoryImpl {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateUserAppInterface): Promise<UserApp> {
    const row = await this.prisma.userApp.create({
      data: {
        userId: data.userId,
        appId: data.appId,
      },
    });
    return row as UserApp;
  }

  async findByUserIdAndAppId(
    userId: number,
    appId: number,
  ): Promise<UserApp | null> {
    const row = await this.prisma.findOne('userApp', {
      where: { userId, appId },
    });
    return row as UserApp | null;
  }

  async findAppsByUserId(userId: number): Promise<App[]> {
    const rows = await this.prisma.findAll('userApp', {
      where: { userId },
      include: { App: { include: { Media: true } } },
      take: 1000,
    });
    return (rows as UserApp[])
      .map((row) => row.App)
      .filter((app): app is App => !!app && app.deletedAt == null);
  }

  async delete(userId: number, appId: number): Promise<boolean> {
    await this.prisma.userApp.deleteMany({
      where: { userId, appId },
    });
    return true;
  }
}
