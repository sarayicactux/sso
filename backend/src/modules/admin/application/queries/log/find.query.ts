import { FindLogInterface } from '../../../domain/interfaces/log/FindLog.interface';

export class FindLogQuery {
  constructor(public readonly find: FindLogInterface) {}
}
