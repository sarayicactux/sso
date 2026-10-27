import { CreateAdminInterface } from '../../../../domain/interfaces/admin/CreateAdmin.interface';

export class CreateAdminCommand {
  constructor(public readonly createAdminDto: CreateAdminInterface) {}
}
