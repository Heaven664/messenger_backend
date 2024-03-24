import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configure the cors options
  const corsOptions: CorsOptions = {
    origin: process.env.ORIGIN,
    credentials: true,
  };
  // Enable cors with the options defined in the cors.config.ts file
  app.enableCors(corsOptions);
  // Enable global validation and transformation of received dto data
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  await app.listen(3001);
}
bootstrap();
