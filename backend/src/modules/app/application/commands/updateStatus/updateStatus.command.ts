import { UpdateStatusInterface } from '../../../domain/interfaces/app/UpdateAppStatus.interface';

export class UpdateAppStatusCommand {
  constructor(public readonly data: UpdateStatusInterface) {}
}
