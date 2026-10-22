import { Injectable } from '@nestjs/common';
import { AdminService } from '../../modules/admin/application/services/admin.service';

@Injectable()
export class SeedAdminCommand {
  constructor(private readonly adminService: AdminService) {}

  async runService(): Promise<void> {
    await this.adminService.seeder();
    console.log('Done');
  }
}
