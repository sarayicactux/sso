import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AppServiceImpl } from '../../domain/services/app.service';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import * as bcrypt from 'bcryptjs';
import moment from 'moment';

import { Jwt } from '../../../../shared/helpers/jwt.helper';
import { Tools } from '../../../../shared/helpers/tools.helper';

@Injectable()
export class AppService implements AppServiceImpl {
  constructor(
    private readonly adminMapper: AdminMapper,
    private readonly jwt: Jwt,
    private readonly tools: Tools,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}
}
