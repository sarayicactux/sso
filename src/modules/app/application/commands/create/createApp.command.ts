import { CreateAppData } from '../../../domain/repositories/app.repository';

export class CreateAppCommand {
  constructor(public readonly createAppData: CreateAppData) {}
}
