import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SoftDeleteCommand } from './softDelete.command';
import { SmsRqRepository } from '../../../../infrastructure/repositories/smsRq.repository';

@CommandHandler(SoftDeleteCommand)
export class SoftDeleteHandler implements ICommandHandler<SoftDeleteCommand> {
  constructor(private readonly smsRqRepository: SmsRqRepository) {}

  async execute(command: SoftDeleteCommand): Promise<boolean> {
    return this.smsRqRepository.softDelete(command.id);
  }
}
