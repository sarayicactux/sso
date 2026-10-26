import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';

// modules
import { EventsModule } from './shared/event/events.module';

import { AdminModule } from './modules/admin/admin.module';
import { MediaModule } from './modules/media/media.module';
import { AppsModule } from './modules/app/app.module';
import { UserModule } from './modules/user/user.module';

const modules = [
  AdminModule,
  MediaModule,
  AppsModule,
  UserModule,
  EventsModule,
];
//commands
import { SeedAdminCommand } from './shared/commands/seedAdmin.command';

import { LoggingMiddleware } from './shared/middlewares/logging.middleware';
// import { LeakyService } from './shared/leakyService.service';
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    PrismaModule,
    ...modules,
  ],
  providers: [SeedAdminCommand],
  // providers: [SeedAdminCommand, LeakyService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
