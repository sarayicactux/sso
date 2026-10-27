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
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { UserControllerImpl } from '../../domain/controllers/user.controller.interface';
import { UserService } from '../../application/services/user.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiForbiddenResponse,
  ApiHeader,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  LoginDto,
  RecoverPasswordDto,
  UpdatePasswordDto,
  CreateUserDto,
  RevokeUserAppDto,
  UpdateUserStatusDto,
  AssociateUserAppDto,
  AppPublicKeyDto,
  UserDto,
} from '../dtos/user.dto';
import { AppDto } from '../../../app/presentation/dtos/app.dto';

import { MobilePipe } from '../../../../shared/pipes/mobile.pipe';
import { IpAddress } from '../../../../shared/decorators/ipaddress.decorator';
import { CodePipe } from '../../../../shared/pipes/code.pipe';
import { User } from '../../../../shared/decorators/user.decorator';
import { Admin } from '../../../../shared/decorators/admin.decorator';

@ApiTags('users')
@Controller('users')
export class UserController implements UserControllerImpl {
  constructor(private readonly userService: UserService) {}

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

  @ApiOperation({
    summary: 'List users (admin)',
    operationId: 'findAllUsers',
    description: 'Admin-only list of users with associated applications',
    tags: ['user'],
  })
  @ApiOkResponse({ type: [UserDto] })
  @ApiBearerAuth()
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Admin({ operationId: 'findAllUsers' }) admin,
  ): Promise<UserDto[]> {
    void admin;
    return this.userService.findAllForAdmin();
  }

  @ApiOperation({
    summary: 'Update user status (admin)',
    operationId: 'updateUserStatus',
    description: 'Activate or deactivate a user',
    tags: ['user'],
  })
  @ApiOkResponse({ type: UserDto })
  @ApiBody({ type: UpdateUserStatusDto })
  @ApiBearerAuth()
  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateUserStatusDto,
    @Admin({ operationId: 'updateUserStatus' }) admin,
  ): Promise<UserDto> {
    return this.userService.updateStatus({ id, status: body.status }, admin);
  }

  @ApiOperation({
    summary: 'List applications for a user (admin)',
    operationId: 'findUserApps',
    description: 'Admin-only list of apps associated with a user',
    tags: ['user'],
  })
  @ApiOkResponse({ type: [AppDto] })
  @ApiBearerAuth()
  @Get(':id/apps')
  @HttpCode(HttpStatus.OK)
  async getUserApps(
    @Param('id', ParseIntPipe) id: number,
    @Admin({ operationId: 'findUserApps' }) admin,
  ): Promise<AppDto[]> {
    void admin;
    return this.userService.getUserApps(id);
  }

  @ApiOperation({
    summary: 'Revoke user access to an app',
    operationId: 'userRevokeApp',
    description: 'Revoke via app accessToken (admin-authenticated)',
    tags: ['user'],
  })
  @ApiOkResponse({ description: 'revoke successful', type: Boolean })
  @ApiNotFoundResponse({ description: 'user app link not found' })
  @ApiBody({ type: RevokeUserAppDto })
  @ApiBearerAuth()
  @Delete('apps')
  @HttpCode(HttpStatus.OK)
  async revokeAppAccess(
    @Body() revokeDto: RevokeUserAppDto,
    @Admin({ operationId: 'userRevokeApp' }) admin,
  ): Promise<boolean> {
    void admin;
    return this.userService.revokeAppAccess(revokeDto);
  }

  @ApiOperation({
    summary: 'Associate application with user (admin)',
    operationId: 'associateUserApp',
    description: 'Link an existing application to a user',
    tags: ['user'],
  })
  @ApiOkResponse({ type: UserDto })
  @ApiBody({ type: AssociateUserAppDto })
  @ApiBearerAuth()
  @Post(':id/apps')
  @HttpCode(HttpStatus.OK)
  async associateApp(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: AssociateUserAppDto,
    @Admin({ operationId: 'associateUserApp' }) admin,
  ): Promise<UserDto> {
    return this.userService.associateApp(
      { userId: id, appId: body.appId },
      admin,
    );
  }

  @ApiOperation({
    summary: 'Remove application association (admin)',
    operationId: 'removeUserApp',
    description: 'Unlink an application from a user without deleting either',
    tags: ['user'],
  })
  @ApiOkResponse({ type: Boolean })
  @ApiNotFoundResponse({ description: 'user app link not found' })
  @ApiBearerAuth()
  @Delete(':id/apps/:appId')
  @HttpCode(HttpStatus.OK)
  async removeUserApp(
    @Param('id', ParseIntPipe) id: number,
    @Param('appId', ParseIntPipe) appId: number,
    @Admin({ operationId: 'removeUserApp' }) admin,
  ): Promise<boolean> {
    return this.userService.removeUserApp(id, appId, admin);
  }

  @ApiOperation({
    summary: 'Generate application public key URL',
    operationId: 'userGenerateAppPublicKey',
    description:
      'Generate a unique publicKey for the current user token and return the application URL with ?pk=',
    tags: ['user'],
  })
  @ApiOkResponse({
    description: 'public key and application URL generated',
    type: AppPublicKeyDto,
  })
  @ApiNotFoundResponse({ description: 'application not found or inactive' })
  @ApiForbiddenResponse({
    description: 'unauthenticated, inactive user, or no access to application',
  })
  @ApiBearerAuth()
  @Post('apps/:appId/publicKey')
  @HttpCode(HttpStatus.OK)
  async generateAppPublicKey(
    @User({ operationId: 'userGenerateAppPublicKey' }) user: UserDto,
    @Param('appId', ParseIntPipe) appId: number,
  ): Promise<AppPublicKeyDto> {
    return this.userService.generateAppPublicKey(user.id, appId);
  }

  @ApiOperation({
    summary: 'User login',
    operationId: 'userLogin',
    description: 'Authenticate with username and password',
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

  @ApiOperation({
    summary: 'User dashboard',
    operationId: 'userDashboard',
    description: 'Authenticated user profile and apps',
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

  @ApiOkResponse({ description: 'logOut', type: Boolean })
  @ApiOperation({
    summary: 'User logout',
    operationId: 'userLogOut',
    description: 'Invalidate current user token',
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

  @ApiOperation({
    summary: 'Update user password',
    operationId: 'userUpdatePassword',
    description: 'Authenticated password change',
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
