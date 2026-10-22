import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

// Infrastructure repositories
import { UserRepository } from './infrastructure/repositories/user.repository';
import { UserTokenRepository } from './infrastructure/repositories/userToken.repository';
import { SmsRqRepository } from './infrastructure/repositories/smsRq.repository';
import { RoleRepository } from './infrastructure/repositories/role.repository';
import { PermissionRepository } from './infrastructure/repositories/permission.repository';
import { LogRepository } from './infrastructure/repositories/log.repository';
const repositories = [
  UserRepository,
  UserTokenRepository,
  SmsRqRepository,
  RoleRepository,
  PermissionRepository,
  LogRepository,
];
// helpers
import { Jwt } from '../../shared/helpers/jwt.helper';
import { Tools } from '../../shared/helpers/tools.helper';

// controllers
import { UserController } from './presentation/controllers/user.controller';
import { RoleController } from './presentation/controllers/role.controller';
import { PermissionController } from './presentation/controllers/permission.controller';
const controllers = [UserController, RoleController, PermissionController];
// services
import { UserService } from './application/services/user.service';
import { RoleService } from './application/services/role.service';
import { PermissionService } from './application/services/permission.service';
const services = [UserService, RoleService, PermissionService];
//Prisma
import { PrismaService } from '../../prisma/prisma.service';

// command Handlers
import { CreateUserHandler } from './application/commands/user/create/createUser.handler';
import { UpdatePasswordHandler } from './application/commands/user/update/updatePassword.handler';
import { UpdateUserStatusHandler } from './application/commands/user/update/updateStatus.handler';
import { RestoreHandler } from './application/commands/user/update/restore.handler';
import { CreateUserTokenHandler } from './application/commands/user_token/create/create.handler';
import { DeleteUserTokenHandler } from './application/commands/user_token/delete/delete.handler';
import { CreateSmsRqHandler } from './application/commands/sms_rq/create/create.handler';
import { UpdateSmsRqHandler } from './application/commands/sms_rq/update/update.handler';
import { SoftDeleteHandler } from './application/commands/sms_rq/delete/softDelete.handler';
import { CreateRoleHandler } from './application/commands/role/create/create.handler';
import { ActiveDeactiveHandler } from './application/commands/role/update/activeDeactive.handler';
import { RestoreRoleHandler } from './application/commands/role/update/restore.handler';
import { UpdateRoleHandler } from './application/commands/role/update/update.handler';
import { DeleteRoleHandler } from './application/commands/role/delete/delete.handler';
import { SoftDeleteRoleHandler } from './application/commands/role/delete/softDelete.handler';
import { CreatePermissionHandler } from './application/commands/permission/create/create.handler';
import { DeletePermissionHandler } from './application/commands/permission/delete/delete.handler';
const CommandHandlers = [
  CreateUserHandler,
  UpdatePasswordHandler,
  UpdateUserStatusHandler,
  RestoreHandler,
  CreateUserTokenHandler,
  CreateSmsRqHandler,
  UpdateSmsRqHandler,
  SoftDeleteHandler,
  DeleteUserTokenHandler,
  CreateRoleHandler,
  ActiveDeactiveHandler,
  RestoreRoleHandler,
  UpdateRoleHandler,
  DeleteRoleHandler,
  SoftDeleteRoleHandler,
  CreatePermissionHandler,
  DeletePermissionHandler,
];

// query Handlers
import { GetUserByMobileHandler } from './application/queries/user/getUserByMobile.handler';
import { GetUserByUsernameHandler } from './application/queries/user/getUserByUsername.handler';
import { GetUserQueryHandler } from './application/queries/user/getUser.handler';
import { GetUserByEmailHandler } from './application/queries/user/getUserByEmail.handler';
import { GetOneSmsRqHandler } from './application/queries/sms_rq/getOne.handler';
import { AllRoleHandler } from './application/queries/role/all.handler';
import { GetOneRoleHandler } from './application/queries/role/getOne.handler';
import { AllActiveRoleHandler } from './application/queries/role/allActive.handler';
import { GetPermissionDetailHandler } from './application/queries/permission/getDetail.handler';
import { GetOnePermissionHandler } from './application/queries/permission/getOne.handler';

const QueryHandlers = [
  GetUserByMobileHandler,
  GetUserByUsernameHandler,
  GetUserByEmailHandler,
  GetUserQueryHandler,
  GetOneSmsRqHandler,
  AllRoleHandler,
  GetOneRoleHandler,
  AllActiveRoleHandler,
  GetPermissionDetailHandler,
  GetOnePermissionHandler,
];

// event Handlers
import { CreateLogHandler } from './application/events/log/createLog.handler';
const EventHandlers = [CreateLogHandler];

// mappers
import { UserMapper } from './infrastructure/mappers/user.mapper';
import { RoleMapper } from './infrastructure/mappers/role.mapper';
import { PermissionMapper } from './infrastructure/mappers/permission.mapper';
const mappers = [UserMapper, RoleMapper, PermissionMapper];
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
  exports: [UserRepository, UserService],
})
export class UserModule {}
