import { CreateLogInterface } from '../interfaces/log/CreateLog.interface';

export interface CreatLog {
  create(create: CreateLogInterface): Promise<boolean>;
}
