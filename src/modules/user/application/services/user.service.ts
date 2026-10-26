import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
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

import { GetUserByMobileQuery } from '../queries/user/getUserByMobile.query';
import { GetUserByEmailQuery } from '../queries/user/getUserByEmail.query';
import { GetUserByUsernameQuery } from '../queries/user/getUserByUsername.query';
import { GetUserQuery } from '../queries/user/getUser.query';
import { FindUserAppByUserIdAndAppIdQuery } from '../queries/user_app/findByUserIdAndAppId.query';
import { FindAppsByUserIdQuery } from '../queries/user_app/findAppsByUserId.query';
import { FindUserTokenByAccessTokenQuery } from '../queries/user_token/findByAccessToken.query';
import { User } from '../../domain/entities/user.entity';
import { UserToken } from '../../domain/entities/userToken.entity';
import { App } from '../../../app/domain/entities/app.entity';
import { UpdateUserPasswordCommand } from '../commands/user/update/updatePassword.command';
import { CreateUserCommand } from '../commands/user/create/createUser.command';
import { CreateUserAppCommand } from '../commands/user_app/create/createUserApp.command';
import { DeleteUserAppCommand } from '../commands/user_app/delete/deleteUserApp.command';
import { ValidateUserAppAccessInterface } from '../../domain/interfaces/user/ValidateUserAppAccess.interface';

@Injectable()
export class UserService implements UserServiceImpl {
  constructor(
    private readonly userMapper: UserMapper,
    private readonly jwt: Jwt,
    private readonly tools: Tools,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

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

  async create(data: CreateUserDto): Promise<UserDto> {
    const app = await this.requireActiveApp(data.accessToken);
    const existing = await this.resolveExistingUser({
      mobile: data.mobile,
      email: data.email,
      username: data.username,
    });

    let user: User;
    if (existing) {
      if (existing.deletedAt != null) {
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
    const { mobile, password } = loginDto;
    const user = (await this.queryBus.execute(
      new GetUserByMobileQuery(mobile),
    )) as User;
    if (!user) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: 'Invalid login credentials',
        },
        HttpStatus.FORBIDDEN,
      );
    }
    if (await bcrypt.compare(password, user.password)) {
      const tokenValues = {
        userId: user.id,
        mobile: user.mobile,
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
    )) as User;
    if (!user) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: 'User not found',
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
  ): Promise<boolean> {
    try {
      const { accessToken, access_token } = data;
      if (!accessToken || !access_token) {
        return false;
      }

      const app = (await this.queryBus.execute(
        new FindAppByAccessTokenQuery(accessToken),
      )) as App | null;
      if (!app || app.status !== true) {
        return false;
      }

      const userToken = (await this.queryBus.execute(
        new FindUserTokenByAccessTokenQuery(access_token),
      )) as UserToken | null;
      if (!userToken) {
        return false;
      }

      const tokenValues = this.jwt.verifier(access_token);
      if (!tokenValues) {
        return false;
      }

      const { userId } = tokenValues as { userId: number };
      if (!userId || userToken.userId !== userId) {
        return false;
      }

      const user = (await this.queryBus.execute(
        new GetUserQuery(userId),
      )) as User | null;
      if (!user) {
        return false;
      }

      const link = await this.queryBus.execute(
        new FindUserAppByUserIdAndAppIdQuery(user.id, app.id),
      );
      return !!link;
    } catch {
      return false;
    }
  }
}
