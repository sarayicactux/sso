import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Put,
  Patch,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { AppControllerImpl } from '../../domain/controllers/app.controller.interface';
import { AppService } from '../../application/services/app.service';
import {
  AppDto,
  CreateAppDto,
  UpdateAppActiveSessionDto,
  UpdateAppDto,
  UpdateAppStatusDto,
} from '../dtos/app.dto';
import { Admin } from '../../../../shared/decorators/admin.decorator';

@ApiTags('apps')
@ApiBearerAuth()
@Controller('apps')
export class AppController implements AppControllerImpl {
  constructor(private readonly appService: AppService) {}

  @ApiOperation({
    summary: 'Create app',
    operationId: 'createApp',
    description: 'Create a client application and issue an accessToken',
    tags: ['apps'],
  })
  @ApiOkResponse({ type: AppDto })
  @ApiBody({ type: CreateAppDto })
  @Post()
  @HttpCode(HttpStatus.OK)
  async create(
    @Body() createApp: CreateAppDto,
    @Admin({ operationId: 'createApp' }) admin,
  ): Promise<AppDto | null> {
    return this.appService.create(createApp, admin);
  }

  @ApiOperation({
    summary: 'List apps',
    operationId: 'findAllApps',
    description: 'List all apps',
    tags: ['apps'],
  })
  @ApiOkResponse({ type: [AppDto] })
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Admin({ operationId: 'findAllApps' }) admin,
  ): Promise<AppDto[]> {
    void admin;
    return this.appService.findAll();
  }

  @ApiOperation({
    summary: 'Find app by access token',
    operationId: 'findAppByAccessToken',
    description: 'Find an app by its accessToken',
    tags: ['apps'],
  })
  @ApiOkResponse({ type: AppDto })
  @Get('by-token/:accessToken')
  @HttpCode(HttpStatus.OK)
  async findByAccessToken(
    @Param('accessToken') accessToken: string,
    @Admin({ operationId: 'findAppByAccessToken' }) admin,
  ): Promise<AppDto | null> {
    void admin;
    return this.appService.findByAccessToken(accessToken);
  }

  @ApiOperation({
    summary: 'Find app by id',
    operationId: 'findAppById',
    description: 'Find an app by id',
    tags: ['apps'],
  })
  @ApiOkResponse({ type: AppDto })
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findById(
    @Param('id', ParseIntPipe) id: number,
    @Admin({ operationId: 'findAppById' }) admin,
  ): Promise<AppDto | null> {
    void admin;
    return this.appService.findById(id);
  }

  @ApiOperation({
    summary: 'Update app',
    operationId: 'updateApp',
    description: 'Update app fields',
    tags: ['apps'],
  })
  @ApiOkResponse({ type: Boolean })
  @ApiBody({ type: UpdateAppDto })
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Body() updateApp: UpdateAppDto,
    @Param('id', ParseIntPipe) id: number,
    @Admin({ operationId: 'updateApp' }) admin,
  ): Promise<boolean> {
    return this.appService.update(id, updateApp, admin);
  }

  @ApiOperation({
    summary: 'Update app status',
    operationId: 'updateAppStatus',
    description: 'Enable or disable an app',
    tags: ['apps'],
  })
  @ApiOkResponse({ type: Boolean })
  @ApiBody({ type: UpdateAppStatusDto })
  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateAppStatusDto,
    @Admin({ operationId: 'updateAppStatus' }) admin,
  ): Promise<boolean> {
    return this.appService.updateStatus({ id, status: body.status }, admin);
  }

  @ApiOperation({
    summary: 'Update app active session',
    operationId: 'updateAppActiveSession',
    description: 'Update activeSession flag',
    tags: ['apps'],
  })
  @ApiOkResponse({ type: Boolean })
  @ApiBody({ type: UpdateAppActiveSessionDto })
  @Patch(':id/activeSession')
  @HttpCode(HttpStatus.OK)
  async updateActiveSession(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateAppActiveSessionDto,
    @Admin({ operationId: 'updateAppActiveSession' }) admin,
  ): Promise<boolean> {
    return this.appService.updateActiveSession(
      { id, activeSession: body.activeSession },
      admin,
    );
  }

  @ApiOperation({
    summary: 'Regenerate app accessToken',
    operationId: 'regenerateAppAccessToken',
    description: 'Generate a new accessToken and replace the existing one',
    tags: ['apps'],
  })
  @ApiOkResponse({ type: AppDto })
  @Patch(':id/accessToken')
  @HttpCode(HttpStatus.OK)
  async regenerateAccessToken(
    @Param('id', ParseIntPipe) id: number,
    @Admin({ operationId: 'regenerateAppAccessToken' }) admin,
  ): Promise<AppDto | null> {
    return this.appService.regenerateAccessToken(id, admin);
  }
}
