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
  Delete,
} from '@nestjs/common';
import { UserControllerImpl } from '../../domain/controllers/user.controller.interface';
import { UserService } from '../../application/services/user.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiHeader,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import {
  LoginDto,
  RecoverPasswordDto,
  UpdatePasswordDto,
  CreateUserDto,
  RevokeUserAppDto,
  UserDto,
} from '../dtos/user.dto';

import { MobilePipe } from '../../../../shared/pipes/mobile.pipe';
import { IpAddress } from '../../../../shared/decorators/ipaddress.decorator';
import { CodePipe } from '../../../../shared/pipes/code.pipe';
import { User } from '../../../../shared/decorators/user.decorator';
import { Admin } from '../../../../shared/decorators/admin.decorator';

@Controller('users')
export class UserController implements UserControllerImpl {
  constructor(private readonly userService: UserService) {}
  // create new user or grant access to an existing user
  @ApiOperation({
    summary: 'Create user or grant app access',
    operationId: 'userCreate',
    description: 'this operation is public',
    tags: ['user'],
  })
  @ApiOkResponse({ description: 'user create/grant successful', type: UserDto })
  @ApiBody({ type: CreateUserDto })
  @Post()
  @HttpCode(HttpStatus.OK)
  async create(@Body() createUserDto: CreateUserDto): Promise<UserDto> {
    return this.userService.create(createUserDto);
  }

  // revoke user access to an app
  @ApiOperation({
    summary: 'Revoke user access to an app',
    operationId: 'userRevokeApp',
    description: 'this operation is public',
    tags: ['user'],
  })
  @ApiOkResponse({ description: 'revoke successful', type: Boolean })
  @ApiNotFoundResponse({ description: 'user app link not found' })
  @ApiBody({ type: RevokeUserAppDto })
  @Delete('apps')
  @HttpCode(HttpStatus.OK)
  async revokeAppAccess(
    @Body() revokeDto: RevokeUserAppDto,
    @Admin({ operationId: 'createApp' }) admin,
  ): Promise<boolean> {
    void admin;
    return this.userService.revokeAppAccess(revokeDto);
  }

  // login user
  @ApiOperation({
    summary: 'User login',
    operationId: 'userLogin',
    description: 'this operation is public',
    tags: ['user'],
  })
  @ApiOkResponse({ description: 'user login successful', type: UserDto })
  @ApiBody({ type: LoginDto })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @IpAddress() ip: string,
  ): Promise<UserDto> {
    return this.userService.login(loginDto, ip);
  }

  // user dashboard
  @ApiOperation({
    summary: 'User dashboard',
    operationId: 'userDashboard',
    description: 'this operation is public',
    tags: ['user'],
  })
  @ApiHeader({
    name: 'authorization Bearer ',
    description: 'this token recieved in login',
  })
  @ApiOkResponse({ description: 'get user info successful', type: UserDto })
  @ApiBearerAuth()
  @Get('dash')
  @HttpCode(HttpStatus.OK)
  async dash(
    @User({ operationId: 'userDashboard' }) user: UserDto,
  ): Promise<UserDto> {
    return this.userService.getDashboard(user.id, user.access_token);
  }
  // log out user
  @ApiOkResponse({ description: 'logOut', type: Boolean })
  @ApiOperation({
    summary: 'User logout',
    operationId: 'userLogOut',
    description: 'this operation is public',
    tags: ['user'],
  })
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @Get('logOut')
  async logOut(
    @User({ operationId: 'userLogOut' }) user: UserDto,
  ): Promise<boolean> {
    await this.userService.logOut(user.access_token);
    return true;
  }
  // update user password
  @ApiOperation({
    summary: 'Update user password',
    operationId: 'userUpdatePassword',
    description: 'this operation is public',
    tags: ['user'],
  })
  @ApiOkResponse({ description: 'update password', type: Boolean })
  @ApiBody({ type: UpdatePasswordDto })
  @ApiBearerAuth()
  @Put('updatePassword')
  @HttpCode(HttpStatus.OK)
  async updatePassword(
    @User({ operationId: 'userUpdatePassword' }) user: UserDto,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    await this.userService.updatePassword(user.mobile, updatePasswordDto);
    return true;
  }
  // forget password
  @ApiOkResponse({
    description: 'user forget password',
    type: [String],
  })
  @ApiOperation({
    summary: 'Forgot password — request recovery code',
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
    },
  })
  @UsePipes(new MobilePipe())
  @Put('forgetPass')
  @HttpCode(HttpStatus.OK)
  async forgetPassword(
    @Body() body: { mobile: string },
    @IpAddress() ip: string,
  ): Promise<any> {
    const { mobile } = body;
    const recoverPassToken = await this.userService.forgetPassword(mobile, ip);
    return { recoverPassToken };
  }
  // recover password
  @ApiOkResponse({ description: 'user recover password', type: Boolean })
  @ApiOperation({
    summary: 'Forgot password — recover with code',
    operationId: 'userRecoverPassword',
    description: 'this operation is public',
    tags: ['user'],
  })
  @ApiHeader({
    name: 'recover_pass_token',
    description: 'this token recieved in forgetPassword',
  })
  @ApiBody({ type: RecoverPasswordDto })
  @UsePipes(new CodePipe())
  @Patch('recoverPass')
  @HttpCode(HttpStatus.OK)
  async recoverPassword(
    @Headers() headers,
    @Body() recoverPass: RecoverPasswordDto,
    @IpAddress() ip: string,
  ): Promise<boolean> {
    const { recover_pass_token } = headers;
    return this.userService.recoverPassword(
      recoverPass,
      recover_pass_token,
      ip,
    );
  }
}
