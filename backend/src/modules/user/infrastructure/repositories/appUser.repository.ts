import { Injectable } from '@nestjs/common';

import { AppUser } from '../../domain/entities/appUser';
import { AppUserRepositoryImpl } from '../../domain/repositories/appUser.repository';
import { CreateAppUserInterface } from '../../domain/interfaces/app_user/CreateAppUser.interface';
import { PrismaService } from '../../../../prisma/prisma.service';

@Injectable()
export class AppUserRepository implements AppUserRepositoryImpl {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateAppUserInterface): Promise<AppUser> {
    const row = await this.prisma.appUser.create({
      data: {
        userId: data.userId,
        appId: data.appId,
      },
    });
    return row as AppUser;
  }

  async findByUserIdAndAppId(
    userId: number,
    appId: number,
  ): Promise<AppUser | null> {
    const row = await this.prisma.findOne('appUser', {
      where: { userId, appId },
    });
    return row as AppUser | null;
  }

  async deleteByUserIdAndAppId(
    userId: number,
    appId: number,
  ): Promise<boolean> {
    await this.prisma.appUser.deleteMany({
      where: { userId, appId },
    });
    return true;
  }
}
