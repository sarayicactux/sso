import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { UserRepository } from './infrastructure/repositories/user.repository';
import { UserTokenRepository } from './infrastructure/repositories/userToken.repository';
import { UserAppRepository } from './infrastructure/repositories/userApp.repository';
import { AppUserRepository } from './infrastructure/repositories/appUser.repository';
const repositories = [
  UserRepository,
  UserTokenRepository,
  UserAppRepository,
  AppUserRepository,
];

import { Jwt } from '../../shared/helpers/jwt.helper';
import { Tools } from '../../shared/helpers/tools.helper';

import { UserController } from './presentation/controllers/user.controller';
import { UserGrpcController } from './presentation/grpc/user.grpc.controller';
const controllers = [UserController, UserGrpcController];

import { UserService } from './application/services/user.service';
const services = [UserService];

import { PrismaService } from '../../prisma/prisma.service';

import { CreateUserHandler } from './application/commands/user/create/createUser.handler';
import { UpdateUserPasswordHandler } from './application/commands/user/update/updatePassword.handler';
import { UpdateUserStatusHandler } from './application/commands/user/update/updateStatus.handler';
import { CreateUserTokenHandler } from './application/commands/user_token/create/create.handler';
import { DeleteUserTokenHandler } from './application/commands/user_token/delete/delete.handler';
import { UpdateUserTokenPublicKeyHandler } from './application/commands/user_token/updatePublicKey/updatePublicKey.handler';
import { CreateUserAppHandler } from './application/commands/user_app/create/createUserApp.handler';
import { DeleteUserAppHandler } from './application/commands/user_app/delete/deleteUserApp.handler';
import { CreateAppUserHandler } from './application/commands/app_user/create/createAppUser.handler';
import { DeleteAppUserHandler } from './application/commands/app_user/delete/deleteAppUser.handler';
const CommandHandlers = [
  CreateUserHandler,
  UpdateUserPasswordHandler,
  UpdateUserStatusHandler,
  CreateUserTokenHandler,
  DeleteUserTokenHandler,
  UpdateUserTokenPublicKeyHandler,
  CreateUserAppHandler,
  DeleteUserAppHandler,
  CreateAppUserHandler,
  DeleteAppUserHandler,
];

import { GetUserByMobileHandler } from './application/queries/user/getUserByMobile.handler';
import { GetUserByUsernameHandler } from './application/queries/user/getUserByUsername.handler';
import { GetUserHandler } from './application/queries/user/getUser.handler';
import { GetUserByEmailHandler } from './application/queries/user/getUserByEmail.handler';
import { FindAllUsersWithAppsHandler } from './application/queries/user/findAllWithApps.handler';
import { FindUserAppByUserIdAndAppIdHandler } from './application/queries/user_app/findByUserIdAndAppId.handler';
import { FindAppsByUserIdHandler } from './application/queries/user_app/findAppsByUserId.handler';
import { FindUserTokenByAccessTokenHandler } from './application/queries/user_token/findByAccessToken.handler';
import { FindUserTokenByPublicKeyHandler } from './application/queries/user_token/findByPublicKey.handler';
import { FindAppUserByUserIdAndAppIdHandler } from './application/queries/app_user/findByUserIdAndAppId.handler';
const QueryHandlers = [
  GetUserByMobileHandler,
  GetUserByUsernameHandler,
  GetUserByEmailHandler,
  GetUserHandler,
  FindAllUsersWithAppsHandler,
  FindUserAppByUserIdAndAppIdHandler,
  FindAppsByUserIdHandler,
  FindUserTokenByAccessTokenHandler,
  FindUserTokenByPublicKeyHandler,
  FindAppUserByUserIdAndAppIdHandler,
];

import { UserMapper } from './infrastructure/mappers/user.mapper';
import { UserAppMapper } from './infrastructure/mappers/userApp.mapper';
const mappers = [UserMapper, UserAppMapper];

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
  exports: [UserRepository, UserService],
})
export class UserModule {}
