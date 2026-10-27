import { UpdateActiveSessionInterface } from '../../../domain/interfaces/app/UpdateAppActiveSession.interface';

export class UpdateAppActiveSessionCommand {
  constructor(public readonly data: UpdateActiveSessionInterface) {}
}
