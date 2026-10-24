import {
  Controller,
  Post,
  HttpStatus,
  HttpCode,
  UseInterceptors,
  UploadedFile,
  HttpException,
  Delete,
  Param,
  ParseIntPipe,
  Body,
  ParseFilePipe,
  MaxFileSizeValidator,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOkResponse,
  ApiBody,
  ApiHeader,
  ApiConsumes,
  ApiOperation,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

import { MediaService } from '../../application/services/media.service';
import { MediaDto } from '../dtos/media.dto';
import { diskStorage } from 'multer';
import { editFileName } from '../../../../shared/middlewares/filename.middleware';
import pathes from '../../../../shared/config/pathes';

//decorator / check permission and admin object
import { Admin } from '../../../../shared/decorators/admin.decorator';
@ApiTags('medias')
@ApiBearerAuth()
@Controller('medias')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}
  // upload file *********************************************************************************
  @ApiOkResponse({
    description: 'media info',
    type: [MediaDto],
  })
  @ApiOperation({
    summary: ' آپلود فایل ',
    operationId: 'uploadFile',
    description: 'this operation is public',
    tags: ['media'],
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        dist: { type: 'string' },
      },
    },
  })
  @Post('/uploadFile')
  @HttpCode(HttpStatus.OK)
  @ApiHeader({
    name: 'authorization Bearer ',
    description: 'this token recieved in login',
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: `${pathes.staticFiles}${pathes.uploadedFiles}`,
        filename: editFileName,
      }),
    }),
  )
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10000000 }),
          // new FileTypeValidator({ fileType: 'image/jpeg' }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Body() body,
    @Admin({ operationId: 'permissionCreate' }) admin,
  ): Promise<any> {
    try {
      if (file) {
        const media = await this.mediaService.upload(admin.id, {
          fileName: file.filename,
          dist: body.dist,
        });
        return media;
      }
    } catch (err) {
      console.log(err);
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'BAD_REQUEST',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  // delete uploaded media   *******************
  @ApiOperation({
    summary: 'delete uploaded media',
    operationId: 'deleteUploadFile',
    description: 'this operation is public',
    tags: ['media'],
  })
  @ApiNotFoundResponse({ description: 'file not found' })
  @ApiInternalServerErrorResponse({
    description: 'delete file faild',
  })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'status',
    type: Boolean,
  })
  @ApiHeader({
    name: 'authorization Bearer ',
    description: 'this token recieved in login',
  })
  @Delete('/:mediaId')
  @HttpCode(HttpStatus.OK)
  async secoundDepartments(
    @Param(
      'mediaId',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    mediaId: number,
    @Admin({ operationId: 'deleteUploadFile' }) admin,
  ): Promise<boolean> {
    try {
      const status = await this.mediaService.deleteMedia(admin.id, mediaId);
      return status;
    } catch (err) {
      throw err;
    }
  }
}
