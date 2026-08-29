import 'reflect-metadata';
import 'dotenv/config';

import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';

import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const origins = (process.env.WEB_ORIGIN ?? 'http://localhost:3001')
    .split(',')
    .map((origin) => origin.trim());

  app.enableCors({ origin: origins, credentials: true });
  app.enableShutdownHooks();

  const openApiConfig = new DocumentBuilder()
    .setTitle('Flights SQL Lab API')
    .setDescription('REST API for experimenting with PostgreSQL queries against the Postgres Pro flights dataset.')
    .setVersion('1.0.0')
    .addTag('Airports')
    .addTag('Routes')
    .addTag('Gateway')
    .build();

  const openApiDocument = SwaggerModule.createDocument(app, openApiConfig);

  app.use(
    '/docs',
    apiReference({
      content: openApiDocument,
      theme: 'purple',
    }),
  );

  const port = Number(process.env.PORT ?? 4001);
  await app.listen(port);

  console.log(`Flights REST API: http://localhost:${port}/api`);
  console.log(`API docs: http://localhost:${port}/docs`);
  console.log(`Gateway metrics: http://localhost:${port}/api/gateway/metrics`);
}

void bootstrap();
