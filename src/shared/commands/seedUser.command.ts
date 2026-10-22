import { Injectable } from '@nestjs/common';
import { UserService } from '../../modules/user/application/services/user.service';

@Injectable()
export class SeedUserCommand {
  constructor(private readonly userService: UserService) {}

  async runService(): Promise<void> {
    await this.userService.seeder();
    console.log('Done');
  }
}
