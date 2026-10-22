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

import { AdminController } from './presentation/controllers/admin.controller';
const controllers = [AdminController];

import { AdminService } from './application/services/admin.service';
const services = [AdminService];

import { PrismaService } from '../../prisma/prisma.service';

import { CreateAdminHandler } from './application/commands/admin/create/createAdmin.handler';
import { UpdatePasswordHandler } from './application/commands/admin/update/updatePassword.handler';
import { CreateAdminTokenHandler } from './application/commands/admin_token/create/create.handler';
import { DeleteAdminTokenHandler } from './application/commands/admin_token/delete/delete.handler';
import { CreateSmsRqHandler } from './application/commands/sms_rq/create/create.handler';
import { UpdateSmsRqHandler } from './application/commands/sms_rq/update/update.handler';
import { SoftDeleteHandler } from './application/commands/sms_rq/delete/softDelete.handler';
import { CreateLogCommandHandler } from './application/commands/log/create/createLog.handler';
const CommandHandlers = [
  CreateAdminHandler,
  UpdatePasswordHandler,
  CreateAdminTokenHandler,
  DeleteAdminTokenHandler,
  CreateSmsRqHandler,
  UpdateSmsRqHandler,
  SoftDeleteHandler,
  CreateLogCommandHandler,
];

import { GetAdminByMobileHandler } from './application/queries/admin/GetAdminByMobile.handler';
import { GetAdminByUsernameHandler } from './application/queries/admin/GetAdminByUsername.handler';
import { GetAdminQueryHandler } from './application/queries/admin/GetAdmin.handler';
import { GetAdminByEmailHandler } from './application/queries/admin/GetAdminByEmail.handler';
import { GetOneSmsRqHandler } from './application/queries/sms_rq/getOne.handler';
import { AllAdminHandler } from './application/queries/admin/allAdmin.handler';
import { GetLogHandler } from './application/queries/log/find.handler';
const QueryHandlers = [
  GetAdminByMobileHandler,
  GetAdminByUsernameHandler,
  GetAdminByEmailHandler,
  GetAdminQueryHandler,
  GetOneSmsRqHandler,
  AllAdminHandler,
  GetLogHandler,
];

import { CreateLogHandler } from './application/events/log/createLog.handler';
const EventHandlers = [CreateLogHandler];

import { AdminMapper } from './infrastructure/mappers/admin.mapper';
const mappers = [AdminMapper];

@Module({
  imports: [CqrsModule],
  controllers: controllers,
  providers: [
    PrismaService,
    ...services,
    ...repositories,
    ...CommandHandlers,
    ...QueryHandlers,
    ...EventHandlers,
    Jwt,
    Tools,
    ...mappers,
  ],
  exports: [AdminRepository, AdminService],
})
export class AdminModule {}
