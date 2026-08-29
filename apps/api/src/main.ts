import 'reflect-metadata';
import 'dotenv/config';

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const origins = (process.env.WEB_ORIGIN ?? 'http://localhost:3001')
    .split(',')
    .map((origin) => origin.trim());

  app.enableCors({
    origin: origins,
    credentials: true,
  });

  app.enableShutdownHooks();

  const port = Number(process.env.PORT ?? 4001);
  await app.listen(port);

  console.log(`Flights GraphQL API: http://localhost:${port}/graphql`);
}

void bootstrap();
