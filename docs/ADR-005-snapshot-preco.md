# ADR-005: Snapshot de preço nos itens de pedido

**Status:** Aceito  
**Data:** 2026-06-01

## Contexto

O preço de um produto pode ser alterado a qualquer momento. Um pedido fechado deve preservar o valor cobrado no momento da venda, independente de atualizações futuras no cadastro do produto.

## Decisão

`ItemPedido` armazena `pesoUnit` e `valorUnit` como snapshot no momento da criação do pedido. Esses campos não são atualizados quando o produto é editado.

## Justificativa

- Integridade fiscal: nota/recibo deve refletir o valor efetivamente cobrado
- Sem necessidade de tabela de histórico de preços — snapshot direto no item é suficiente para o volume do MVP
- Auditoria clara: qualquer item de pedido carrega seu próprio preço histórico

## Consequências

- `total` do pedido calculado em runtime (`SUM(quantidade * valorUnit)`) ou persistido — optou-se por calcular na query agregada
- Editar um pedido existente: requer decisão sobre reprocessar ou manter snapshot — no MVP, pedidos não são editados após criação
- Campo `valorUnit` em `ItemPedido` ≠ `Produto.precoKg` atual — isso é intencional, não um bug
