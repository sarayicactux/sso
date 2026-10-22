import { AdminDto } from '../../presentation/dtos/admin.dto';
export class AdminMapper {
  toAdminDto(admin, access_token: string | null = null): AdminDto | null {
    if (!admin) return null;
    return new AdminDto({
      id: admin.id,
      username: admin.username,
      firstName: admin.firstName,
      lastName: admin.lastName,
      email: admin.email,
      mobile: admin.mobile,
      access_token: access_token,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt,
    });
  }
}
