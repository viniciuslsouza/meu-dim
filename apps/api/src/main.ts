import "./instrument";
import "reflect-metadata";

import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { HttpAdapterHost, NestFactory } from "@nestjs/core";
import {
  DocumentBuilder,
  SwaggerModule
} from "@nestjs/swagger";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { Logger } from "nestjs-pino";

import { AllExceptionsFilter } from "./common/filters/all-exceptions.filter";
import { AppModule } from "./app.module";
import { PrismaService } from "./prisma/prisma.service";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    rawBody: true
  });
  const config = app.get(ConfigService);

  app.useLogger(app.get(Logger));
  app.use(cookieParser());
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:"]
        }
      }
    })
  );
  app.enableCors({
    origin: config.getOrThrow<string>("APP_URL"),
    credentials: true
  });
  app.getHttpAdapter().getInstance().set("trust proxy", 1);
  app.setGlobalPrefix("v1");
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true
    })
  );
  app.useGlobalFilters(
    new AllExceptionsFilter(app.get(HttpAdapterHost))
  );

  if (config.get<string>("NODE_ENV") !== "production") {
    const swaggerConfig = new DocumentBuilder()
      .setTitle("Meu Dim API")
      .setDescription("API do Meu Dim")
      .setVersion("1.0")
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);

    SwaggerModule.setup("docs", app, document);
  }

  app.get(PrismaService).enableShutdownHooks(app);
  await app.listen(config.getOrThrow<number>("PORT"));
}

void bootstrap().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);

  console.error(message);
  process.exitCode = 1;
});
