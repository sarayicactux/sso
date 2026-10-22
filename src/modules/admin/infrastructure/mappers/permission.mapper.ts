import { PermissionDto } from '../../presentation/dtos/permission.dto';
export class PermissionMapper {
  permissionObject(role): PermissionDto {
    return new PermissionDto({
      id: role.id,
      roleId: role.roleId,
      operationId: role.operationId,
    });
  }
}
