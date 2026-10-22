export class SmsRq {
  readonly id: number;
  mobile: string;
  code: number;
  ip: string;
  lastSentTime: Date;
  sendCount: number;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(data: {
    id?: number;
    mobile: string;
    code: number;
    ip: string;
    lastSentTime: Date;
    sendCount: number;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = data.id;
    this.mobile = data.mobile;
    this.ip = data.ip;
    this.code = data.code;
    this.sendCount = data.sendCount;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.lastSentTime = data.lastSentTime || null;
  }
}
