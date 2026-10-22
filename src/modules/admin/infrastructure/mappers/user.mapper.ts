import { UserDto } from '../../presentation/dtos/user.dto';
import { RoleMapper } from './role.mapper';
import userStatus from '../../domain/enums/userStatus.enum'
export class UserMapper {
  userObject(user, access_token: string | null = null): UserDto | null {
    if (!user) return null;
    return new UserDto({
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      mobile: user.mobile,
      isActive: userStatus[user.isActive],
      roleId: user.roleId,
      Role: user.Role ? new RoleMapper().roleObject(user.Role) : null,
      access_token: access_token,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }
}
