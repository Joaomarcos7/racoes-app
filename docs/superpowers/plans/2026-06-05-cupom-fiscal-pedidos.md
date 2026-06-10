# Cupom Fiscal de Pedidos — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adicionar botão de impressão na tabela de pedidos que abre uma página server-rendered formatada como cupom fiscal (80mm) e dispara o diálogo de impressão do navegador automaticamente.

**Architecture:** Nova rota `src/app/(system)/pedidos/[id]/print/page.tsx` server component busca pedido via Prisma e renderiza HTML do cupom com CSS `@media print` para 80mm. `PedidoTable` recebe novo ícone `Printer` que abre a rota em nova aba. Pure functions de formatação são extraídas e testadas via TDD antes de qualquer implementação.

**Tech Stack:** Next.js App Router (server component), Prisma (direct query), Tailwind CSS / inline styles, `lucide-react` (ícone Printer), Vitest (testes)

---

## File Structure

- **Create:** `src/lib/cupom-fiscal-utils.ts` — pure functions de formatação do cupom
- **Create:** `src/test/cupom-fiscal-utils.test.ts` — testes das pure functions
- **Create:** `src/app/(system)/pedidos/[id]/print/page.tsx` — página server component do cupom
- **Modify:** `src/components/pedidos/PedidoTable.tsx` — adiciona coluna com botão Printer

---

## Task 1: Pure functions de formatação do cupom

**Files:**
- Create: `src/lib/cupom-fiscal-utils.ts`
- Create: `src/test/cupom-fiscal-utils.test.ts`

### Step 1.1 — Write failing tests

- [ ] Crie `src/test/cupom-fiscal-utils.test.ts` com o conteúdo abaixo:

```typescript
import { describe, it, expect } from "vitest"
import {
  padEnd,
  truncate,
  formatarLinhaProduto,
  calcularSubtotal,
  calcularTotal,
  formatarDataEmissao,
} from "@/lib/cupom-fiscal-utils"

describe("padEnd", () => {
  it("pads string to exact width with spaces on the right", () => {
    expect(padEnd("ABC", 6)).toBe("ABC   ")
  })

  it("returns string unchanged when already at width", () => {
    expect(padEnd("ABCDEF", 6)).toBe("ABCDEF")
  })

  it("truncates string when longer than width", () => {
    expect(padEnd("ABCDEFGH", 6)).toBe("ABCDEF")
  })
})

describe("truncate", () => {
  it("returns string unchanged when shorter than max", () => {
    expect(truncate("ABC", 6)).toBe("ABC")
  })

  it("truncates to max length", () => {
    expect(truncate("ABCDEFGH", 6)).toBe("ABCDEF")
  })
})

describe("formatarLinhaProduto", () => {
  it("formats product line within 42 chars", () => {
    const linha = formatarLinhaProduto("Ração Premium", 25, 2, 180)
    expect(linha.length).toBeLessThanOrEqual(42)
  })

  it("includes product name, weight, quantity and total", () => {
    const linha = formatarLinhaProduto("Ração Premium", 25, 2, 180)
    expect(linha).toContain("25kg")
    expect(linha).toContain("2")
    expect(linha).toContain("180")
  })

  it("truncates long product names to fit in 42 chars", () => {
    const linha = formatarLinhaProduto("Nome Muito Longo De Produto Especial Super", 10, 1, 50)
    expect(linha.length).toBeLessThanOrEqual(42)
  })
})

describe("calcularSubtotal", () => {
  it("sums all item quantities times valorUnit", () => {
    const itens = [
      { quantidade: 2, valorUnit: 90 },
      { quantidade: 1, valorUnit: 50 },
    ]
    expect(calcularSubtotal(itens)).toBe(230)
  })

  it("returns 0 for empty items", () => {
    expect(calcularSubtotal([])).toBe(0)
  })
})

describe("calcularTotal", () => {
  it("subtracts desconto from subtotal", () => {
    expect(calcularTotal(270, 10)).toBe(260)
  })

  it("returns subtotal when desconto is 0", () => {
    expect(calcularTotal(270, 0)).toBe(270)
  })

  it("never returns negative total", () => {
    expect(calcularTotal(10, 999)).toBe(0)
  })
})

describe("formatarDataEmissao", () => {
  it("formats date as DD/MM/AAAA HH:MM in pt-BR", () => {
    const date = new Date("2026-06-05T14:32:00")
    const result = formatarDataEmissao(date)
    expect(result).toMatch(/\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}/)
  })
})
```

### Step 1.2 — Run tests to verify they fail

- [ ] Run: `npx vitest run src/test/cupom-fiscal-utils.test.ts`
- [ ] Expected: FAIL — "Cannot find module '@/lib/cupom-fiscal-utils'"

### Step 1.3 — Implement pure functions

- [ ] Crie `src/lib/cupom-fiscal-utils.ts`:

```typescript
export function padEnd(str: string, width: number): string {
  if (str.length >= width) return str.slice(0, width)
  return str + " ".repeat(width - str.length)
}

export function truncate(str: string, max: number): string {
  return str.length <= max ? str : str.slice(0, max)
}

export function formatarLinhaProduto(
  nome: string,
  pesoKg: number,
  quantidade: number,
  total: number
): string {
  const totalStr = `R$${total.toFixed(2)}`
  const qtdStr = String(quantidade)
  const pesoStr = `${pesoKg}kg`
  // right side: " 25kg  2  R$180.00" = ~20 chars
  const rightSide = ` ${padEnd(pesoStr, 5)} ${padEnd(qtdStr, 3)} ${totalStr}`
  const nomeWidth = 42 - rightSide.length
  return padEnd(truncate(nome, nomeWidth), nomeWidth) + rightSide
}

export function calcularSubtotal(
  itens: { quantidade: number; valorUnit: number }[]
): number {
  return itens.reduce((acc, item) => acc + item.quantidade * item.valorUnit, 0)
}

export function calcularTotal(subtotal: number, desconto: number): number {
  return Math.max(0, subtotal - desconto)
}

export function formatarDataEmissao(date: Date): string {
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}
```

### Step 1.4 — Run tests to verify they pass

- [ ] Run: `npx vitest run src/test/cupom-fiscal-utils.test.ts`
- [ ] Expected: All tests PASS, no warnings

### Step 1.5 — Commit

```bash
git add src/lib/cupom-fiscal-utils.ts src/test/cupom-fiscal-utils.test.ts
git commit -m "feat: add cupom fiscal pure formatting utils with tests"
```

---

## Task 2: Página de impressão do cupom

**Files:**
- Create: `src/app/(system)/pedidos/[id]/print/page.tsx`

Esta é uma página server component. Não usa `"use client"`. Busca o pedido diretamente via Prisma. Renderiza HTML simples com estilos inline (não Tailwind, pois o CSS de impressão precisa ser preciso e Tailwind não carrega em `@media print` server-rendered sem layout wrapper).

### Step 2.1 — Crie a página

- [ ] Crie `src/app/(system)/pedidos/[id]/print/page.tsx`:

```tsx
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import {
  calcularSubtotal,
  calcularTotal,
  formatarLinhaProduto,
  formatarDataEmissao,
} from "@/lib/cupom-fiscal-utils"

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

const SEP = "─".repeat(42)
const SEP_DOUBLE = "═".repeat(42)

export default async function CupomFiscalPrintPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session) redirect("/login")

  const { id } = await params
  const pedido = await prisma.pedido.findUnique({
    where: { id },
    include: { cliente: true, itens: { include: { produto: true } } },
  })

  if (!pedido) {
    return (
      <html>
        <body style={{ fontFamily: "Courier New, monospace", fontSize: "11px" }}>
          <p>Pedido não encontrado.</p>
        </body>
      </html>
    )
  }

  const subtotal = calcularSubtotal(pedido.itens)
  const desconto = pedido.desconto ?? 0
  const total = calcularTotal(subtotal, desconto)
  const agora = new Date()
  const dataEmissao = formatarDataEmissao(agora)

  const isEntrega = pedido.tipoPedido === "ENTREGA"
  const clienteInfo = isEntrega && pedido.cliente
    ? `ENTREGA | ${pedido.cliente.nome}`
    : "VENDA BALCAO"
  const cidadeInfo = isEntrega && pedido.cliente ? pedido.cliente.cidade : null

  const metodoLabel = pedido.metodoPagamento
    ? ` | ${METODO_LABELS[pedido.metodoPagamento] ?? pedido.metodoPagamento}`
    : ""
  const pagamentoLine = `${STATUS_PAG_LABELS[pedido.statusPagamento] ?? pedido.statusPagamento}${metodoLabel}`

  const styles = `
    @page { size: 80mm auto; margin: 4mm; }
    body {
      font-family: 'Courier New', Courier, monospace;
      font-size: 11px;
      width: 72mm;
      margin: 0;
      padding: 0;
      color: #000;
    }
    pre {
      white-space: pre-wrap;
      word-break: break-word;
      margin: 0;
      font-family: inherit;
      font-size: inherit;
    }
    @media print {
      body { margin: 0; }
    }
  `

  const linhasItens = pedido.itens.map((item) =>
    formatarLinhaProduto(
      item.produto.nome,
      item.pesoUnit,
      item.quantidade,
      item.quantidade * item.valorUnit
    )
  )

  const cupomLines = [
    SEP_DOUBLE,
    "      COMERCIAL OURIQUES      ",
    SEP_DOUBLE,
    "CUPOM NAO FISCAL",
    "",
    `Data emissao: ${dataEmissao}`,
    `Pedido: ${clienteInfo}`,
    ...(cidadeInfo ? [`Cidade: ${cidadeInfo}`] : []),
    SEP,
    "PRODUTO             KG    QTD  TOTAL",
    ...linhasItens,
    SEP,
    `Subtotal:${" ".repeat(42 - 9 - formatBRL(subtotal).length)}${formatBRL(subtotal)}`,
    ...(desconto > 0
      ? [`Desconto:${" ".repeat(42 - 9 - formatBRL(desconto).length - 1)}-${formatBRL(desconto)}`]
      : []),
    `TOTAL:   ${" ".repeat(42 - 9 - formatBRL(total).length)}${formatBRL(total)}`,
    SEP,
    `Pagamento: ${pagamentoLine}`,
    ...(pedido.observacoes
      ? [SEP, `Obs: ${pedido.observacoes}`]
      : []),
    SEP_DOUBLE,
  ]

  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <title>Cupom - {isEntrega && pedido.cliente ? pedido.cliente.nome : "Balcao"}</title>
        <style dangerouslySetInnerHTML={{ __html: styles }} />
        <script dangerouslySetInnerHTML={{ __html: "window.onload = function() { window.print(); }" }} />
      </head>
      <body>
        <pre>{cupomLines.join("\n")}</pre>
      </body>
    </html>
  )
}

function formatBRL(value: number): string {
  return `R$${value.toFixed(2).replace(".", ",")}`
}
```

> **Nota:** A função `formatBRL` é local nesta página (não usa `Intl.NumberFormat`) para garantir output previsível e consistente no `pre` do cupom. `formatarDataEmissao` e `formatarLinhaProduto` vêm do `cupom-fiscal-utils.ts`.

### Step 2.2 — Verifique TypeScript

- [ ] Run: `npx tsc --noEmit`
- [ ] Expected: sem erros

### Step 2.3 — Commit

```bash
git add src/app/(system)/pedidos/[id]/print/page.tsx
git commit -m "feat: add cupom fiscal print page (server component, 80mm)"
```

---

## Task 3: Botão de impressão na PedidoTable

**Files:**
- Modify: `src/components/pedidos/PedidoTable.tsx`

### Step 3.1 — Write failing test (comportamento do botão)

- [ ] Adicione ao final de `src/test/pedido-status-utils.test.ts` **não** — crie arquivo dedicado `src/test/PedidoTablePrint.test.tsx`:

```tsx
import { describe, it, expect, vi } from "vitest"
import { render, fireEvent } from "@testing-library/react"

// Minimal pedido stub — só o que PedidoTable usa
const makePedido = (id: string) => ({
  id,
  tipoPedido: "BALCAO" as const,
  cliente: null,
  dataPedido: "2026-06-05",
  statusEntrega: null,
  statusPagamento: "PAGO" as const,
  metodoPagamento: "PIX" as const,
  observacoes: null,
  desconto: 0,
  dataVencimentoFiado: null,
  itens: [],
  createdAt: "2026-06-05",
  updatedAt: "2026-06-05",
})

describe("PedidoTable print button", () => {
  it("opens print page in new tab when printer icon is clicked", () => {
    // Dinamically import to avoid circular deps at test time
    const { PedidoTable } = require("@/components/pedidos/PedidoTable")
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null)

    const { getAllByLabelText } = render(
      <PedidoTable pedidos={[makePedido("abc123")]} onDelete={vi.fn()} />
    )

    const printBtn = getAllByLabelText("Imprimir cupom")[0]
    fireEvent.click(printBtn)

    expect(openSpy).toHaveBeenCalledWith("/pedidos/abc123/print", "_blank")
    openSpy.mockRestore()
  })
})
```

### Step 3.2 — Run test to verify it fails

- [ ] Run: `npx vitest run src/test/PedidoTablePrint.test.tsx`
- [ ] Expected: FAIL — botão com aria-label "Imprimir cupom" não existe ainda

### Step 3.3 — Adicione o botão Printer na PedidoTable

- [ ] Abra `src/components/pedidos/PedidoTable.tsx`
- [ ] Adicione `Printer` no import de lucide-react (linha 7):

```typescript
import { Plus, Printer, Trash2 } from "lucide-react"
```

- [ ] Na coluna de ações (linha 65–83), adicione o botão Printer **antes** do botão de detalhes:

```tsx
<td className="px-4 py-3 text-right">
  <div className="flex gap-1 justify-end">
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            aria-label="Imprimir cupom"
            onClick={() => window.open(`/pedidos/${p.id}/print`, "_blank")}
          >
            <Printer size={14} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Imprimir cupom</TooltipContent>
      </Tooltip>
    </TooltipProvider>
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button size="icon" variant="ghost" asChild>
            <Link href={`/pedidos/${p.id}`}><Plus size={14} /></Link>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Ver detalhes</TooltipContent>
      </Tooltip>
    </TooltipProvider>
    <ConfirmDeleteDialog onConfirm={() => onDelete(p.id)}>
      <Button size="icon" variant="ghost" className="text-red-500 hover:text-red-700">
        <Trash2 size={14} />
      </Button>
    </ConfirmDeleteDialog>
  </div>
</td>
```

### Step 3.4 — Run tests to verify they pass

- [ ] Run: `npx vitest run src/test/PedidoTablePrint.test.tsx`
- [ ] Expected: PASS

### Step 3.5 — Run full test suite

- [ ] Run: `npx vitest run`
- [ ] Expected: todos os testes passam, sem warnings

### Step 3.6 — TypeScript check

- [ ] Run: `npx tsc --noEmit`
- [ ] Expected: sem erros

### Step 3.7 — Commit

```bash
git add src/components/pedidos/PedidoTable.tsx src/test/PedidoTablePrint.test.tsx
git commit -m "feat: add print button to PedidoTable opening 80mm cupom fiscal"
```

---

## Verificação Manual

Após os 3 tasks:

1. `npm run dev` — servidor rodando em http://localhost:3000
2. Navegue para `/pedidos`
3. Clique no ícone de impressora em qualquer pedido
4. Nova aba abre com o cupom formatado
5. Diálogo de impressão do navegador dispara automaticamente
6. No diálogo, selecionar a impressora térmica 80mm e confirmar
