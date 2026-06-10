# ADR-006: Consolidação de carga com alocação por rota

**Status:** Aceito  
**Data:** 2026-06-01

## Contexto

O distribuidor opera com veículos de capacidade limitada. Pedidos precisam ser agrupados em rotas de entrega, respeitando a capacidade do veículo. Um pedido só pode estar em uma rota por vez.

## Decisão

`ConsolidacaoRota` representa uma rota de entrega. `ConsolidacaoItem` vincula pedidos à rota com constraint `pedidoId @unique` — um pedido só pode estar em uma rota aberta por vez.

Fechar a rota (`POST /api/consolidacao/:id/fechar`) executa transação atômica que:
1. Muda `ConsolidacaoRota.status` para `FECHADA`
2. Atualiza todos os pedidos alocados para `statusEntrega: EM_ROTA`

## Justificativa

- `@unique` no `pedidoId` enforça a regra de negócio no banco, sem lógica duplicada no código
- Transação garante consistência: impossível ter rota fechada com pedidos ainda em `PENDENTE`
- Validação de peso na alocação (`pesoTotal > veiculo.capacidadeKg`) retorna 400 antes de inserir

## Consequências

- Remover pedido de rota antes de fechar: `DELETE /api/consolidacao/:id/remover/:pedidoId`
- Reabrir rota fechada: não suportado no MVP — criar nova rota
- Um pedido cancelado após alocação: precisa ser removido manualmente da rota antes de cancelar
