import { createHash, randomBytes } from "node:crypto";

import {
  Injectable,
  UnauthorizedException
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  JwtService,
  type JwtSignOptions
} from "@nestjs/jwt";

import { MailService } from "../../mail/mail.service";
import { PrismaService } from "../../prisma/prisma.service";
import {
  type SafeUser,
  safeUserSelect
} from "../users/safe-user";
import type {
  AccessTokenPayload,
  RefreshTokenPayload
} from "./auth.types";

interface AuthenticationResult {
  accessToken: string;
  refreshToken: string;
  user: SafeUser;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly mail: MailService
  ) {}

  async requestMagicLink(email: string): Promise<void> {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.prisma.user.upsert({
      where: { email: normalizedEmail },
      create: { email: normalizedEmail },
      update: {},
      select: { id: true }
    });
    const token = randomBytes(32).toString("hex");
    const tokenHash = this.hashToken(token);

    await this.prisma.magicLink.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000)
      }
    });

    const appUrl = this.config.getOrThrow<string>("APP_URL");
    const callbackUrl = new URL("/auth/callback", appUrl);

    callbackUrl.searchParams.set("token", token);
    await this.mail.sendMagicLink(normalizedEmail, callbackUrl.toString());
  }

  async verifyToken(rawToken: string): Promise<AuthenticationResult> {
    const tokenHash = this.hashToken(rawToken);
    const user = await this.prisma.$transaction(async (transaction) => {
      const magicLink = await transaction.magicLink.findUnique({
        where: { tokenHash },
        select: {
          id: true,
          usedAt: true,
          expiresAt: true,
          user: {
            select: safeUserSelect
          }
        }
      });

      if (
        !magicLink ||
        magicLink.usedAt ||
        magicLink.expiresAt <= new Date()
      ) {
        throw new UnauthorizedException("Token inválido ou expirado");
      }

      const consumed = await transaction.magicLink.updateMany({
        where: {
          id: magicLink.id,
          usedAt: null,
          expiresAt: { gt: new Date() }
        },
        data: { usedAt: new Date() }
      });

      if (consumed.count !== 1) {
        throw new UnauthorizedException("Token inválido ou expirado");
      }

      return magicLink.user;
    });

    const [accessToken, refreshToken] = await Promise.all([
      this.createAccessToken(user),
      this.createRefreshToken(user.id)
    ]);

    return { accessToken, refreshToken, user };
  }

  async refreshTokens(
    refreshToken: string
  ): Promise<{ accessToken: string }> {
    try {
      const payload = await this.jwt.verifyAsync<RefreshTokenPayload>(
        refreshToken,
        {
          secret: this.config.getOrThrow<string>("REFRESH_SECRET"),
          algorithms: ["HS256"]
        }
      );

      if (payload.type !== "refresh" || !payload.sub) {
        throw new UnauthorizedException("Refresh token inválido");
      }

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: safeUserSelect
      });

      if (!user) {
        throw new UnauthorizedException("Refresh token inválido");
      }

      return { accessToken: await this.createAccessToken(user) };
    } catch {
      throw new UnauthorizedException("Refresh token inválido ou expirado");
    }
  }

  hashToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }

  private createAccessToken(user: SafeUser): Promise<string> {
    const payload: AccessTokenPayload = {
      sub: user.id,
      email: user.email,
      plan: user.plan,
      type: "access"
    };

    return this.jwt.signAsync(payload);
  }

  private createRefreshToken(userId: string): Promise<string> {
    const payload: RefreshTokenPayload = {
      sub: userId,
      type: "refresh"
    };

    return this.jwt.signAsync(payload, {
      secret: this.config.getOrThrow<string>("REFRESH_SECRET"),
      expiresIn: this.config.getOrThrow<string>(
        "REFRESH_EXPIRES"
      ) as JwtSignOptions["expiresIn"],
      algorithm: "HS256"
    });
  }
}
