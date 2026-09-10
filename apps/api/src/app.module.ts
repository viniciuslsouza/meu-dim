import { BullModule } from "@nestjs/bullmq";
import { Controller, Get, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { ScheduleModule } from "@nestjs/schedule";
import { ThrottlerModule } from "@nestjs/throttler";
import { LoggerModule } from "nestjs-pino";

import { ThrottlerBehindProxyGuard } from "./common/guards/throttler-behind-proxy.guard";
import configuration from "./config/configuration";
import { validateEnv } from "./config/env.schema";
import { MailModule } from "./mail/mail.module";
import { AuthModule } from "./modules/auth/auth.module";
import { DebtsModule } from "./modules/debts/debts.module";
import { HealthModule } from "./modules/health/health.module";
import { PaymentsModule } from "./modules/payments/payments.module";
import { PlansModule } from "./modules/plans/plans.module";
import { StatementsModule } from "./modules/statements/statements.module";
import { PrismaModule } from "./prisma/prisma.module";

@Controller()
class AppController {
  @Get()
  getHealth(): { name: string; status: string } {
    return {
      name: "Meu Dim API",
      status: "ok"
    };
  }
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [configuration],
      validate: validateEnv
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        level:
          process.env.NODE_ENV === "production" ? "info" : "debug",
        redact: [
          "req.headers.authorization",
          "req.headers.cookie",
          "res.headers.set-cookie"
        ]
      }
    }),
    ThrottlerModule.forRoot([
      {
        name: "default",
        ttl: 60_000,
        limit: 60
      },
      {
        name: "auth",
        ttl: 60_000,
        limit: 10,
        skipIf: (context) => {
          const request = context
            .switchToHttp()
            .getRequest<{ originalUrl?: string; url?: string }>();
          const path = request.originalUrl ?? request.url ?? "";

          return !/^\/(?:v1\/)?auth(?:\/|$)/.test(path);
        }
      }
    ]),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const redisUrl = new URL(
          config.getOrThrow<string>("REDIS_URL")
        );

        return {
          connection: {
            host: redisUrl.hostname,
            port: Number(redisUrl.port || 6379),
            username: decodeURIComponent(redisUrl.username || "default"),
            password: decodeURIComponent(redisUrl.password),
            maxRetriesPerRequest: null,
            ...(redisUrl.protocol === "rediss:" ? { tls: {} } : {})
          }
        };
      }
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    MailModule,
    HealthModule,
    AuthModule,
    StatementsModule,
    DebtsModule,
    PlansModule,
    PaymentsModule
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerBehindProxyGuard
    }
  ]
})
export class AppModule {}
