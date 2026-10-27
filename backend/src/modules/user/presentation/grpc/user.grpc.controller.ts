import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { UserService } from '../../application/services/user.service';
import {
  ValidateUserAppAccessInterface,
  ValidateUserAppAccessResult,
} from '../../domain/interfaces/user/ValidateUserAppAccess.interface';
import { UpdateUserStatusByUsernameInterface } from '../../domain/interfaces/user/UpdateUserStatusByUsername.interface';
import {
  CreateUserViaAppInterface,
  CreateUserViaAppResult,
} from '../../domain/interfaces/user/CreateUserViaApp.interface';
import {
  GetUserByPublicKeyInterface,
  GetUserByPublicKeyResult,
} from '../../domain/interfaces/user/GetUserByPublicKey.interface';

@Controller()
export class UserGrpcController {
  constructor(private readonly userService: UserService) {}

  @GrpcMethod('UserGrpcService', 'ValidateUserAppAccess')
  async validateUserAppAccess(
    data: ValidateUserAppAccessInterface,
  ): Promise<ValidateUserAppAccessResult> {
    return this.userService.validateUserAppAccess({
      accessToken: data?.accessToken,
      access_token: data?.access_token,
    });
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

  @GrpcMethod('UserGrpcService', 'GetUserByPublicKey')
  async getUserByPublicKey(
    data: GetUserByPublicKeyInterface,
  ): Promise<GetUserByPublicKeyResult> {
    return this.userService.getUserByPublicKey({
      accessToken: data?.accessToken,
      publicKey: data?.publicKey,
    });
  }
}
