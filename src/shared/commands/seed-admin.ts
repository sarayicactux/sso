import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { SeedAdminCommand } from './seedAdmin.command';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const command = app.get(SeedAdminCommand);
    await command.runService();
  } catch (error) {
    console.error('Admin seeding failed:', error);
    process.exitCode = 1;
  } finally {
    await app.close();
  }
}

bootstrap();
//npx ts-node -r tsconfig-paths/register src/shared/commands/seed-admin.ts
