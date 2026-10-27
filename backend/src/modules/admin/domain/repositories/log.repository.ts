import { CreateLogInterface } from '../interfaces/log/CreateLog.interface';
import { FindLogInterface } from '../interfaces/log/FindLog.interface';
import { Log } from '../entities/log.entity';

export interface LogRepositoryImpl {
  create(log: CreateLogInterface): Promise<Log>;
  find(find: FindLogInterface): Promise<Log[]>;
}
