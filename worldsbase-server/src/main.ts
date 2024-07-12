import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
// import fastifyCors from '@fastify/cors';
// import helmet from '@fastify/helmet';
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
    { logger: ['error', 'warn', 'log', 'verbose', 'debug'] },
  );

  // app.register(helmet, {
  //   contentSecurityPolicy: {
  //     directives: {
  //       defaultSrc: ["'self'"],
  //       styleSrc: ["'self'", 'https:', "'unsafe-inline'"],
  //       scriptSrc: ["'self'", 'https:', "'unsafe-inline'"],
  //       connectSrc: ["'self'", 'https:', 'your-domain.com'],
  //       fontSrc: ["'self'", 'https:', 'data:'],
  //       objectSrc: ["'none'"],
  //     },
  //   },
  //   frameguard: {
  //     action: 'deny',
  //   },
  //   hsts: {
  //     maxAge: 31536000,
  //     includeSubDomains: true,
  //     preload: true,
  //   },
  //   noSniff: true,
  //   xssFilter: true,
  // });

  // app.register(fastifyCors, {
  //   origin: [
  //     'https://dashboard.worlds.org',
  //     'https://wtf-mini-game.vercel.app',
  //     'https://wtf-mini-game-preview.vercel.app',
  //     'https://portal.wtf.gg',
  //     'https://wtf.gg',
  //   ],
  //   methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  //   credentials: true,
  // });

  const config = new DocumentBuilder()
    .setTitle('Worldsbase')
    .setDescription('Worldsbase API description')
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
