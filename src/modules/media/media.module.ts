import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

// Infrastructure repositories
import { MediaRepository } from './infrastructure/repositories/media.repository';

// helpers
import { Jwt } from '../../shared/helpers/jwt.helper';
import { Tools } from '../../shared/helpers/tools.helper';

// controllers
import { MediaController } from './presentation/controllers/media.controller';
const controllers = [MediaController];
// services
import { MediaService } from './application/services/media.service';
const services = [MediaService];
//Prisma
import { PrismaService } from '../../prisma/prisma.service';

// command Handlers
import { CreateMediaHandler } from './application/commands/create/media.handler';
import { UpdateMediaHandler } from './application/commands/update/update.handler';
import { DeleteMediaHandler } from './application/commands/delete/delete.handler';
const CommandHandlers = [
  CreateMediaHandler,
  UpdateMediaHandler,
  DeleteMediaHandler,
];

// query Handlers
import { GetMediaQueryHandler } from './application/queries/getMedia.handler';

const QueryHandlers = [GetMediaQueryHandler];

// mappers
import { MediaMapper } from './infrastructure/mappers/media.mapper';
const mappers = [MediaMapper];
@Module({
  imports: [CqrsModule],
  controllers: controllers,
  providers: [
    PrismaService,
    ...services,
    MediaRepository,
    ...CommandHandlers,
    ...QueryHandlers,
    Jwt,
    Tools,
    ...mappers,
  ],
  exports: [MediaRepository, MediaService],
})
export class MediaModule {}
