# Meu Dim

Monorepo do Meu Dim, organizado com Turborepo e pnpm workspaces.

## Requisitos

- Node.js 20 ou superior
- pnpm 10

## Como executar

```bash
pnpm install
pnpm dev
```

A aplicação web fica disponível em `http://localhost:3000` e a API em
`http://localhost:3001`.

## Estrutura

- `apps/api`: API NestJS
- `apps/web`: aplicação Next.js
- `packages/shared`: código TypeScript compartilhado
- `packages/ui`: base para componentes compartilhados
- `packages/config`: configurações de TypeScript e ESLint
