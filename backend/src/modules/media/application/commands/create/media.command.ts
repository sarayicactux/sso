import { CreateMediaDTO } from '../../../presentation/dtos/media.dto';

export class CreateMediaCommand {
  constructor(public readonly createMediaDTO: CreateMediaDTO) {}
}
