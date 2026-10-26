import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { UserService } from '../../application/services/user.service';
import { ValidateUserAppAccessInterface } from '../../domain/interfaces/user/ValidateUserAppAccess.interface';
import { UpdateUserStatusByUsernameInterface } from '../../domain/interfaces/user/UpdateUserStatusByUsername.interface';
import {
  CreateUserViaAppInterface,
  CreateUserViaAppResult,
} from '../../domain/interfaces/user/CreateUserViaApp.interface';

@Controller()
export class UserGrpcController {
  constructor(private readonly userService: UserService) {}

  @GrpcMethod('UserGrpcService', 'ValidateUserAppAccess')
  async validateUserAppAccess(
    data: ValidateUserAppAccessInterface,
  ): Promise<{ valid: boolean }> {
    const valid = await this.userService.validateUserAppAccess({
      accessToken: data?.accessToken,
      access_token: data?.access_token,
    });
    return { valid };
  }

  @GrpcMethod('UserGrpcService', 'UpdateUserStatusByUsername')
  async updateUserStatusByUsername(
    data: UpdateUserStatusByUsernameInterface,
  ): Promise<{ success: boolean; status: boolean }> {
    return this.userService.updateStatusByUsernameViaApp({
      username: data?.username,
      status: data?.status,
      accessToken: data?.accessToken,
    });
  }

  @GrpcMethod('UserGrpcService', 'CreateUser')
  async createUser(
    data: CreateUserViaAppInterface,
  ): Promise<CreateUserViaAppResult> {
    return this.userService.createViaApp({
      username: data?.username,
      email: data?.email,
      mobile: data?.mobile,
      firstName: data?.firstName,
      lastName: data?.lastName,
      password: data?.password,
      accessToken: data?.accessToken,
    });
  }
}
