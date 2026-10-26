import { UserDto } from '../../presentation/dtos/user.dto';
import { AppMapper } from '../../../app/infrastructure/mappers/app.mapper';

export class UserMapper {
  private readonly appMapper = new AppMapper();

  toUserDto(
    user,
    access_token: string | null = null,
    apps: any[] | null = null,
  ): UserDto | null {
    if (!user) return null;
    return new UserDto({
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      mobile: user.mobile,
      access_token: access_token,
      apps: apps
        ? apps
            .map((app) => this.appMapper.toAppDto(app, ''))
            .filter((dto) => dto != null)
        : undefined,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }
}
