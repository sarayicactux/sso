export class App {
  readonly id: number;
  title: string;
  description: string;
  url: string;
  mediaId?: number;
  adminId: number;
  status: boolean;
  activeSession: boolean;
  accessToken: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;

  constructor(data: {
    id?: number;
    title: string;
    description: string;
    url: string;
    mediaId?: number;
    adminId: number;
    status: boolean;
    activeSession: boolean;
    accessToken: string;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
  }) {
    this.id = data.id;
    this.title = data.title;
    this.description = data.description;
    this.url = data.url;
    this.mediaId = data.mediaId;
    this.adminId = data.adminId;
    this.status = data.status;
    this.activeSession = data.activeSession;
    this.accessToken = data.accessToken;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.deletedAt = data.deletedAt || null;
  }
}
