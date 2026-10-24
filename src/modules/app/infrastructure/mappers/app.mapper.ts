import { AppDto } from '../../presentation/dtos/app.dto';
export class AppMapper {
  toAppDto(app, access_token: string | null = null): AppDto | null {
    if (!app) return null;
    return new AppDto({
      id: app.id,
      title: app.title,
      description: app.description,
      url: app.url,
      mediaId: app.mediaId,
      Media: app.Media
        ? {
            id: app.Media.id,
            mediaUrl: app.Media.mediaUrl,
            mimeType: app.Media.mimeType,
          }
        : null,
      adminId: app.adminId,
      status: app.status,
      activeSession: app.activeSession,
      accessToken: access_token,
      createdAt: app.createdAt,
      updatedAt: app.updatedAt,
    });
  }
}
