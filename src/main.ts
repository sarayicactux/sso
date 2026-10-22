import { NestFactory } from '@nestjs/core';
import * as dotenv from 'dotenv';
import * as express from 'express';
import helmet from 'helmet';
// import * as shell from 'shelljs';

dotenv.config();

import * as session from 'express-session';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as swaggerConfig from './shared/config/swagger.json';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import pathes from './shared/config/pathes';
import inRoleRoutes from './shared/config/inRoleRoutes';
// import { NotFoundFilter } from './common/helpers/notFound.helper';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
  });
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // app.useGlobalFilters(new NotFoundFilter());
  app.useGlobalPipes(new ValidationPipe());
  app.use(
    session({
      name: 'exirbuy.ts',
      secret: 'FzrhfY@6y5x6PrWqxxdXlIQnriclDUOPGf9FthZ#es#v@4!kkJ%PQZ52&Yo%',
      resave: false,
      saveUninitialized: false,
    }),
  );
  app.useStaticAssets(pathes.staticFiles);
  app.setBaseViewsDir(pathes.viewFiles);
  app.setViewEngine('ejs');
  app.use(cookieParser());
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));
  app.use((req, res, next) => {
    if (!req) {
      console.log('!req');
    }
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.header('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('X-Powered-By', 'NestJs');
    res.setHeader('X-Developd-By', 'sarayi.cactux@gmail.com,atefe hashemi');
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET, POST, OPTIONS, PUT, PATCH, DELETE',
    );
    res.setHeader(
      'Access-Control-Allow-Headers',
      'X-Requested-With,content-type',
    );
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept',
    );
    next();
  });

  app.use(helmet());
  const env = process.env.NODE_ENV.toLowerCase();
  // const env = 'test'.toLowerCase();
  const config = new DocumentBuilder()
    .setTitle(swaggerConfig.title)
    .setDescription(swaggerConfig.description)
    .setVersion(swaggerConfig.version)
    .addTag(swaggerConfig.tag)
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  (global as any).allRoutes = inRoleRoutes(document.paths);

  if (env === 'test') {
    SwaggerModule.setup('api', app, document);
  }
  await app.listen(process.env.APP_PORT);
}
bootstrap();
