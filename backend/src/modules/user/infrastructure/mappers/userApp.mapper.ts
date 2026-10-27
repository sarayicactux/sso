import { UserAppDto } from '../../presentation/dtos/userApp.dto';

export class UserAppMapper {
  toUserAppDto(userApp): UserAppDto | null {
    if (!userApp) return null;
    return new UserAppDto({
      id: userApp.id,
      userId: userApp.userId,
      appId: userApp.appId,
      createdAt: userApp.createdAt,
      updatedAt: userApp.updatedAt,
    });
  }
}
