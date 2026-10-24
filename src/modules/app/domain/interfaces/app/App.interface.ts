export interface AdminInterface {
  id: number;
  title: string;
  description: string;
  url: string;
  mediaId?: number;
  adminId: number;
  activeSession: boolean;
  accessToken: string;
  createdAt?: Date;
  updatedAt?: Date;
}
