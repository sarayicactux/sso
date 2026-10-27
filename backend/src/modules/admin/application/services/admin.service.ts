import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AdminServiceImpl } from '../../domain/services/admin.service';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import * as bcrypt from 'bcryptjs';
import moment from 'moment';

import {
  LoginDto,
  RecoverPasswordDto,
  UpdatePasswordDto,
  AdminDto,
} from '../../presentation/dtos/admin.dto';

import { AdminMapper } from '../../infrastructure/mappers/admin.mapper';
import { Jwt } from '../../../../shared/helpers/jwt.helper';
import { Tools } from '../../../../shared/helpers/tools.helper';

import { CreateAdminTokenCommand } from '../commands/admin_token/create/create.command';
import { DeleteAdminTokenCommand } from '../commands/admin_token/delete/delete.command';
import { CreateSmsRqCommand } from '../commands/sms_rq/create/create.command';
import { UpdateSmsRqCommand } from '../commands/sms_rq/update/update.command';
import { SoftDeleteCommand } from '../commands/sms_rq/delete/softDelete.command';
import { GetOneSmsRqQuery } from '../queries/sms_rq/getOne.query';

import { GetAdminByMobileQuery } from '../queries/admin/GetAdminByMobile.query';
import { GetAdminByUsernameQuery } from '../queries/admin/getAdminByUsername.query';
import { Admin } from '../../domain/entities/admin.entity';
import { UpdatePasswordCommand } from '../commands/admin/update/updatePassword.command';
import { CreateAdminCommand } from '../commands/admin/create/createAdmin.command';

@Injectable()
export class AdminService implements AdminServiceImpl {
  constructor(
    private readonly adminMapper: AdminMapper,
    private readonly jwt: Jwt,
    private readonly tools: Tools,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async login(loginDto: LoginDto, ip: string): Promise<AdminDto> {
    const { username, password } = loginDto;
    const admin = (await this.queryBus.execute(
      new GetAdminByUsernameQuery(username),
    )) as Admin;
    if (!admin) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: 'اطلاعات ورود نا معتبر است',
        },
        HttpStatus.FORBIDDEN,
      );
    }
    if (await bcrypt.compare(password, admin.password)) {
      const tokenValues = {
        adminId: admin.id,
        mobile: admin.mobile,
        username: admin.username,
      };
      const token = this.jwt.signer(tokenValues, 86400 * 30);
      await this.commandBus.execute(
        new CreateAdminTokenCommand({
          adminId: admin.id,
          ip,
          access_token: token,
        }),
      );
      return this.adminMapper.toAdminDto(admin, token);
    }
    throw new HttpException(
      {
        status: HttpStatus.FORBIDDEN,
        error: 'اطلاعات ورود نا معتبر است',
      },
      HttpStatus.FORBIDDEN,
    );
  }

  async updatePassword(
    mobile: string,
    updatePasswordDto: UpdatePasswordDto,
  ): Promise<boolean> {
    const { oldPassword, newPassword } = updatePasswordDto;
    const admin = (await this.queryBus.execute(
      new GetAdminByMobileQuery(mobile),
    )) as Admin;
    if (!admin || !(await bcrypt.compare(oldPassword, admin.password))) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: 'رمز عبور قدیمی نا معتبر است',
        },
        HttpStatus.FORBIDDEN,
      );
    }
    const password = await bcrypt.hash(newPassword, 10);
    await this.commandBus.execute(
      new UpdatePasswordCommand(password, admin.id),
    );
    return true;
  }

  async forgetPassword(mobile: string, ip: string): Promise<string | null> {
    const admin = (await this.queryBus.execute(
      new GetAdminByMobileQuery(mobile),
    )) as Admin;
    if (!admin) {
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
      adminId: admin.id,
      mobile: admin.mobile,
      code,
      time: new Date(),
    };
    const token = this.jwt.signer(tokenValues, 60 * 60);
    const smsRq = await this.queryBus.execute(
      new GetOneSmsRqQuery({ mobile: admin.mobile, ip }),
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
          mobile: admin.mobile,
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
        mobile: admin.mobile,
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
    const admin = (await this.queryBus.execute(
      new GetAdminByMobileQuery(mobile),
    )) as Admin;
    if (!admin) {
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
    await this.commandBus.execute(
      new UpdatePasswordCommand(password, admin.id),
    );
    return true;
  }

  async logOut(token: string): Promise<boolean> {
    await this.commandBus.execute(new DeleteAdminTokenCommand(token));
    return true;
  }

  async seeder() {
    if (
      !(await this.queryBus.execute(
        new GetAdminByMobileQuery(process.env.MOBILE),
      ))
    ) {
      await this.commandBus.execute(
        new CreateAdminCommand({
          username: process.env.USERNAME,
          email: process.env.EMAIL,
          mobile: process.env.MOBILE,
          firstName: process.env.FIRST_NAME,
          lastName: process.env.LAST_NAME,
          password: await bcrypt.hash(process.env.PASSWORD, 10),
        }),
      );
    }
  }
}
