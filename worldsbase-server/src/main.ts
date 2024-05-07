import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import { AppModule } from './app.module';
import { XApiKeyGuard } from './x-api-key/x-api-key.guard';

declare const module: any;

const port = process.env.PORT || 3005;

async function bootstrap() {
  dotenv.config();

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('WorldsBase')
    .setDescription('WorldsBase API description')
    .setVersion('0.0.1')
    .addTag('worlds-base')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  app.useGlobalGuards(new XApiKeyGuard());
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(port, '0.0.0.0');
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
