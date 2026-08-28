# Fiado Hub — Design Spec

## Problema

Usuário precisa navegar até cada cliente individualmente para dar baixa em fiados. Com múltiplos clientes devedores, o processo é lento e os registros ficam desatualizados.

## Solução

Página dedicada `/fiado` que centraliza todos os clientes com fiado em aberto em uma única tela, com ação "Dar Baixa" por cliente sem sair da página.

## Arquitetura

Cinco arquivos tocados:

| Arquivo | Ação |
|---------|------|
| `src/app/api/fiado/route.ts` | Criar — endpoint GET agrega clientes + pedidos em aberto |
| `src/hooks/use-fiado.ts` | Criar — hook React Query para o endpoint |
| `src/app/(system)/fiado/page.tsx` | Criar — página hub |
| `src/components/layout/Sidebar.tsx` | Modificar — adicionar link "Fiado" |
| `src/components/dashboard/PainelFiado.tsx` | Modificar — header vira link para `/fiado` |

Componentes reutilizados sem mudança: `BaixaFiadoDialog`, `useDarBaixaFiado`.

## API: `GET /api/fiado`

**Auth:** sessão obrigatória (padrão do sistema).

**Query Prisma:** `prisma.cliente.findMany` onde o cliente tem ao menos um pedido com `statusPagamento: "FIADO"`, `valorEmAbertoFiado > 0`, `ativo: true`. Inclui esses pedidos com seus itens.

**Resposta:**

```ts
{
  totalGeral: number          // soma de todos os valorEmAbertoFiado
  clientes: Array<{
    id: string
    nome: string
    cidade: string
    telefone: string | null
    totalFiado: number        // soma dos valorEmAbertoFiado deste cliente
    pedidosFiado: PedidoDTO[] // pedidos filtrados (FIADO, em aberto)
  }>
}
```

Ordenação: `totalFiado` descrescente (maior devedor primeiro).

## Hook: `useFiado`

```ts
// src/hooks/use-fiado.ts
export function useFiado() {
  return useQuery({
    queryKey: ["fiado"],
    queryFn: async () => {
      const res = await fetch("/api/fiado")
      if (!res.ok) throw new Error("Erro ao buscar fiados")
      return res.json()
    },
  })
}
```

Invalidação: `useDarBaixaFiado` já existe em `use-clientes.ts`. Na página hub, após `onSuccess` da baixa: `qc.invalidateQueries({ queryKey: ["fiado"] })`.

## Página: `/fiado`

**Header:** título "Fiado em Aberto" + badge laranja com `totalGeral` formatado + texto secundário "{N} clientes".

**Tabela:**

| Coluna | Detalhe |
|--------|---------|
| Cliente | nome bold |
| Cidade | texto cinza |
| Telefone | texto cinza, "—" se ausente |
| Pedidos em aberto | count badge |
| Total devido | laranja bold |
| Ação | botão "Dar Baixa" sm |

Ordenação: fixa por total desc (igual à API).

**Estado vazio:** ícone check verde + "Nenhum fiado em aberto".

**Loading:** skeleton de 3 linhas.

**Fluxo de baixa:**
1. Usuário clica "Dar Baixa" na linha do cliente
2. `BaixaFiadoDialog` abre com `pedidosFiado` daquele cliente
3. Usuário preenche valores + método → submete
4. `useDarBaixaFiado(clienteId).mutate(...)` → `onSuccess` invalida `["fiado"]`
5. Dialog fecha, tabela recarrega — se cliente quitou tudo, some da lista

## Sidebar

Adicionar entrada no array `links` em `Sidebar.tsx`:

```ts
{ href: "/fiado", label: "Fiado", icon: Wallet }
```

Posição: entre Pedidos e Clientes. Importar `Wallet` de `lucide-react`.

## PainelFiado (dashboard)

Título "Fiado em Aberto" no card vira um `<Link href="/fiado">` com estilo hover underline sutil. Dados e paginação permanecem iguais — só o header fica clicável como atalho para o hub.

## Testes

- `filtrarPedidosParaEntregar` e similares já têm cobertura em `alocacao-parcial.test.ts`
- Sem lógica nova para testar em utils — a regra de filtragem é `statusPagamento === "FIADO" && valorEmAbertoFiado > 0`, já validada no banco via query
- Sem TDD para a página (visual)

## Fora do escopo

- Filtros/busca na tabela
- Exportação de relatório
- Histórico de baixas por cliente (já existe em `/clientes/[id]`)
