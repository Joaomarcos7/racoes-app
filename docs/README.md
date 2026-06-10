# Documentação — RaçõesPro

Documentação técnica do projeto. Atualizar a cada nova iteração.

## Arquitetura

- [C4-arquitetura.md](C4-arquitetura.md) — Diagrama C4 (contexto, containers, componentes, modelo de dados)

## ADRs — Architecture Decision Records

| # | Decisão | Status |
|---|---|---|
| [ADR-001](ADR-001-banco-de-dados.md) | SQLite local → Turso (libsql) em produção | Aceito |
| [ADR-002](ADR-002-autenticacao.md) | NextAuth v5 com Credentials provider | Aceito |
| [ADR-003](ADR-003-rest-api-routes.md) | REST API Routes em vez de Server Actions | Aceito |
| [ADR-004](ADR-004-soft-delete.md) | Soft delete com campo `ativo` | Aceito |
| [ADR-005](ADR-005-snapshot-preco.md) | Snapshot de preço nos itens de pedido | Aceito |
| [ADR-006](ADR-006-consolidacao-rota.md) | Consolidação de carga com alocação por rota | Aceito |

## Bug Fixes

- [bugfixes.md](bugfixes.md) — Breaking changes e fixes do Prisma 7, Next.js 16, TypeScript, shadcn
