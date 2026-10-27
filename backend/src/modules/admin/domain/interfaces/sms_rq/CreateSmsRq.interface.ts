export interface CreateSmsRqInterface {
  mobile: string;
  ip: string;
  jwtToken: string;
  code: number;
  lastSentTime?: Date;
  sendCount: number | 1;
}
