import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { SeedUserCommand } from './seedUser.command';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const command = app.get(SeedUserCommand);
    await command.runService();
  } catch (error) {
    console.error('User seeding failed:', error);
    process.exitCode = 1;
  } finally {
    await app.close();
  }
}

bootstrap();
//npx ts-node -r tsconfig-paths/register src/shared/commands/seed-user.ts
