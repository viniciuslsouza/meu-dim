import {
  type CanActivate,
  type ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException
} from "@nestjs/common";

import type { SafeUser } from "../../users/safe-user";

interface AuthenticatedRequest {
  user?: SafeUser;
}

@Injectable()
export class PaidGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const { user } = context
      .switchToHttp()
      .getRequest<AuthenticatedRequest>();

    if (!user) {
      throw new UnauthorizedException("Autenticação necessária");
    }

    const isExpired =
      user.planExpiresAt !== null && user.planExpiresAt <= new Date();

    if (user.plan === "FREE" || isExpired) {
      throw new HttpException(
        "Este recurso requer um plano pago ativo",
        HttpStatus.PAYMENT_REQUIRED
      );
    }

    return true;
  }
}
