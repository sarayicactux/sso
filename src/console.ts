import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    // Run your CLI task here
    console.log('Application context initialized');
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    await app.close();
  }
}

bootstrap();
//npx ts-node -r tsconfig-paths/register src/console.ts
