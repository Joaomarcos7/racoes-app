# Bug Fixes & Breaking Changes

Registro de problemas encontrados durante o desenvolvimento e como foram resolvidos.  
Atualizar a cada nova iteração.

---

## Prisma 7 — Comportamento de migrate reset

### BF-015: `prisma migrate reset` não reaplicou migrations automaticamente

**Sintoma:** Dashboard 500 — `SQLITE_ERROR: no such table: main.User`. Apenas `_prisma_migrations` existia no banco.

**Causa raiz:** No Prisma 7, `prisma migrate reset --force` deleta o banco e recria apenas a tabela de controle `_prisma_migrations`, mas **não aplica as migrations pendentes automaticamente**. É necessário rodar `prisma migrate dev` em seguida.

**Sequência correta ao resetar o banco em dev:**
```bash
npx prisma migrate reset --force   # deleta dados
npx prisma migrate dev             # reaplicar schema
npx prisma db seed                 # popular dados iniciais
```

**Observação:** Após qualquer alteração em `node_modules/@prisma/client` (via `prisma generate`), o servidor Next.js deve ser reiniciado — o singleton `globalThis.prisma` carregado em memória não é atualizado por hot reload.

---

## Autenticação

### BF-012: Login retorna `error=Configuration` / `error=CredentialsSignin`

**Sintoma:** Login com `admin@racoes.com` / `admin123` falha. NextAuth redireciona para `/login?error=Configuration` ou `/login?error=CredentialsSignin`.

**Causa raiz:** `TURSO_DATABASE_URL=` no `.env` define a variável como string vazia `""`. O operador `??` (nullish coalescing) só ignora `null`/`undefined` — não ignora string vazia. Então:
```typescript
// ERRADO — TURSO_DATABASE_URL="" passa o ?? e url fica ""
const url = process.env.TURSO_DATABASE_URL ?? process.env.DATABASE_URL ?? "file:./prisma/dev.db"
// url = "" → PrismaLibSql({ url: "" }) lança erro dentro do authorize
```
O `authorize` do NextAuth lançava exceção → NextAuth retorna `error=Configuration`.

**Fix em `src/lib/prisma.ts`:**
```typescript
// CORRETO — || ignora strings vazias
const url = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || "file:./prisma/dev.db"
const authToken = process.env.TURSO_AUTH_TOKEN || undefined
```

**Observação:** Após alterar `prisma.ts`, o singleton `globalThis.prisma` (inicializado com URL errada) persiste em dev. Obrigatório reiniciar o servidor para limpar o singleton. Sem reinício, a correção não tem efeito.

---

### BF-014: Dashboard com cold start de 5.5s

**Sintoma:** Primeira navegação ao dashboard demora ~5.5s. Outras páginas demoram <800ms no cold start.

**Causa raiz:** Dashboard importava `ExportButton` e `GraficoVendas` de forma estática (eager). Essas dependências carregavam `@react-pdf/renderer` (3MB), `xlsx` (7.2MB) e `recharts` (8MB) — 18MB de bibliotecas compilados pelo Turbopack na primeira requisição.

**Fix em `src/app/(system)/dashboard/page.tsx`:**
```typescript
// Antes: import estático — 18MB compilados na primeira carga
import { GraficoVendas } from "@/components/dashboard/GraficoVendas"
import { ExportButton } from "@/components/dashboard/ExportButton"

// Depois: dynamic import — bibliotecas carregadas apenas quando necessário
const GraficoVendas = dynamic(() => import("@/components/dashboard/GraficoVendas").then(m => m.GraficoVendas), { ssr: false })
const ExportButton = dynamic(() => import("@/components/dashboard/ExportButton").then(m => m.ExportButton), { ssr: false })
```

**Resultado:** Cold start 5.5s → 0.67s (8x mais rápido).

---

### BF-013: `<SelectItem value="">` lança RuntimeError

**Sintoma:** `A <Select.Item /> must have a value prop that is not an empty string.`

**Causa:** shadcn/ui Select usa Radix UI — string vazia é reservada para "limpar seleção" e não pode ser usada como valor de item.

**Fix:** Usar valor sentinela `"all"` e converter antes de passar para a query:
```tsx
// SelectItem
<SelectItem value="all">Todos</SelectItem>

// useState inicial
const [statusEntrega, setStatusEntrega] = useState("all")

// passar para hook
statusEntrega: statusEntrega === "all" ? "" : statusEntrega,
```

---

## Prisma 7 — Breaking Changes

### BF-001: `url` não suportado em `datasource` do schema

**Sintoma:** `The datasource property url is no longer supported in schema files`

**Causa:** Prisma 7 removeu a propriedade `url` do bloco `datasource` no schema.

**Fix:** Criar `prisma.config.ts` com `defineConfig({ datasource: { url: process.env.DATABASE_URL ?? "file:./prisma/dev.db" } })`. Remover `url` do `schema.prisma`.

---

### BF-002: `env()` lança erro quando `.env` não está carregado

**Sintoma:** `PrismaConfigEnvError: Cannot resolve environment variable: DATABASE_URL`

**Causa:** O helper `env()` do Prisma falha se a variável não estiver definida no processo.

**Fix:** Usar `process.env.DATABASE_URL ?? "file:./prisma/dev.db"` diretamente em vez de `env("DATABASE_URL")`.

---

### BF-003: `new PrismaClient()` sem adapter falha

**Sintoma:** `PrismaClientInitializationError: PrismaClient needs to be constructed with a non-empty, valid PrismaClientOptions`

**Causa:** Prisma 7 exige adapter em toda instância de PrismaClient quando usando driver adapters.

**Fix:** Sempre construir com adapter:
```typescript
const adapter = new PrismaLibSql({ url })
const prisma = new PrismaClient({ adapter })
```

---

### BF-004: Import `PrismaLibSQL` renomeado para `PrismaLibSql`

**Sintoma:** `TypeError: import_adapter_libsql.PrismaLibSQL is not a constructor`

**Causa:** `@prisma/adapter-libsql` renomeou a classe e mudou a API do construtor.

**Fix:** Mudar import para `PrismaLibSql` (lowercase 'ql') e usar novo construtor:
```typescript
// Antes (v6)
import { PrismaLibSQL } from "@prisma/adapter-libsql"
const client = createClient({ url })
const adapter = new PrismaLibSQL(client)

// Depois (v7)
import { PrismaLibSql } from "@prisma/adapter-libsql"
const adapter = new PrismaLibSql({ url, authToken })
```

---

### BF-005: Configuração de seed ignorada no `package.json`

**Sintoma:** `⚠️ No seed command configured` mesmo com `"prisma": { "seed": "..." }` no `package.json`

**Causa:** Prisma 7 moveu a configuração de seed para `prisma.config.ts`.

**Fix:** Mover para `prisma.config.ts`:
```typescript
export default defineConfig({
  migrations: { seed: "tsx prisma/seed.ts" },
})
```

---

### BF-006: `previewFeatures = ["driverAdapters"]` depreciado

**Sintoma:** `warn Preview feature "driverAdapters" is deprecated`

**Causa:** Driver adapters saíram de preview no Prisma 7, a flag não é mais necessária.

**Fix:** Remover `previewFeatures = ["driverAdapters"]` do generator no schema.

---

## Next.js 16 — Breaking Changes

### BF-007: `middleware.ts` depreciado

**Sintoma:** `⚠ The "middleware" file convention is deprecated. Please use "proxy" instead`

**Causa:** Next.js 16 renomeou a convenção de middleware.

**Fix:** Renomear `src/middleware.ts` → `src/proxy.ts`. Conteúdo permanece igual.

---

### BF-008: `params` em rotas dinâmicas é agora uma Promise

**Sintoma:** TypeScript error ao acessar `params.id` diretamente.

**Causa:** Next.js 16 tornou `params` assíncrono em route handlers.

**Fix:** Await params antes de usar:
```typescript
// Antes
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params

// Depois
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
```

---

## TypeScript

### BF-009: Recharts `Tooltip formatter` tipo incompatível

**Sintoma:** `Type '(v: number) => string' is not assignable to type 'Formatter<ValueType, NameType>'`

**Fix:**
```typescript
// Antes
<Tooltip formatter={(v: number) => formatCurrency(v)} />

// Depois
<Tooltip formatter={(v) => formatCurrency(Number(v))} />
```

---

### BF-010: `PainelFiado` prop `totalFiado` tipo `number | undefined`

**Sintoma:** `Type 'number | undefined' is not assignable to type 'number'` ao passar dados da API.

**Fix:** Cast explícito no uso:
```typescript
<PainelFiado
  clientes={(data.clientesFiado as unknown as { id: string; nome: string; cidade: string; totalFiado: number }[])}
  totalFiado={data.totalFiado}
/>
```

---

## shadcn/ui

### BF-011: Init usou estilo errado

**Sintoma:** `components.json` com `"style": "base-nova"` e `"baseColor": "neutral"` — componentes com visual incorreto.

**Fix:** Atualizar `components.json`:
```json
{
  "style": "new-york",
  "tailwind": { "baseColor": "zinc" }
}
```
Re-instalar componentes com `npx shadcn@latest add`.
