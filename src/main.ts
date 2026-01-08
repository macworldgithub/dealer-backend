import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';

import { join } from 'path';
// import * as express from 'express';
import * as bodyParser from 'body-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setViewEngine('ejs');
  app.setBaseViewsDir(join(__dirname, '..', 'views'));

  // Optional: Basic auth for Swagger UI protection (uncomment to enable)
  // app.use(
  //   ['/api-docs', '/api-docs-json'],
  //   basicAuth({
  //     users: { developers: 'macworldteam' }, // Replace with secure credentials
  //     challenge: true,
  //   }),
  // );

  // Enable CORS to allow Swagger UI to make requests from the browser
  app.enableCors();

  // ✅ Store raw body for Stripe webhook
  app.use(
    '/reservations/webhook',
    bodyParser.raw({ type: 'application/json' }),
  );

  app.useStaticAssets(join(__dirname, '..', 'public'));

  // Swagger configuration
const config = new DocumentBuilder()
  .setTitle('Dealer Inspect API V1')
  .setDescription('API documentation for Dealer Inspect backend')
  .setVersion('1.0')
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'Authorization',
      in: 'header',
      description: 'Enter JWT token as: Bearer <token>',
    },
    'access-token',
  )
  .addSecurityRequirements('access-token') // optional
  .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(5000);
}
bootstrap();
