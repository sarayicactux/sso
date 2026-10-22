import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';

// modules
import { EventsModule } from './shared/event/events.module';

import { UserModule } from './modules/user/user.module';

const modules = [UserModule, EventsModule];
//commands
import { SeedUserCommand } from './shared/commands/seedUser.command';

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
  providers: [SeedUserCommand],
  // providers: [SeedUserCommand, LeakyService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
