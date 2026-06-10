# C4 — Arquitetura RaçõesPro

## Nível 1: Contexto do Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                        Comercial Ouriques                        │
│                                                                  │
│  ┌──────────────┐          ┌─────────────────────────────────┐  │
│  │   Operador   │ browser  │         RaçõesPro               │  │
│  │ (funcionário)│─────────▶│  Sistema de gestão de pedidos,  │  │
│  └──────────────┘          │  clientes, produtos e rotas     │  │
│                            └─────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

Sistema interno. Um único tipo de usuário (operador). Sem integrações externas no MVP.

---

## Nível 2: Containers

```
┌─────────────────────────────────────────────────────────────────────┐
│                          RaçõesPro                                   │
│                                                                      │
│  ┌──────────────────────────────────────────────────┐               │
│  │              Next.js App (Node.js)                │               │
│  │                                                   │               │
│  │  ┌─────────────────┐   ┌──────────────────────┐  │               │
│  │  │   React Client  │   │    API Routes (REST)  │  │               │
│  │  │  (TanStack Q)   │──▶│  /api/produtos        │  │               │
│  │  │  shadcn/ui      │   │  /api/clientes        │  │               │
│  │  │  Recharts       │   │  /api/pedidos         │  │               │
│  │  │  PDF / XLSX     │   │  /api/veiculos        │  │               │
│  │  └─────────────────┘   │  /api/consolidacao    │  │               │
│  │                        │  /api/dashboard       │  │               │
│  │                        │  /api/auth (NextAuth) │  │               │
│  │                        └──────────┬────────────┘  │               │
│  │                                   │ Prisma 7      │               │
│  └───────────────────────────────────┼───────────────┘               │
│                                      │                               │
│  ┌───────────────────────────────────▼───────────────┐               │
│  │              Banco de Dados                        │               │
│  │  Dev: SQLite (file:./prisma/dev.db)                │               │
│  │  Prod: Turso / libsql                              │               │
│  └────────────────────────────────────────────────────┘               │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Nível 3: Componentes (Next.js App)

### Camada de dados

| Componente | Responsabilidade |
|---|---|
| `src/lib/prisma.ts` | Singleton do PrismaClient com adapter PrismaLibSql |
| `prisma/schema.prisma` | Modelos: User, Produto, Cliente, Veiculo, Pedido, ItemPedido, ConsolidacaoRota, ConsolidacaoItem |
| `prisma.config.ts` | URL do datasource (Prisma 7 — fora do schema) e comando de seed |

### Camada de API

| Rota | Operações |
|---|---|
| `/api/auth/[...nextauth]` | Login, logout, sessão JWT |
| `/api/produtos` | CRUD + soft delete |
| `/api/clientes` | CRUD + soft delete + histórico de pedidos |
| `/api/veiculos` | CRUD + soft delete |
| `/api/pedidos` | Criar, listar, detalhar, atualizar status |
| `/api/consolidacao` | Criar rota, alocar pedido, remover pedido, fechar rota |
| `/api/dashboard` | KPIs agregados (vendas, fiado, pedidos) por período |

### Camada de autenticação

| Componente | Responsabilidade |
|---|---|
| `src/lib/auth.ts` | Configuração NextAuth v5, Credentials provider, callbacks JWT |
| `src/proxy.ts` | Middleware: protege rotas, redireciona login/logout |

### Camada de UI

| Componente | Responsabilidade |
|---|---|
| `src/app/(system)/layout.tsx` | Shell com sidebar + área de conteúdo |
| `src/components/layout/Sidebar.tsx` | Navegação principal |
| `src/app/(system)/dashboard/` | KPIs, gráfico de vendas, painel de fiado, export PDF/Excel |
| `src/app/(system)/pedidos/` | Listagem, criação, detalhe de pedidos |
| `src/app/(system)/clientes/` | CRUD + histórico |
| `src/app/(system)/produtos/` | CRUD |
| `src/app/(system)/veiculos/` | CRUD |
| `src/app/(system)/consolidacao/` | Painel duplo: rotas abertas + pedidos disponíveis |

---

## Modelo de dados

```
User
  └── (autentica operadores)

Produto ──────────────────────────┐
Cliente ──────────────────────────┤
  └── Pedido ──────────────────── ItemPedido (snapshot pesoUnit, valorUnit)
        └── ConsolidacaoItem ────▶ ConsolidacaoRota
                                    └── Veiculo
```

**Enums:**
- `StatusEntrega`: PENDENTE | EM_ROTA | ENTREGUE | CANCELADO
- `StatusPagamento`: PENDENTE | PAGO | FIADO
- `MetodoPagamento`: DINHEIRO | PIX | BOLETO | FIADO
- `StatusRota`: ABERTA | FECHADA

---

## Decisões de arquitetura relevantes

Ver ADRs individuais:
- [ADR-001](ADR-001-banco-de-dados.md) — SQLite → Turso
- [ADR-002](ADR-002-autenticacao.md) — NextAuth v5 Credentials
- [ADR-003](ADR-003-rest-api-routes.md) — REST vs Server Actions
- [ADR-004](ADR-004-soft-delete.md) — Soft delete
- [ADR-005](ADR-005-snapshot-preco.md) — Snapshot de preço
- [ADR-006](ADR-006-consolidacao-rota.md) — Consolidação de carga
