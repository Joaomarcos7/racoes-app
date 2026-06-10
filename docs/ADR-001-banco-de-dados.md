# ADR-001: SQLite local → Turso (libsql) em produção

**Status:** Aceito  
**Data:** 2026-06-01

## Contexto

MVP para distribuidor de rações (Comercial Ouriques). Volume esperado: centenas de pedidos/mês, operação local com 1-3 usuários simultâneos. Custo operacional precisa ser zero ou próximo de zero na fase inicial.

## Decisão

SQLite via arquivo local em desenvolvimento (`file:./prisma/dev.db`), Turso (libsql) em produção.

## Justificativa

- SQLite suficiente para carga do MVP sem overhead de servidor
- Turso oferece SQLite gerenciado na nuvem com free tier generoso e API compatível com libsql
- Mesma engine, mesma sintaxe — sem diferença de comportamento entre dev e prod
- Prisma 7 exige adapter `PrismaLibSql` para ambos os ambientes, então a abstração é transparente

## Consequências

- Adapter `@prisma/adapter-libsql` obrigatório em toda instância de `PrismaClient`
- `prisma.config.ts` gerencia URL fora do schema (breaking change Prisma 7)
- Migração futura para Postgres requer trocar adapter e rever tipos (ex: enums)
- Sem suporte a `RETURNING` em algumas versões do libsql — usar `findUnique` pós-insert se necessário
