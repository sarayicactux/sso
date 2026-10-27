export interface AppInterface {
  id: number;
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
}
