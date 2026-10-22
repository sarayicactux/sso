import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Put,
  UsePipes,
  Patch,
  Headers,
} from '@nestjs/common';
import { AdminControllerImpl } from '../../domain/controllers/admin.controller.interface';
import { AdminService } from '../../application/services/admin.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiHeader,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import {
  LoginDto,
  RecoverPasswordDto,
  UpdatePasswordDto,
  AdminDto,
} from '../dtos/admin.dto';

//shared
import { MobilePipe } from '../../../../shared/pipes/mobile.pipe';
import { IpAddress } from '../../../../shared/decorators/ipaddress.decorator';
import { CodePipe } from '../../../../shared/pipes/code.pipe';
import { Admin } from '../../../../shared/decorators/admin.decorator';

@Controller('admins')
export class AdminController implements AdminControllerImpl {
  constructor(private readonly adminService: AdminService) {}

  // login ************************************
  @ApiOperation({
    summary: ' ورود مدیر  ',
    operationId: 'adminLogin',
    description: 'this operation is public',
    tags: ['admin'],
  })
  @ApiOkResponse({
    description: 'admin login successful',
    type: AdminDto,
  })
  @ApiNotFoundResponse({ description: 'admin not found' })
  @ApiInternalServerErrorResponse({
    description: 'login faild',
  })
  @ApiBody({
    type: LoginDto,
    description: 'login admin DTO',
  })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @IpAddress() ip: string,
  ): Promise<AdminDto> {
    try {
      return await this.adminService.login(loginDto, ip);
    } catch (err) {
      throw err;
    }
  }

  // dashboard ************************************
  @ApiOperation({
    summary: ' داشبورد مدیر ',
    operationId: 'adminDashboard',
    description: 'this operation is public',
    tags: ['admin'],
  })
  @ApiHeader({
    name: 'authorization Bearer ',
    description: 'this token recieved in login',
  })
  @ApiOkResponse({
    description: 'get Admin info successful',
    type: AdminDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'get Admin info faild',
  })
  @ApiBearerAuth()
  @Get('dash')
  @HttpCode(HttpStatus.OK)
  async dash(
    @Admin({ operationId: 'adminDashboard' }) user: AdminDto,
  ): Promise<AdminDto> {
    return user;
  }
  // logOut user ********************************************************
  @ApiOkResponse({
    description: 'logOut',
    type: Boolean,
  })
  @ApiOperation({
    summary: ' خروج مدیر ',
    operationId: 'adminLogOut',
    description: 'this operation is public',
    tags: ['admin'],
  })
  @ApiHeader({
    name: 'authorization Bearer ',
    description: 'this token recieved in login',
  })
  @ApiNotFoundResponse({ description: 'unitUser not found' })
  @ApiInternalServerErrorResponse({
    description: 'logout faild',
  })
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @Get('logOut')
  async logOut(
    @Admin({ operationId: 'adminLogOut' }) user: AdminDto,
  ): Promise<boolean> {
    try {
      await this.adminService.logOut(user.access_token);
      return true;
    } catch (err) {
      throw err;
    }
  }
  // updatePassword ************************************
  @ApiOperation({
    summary: ' به روز رسانی رمز مدیر  ',
    operationId: 'adminUpdatePassword',
    description: 'this operation is public',
    tags: ['admin'],
  })
  @ApiOkResponse({
    description: 'update password',
    type: Boolean,
  })
  @ApiBody({
    type: UpdatePasswordDto,
    description: 'update admin password',
  })
  @ApiHeader({
    name: 'authorization Bearer ',
    description: 'this token recieved in login',
  })
  @ApiBearerAuth()
  @Put('updatePassword')
  @HttpCode(HttpStatus.OK)
  async updatePassword(
    @Admin({ operationId: 'adminUpdatePassword' })
    user: AdminDto,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    try {
      await this.adminService.updatePassword(user.mobile, updatePasswordDto);
      return true;
    } catch (err) {
      throw err;
    }
  }

  // forgetPassword ************************************
  @ApiOkResponse({
    description: 'user forget password',
    type: [String],
  })
  @ApiOperation({
    summary: ' مرحله اول فراموش رمز عبور ',
    operationId: 'userForgetPassword',
    description: 'this operation is public',
    tags: ['user'],
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        mobile: { type: 'string' },
      },
      description: 'update user password',
    },
  })
  @ApiNotFoundResponse({ description: 'user not found' })
  @ApiInternalServerErrorResponse({
    description: 'recovery faild',
  })
  @UsePipes(new MobilePipe())
  @Put('forgetPass')
  @HttpCode(HttpStatus.OK)
  async forgetPassword(
    @Body() body: { mobile: string },
    @IpAddress() ip: string,
  ): Promise<any> {
    try {
      const { mobile } = body;
      const recoverPassToken = await this.adminService.forgetPassword(
        mobile,
        ip,
      );
      return { recoverPassToken };
    } catch (err) {
      throw err;
    }
  }
  // recover Password ************************************
  @ApiOkResponse({
    description: 'user recover password',
    type: AdminDto,
  })
  @ApiOperation({
    summary: ' مرحله دوم فراموش رمز عبور ',
    operationId: 'userRecoverPassword',
    description: 'this operation is public',
    tags: ['user'],
  })
  @ApiNotFoundResponse({ description: 'user not found' })
  @ApiInternalServerErrorResponse({
    description: 'recovery faild',
  })
  @ApiHeader({
    name: 'recover_pass_token',
    description: 'this token recieved in forgetPassword',
  })
  @ApiBody({
    type: RecoverPasswordDto,
    description: 'recover user password DTO',
  })
  @UsePipes(new CodePipe())
  @Patch('recoverPass')
  @HttpCode(HttpStatus.OK)
  async recoverPassword(
    @Headers() headers,
    @Body() recoverPass: RecoverPasswordDto,
    @IpAddress() ip: string,
  ): Promise<boolean> {
    try {
      const { recover_pass_token } = headers;
      return this.adminService.recoverPassword(
        recoverPass,
        recover_pass_token,
        ip,
      );
    } catch (err) {
      throw err;
    }
  }
}
