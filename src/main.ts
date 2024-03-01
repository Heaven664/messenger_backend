import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { corsOptions } from 'config/cors.config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Enable cors with the options defined in the cors.config.ts file
  app.enableCors(corsOptions);
  // Enable global validation and transformation of received dto data
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  await app.listen(3001);
}
bootstrap();
