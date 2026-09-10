import type { Prisma } from "@prisma/client";

export const safeUserSelect = {
  id: true,
  email: true,
  name: true,
  plan: true,
  planExpiresAt: true,
  createdAt: true
} satisfies Prisma.UserSelect;

export type SafeUser = Prisma.UserGetPayload<{
  select: typeof safeUserSelect;
}>;
