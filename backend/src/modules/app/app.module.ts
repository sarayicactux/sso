import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { AppRepository } from './infrastructure/repositories/app.repository';
const repositories = [AppRepository];

import { Jwt } from '../../shared/helpers/jwt.helper';
import { Tools } from '../../shared/helpers/tools.helper';

import { AppController } from './presentation/controllers/app.controller';
const controllers = [AppController];

import { AppService } from './application/services/app.service';
const services = [AppService];

import { PrismaService } from '../../prisma/prisma.service';

import { CreateAppHandler } from './application/commands/create/createApp.handler';
import { UpdateAppHandler } from './application/commands/update/updateApp.handler';
import { UpdateAppStatusHandler } from './application/commands/updateStatus/updateStatus.handler';
import { UpdateAppActiveSessionHandler } from './application/commands/updateActiveSession/updateActiveSession.handler';
import { UpdateAppAccessTokenHandler } from './application/commands/updateAccessToken/updateAccessToken.handler';
const CommandHandlers = [
  CreateAppHandler,
  UpdateAppHandler,
  UpdateAppStatusHandler,
  UpdateAppActiveSessionHandler,
  UpdateAppAccessTokenHandler,
];

import { FindAppByIdHandler } from './application/queries/findById.handler';
import { FindAppByAccessTokenHandler } from './application/queries/findByAccessToken.handler';
import { FindAllAppsHandler } from './application/queries/findAll.handler';
const QueryHandlers = [
  FindAppByIdHandler,
  FindAppByAccessTokenHandler,
  FindAllAppsHandler,
];

import { AppMapper } from './infrastructure/mappers/app.mapper';
const mappers = [AppMapper];

@Module({
  imports: [CqrsModule],
  controllers: controllers,
  providers: [
    PrismaService,
    ...services,
    ...repositories,
    ...CommandHandlers,
    ...QueryHandlers,
    Jwt,
    Tools,
    ...mappers,
  ],
  exports: [AppRepository, AppService],
})
export class AppsModule {}
