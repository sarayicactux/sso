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
import { UserService } from '../../application/services/user.service';
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
  RegisterDto,
  UpdatePasswordDto,
  UserDto,
  UpdateUserStatusDto,
} from '../dtos/user.dto';
import { User } from '../../../../shared/decorators/user.decorator';

//shared
import { MobilePipe } from '../../../../shared/pipes/mobile.pipe';
import { IpAddress } from '../../../../shared/decorators/ipaddress.decorator';
import { CodePipe } from '../../../../shared/pipes/code.pipe';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // login ************************************
  @ApiOperation({
    summary: ' ورود کاربران  ',
    operationId: 'userLogin',
    description: 'this operation is public',
    tags: ['user'],
  })
  @ApiOkResponse({
    description: 'user login successful',
    type: UserDto,
  })
  @ApiNotFoundResponse({ description: 'user not found' })
  @ApiInternalServerErrorResponse({
    description: 'login faild',
  })
  @ApiBody({
    type: LoginDto,
    description: 'login user DTO',
  })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @IpAddress() ip: string,
  ): Promise<UserDto> {
    try {
      return await this.userService.login(loginDto, ip);
    } catch (err) {
      throw err;
    }
  }

  // create ********************************************************
  @ApiOperation({
    summary: ' ثبت کاربر جدید ',
    operationId: 'userCreateUser',
    description: 'this operation is public',
    tags: ['user'],
  })
  @ApiOkResponse({
    description: '  اطلاعات کاربر  ',
    type: UserDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'create user faild',
  })
  @ApiBody({
    type: RegisterDto,
    description: 'create new user DTO',
  })
  @UsePipes(new MobilePipe())
  @Post('')
  @ApiBearerAuth()
  async create(
    @Body() registerDto: RegisterDto,
    @User({ operationId: 'userDashboard', roleCheck: true }) user: UserDto,
  ): Promise<UserDto> {
    try {
      return await this.userService.register(user.id, registerDto);
    } catch (err) {
      throw err;
    }
  }
  // dashboard ************************************
  @ApiOperation({
    summary: ' داشبورد کاربر ',
    operationId: 'userDashboard',
    description: 'this operation is public',
    tags: ['user'],
  })
  @ApiHeader({
    name: 'authorization Bearer ',
    description: 'this token recieved in login',
  })
  @ApiOkResponse({
    description: 'get User info successful',
    type: UserDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'get User info faild',
  })
  @ApiBearerAuth()
  @Get('dash')
  @HttpCode(HttpStatus.OK)
  async dash(
    @User({ operationId: 'userDashboard', roleCheck: false }) user: UserDto,
  ): Promise<UserDto> {
    return user;
  }
  // logOut user ********************************************************
  @ApiOkResponse({
    description: 'logOut',
    type: Boolean,
  })
  @ApiOperation({
    summary: ' خروج کاربر ',
    operationId: 'userLogOut',
    description: 'this operation is public',
    tags: ['user'],
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
    @User({ operationId: 'userLogOut', roleCheck: false }) user: UserDto,
  ): Promise<boolean> {
    try {
      await this.userService.logOut(user.access_token);
      return true;
    } catch (err) {
      throw err;
    }
  }
  // updatePassword ************************************
  @ApiOperation({
    summary: ' به روز رسانی رمز کاربر  ',
    operationId: 'userUpdatePassword',
    description: 'this operation is public',
    tags: ['user'],
  })
  @ApiOkResponse({
    description: 'update password',
    type: Boolean,
  })
  @ApiBody({
    type: UpdatePasswordDto,
    description: 'update user password',
  })
  @ApiHeader({
    name: 'authorization Bearer ',
    description: 'this token recieved in login',
  })
  @ApiBearerAuth()
  @Put('updatePassword')
  @HttpCode(HttpStatus.OK)
  async updatePassword(
    @User({ operationId: 'userUpdatePassword', roleCheck: false })
    user: UserDto,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    try {
      await this.userService.updatePassword(user.mobile, updatePasswordDto);
      return true;
    } catch (err) {
      throw err;
    }
  }

  // updateStatus ************************************
  @ApiOperation({
    summary: ' به روز رسانی وضعیت کاربر  ',
    operationId: 'userUpdateStatus',
    description: 'this operation protected by RBAC',
    tags: ['user'],
  })
  @ApiOkResponse({
    description: 'update status',
    type: Boolean,
  })
  @ApiBody({
    type: UpdateUserStatusDto,
    description: 'update user status',
  })
  @ApiHeader({
    name: 'authorization Bearer ',
    description: 'this token recieved in login',
  })
  @ApiBearerAuth()
  @Put('updateStatus')
  @HttpCode(HttpStatus.OK)
  async updateStatus(
    @User({ operationId: 'userUpdateStatus', roleCheck: true }) user: UserDto,
    @Body() updateUserStatusDto: UpdateUserStatusDto,
  ) {
    try {
      await this.userService.updateStatus(
        user.id,
        updateUserStatusDto.id,
        updateUserStatusDto.status,
      );
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
    @IpAddress() ip: string,
    @Body() body: { mobile: string },
  ): Promise<any> {
    try {
      const { mobile } = body;
      const recoverPassToken = await this.userService.forgetPassword(
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
    type: UserDto,
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
      return this.userService.recoverPassword(
        recoverPass,
        recover_pass_token,
        ip,
      );
      // return (global as any).allRoutes;
    } catch (err) {
      throw err;
    }
  }
}
