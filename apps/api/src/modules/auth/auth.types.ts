import type { PlanTier } from "@prisma/client";

export interface AccessTokenPayload {
  sub: string;
  email: string;
  plan: PlanTier;
  type: "access";
}

export interface RefreshTokenPayload {
  sub: string;
  type: "refresh";
}
