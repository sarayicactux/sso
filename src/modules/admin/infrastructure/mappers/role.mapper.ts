import { RoleDto } from '../../presentation/dtos/role.dto';
import { PermissionMapper } from './permission.mapper';
import { UserMapper } from './user.mapper';
export class RoleMapper {
  roleObject(role): RoleDto {
    return new RoleDto({
      id: role.id,
      name: role.name,
      description: role.description,
      isActive: role.isActive,
      Users: role.Users
        ? role.Users.map((user) => new UserMapper().userObject(user))
        : [],
      Permissions: role.Permissions
        ? role.Permissions.map((permission) => new PermissionMapper().permissionObject(permission))
        : [],
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    });
  }
}
