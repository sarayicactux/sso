import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Put,
  UsePipes,
  Patch,
  Headers,
} from '@nestjs/common';
import { AppControllerImpl } from '../../domain/controllers/app.controller.interface';
import { AppService } from '../../application/services/app.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiHeader,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import {
  LoginDto,
  RecoverPasswordDto,
  UpdatePasswordDto,
  AdminDto,
} from '../dtos/admin.dto';

//shared
import { MobilePipe } from '../../../../shared/pipes/mobile.pipe';
import { IpAddress } from '../../../../shared/decorators/ipaddress.decorator';
import { CodePipe } from '../../../../shared/pipes/code.pipe';
import { Admin } from '../../../../shared/decorators/admin.decorator';

@Controller('apps')
export class AppController implements AppControllerImpl {
  constructor(private readonly appService: AppService) {}
}
