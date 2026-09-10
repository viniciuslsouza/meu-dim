import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import type { Request, Response } from "express";

import type { SafeUser } from "../users/safe-user";
import { AuthService } from "./auth.service";
import { MagicLinkDto } from "./dto/magic-link.dto";
import { VerifyTokenDto } from "./dto/verify-token.dto";

const REFRESH_COOKIE = "refresh_token";
const REFRESH_COOKIE_PATH = "/v1/auth";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService
  ) {}

  @Post("magic-link")
  @Throttle({
    default: { limit: 10, ttl: 60_000 },
    auth: { limit: 10, ttl: 60_000 }
  })
  async requestMagicLink(
    @Body() dto: MagicLinkDto
  ): Promise<{ message: string }> {
    await this.auth.requestMagicLink(dto.email);

    return {
      message: "Se o e-mail existir, você receberá um link em breve."
    };
  }

  @Post("verify")
  @HttpCode(HttpStatus.OK)
  async verify(
    @Body() dto: VerifyTokenDto,
    @Res({ passthrough: true }) response: Response
  ): Promise<{ accessToken: string; user: SafeUser }> {
    const { accessToken, refreshToken, user } =
      await this.auth.verifyToken(dto.token);

    response.cookie(
      REFRESH_COOKIE,
      refreshToken,
      this.cookieOptions()
    );

    return { accessToken, user };
  }

  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() request: Request
  ): Promise<{ accessToken: string }> {
    const cookies = request.cookies as unknown as Record<
      string,
      string | undefined
    >;
    const refreshToken = cookies[REFRESH_COOKIE];

    if (!refreshToken) {
      throw new UnauthorizedException("Refresh token não informado");
    }

    return this.auth.refreshTokens(refreshToken);
  }

  @Post("logout")
  @HttpCode(HttpStatus.OK)
  logout(
    @Res({ passthrough: true }) response: Response
  ): { message: string } {
    response.clearCookie(REFRESH_COOKIE, this.cookieOptions());

    return { message: "Logout realizado." };
  }

  private cookieOptions() {
    return {
      httpOnly: true,
      sameSite: "strict" as const,
      secure: this.config.get<string>("NODE_ENV") === "production",
      path: REFRESH_COOKIE_PATH
    };
  }
}
