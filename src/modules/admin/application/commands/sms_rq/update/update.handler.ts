import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateSmsRqCommand } from './update.command';
import { SmsRqRepository } from '../../../../infrastructure/repositories/smsRq.repository';

@CommandHandler(UpdateSmsRqCommand)
export class UpdateSmsRqHandler implements ICommandHandler<UpdateSmsRqCommand> {
  constructor(private readonly smsRqRepository: SmsRqRepository) {}

  async execute(command: UpdateSmsRqCommand): Promise<boolean> {
    return this.smsRqRepository.update(command.id, command.updateSmsRqDto);
  }
}
