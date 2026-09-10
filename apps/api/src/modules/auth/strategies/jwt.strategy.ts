import {
  Injectable,
  UnauthorizedException
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

import { PrismaService } from "../../../prisma/prisma.service";
import {
  type SafeUser,
  safeUserSelect
} from "../../users/safe-user";
import type { AccessTokenPayload } from "../auth.types";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>("JWT_SECRET"),
      algorithms: ["HS256"]
    });
  }

  async validate(payload: AccessTokenPayload): Promise<SafeUser> {
    if (payload.type !== "access" || !payload.sub) {
      throw new UnauthorizedException("Token de acesso inválido");
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: safeUserSelect
    });

    if (!user) {
      throw new UnauthorizedException("Usuário não encontrado");
    }

    return user;
  }
}
