import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import * as fs from 'fs';

// shared
import pathes from '../../../../shared/config/pathes';
import { Tools } from '../../../../shared/helpers/tools.helper';
//use case
import { MediaServiceImpl } from '../../domain/services/media.service';

//DTOs
import {
  UploadMediaDto,
  CreateMediaDTO,
  MediaDto,
} from '../../presentation/dtos/media.dto';

// mappers
import { MediaMapper } from '../../infrastructure/mappers/media.mapper';

// commands
import { CreateMediaCommand } from '../commands/create/media.command';
import { DeleteMediaCommand } from '../commands/delete/delete.command';

//queries
import { GetMediaQuery } from '../queries/getMedia.query';

//entities
import { Media } from '../../domain/entities/media.entity';

// enums
import { DatabaseAct } from '../../../../shared/enums/databaseAct.enum';

@Injectable()
export class MediaService implements MediaServiceImpl {
  constructor(
    private readonly mediaMapper: MediaMapper,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly tools: Tools,
  ) {}
  async upload(adminId: number, upload: UploadMediaDto): Promise<MediaDto> {
    const { dist, fileName } = upload;
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    !fs.existsSync(`${pathes.staticFiles}${pathes.uploadedFiles}${dist}`)
      ? fs.mkdir(
          `${pathes.staticFiles}${pathes.uploadedFiles}${dist}`,
          (err) => {
            console.log(err);
          },
        )
      : null;
    fs.copyFile(
      `${pathes.staticFiles}${pathes.uploadedFiles}${fileName}`,
      `${pathes.staticFiles}${pathes.uploadedFiles}${dist}/${fileName}`,
      (err) => {
        if (err) console.log(err);
        fs.unlinkSync(
          `${pathes.staticFiles}${pathes.uploadedFiles}${fileName}`,
        );
      },
    );
    const mimeType = await this.tools.checkMime(
      `${pathes.staticFiles}${pathes.uploadedFiles}/${dist}/${fileName}`,
    );
    const mediaUrl = `${pathes.uploadedFiles}${dist}/${fileName}`;
    const createMediaDto: CreateMediaDTO = {
      mediaUrl,
      mimeType,
      ownerId: null,
      ownerModel: null,
    };

    const newMedia = await this.commandBus.execute(
      new CreateMediaCommand(createMediaDto),
    );
    this.tools.saveLogs({
      adminId,
      tableName: 'medias',
      rowId: newMedia.id,
      act: DatabaseAct.CREATE,
      oldData: null,
      newData: newMedia,
      description: 'آپلود فایل جدید',
    });
    return this.mediaMapper.mediaObject(newMedia);
  }
  async deleteMedia(adminId: number, id: number): Promise<boolean> {
    const media = (await this.queryBus.execute(new GetMediaQuery(id))) as Media;
    if (!media) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'فایل پیدا نشد',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    if (!media.ownerId) {
      const fileUrl = `${pathes.staticFiles}/${media.mediaUrl}`;
      try {
        fs.unlinkSync(fileUrl);
        await this.commandBus.execute(new DeleteMediaCommand(id));
        this.tools.saveLogs({
          adminId,
          tableName: 'medias',
          rowId: media.id,
          act: DatabaseAct.DELETE,
          oldData: media,
          newData: null,
          description: 'حذف فایل',
        });
        return true;
      } catch (err) {
        console.error(err);
        return false;
      }
    }
    return true;
  }
}
