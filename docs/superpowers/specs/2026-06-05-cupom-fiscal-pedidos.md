# Cupom Fiscal de Pedidos — Design Spec

## Goal

Permitir impressão de cupom no formato de cupom fiscal (não oficial) para qualquer pedido, diretamente na tela de Pedidos.

## Architecture

Nova página server-rendered `src/app/(system)/pedidos/[id]/print/page.tsx` renderiza o cupom em HTML puro com CSS para impressão 80mm. Botão de impressora adicionado em cada linha da `PedidoTable` abre essa página em nova aba via `window.open`. A página auto-dispara o diálogo de impressão do navegador ao carregar (`window.onload = () => window.print()`). Nenhuma biblioteca externa necessária.

## Tech Stack

- Next.js App Router (server component)
- Prisma (busca direta, sem API route)
- CSS `@media print` + fonte `Courier New`
- `lucide-react` ícone `Printer` no botão da tabela

## Components

### `src/app/(system)/pedidos/[id]/print/page.tsx`

Server component. Recebe `params.id`, busca pedido via `prisma.pedido.findUnique` com include de `cliente` e `itens.produto`. Retorna HTML estático do cupom.

**Layout do cupom (80mm, ~42 chars por linha):**

```
================================
      COMERCIAL OURIQUES
================================
CUPOM NÃO FISCAL

Data emissão: DD/MM/AAAA HH:MM
Pedido: ENTREGA | Nome Cliente
Cidade: NomeCidade
(ou "VENDA BALCÃO" se tipoPedido = BALCAO)
--------------------------------
PRODUTO        KG   QTD   TOTAL
NomeProduto    Xkg   N   R$0,00
--------------------------------
Subtotal:             R$0,00
Desconto:             -R$0,00   (omitir se desconto = 0)
TOTAL:                R$0,00
--------------------------------
Pagamento: STATUS | METODO
(omitir método se nulo)
--------------------------------
Obs: texto das observações
(omitir seção se sem observações)
================================
```

**CSS:**
- `@page { size: 80mm auto; margin: 4mm; }`
- `body { font-family: 'Courier New', monospace; font-size: 11px; width: 72mm; }`
- `@media print { body { margin: 0; } }`
- Script inline: `<script>window.onload = () => window.print()</script>`

**Auth:** Verifica sessão via `auth()`. Retorna 403 se não autenticado.

**Pedido não encontrado:** Retorna mensagem simples "Pedido não encontrado."

### `src/components/pedidos/PedidoTable.tsx`

Adiciona coluna de ações com ícone `Printer` (lucide-react, size 14). Ao clicar: `window.open(\`/pedidos/${p.id}/print\`, '_blank')`. Posicionado antes do botão de detalhes na coluna de ações existente.

## Data Flow

1. Usuário clica ícone `Printer` na linha do pedido
2. `window.open('/pedidos/[id]/print', '_blank')` abre nova aba
3. Server component busca pedido no banco via Prisma
4. HTML do cupom é renderizado e enviado ao browser
5. `window.onload` dispara `window.print()`
6. Usuário seleciona impressora térmica (80mm) e imprime
7. Aba pode ser fechada após impressão

## Labels

```typescript
const METODO_LABELS: Record<string, string> = {
  DINHEIRO: "DINHEIRO",
  PIX: "PIX",
  BOLETO: "BOLETO",
  CHEQUE: "CHEQUE",
  CARTAO_CREDITO: "CARTAO CREDITO",
  CARTAO_DEBITO: "CARTAO DEBITO",
}

const STATUS_PAG_LABELS: Record<string, string> = {
  PENDENTE: "PENDENTE",
  PAGO: "PAGO",
  FIADO: "FIADO",
}
```

(Maiúsculo para estilo cupom fiscal)

## Testing

Pure functions extraídas para teste:

- `formatCupomLinha(texto: string, largura: number): string` — padding/truncate para caber em N chars
- `calcularTotalPedido(itens: ItemPedidoDTO[]): number` — subtotal dos itens
- `formatarLinhaProduto(nome: string, peso: number, qtd: number, total: number): string` — linha formatada do produto

Testes em `src/test/cupom-fiscal-utils.test.ts`.

## Constraints

- Papel: 80mm (área útil ~72mm = ~42 chars em Courier New 11px)
- Não é cupom fiscal oficial — exibe "CUPOM NÃO FISCAL" explicitamente
- Sem geração de PDF — usa diálogo de impressão nativo do browser
- Sem nova dependência de biblioteca
