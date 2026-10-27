/* eslint-disable @typescript-eslint/no-empty-function */
import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  logger = new Logger('Response');
  constructor() {}
  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl: url } = req;
    const reqTime = new Date().getTime();
    res.on('finish', () => {
      const { statusCode } = res;
      if (statusCode === 200 || statusCode === 201 || statusCode === 304) {
        const resTime = new Date().getTime();
        this.logger.log(
          `${method} ${url} - ${statusCode} - ${
            res.get('Content-Length') || 0
          } bytes - ${resTime - reqTime} ms`,
        );
      } else {
        this.logger.error(`${method} ${url} - ${statusCode} `);
      }
    });
    next();
  }
}
