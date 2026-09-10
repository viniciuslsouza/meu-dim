import { Global, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import {
  JwtModule,
  type JwtSignOptions
} from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";

import { MailModule } from "../../mail/mail.module";
import { PrismaModule } from "../../prisma/prisma.module";
import { UsersModule } from "../users/users.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { PaidGuard } from "./guards/paid.guard";
import { JwtStrategy } from "./strategies/jwt.strategy";

@Global()
@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>("JWT_SECRET"),
        signOptions: {
          expiresIn: config.getOrThrow<string>(
            "JWT_EXPIRES"
          ) as JwtSignOptions["expiresIn"],
          algorithm: "HS256"
        }
      })
    }),
    PrismaModule,
    MailModule,
    UsersModule
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtAuthGuard, PaidGuard],
  exports: [JwtModule, JwtAuthGuard, PaidGuard, AuthService]
})
export class AuthModule {}
