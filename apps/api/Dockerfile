FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.15.1 --activate

FROM base AS builder
WORKDIR /app
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml turbo.json ./
COPY scripts ./scripts
COPY packages ./packages
COPY apps/api ./apps/api
RUN pnpm install --frozen-lockfile
RUN pnpm turbo build --filter=@meudim/api
RUN pnpm --filter=@meudim/api exec prisma generate

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app /app
EXPOSE 3001
CMD ["sh", "-c", "pnpm --filter=@meudim/api exec prisma migrate deploy && node apps/api/dist/main.js"]
