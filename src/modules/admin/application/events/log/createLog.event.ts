import { IEvent } from '@nestjs/cqrs';

import { CreateLogInterface } from '../../../domain/interfaces/log/CreateLog.interface';

export class CreateLogEvent implements IEvent {
  constructor(public readonly createLog: CreateLogInterface) {}
}
