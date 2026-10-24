import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import { AppServiceImpl } from '../../domain/services/app.service';
import { CreateAppInterface } from '../../domain/interfaces/app/CreateApp.interface';
import { UpdateAppInterface } from '../../domain/interfaces/app/UpdateApp.interface';
import { UpdateActiveSessionInterface } from '../../domain/interfaces/app/UpdateAppActiveSession.interface';
import { UpdateStatusInterface } from '../../domain/interfaces/app/UpdateAppStatus.interface';
import { App } from '../../domain/entities/app.entity';
import { AppDto } from '../../presentation/dtos/app.dto';
import { AppMapper } from '../../infrastructure/mappers/app.mapper';
import { Tools } from '../../../../shared/helpers/tools.helper';
import { DatabaseAct } from '../../../../shared/enums/databaseAct.enum';

import { CreateAppCommand } from '../commands/create/createApp.command';
import { UpdateAppCommand } from '../commands/update/updateApp.command';
import { UpdateAppStatusCommand } from '../commands/updateStatus/updateStatus.command';
import { UpdateAppActiveSessionCommand } from '../commands/updateActiveSession/updateActiveSession.command';
import { UpdateAppAccessTokenCommand } from '../commands/updateAccessToken/updateAccessToken.command';
import { FindAppByIdQuery } from '../queries/findById.query';
import { FindAppByAccessTokenQuery } from '../queries/findByAccessToken.query';
import { FindAllAppsQuery } from '../queries/findAll.query';
import { generateAppAccessToken } from '../helpers/access-token.util';

@Injectable()
export class AppService implements AppServiceImpl {
  constructor(
    private readonly appMapper: AppMapper,
    private readonly tools: Tools,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  private async ensureUniqueAccessToken(): Promise<string> {
    for (let attempt = 0; attempt < 5; attempt++) {
      const accessToken = generateAppAccessToken();
      const existing = await this.queryBus.execute(
        new FindAppByAccessTokenQuery(accessToken),
      );
      if (!existing) {
        return accessToken;
      }
    }
    throw new HttpException(
      {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'Failed to generate a unique access token',
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  private notFound(): never {
    throw new HttpException(
      {
        status: HttpStatus.NOT_FOUND,
        error: 'App not found',
      },
      HttpStatus.NOT_FOUND,
    );
  }

  private mapPrismaError(error: any): never {
    if (error?.code === 'P2002') {
      throw new HttpException(
        {
          status: HttpStatus.CONFLICT,
          error: 'App with the same title, url, or accessToken already exists',
        },
        HttpStatus.CONFLICT,
      );
    }
    throw error;
  }

  async create(createApp: CreateAppInterface, admin: any): Promise<AppDto> {
    const accessToken = await this.ensureUniqueAccessToken();
    try {
      const newApp = (await this.commandBus.execute(
        new CreateAppCommand({
          ...createApp,
          adminId: admin.id,
          accessToken,
          status: true,
          activeSession: true,
        }),
      )) as App;

      this.tools.saveLogs({
        adminId: admin.id,
        tableName: 'apps',
        rowId: newApp.id,
        act: DatabaseAct.CREATE,
        oldData: null,
        newData: newApp,
        description: 'Create app',
      });

      return this.appMapper.toAppDto(newApp);
    } catch (error) {
      this.mapPrismaError(error);
    }
  }

  async update(
    id: number,
    data: UpdateAppInterface,
    admin: any,
  ): Promise<boolean> {
    const existing = (await this.queryBus.execute(
      new FindAppByIdQuery(id),
    )) as App | null;
    if (!existing) {
      this.notFound();
    }
    try {
      const result = await this.commandBus.execute(
        new UpdateAppCommand(id, data),
      );
      this.tools.saveLogs({
        adminId: admin.id,
        tableName: 'apps',
        rowId: id,
        act: DatabaseAct.UPDATE,
        oldData: existing,
        newData: data,
        description: 'Update app',
      });
      return result;
    } catch (error) {
      this.mapPrismaError(error);
    }
  }

  async updateStatus(
    data: UpdateStatusInterface,
    admin: any,
  ): Promise<boolean> {
    const existing = (await this.queryBus.execute(
      new FindAppByIdQuery(data.id),
    )) as App | null;
    if (!existing) {
      this.notFound();
    }
    const result = await this.commandBus.execute(
      new UpdateAppStatusCommand(data),
    );
    this.tools.saveLogs({
      adminId: admin.id,
      tableName: 'apps',
      rowId: data.id,
      act: DatabaseAct.UPDATE,
      oldData: { status: existing.status },
      newData: { status: data.status },
      description: 'Update app status',
    });
    return result;
  }

  async updateActiveSession(
    data: UpdateActiveSessionInterface,
    admin: any,
  ): Promise<boolean> {
    const existing = (await this.queryBus.execute(
      new FindAppByIdQuery(data.id),
    )) as App | null;
    if (!existing) {
      this.notFound();
    }
    const result = await this.commandBus.execute(
      new UpdateAppActiveSessionCommand(data),
    );
    this.tools.saveLogs({
      adminId: admin.id,
      tableName: 'apps',
      rowId: data.id,
      act: DatabaseAct.UPDATE,
      oldData: { activeSession: existing.activeSession },
      newData: { activeSession: data.activeSession },
      description: 'Update app active session',
    });
    return result;
  }

  async regenerateAccessToken(id: number, admin: any): Promise<AppDto> {
    const existing = (await this.queryBus.execute(
      new FindAppByIdQuery(id),
    )) as App | null;
    if (!existing) {
      this.notFound();
    }

    const accessToken = await this.ensureUniqueAccessToken();
    try {
      await this.commandBus.execute(
        new UpdateAppAccessTokenCommand({ id, accessToken }),
      );
      this.tools.saveLogs({
        adminId: admin.id,
        tableName: 'apps',
        rowId: id,
        act: DatabaseAct.UPDATE,
        oldData: { accessToken: existing.accessToken },
        newData: { accessToken },
        description: 'Regenerate app accessToken',
      });
      return this.appMapper.toAppDto({ ...existing, accessToken });
    } catch (error) {
      this.mapPrismaError(error);
    }
  }

  async findById(id: number): Promise<AppDto> {
    const app = (await this.queryBus.execute(
      new FindAppByIdQuery(id),
    )) as App | null;
    if (!app) {
      this.notFound();
    }
    return this.appMapper.toAppDto(app);
  }

  async findByAccessToken(accessToken: string): Promise<AppDto> {
    const app = (await this.queryBus.execute(
      new FindAppByAccessTokenQuery(accessToken),
    )) as App | null;
    if (!app) {
      this.notFound();
    }
    return this.appMapper.toAppDto(app);
  }

  async findAll(): Promise<AppDto[]> {
    const apps = (await this.queryBus.execute(new FindAllAppsQuery())) as App[];
    return apps.map((app) => this.appMapper.toAppDto(app));
  }
}
