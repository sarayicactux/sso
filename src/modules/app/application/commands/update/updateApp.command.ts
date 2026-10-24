import { UpdateAppInterface } from '../../../domain/interfaces/app/UpdateApp.interface';

export class UpdateAppCommand {
  constructor(
    public readonly id: number,
    public readonly data: UpdateAppInterface,
  ) {}
}
