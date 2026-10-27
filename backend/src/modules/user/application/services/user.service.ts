import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { status as GrpcStatus } from '@grpc/grpc-js';
import { UserServiceImpl } from '../../domain/services/user.service';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import * as bcrypt from 'bcryptjs';
import moment from 'moment';

import {
  LoginDto,
  RecoverPasswordDto,
  UpdatePasswordDto,
  CreateUserDto,
  RevokeUserAppDto,
  UserDto,
} from '../../presentation/dtos/user.dto';

import { UserMapper } from '../../infrastructure/mappers/user.mapper';
import { Jwt } from '../../../../shared/helpers/jwt.helper';
import { Tools } from '../../../../shared/helpers/tools.helper';

import { CreateUserTokenCommand } from '../commands/user_token/create/create.command';
import { DeleteUserTokenCommand } from '../commands/user_token/delete/delete.command';
import { CreateSmsRqCommand } from '../../../admin/application/commands/sms_rq/create/create.command';
import { UpdateSmsRqCommand } from '../../../admin/application/commands/sms_rq/update/update.command';
import { SoftDeleteCommand } from '../../../admin/application/commands/sms_rq/delete/softDelete.command';
import { GetOneSmsRqQuery } from '../../../admin/application/queries/sms_rq/getOne.query';
import { FindAppByAccessTokenQuery } from '../../../app/application/queries/findByAccessToken.query';
import { FindAppByIdQuery } from '../../../app/application/queries/findById.query';

import { GetUserByMobileQuery } from '../queries/user/getUserByMobile.query';
import { GetUserByEmailQuery } from '../queries/user/getUserByEmail.query';
import { GetUserByUsernameQuery } from '../queries/user/getUserByUsername.query';
import { GetUserQuery } from '../queries/user/getUser.query';
import { FindAllUsersWithAppsQuery } from '../queries/user/findAllWithApps.query';
import { FindUserAppByUserIdAndAppIdQuery } from '../queries/user_app/findByUserIdAndAppId.query';
import { FindAppsByUserIdQuery } from '../queries/user_app/findAppsByUserId.query';
import { FindUserTokenByAccessTokenQuery } from '../queries/user_token/findByAccessToken.query';
import { FindUserTokenByPublicKeyQuery } from '../queries/user_token/findByPublicKey.query';
import { User } from '../../domain/entities/user.entity';
import { UserToken } from '../../domain/entities/userToken.entity';
import { App } from '../../../app/domain/entities/app.entity';
import { UpdateUserPasswordCommand } from '../commands/user/update/updatePassword.command';
import { UpdateUserStatusCommand } from '../commands/user/update/updateStatus.command';
import { CreateUserCommand } from '../commands/user/create/createUser.command';
import { CreateUserAppCommand } from '../commands/user_app/create/createUserApp.command';
import { DeleteUserAppCommand } from '../commands/user_app/delete/deleteUserApp.command';
import { UpdateUserTokenPublicKeyCommand } from '../commands/user_token/updatePublicKey/updatePublicKey.command';
import {
  ValidateUserAppAccessInterface,
  ValidateUserAppAccessResult,
} from '../../domain/interfaces/user/ValidateUserAppAccess.interface';
import { UpdateUserStatusInterface } from '../../domain/interfaces/user/UpdateUserStatus.interface';
import {
  UpdateUserStatusByUsernameInterface,
  UpdateUserStatusByUsernameResult,
} from '../../domain/interfaces/user/UpdateUserStatusByUsername.interface';
import {
  CreateUserViaAppInterface,
  CreateUserViaAppResult,
} from '../../domain/interfaces/user/CreateUserViaApp.interface';
import {
  GetUserByPublicKeyInterface,
  GetUserByPublicKeyResult,
} from '../../domain/interfaces/user/GetUserByPublicKey.interface';
import { AssociateUserAppInterface } from '../../domain/interfaces/user_app/AssociateUserApp.interface';
import { AppMapper } from '../../../app/infrastructure/mappers/app.mapper';
import { AppDto } from '../../../app/presentation/dtos/app.dto';
import { AppPublicKeyDto } from '../../presentation/dtos/user.dto';
import { UserWithApps } from '../../domain/repositories/user.repository';
import { DatabaseAct } from '../../../../shared/enums/databaseAct.enum';
import { generateAppAccessToken } from '../../../../shared/helpers/access-token.util';

@Injectable()
export class UserService implements UserServiceImpl {
  private readonly appMapper = new AppMapper();

  constructor(
    private readonly userMapper: UserMapper,
    private readonly jwt: Jwt,
    private readonly tools: Tools,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  private userNotFound(): never {
    throw new HttpException(
      {
        status: HttpStatus.NOT_FOUND,
        error: 'User not found',
      },
      HttpStatus.NOT_FOUND,
    );
  }

  private appNotFound(): never {
    throw new HttpException(
      {
        status: HttpStatus.NOT_FOUND,
        error: 'Application not found',
      },
      HttpStatus.NOT_FOUND,
    );
  }

  private async requireActiveApp(accessToken: string): Promise<App> {
    const app = (await this.queryBus.execute(
      new FindAppByAccessTokenQuery(accessToken),
    )) as App | null;
    if (!app || app.status !== true) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: 'Invalid or inactive application',
        },
        HttpStatus.FORBIDDEN,
      );
    }
    return app;
  }

  private async resolveExistingUser(params: {
    mobile: string;
    email: string;
    username: string;
  }): Promise<User | null> {
    const byMobile = (await this.queryBus.execute(
      new GetUserByMobileQuery(params.mobile),
    )) as User | null;
    const byEmail = (await this.queryBus.execute(
      new GetUserByEmailQuery(params.email),
    )) as User | null;
    const byUsername = (await this.queryBus.execute(
      new GetUserByUsernameQuery(params.username),
    )) as User | null;

    const found = [byMobile, byEmail, byUsername].filter((u): u is User => !!u);
    if (found.length === 0) return null;

    const ids = new Set(found.map((u) => u.id));
    if (ids.size > 1) {
      throw new HttpException(
        {
          status: HttpStatus.CONFLICT,
          error: 'User identity fields match multiple different accounts',
        },
        HttpStatus.CONFLICT,
      );
    }
    return found[0];
  }

  private async appsForUser(userId: number): Promise<App[]> {
    return this.queryBus.execute(new FindAppsByUserIdQuery(userId));
  }
  private invalidUserAppAccess(): ValidateUserAppAccessResult {
    return {
      valid: false,
      id: 0,
      username: '',
      email: '',
      mobile: '',
      firstName: '',
      lastName: '',
      status: false,
    };
  }
  async create(data: CreateUserDto): Promise<UserDto> {
    const app = await this.requireActiveApp(data.accessToken);
    const existing = await this.resolveExistingUser({
      mobile: data.mobile,
      email: data.email,
      username: data.username,
    });

    let user: User;
    if (existing) {
      if (!User.canGrantAppAccess(existing)) {
        throw new HttpException(
          {
            status: HttpStatus.FORBIDDEN,
            error: 'User is inactive',
          },
          HttpStatus.FORBIDDEN,
        );
      }
      user = existing;
    } else {
      const password = await bcrypt.hash(data.password, 10);
      user = (await this.commandBus.execute(
        new CreateUserCommand({
          username: data.username,
          email: data.email,
          mobile: data.mobile,
          firstName: data.firstName,
          lastName: data.lastName,
          password,
        }),
      )) as User;
    }

    const link = await this.queryBus.execute(
      new FindUserAppByUserIdAndAppIdQuery(user.id, app.id),
    );
    if (!link) {
      await this.commandBus.execute(
        new CreateUserAppCommand({ userId: user.id, appId: app.id }),
      );
    }

    const apps = await this.appsForUser(user.id);
    return this.userMapper.toUserDto(user, null, apps);
  }

  /**
   * gRPC CreateUser: validate App accessToken against DB first, then reuse REST create.
   * Response omits password, access tokens, and apps.
   */
  async createViaApp(
    data: CreateUserViaAppInterface,
  ): Promise<CreateUserViaAppResult> {
    const username = data?.username?.trim();
    const email = data?.email?.trim();
    const mobile = data?.mobile?.trim();
    const password = data?.password;
    const accessToken = data?.accessToken?.trim();
    const firstName = data?.firstName?.trim() || undefined;
    const lastName = data?.lastName?.trim() || undefined;

    if (!username || !email || !mobile || !password || !accessToken) {
      throw new RpcException({
        code: GrpcStatus.INVALID_ARGUMENT,
        message:
          'username, email, mobile, password, and accessToken are required',
      });
    }
    if (password.length < 6) {
      throw new RpcException({
        code: GrpcStatus.INVALID_ARGUMENT,
        message: 'password must be at least 6 characters',
      });
    }

    // Critical: reject invalid/inactive app tokens before any user write.
    const app = (await this.queryBus.execute(
      new FindAppByAccessTokenQuery(accessToken),
    )) as App | null;
    if (!app || app.status !== true) {
      throw new RpcException({
        code: GrpcStatus.PERMISSION_DENIED,
        message: 'Invalid or inactive application',
      });
    }

    try {
      const user = await this.create({
        username,
        email,
        mobile,
        firstName,
        lastName,
        password,
        accessToken,
      });
      return {
        success: true,
        id: user.id,
        username: user.username,
        email: user.email,
        mobile: user.mobile,
        firstName: user.firstName ?? '',
        lastName: user.lastName ?? '',
        status: user.status !== false,
      };
    } catch (e) {
      if (e instanceof RpcException) {
        throw e;
      }
      if (e instanceof HttpException) {
        throw this.httpExceptionToRpc(e);
      }
      throw new RpcException({
        code: GrpcStatus.INTERNAL,
        message: 'Failed to create user',
      });
    }
  }

  private httpExceptionToRpc(e: HttpException): RpcException {
    const status = e.getStatus();
    const body = e.getResponse();
    const message =
      typeof body === 'string'
        ? body
        : ((body as { error?: string; message?: string })?.error ??
          (body as { message?: string })?.message ??
          e.message);

    let code = GrpcStatus.INTERNAL;
    if (status === HttpStatus.BAD_REQUEST) {
      code = GrpcStatus.INVALID_ARGUMENT;
    } else if (status === HttpStatus.FORBIDDEN) {
      code = GrpcStatus.PERMISSION_DENIED;
    } else if (status === HttpStatus.NOT_FOUND) {
      code = GrpcStatus.NOT_FOUND;
    } else if (status === HttpStatus.CONFLICT) {
      code = GrpcStatus.ALREADY_EXISTS;
    }

    return new RpcException({
      code,
      message: Array.isArray(message) ? message.join(', ') : String(message),
    });
  }

  async revokeAppAccess(data: RevokeUserAppDto): Promise<boolean> {
    const app = await this.requireActiveApp(data.accessToken);
    const link = await this.queryBus.execute(
      new FindUserAppByUserIdAndAppIdQuery(data.userId, app.id),
    );
    if (!link) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'User access to this application was not found',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    await this.commandBus.execute(
      new DeleteUserAppCommand(data.userId, app.id),
    );
    return true;
  }

  async login(loginDto: LoginDto, ip: string): Promise<UserDto> {
    const { username, password } = loginDto;
    const user = (await this.queryBus.execute(
      new GetUserByUsernameQuery(username),
    )) as User | null;
    if (!user) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: 'Invalid login credentials',
        },
        HttpStatus.FORBIDDEN,
      );
    }
    if (!User.canAuthenticate(user)) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: 'User account is inactive',
        },
        HttpStatus.FORBIDDEN,
      );
    }
    if (await bcrypt.compare(password, user.password)) {
      const tokenValues = {
        userId: user.id,
        mobile: user.mobile,
        username: user.username,
      };
      const token = this.jwt.signer(tokenValues, 86400 * 30);
      await this.commandBus.execute(
        new CreateUserTokenCommand({
          userId: user.id,
          ip,
          access_token: token,
        }),
      );
      const apps = await this.appsForUser(user.id);
      return this.userMapper.toUserDto(user, token, apps);
    }

    throw new HttpException(
      {
        status: HttpStatus.FORBIDDEN,
        error: 'Invalid login credentials',
      },
      HttpStatus.FORBIDDEN,
    );
  }

  async updatePassword(
    mobile: string,
    updatePasswordDto: UpdatePasswordDto,
  ): Promise<boolean> {
    const { oldPassword, newPassword } = updatePasswordDto;
    const user = (await this.queryBus.execute(
      new GetUserByMobileQuery(mobile),
    )) as User;
    if (!user || !(await bcrypt.compare(oldPassword, user.password))) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: 'Invalid old password',
        },
        HttpStatus.FORBIDDEN,
      );
    }
    const password = await bcrypt.hash(newPassword, 10);
    await this.commandBus.execute(
      new UpdateUserPasswordCommand(password, user.id),
    );
    return true;
  }

  async getDashboard(userId: number, access_token: string): Promise<UserDto> {
    const user = (await this.queryBus.execute(
      new GetUserQuery(userId),
    )) as User | null;
    if (!user) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: 'User not found',
        },
        HttpStatus.FORBIDDEN,
      );
    }
    if (!User.canAuthenticate(user)) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: 'User account is inactive',
        },
        HttpStatus.FORBIDDEN,
      );
    }
    const apps = await this.appsForUser(user.id);
    return this.userMapper.toUserDto(user, access_token, apps);
  }

  async forgetPassword(mobile: string, ip: string): Promise<string | null> {
    const user = (await this.queryBus.execute(
      new GetUserByMobileQuery(mobile),
    )) as User;
    if (!user) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Internal server error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    const code = this.tools.codeCreator();
    const tokenValues = {
      userId: user.id,
      mobile: user.mobile,
      code,
      time: new Date(),
    };
    const token = this.jwt.signer(tokenValues, 60 * 60);
    const smsRq = await this.queryBus.execute(
      new GetOneSmsRqQuery({ mobile: user.mobile, ip }),
    );

    if (smsRq) {
      if (smsRq.sendCount > 4) {
        return smsRq.jwtToken;
      }
      const now = moment(new Date());
      now.diff(moment(smsRq.lastSentTime), 'seconds');
      const sendCount = smsRq.sendCount + 1;
      await this.commandBus.execute(
        new UpdateSmsRqCommand(smsRq.id, {
          mobile: user.mobile,
          ip,
          code,
          jwtToken: token,
          sendCount,
        }),
      );
      await this.tools.sendSmsCode(mobile, code);
      return token;
    }
    await this.commandBus.execute(
      new CreateSmsRqCommand({
        mobile: user.mobile,
        ip,
        code,
        jwtToken: token,
        sendCount: 1,
      }),
    );
    await this.tools.sendSmsCode(mobile, code);
    return token;
  }

  async recoverPassword(
    recoverPasswordDto: RecoverPasswordDto,
    recoverPassToken: string,
    ip: string,
  ): Promise<boolean> {
    const { code, newPassword } = recoverPasswordDto;
    if (!recoverPassToken) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: 'FORBIDDEN_HEARED',
        },
        HttpStatus.FORBIDDEN,
      );
    }
    const tokenValues = this.jwt.verifier(recoverPassToken);
    if (!tokenValues) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: 'FORBIDDEN_token_not_valid',
        },
        HttpStatus.FORBIDDEN,
      );
    }
    const mobile = tokenValues['mobile'];
    const smsRq = await this.queryBus.execute(
      new GetOneSmsRqQuery({ mobile, ip }),
    );
    if (!smsRq || smsRq.code !== code) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: 'Internal server error',
        },
        HttpStatus.FORBIDDEN,
      );
    }
    await this.commandBus.execute(new SoftDeleteCommand(smsRq.id));
    const user = (await this.queryBus.execute(
      new GetUserByMobileQuery(mobile),
    )) as User;
    if (!user) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Internal server error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    if (code !== tokenValues['code']) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_ACCEPTABLE,
          error: 'Invalid verification code',
        },
        HttpStatus.NOT_ACCEPTABLE,
      );
    }
    const password = await bcrypt.hash(newPassword, 10);
    await this.commandBus.execute(
      new UpdateUserPasswordCommand(password, user.id),
    );
    return true;
  }

  async logOut(token: string): Promise<boolean> {
    await this.commandBus.execute(new DeleteUserTokenCommand(token));
    return true;
  }

  async validateUserAppAccess(
    data: ValidateUserAppAccessInterface,
  ): Promise<ValidateUserAppAccessResult> {
    try {
      const { accessToken, access_token } = data;
      if (!accessToken || !access_token) {
        return this.invalidUserAppAccess();
      }

      const app = (await this.queryBus.execute(
        new FindAppByAccessTokenQuery(accessToken),
      )) as App | null;
      if (!app || app.status !== true) {
        return this.invalidUserAppAccess();
      }

      const userToken = (await this.queryBus.execute(
        new FindUserTokenByAccessTokenQuery(access_token),
      )) as UserToken | null;
      if (!userToken) {
        return this.invalidUserAppAccess();
      }

      const tokenValues = this.jwt.verifier(access_token);
      if (!tokenValues) {
        return this.invalidUserAppAccess();
      }

      const { userId } = tokenValues as { userId: number };
      if (!userId || userToken.userId !== userId) {
        return this.invalidUserAppAccess();
      }

      const user = (await this.queryBus.execute(
        new GetUserQuery(userId),
      )) as User | null;
      if (!user || !User.canAuthenticate(user)) {
        return this.invalidUserAppAccess();
      }

      const link = await this.queryBus.execute(
        new FindUserAppByUserIdAndAppIdQuery(user.id, app.id),
      );
      if (!link) {
        return this.invalidUserAppAccess();
      }

      return {
        valid: true,
        id: user.id,
        username: user.username,
        email: user.email,
        mobile: user.mobile,
        firstName: user.firstName ?? '',
        lastName: user.lastName ?? '',
        status: user.status !== false,
      };
    } catch {
      return this.invalidUserAppAccess();
    }
  }

  async updateStatusByUsernameViaApp(
    data: UpdateUserStatusByUsernameInterface,
  ): Promise<UpdateUserStatusByUsernameResult> {
    const username = data?.username?.trim();
    const accessToken = data?.accessToken?.trim();
    if (!username || accessToken == null || accessToken === '') {
      throw new RpcException({
        code: GrpcStatus.INVALID_ARGUMENT,
        message: 'username and accessToken are required',
      });
    }
    if (typeof data.status !== 'boolean') {
      throw new RpcException({
        code: GrpcStatus.INVALID_ARGUMENT,
        message: 'status must be a boolean',
      });
    }

    const app = (await this.queryBus.execute(
      new FindAppByAccessTokenQuery(accessToken),
    )) as App | null;
    if (!app || app.status !== true) {
      throw new RpcException({
        code: GrpcStatus.PERMISSION_DENIED,
        message: 'Invalid or inactive application',
      });
    }

    const user = (await this.queryBus.execute(
      new GetUserByUsernameQuery(username),
    )) as User | null;
    if (!user) {
      throw new RpcException({
        code: GrpcStatus.NOT_FOUND,
        message: 'User not found',
      });
    }

    try {
      await this.commandBus.execute(
        new UpdateUserStatusCommand({ id: user.id, status: data.status }),
      );
    } catch {
      throw new RpcException({
        code: GrpcStatus.INTERNAL,
        message: 'Failed to update user status',
      });
    }

    return { success: true, status: data.status };
  }

  async findAllForAdmin(): Promise<UserDto[]> {
    const rows = (await this.queryBus.execute(
      new FindAllUsersWithAppsQuery(),
    )) as UserWithApps[];
    return rows
      .map((row) =>
        this.userMapper.toUserDto(row, null, (row.apps as App[]) || []),
      )
      .filter((dto): dto is UserDto => dto != null);
  }

  async updateStatus(
    data: UpdateUserStatusInterface,
    admin: any,
  ): Promise<UserDto> {
    const existing = (await this.queryBus.execute(
      new GetUserQuery(data.id),
    )) as User | null;
    if (!existing) {
      this.userNotFound();
    }
    const updated = (await this.commandBus.execute(
      new UpdateUserStatusCommand(data),
    )) as User;
    this.tools.saveLogs({
      adminId: admin.id,
      tableName: 'users',
      rowId: data.id,
      act: DatabaseAct.UPDATE,
      oldData: { status: existing.status },
      newData: { status: data.status },
      description: 'Update user status',
    });
    const apps = await this.appsForUser(updated.id);
    return this.userMapper.toUserDto(updated, null, apps);
  }

  async getUserApps(userId: number): Promise<AppDto[]> {
    const user = (await this.queryBus.execute(
      new GetUserQuery(userId),
    )) as User | null;
    if (!user) {
      this.userNotFound();
    }
    const apps = await this.appsForUser(userId);
    return apps
      .map((app) => this.appMapper.toAppDto(app, ''))
      .filter((dto): dto is AppDto => dto != null);
  }

  async associateApp(
    data: AssociateUserAppInterface,
    admin: any,
  ): Promise<UserDto> {
    const user = (await this.queryBus.execute(
      new GetUserQuery(data.userId),
    )) as User | null;
    if (!user) {
      this.userNotFound();
    }
    if (!User.canGrantAppAccess(user)) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: 'User is inactive',
        },
        HttpStatus.FORBIDDEN,
      );
    }
    const app = (await this.queryBus.execute(
      new FindAppByIdQuery(data.appId),
    )) as App | null;
    if (!app || app.deletedAt != null) {
      this.appNotFound();
    }
    const link = await this.queryBus.execute(
      new FindUserAppByUserIdAndAppIdQuery(data.userId, data.appId),
    );
    if (link) {
      throw new HttpException(
        {
          status: HttpStatus.CONFLICT,
          error: 'User is already associated with this application',
        },
        HttpStatus.CONFLICT,
      );
    }
    await this.commandBus.execute(
      new CreateUserAppCommand({ userId: data.userId, appId: data.appId }),
    );
    this.tools.saveLogs({
      adminId: admin.id,
      tableName: 'user_apps',
      rowId: data.userId,
      act: DatabaseAct.CREATE,
      oldData: null,
      newData: { userId: data.userId, appId: data.appId },
      description: 'Associate user with application',
    });
    const apps = await this.appsForUser(data.userId);
    return this.userMapper.toUserDto(user, null, apps);
  }

  async removeUserApp(
    userId: number,
    appId: number,
    admin: any,
  ): Promise<boolean> {
    const user = (await this.queryBus.execute(
      new GetUserQuery(userId),
    )) as User | null;
    if (!user) {
      this.userNotFound();
    }
    const app = (await this.queryBus.execute(
      new FindAppByIdQuery(appId),
    )) as App | null;
    if (!app) {
      this.appNotFound();
    }
    const link = await this.queryBus.execute(
      new FindUserAppByUserIdAndAppIdQuery(userId, appId),
    );
    if (!link) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'User access to this application was not found',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    await this.commandBus.execute(new DeleteUserAppCommand(userId, appId));
    this.tools.saveLogs({
      adminId: admin.id,
      tableName: 'user_apps',
      rowId: userId,
      act: DatabaseAct.DELETE,
      oldData: { userId, appId },
      newData: null,
      description: 'Remove user application association',
    });
    return true;
  }

  private async ensureUniquePublicKey(): Promise<string> {
    for (let attempt = 0; attempt < 5; attempt++) {
      const publicKey = generateAppAccessToken();
      const existing = await this.queryBus.execute(
        new FindUserTokenByPublicKeyQuery(publicKey),
      );
      if (!existing) {
        return publicKey;
      }
    }
    throw new HttpException(
      {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'Failed to generate a unique public key',
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  async generateAppPublicKey(
    userId: number,
    appId: number,
  ): Promise<AppPublicKeyDto> {
    const user = (await this.queryBus.execute(
      new GetUserQuery(userId),
    )) as User | null;
    if (!user) {
      this.userNotFound();
    }
    if (!User.canAuthenticate(user)) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: 'User account is inactive',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    const app = (await this.queryBus.execute(
      new FindAppByIdQuery(appId),
    )) as App | null;
    if (!app || app.deletedAt != null || app.status !== true) {
      this.appNotFound();
    }

    const link = await this.queryBus.execute(
      new FindUserAppByUserIdAndAppIdQuery(userId, appId),
    );
    if (!link) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: 'User does not have access to this application',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    const publicKey = await this.ensureUniquePublicKey();
    try {
      const updated = await this.commandBus.execute(
        new UpdateUserTokenPublicKeyCommand({
          userId,
          publicKey,
        }),
      );
      if (!updated) {
        throw new HttpException(
          {
            status: HttpStatus.FORBIDDEN,
            error: 'User token not found',
          },
          HttpStatus.FORBIDDEN,
        );
      }
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      if (error?.code === 'P2002') {
        throw new HttpException(
          {
            status: HttpStatus.CONFLICT,
            error: 'Public key collision; please retry',
          },
          HttpStatus.CONFLICT,
        );
      }
      throw error;
    }

    return new AppPublicKeyDto({
      publicKey,
      url: `${app.url}?pk=${publicKey}`,
    });
  }

  /**
   * gRPC GetUserByPublicKey: validate App accessToken, resolve UserToken by publicKey,
   * authorize UserApp, return user identity plus that token's access_token.
   */
  async getUserByPublicKey(
    data: GetUserByPublicKeyInterface,
  ): Promise<GetUserByPublicKeyResult> {
    const accessToken = data?.accessToken?.trim();
    const publicKey = data?.publicKey?.trim();
    if (!accessToken || !publicKey) {
      throw new RpcException({
        code: GrpcStatus.INVALID_ARGUMENT,
        message: 'accessToken and publicKey are required',
      });
    }

    const app = (await this.queryBus.execute(
      new FindAppByAccessTokenQuery(accessToken),
    )) as App | null;
    if (!app || app.status !== true) {
      throw new RpcException({
        code: GrpcStatus.PERMISSION_DENIED,
        message: 'Invalid or inactive application',
      });
    }

    const userToken = (await this.queryBus.execute(
      new FindUserTokenByPublicKeyQuery(publicKey),
    )) as UserToken | null;
    if (!userToken?.access_token) {
      throw new RpcException({
        code: GrpcStatus.NOT_FOUND,
        message: 'Public key not found',
      });
    }

    const tokenValues = this.jwt.verifier(userToken.access_token);
    if (!tokenValues) {
      throw new RpcException({
        code: GrpcStatus.PERMISSION_DENIED,
        message: 'Invalid user token',
      });
    }

    const { userId } = tokenValues as { userId: number };
    if (!userId || userToken.userId !== userId) {
      throw new RpcException({
        code: GrpcStatus.PERMISSION_DENIED,
        message: 'Invalid user token',
      });
    }

    const user = (await this.queryBus.execute(
      new GetUserQuery(userId),
    )) as User | null;
    if (!user) {
      throw new RpcException({
        code: GrpcStatus.NOT_FOUND,
        message: 'User not found',
      });
    }
    if (!User.canAuthenticate(user)) {
      throw new RpcException({
        code: GrpcStatus.PERMISSION_DENIED,
        message: 'User account is inactive',
      });
    }

    const link = await this.queryBus.execute(
      new FindUserAppByUserIdAndAppIdQuery(user.id, app.id),
    );
    if (!link) {
      throw new RpcException({
        code: GrpcStatus.PERMISSION_DENIED,
        message: 'User does not have access to this application',
      });
    }

    // publicKey is single-use: clear after successful validation
    try {
      await this.commandBus.execute(
        new UpdateUserTokenPublicKeyCommand({
          id: userToken.id,
          publicKey: '',
        }),
      );
    } catch {
      throw new RpcException({
        code: GrpcStatus.INTERNAL,
        message: 'Failed to consume public key',
      });
    }

    return {
      success: true,
      id: user.id,
      username: user.username,
      email: user.email,
      mobile: user.mobile,
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      status: user.status !== false,
      access_token: userToken.access_token,
    };
  }
}
