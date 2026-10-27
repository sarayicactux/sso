import { ICommand } from '@nestjs/cqrs';

import { CreateLogInterface } from '../../../../domain/interfaces/log/CreateLog.interface';

export class CreateLogCommand implements ICommand {
  constructor(public readonly createLog: CreateLogInterface) {}
}
