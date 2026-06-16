# Deploy de Produção — Vercel + Turso

## Goal

Colocar o MVP em produção com custo mínimo (~R$0/mês), acessível de qualquer lugar, usando a infraestrutura já preparada no código (Turso/libsql + Vercel).

## Architecture

- **GitHub** — repositório do código fonte (source of truth)
- **Vercel** (free tier) — hospedagem Next.js, deploy automático em push na `main`
- **Turso** (free tier) — SQLite remoto via libsql, persiste todos os dados

O `prisma.ts` já usa `PrismaLibSql` com prioridade `TURSO_DATABASE_URL` → `DATABASE_URL` → arquivo local. Nenhuma mudança de código necessária para a lógica de banco.

## Deploy Flow

```
git push main
  → Vercel detecta Next.js
  → Build: prisma migrate deploy && next build
  → Start: next start
  → App disponível em https://racoes-app.vercel.app (ou domínio customizado)
```

## Environment Variables (Vercel)

| Var | Valor |
|-----|-------|
| `TURSO_DATABASE_URL` | `libsql://racoes-app-[user].turso.io` |
| `TURSO_AUTH_TOKEN` | token gerado pelo Turso CLI |
| `AUTH_SECRET` | mesmo valor do `.env` local |
| `AUTH_URL` | `https://[seu-app].vercel.app` |

## Code Changes Required

### 1. `package.json` — build command
Vercel precisa rodar migrations antes do build. Adicionar script:
```json
"build": "prisma migrate deploy && next build"
```

### 2. `prisma/schema.prisma` — nenhuma mudança
Schema já é SQLite/libsql compatível.

### 3. `.gitignore` — já correto
`.env*` e `prisma/dev.db` já ignorados.

### 4. `.env.example` — atualizar
Documentar vars de produção necessárias.

## Data Migration (banco local → Turso)

Dados de desenvolvimento locais podem ser importados via:
```bash
turso db shell racoes-app < export.sql
```

Para MVP inicial, banco começa vazio em produção (sem seeds obrigatórios).

## Vercel Configuration

- Build command: `prisma migrate deploy && next build`
- Output directory: `.next` (auto-detectado)
- Node.js version: 20.x
- Root directory: `/` (raiz do repo)

## Auth URL

`AUTH_URL` deve apontar para a URL final do Vercel. NextAuth v5 usa `AUTH_URL` (não `NEXTAUTH_URL`). O `.env` local já usa `AUTH_URL`.

## Steps Overview

1. Criar repositório GitHub e fazer push do código
2. Instalar Turso CLI, criar banco, rodar `prisma migrate deploy` apontando para Turso
3. Criar projeto no Vercel, conectar ao GitHub, configurar env vars
4. Verificar deploy: login, listagem de pedidos, impressão de cupom
5. (Opcional) Configurar domínio customizado no Vercel
