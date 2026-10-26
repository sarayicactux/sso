import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { UserService } from '../../application/services/user.service';
import { ValidateUserAppAccessInterface } from '../../domain/interfaces/user/ValidateUserAppAccess.interface';

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
}
