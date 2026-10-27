import { Injectable } from '@nestjs/common';

import { App } from '../../domain/entities/app.entity';
import {
  AppRepositoryImpl,
  CreateAppData,
} from '../../domain/repositories/app.repository';
import { PrismaService } from '../../../../prisma/prisma.service';
import { UpdateAppInterface } from '../../domain/interfaces/app/UpdateApp.interface';
import { UpdateActiveSessionInterface } from '../../domain/interfaces/app/UpdateAppActiveSession.interface';
import { UpdateStatusInterface } from '../../domain/interfaces/app/UpdateAppStatus.interface';
import { UpdateAccessTokenInterface } from '../../domain/interfaces/app/UpdateAppAccessToken.interface';

@Injectable()
export class AppRepository implements AppRepositoryImpl {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateAppData): Promise<App> {
    const app = await this.prisma.app.create({
      data: {
        title: data.title,
        description: data.description,
        url: data.url,
        mediaId: data.mediaId ?? null,
        adminId: data.adminId,
        accessToken: data.accessToken,
        status: data.status ?? true,
        activeSession: data.activeSession ?? true,
      },
      include: {
        Media: true,
      },
    });
    return app as App;
  }

  async update(id: number, data: UpdateAppInterface): Promise<boolean> {
    await this.prisma.app.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        url: data.url,
        mediaId: data.mediaId,
      },
    });
    return true;
  }

  async updateStatus(data: UpdateStatusInterface): Promise<boolean> {
    await this.prisma.app.update({
      where: { id: data.id },
      data: { status: data.status },
    });
    return true;
  }

  async updateActiveSession(
    data: UpdateActiveSessionInterface,
  ): Promise<boolean> {
    await this.prisma.app.update({
      where: { id: data.id },
      data: { activeSession: data.activeSession },
    });
    return true;
  }

  async updateAccessToken(data: UpdateAccessTokenInterface): Promise<boolean> {
    await this.prisma.app.update({
      where: { id: data.id },
      data: { accessToken: data.accessToken },
    });
    return true;
  }

  async findById(id: number): Promise<App | null> {
    const app = await this.prisma.findOne('app', {
      where: { id },
      include: { Media: true },
    });
    return app as App | null;
  }

  async findByAccessToken(accessToken: string): Promise<App | null> {
    const app = await this.prisma.findOne('app', {
      where: { accessToken },
      include: { Media: true },
    });
    return app as App | null;
  }

  async findAll(): Promise<App[]> {
    const apps = await this.prisma.findAll('app', {
      include: { Media: true },
      take: 1000,
    });
    return apps as App[];
  }
}
