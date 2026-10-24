import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { AdminRepository } from './infrastructure/repositories/admin.repository';
import { AdminTokenRepository } from './infrastructure/repositories/adminToken.repository';
import { SmsRqRepository } from './infrastructure/repositories/smsRq.repository';
import { LogRepository } from './infrastructure/repositories/log.repository';
const repositories = [
  AdminRepository,
  AdminTokenRepository,
  SmsRqRepository,
  LogRepository,
];

import { Jwt } from '../../shared/helpers/jwt.helper';
import { Tools } from '../../shared/helpers/tools.helper';

import { AppController } from './presentation/controllers/app.controller';
const controllers = [AppController];

import { AppService } from './application/services/app.service';
const services = [AppService];

import { PrismaService } from '../../prisma/prisma.service';

const CommandHandlers = [];

const QueryHandlers = [];

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
  exports: [AdminRepository, AppService],
})
export class AppsModule {}
