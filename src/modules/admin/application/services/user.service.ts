import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserUseCase } from '../../domain/service/admin.service';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import * as bcrypt from 'bcryptjs';
import moment from 'moment';

//DTOs
import {
  LoginDto,
  RecoverPasswordDto,
  RegisterDto,
  UpdatePasswordDto,
  UserDto,
} from '../../presentation/dtos/user.dto';

// mappers
import { UserMapper } from '../../infrastructure/mappers/user.mapper';

//helpers
import { Jwt } from '../../../../shared/helpers/jwt.helper';
import { Tools } from '../../../../shared/helpers/tools.helper';

// commands
import { CreateUserCommand } from '../commands/user/create/createUser.command';
import { CreateUserTokenCommand } from '../commands/user_token/create/create.command';
import { UpdatePasswordCommand } from '../commands/user/update/updatePassword.command';
import { DeleteUserTokenCommand } from '../commands/user_token/delete/delete.command';
import { CreateSmsRqCommand } from '../commands/sms_rq/create/create.command';
import { UpdateSmsRqCommand } from '../commands/sms_rq/update/update.command';
import { SoftDeleteCommand } from '../commands/sms_rq/delete/softDelete.command';
import { GetOneSmsRqQuery } from '../queries/sms_rq/getOne.query';
import { UpdateUserStatusCommand } from '../commands/user/update/updateStatus.command';

//queries
import { GetUserByMobileQuery } from '../queries/user/getUserByMobile.query';
import { GetUserByUsernameQuery } from '../queries/user/getUserByUsername.query';
import { GetUserByEmailQuery } from '../queries/user/getUserByEmail.query';
import { GetUserQuery } from '../queries/user/getUser.query';

//entities
import { User } from '../../domain/entities/admin.entity';

//enums
import { UserStatus } from '../../domain/enums/userStatus.enum';
import { CreateRoleCommand } from '../commands/role/create/create.command';
import { GetOneQuery } from '../queries/role/getOne.query';
import { DatabaseAct } from '../../../../shared/enums/databaseAct.enum';

@Injectable()
export class UserService implements UserUseCase {
  constructor(
    private readonly userMapper: UserMapper,
    private readonly jwt: Jwt,
    private readonly tools: Tools,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}
  async register(adminId, registerDto: RegisterDto): Promise<UserDto | null> {
    const { username, mobile, email, password } = registerDto;

    if (await this.queryBus.execute(new GetUserByMobileQuery(mobile))) {
      throw new HttpException(
        {
          status: HttpStatus.CONFLICT,
          error: 'شماره موبایل تکراری است',
        },
        HttpStatus.CONFLICT,
      );
    }

    if (await this.queryBus.execute(new GetUserByUsernameQuery(username))) {
      throw new HttpException(
        {
          status: HttpStatus.CONFLICT,
          error: 'نام کاربری تکراری است',
        },
        HttpStatus.CONFLICT,
      );
    }

    if (await this.queryBus.execute(new GetUserByEmailQuery(email))) {
      throw new HttpException(
        {
          status: HttpStatus.CONFLICT,
          error: 'ایمیل  تکراری است',
        },
        HttpStatus.CONFLICT,
      );
    }
    registerDto.password = await bcrypt.hash(registerDto.password, 10);

    const newUser = await this.commandBus.execute(
      new CreateUserCommand(registerDto),
    );
    if (newUser) {
      this.tools.saveLogs({
        adminId,
        tableName: 'users',
        rowId: newUser.id,
        act: DatabaseAct.CREATE,
        oldData: null,
        newData: newUser,
        description: 'ایجاد کاربر جدید',
      });
    }

    return this.userMapper.userObject(newUser, null);
  }

  async login(loginDto: LoginDto, ip: string): Promise<UserDto> {
    const { fireBaseToken, mobile, password } = loginDto;
    const user = (await this.queryBus.execute(
      new GetUserByMobileQuery(mobile),
    )) as User;
    if (!user || user.isActive !== UserStatus.Active) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: 'اطلاعات ورود نا معتبر است',
        },
        HttpStatus.FORBIDDEN,
      );
    }
    if (await bcrypt.compare(password, user.password)) {
      const tokenValues = {
        adminId: user.id,
        mobile: user.mobile,
      };
      const token = this.jwt.signer(tokenValues, 86400 * 30);
      await this.commandBus.execute(
        new CreateUserTokenCommand({
          adminId: user.id,
          ip,
          access_token: token,
          fireBaseToken,
        }),
      );
      return this.userMapper.userObject(user, token);
    } else {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: 'اطلاعات ورود نا معتبر است',
        },
        HttpStatus.FORBIDDEN,
      );
    }
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
          error: 'رمز عبور قدیمی نا معتبر است',
        },
        HttpStatus.FORBIDDEN,
      );
    }
    const password = await bcrypt.hash(newPassword, 10);
    await this.commandBus.execute(new UpdatePasswordCommand(password, user.id));
    return true;
  }

  async forgetPassword(mobile: string, ip: string): Promise<string | null> {
    const user = (await this.queryBus.execute(
      new GetUserByMobileQuery(mobile),
    )) as User;
    if (!user) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: ' خطای داخلی سرور ',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    const code = this.tools.codeCreator();
    const tokenValues = {
      adminId: user.id,
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
      const secondsDiff = now.diff(moment(smsRq.lastSentTime), 'seconds');
      if (secondsDiff < 120) {
        //return smsRq.jwtToken;
      }
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
          error: ' خطای داخلی سرور ',
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
          error: ' خطای داخلی سرور ',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    if (code !== tokenValues['code']) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_ACCEPTABLE,
          error: 'کد ارسال نا معتبر است',
        },
        HttpStatus.NOT_ACCEPTABLE,
      );
    }
    const password = await bcrypt.hash(newPassword, 10);
    await this.commandBus.execute(new UpdatePasswordCommand(password, user.id));
    return true;
  }

  async logOut(token: string): Promise<boolean> {
    await this.commandBus.execute(new DeleteUserTokenCommand(token));
    return true;
  }

  async updateStatus(
    adminId: number,
    id: number,
    status: UserStatus,
  ): Promise<boolean> {
    const user = await this.queryBus.execute(new GetUserQuery(id));
    if (!user) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'کاربر پیدا نشد',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    this.tools.saveLogs({
      adminId,
      tableName: 'users',
      rowId: user.id,
      act: DatabaseAct.CREATE,
      oldData: user,
      newData: { ...user, status },
      description: 'ایجاد کاربر جدید',
    });
    return this.commandBus.execute(new UpdateUserStatusCommand(id, status));
  }
  async seeder() {
    let role = await this.queryBus.execute(new GetOneQuery(1));
    if (!role) {
      role = await this.commandBus.execute(
        new CreateRoleCommand({
          name: 'راهبر سیستم',
          description: 'راهبر سیستم',
        }),
      );
    }
    if (
      !(await this.queryBus.execute(
        new GetUserByMobileQuery(process.env.MOBILE),
      ))
    ) {
      await this.commandBus.execute(
        new CreateUserCommand({
          username: process.env.USERNAME,
          email: process.env.EMAIL,
          mobile: process.env.MOBILE,
          firstName: process.env.FIRST_NAME,
          lastName: process.env.LAST_NAME,
          password: await bcrypt.hash(process.env.PASSWORD, 10),
          roleId: +process.env.ROLE_ID,
        }),
      );
    }
    return;
  }
}
