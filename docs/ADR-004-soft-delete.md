# ADR-004: Soft delete com campo `ativo`

**Status:** Aceito  
**Data:** 2026-06-01

## Contexto

Produtos, clientes e veículos precisam poder ser "removidos" da operação sem perder histórico. Um pedido fechado deve manter referência ao produto com preço original mesmo se o produto for descontinuado.

## Decisão

Soft delete via campo `ativo: Boolean @default(true)` em `Produto`, `Cliente` e `Veiculo`. Nenhum registro é deletado fisicamente.

## Justificativa

- Pedidos históricos mantêm integridade referencial sem precisar de tabelas de archive
- Relatórios de período passado permanecem corretos
- Auditoria possível: saber quando e quais produtos foram desativados
- Simples de implementar — filtro `where: { ativo: true }` em todas as queries de listagem

## Consequências

- Todas as queries de listagem devem incluir `where: { ativo: true }` — risco de esquecer o filtro
- IDs de registros inativos ainda existem no banco — FK constraints continuam válidas
- Reativação possível (`PATCH /api/produtos/:id` com `{ ativo: true }`)
- Não aplicado a `Pedido`, `ConsolidacaoRota`, `ItemPedido` — esses têm ciclo de vida por status
