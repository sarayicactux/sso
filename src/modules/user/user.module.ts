import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { UserRepository } from './infrastructure/repositories/user.repository';
import { UserTokenRepository } from './infrastructure/repositories/userToken.repository';
import { UserAppRepository } from './infrastructure/repositories/userApp.repository';
const repositories = [UserRepository, UserTokenRepository, UserAppRepository];

import { Jwt } from '../../shared/helpers/jwt.helper';
import { Tools } from '../../shared/helpers/tools.helper';

import { UserController } from './presentation/controllers/user.controller';
const controllers = [UserController];

import { UserService } from './application/services/user.service';
const services = [UserService];

import { PrismaService } from '../../prisma/prisma.service';

import { CreateUserHandler } from './application/commands/user/create/createUser.handler';
import { UpdateUserPasswordHandler } from './application/commands/user/update/updatePassword.handler';
import { CreateUserTokenHandler } from './application/commands/user_token/create/create.handler';
import { DeleteUserTokenHandler } from './application/commands/user_token/delete/delete.handler';
import { CreateUserAppHandler } from './application/commands/user_app/create/createUserApp.handler';
import { DeleteUserAppHandler } from './application/commands/user_app/delete/deleteUserApp.handler';
const CommandHandlers = [
  CreateUserHandler,
  UpdateUserPasswordHandler,
  CreateUserTokenHandler,
  DeleteUserTokenHandler,
  CreateUserAppHandler,
  DeleteUserAppHandler,
];

import { GetUserByMobileHandler } from './application/queries/user/getUserByMobile.handler';
import { GetUserByUsernameHandler } from './application/queries/user/getUserByUsername.handler';
import { GetUserHandler } from './application/queries/user/getUser.handler';
import { GetUserByEmailHandler } from './application/queries/user/getUserByEmail.handler';
import { FindUserAppByUserIdAndAppIdHandler } from './application/queries/user_app/findByUserIdAndAppId.handler';
import { FindAppsByUserIdHandler } from './application/queries/user_app/findAppsByUserId.handler';
const QueryHandlers = [
  GetUserByMobileHandler,
  GetUserByUsernameHandler,
  GetUserByEmailHandler,
  GetUserHandler,
  FindUserAppByUserIdAndAppIdHandler,
  FindAppsByUserIdHandler,
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
