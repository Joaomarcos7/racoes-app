# Deploy de Produção Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Colocar o MVP em produção acessível de qualquer lugar, usando Vercel (Next.js) + Turso (SQLite remoto), custo ~R$0/mês.

**Architecture:** Código no GitHub → Vercel faz build e deploy automático em push na `main`. Banco de dados SQLite remoto no Turso via libsql — o `src/lib/prisma.ts` já usa `TURSO_DATABASE_URL` quando disponível. Migrations rodam no build com `prisma migrate deploy`.

**Tech Stack:** Next.js 16, Prisma 7 + libsql adapter, Turso (libsql), Vercel, GitHub

---

## Task 1: Criar repositório GitHub e fazer push do código

**Files:**
- No code changes — apenas comandos git/GitHub CLI

Este task cria o repositório remoto no GitHub e sobe o código local. O `.gitignore` já exclui `.env*` e `prisma/dev.db` — nenhum secret ou banco será commitado.

- [ ] **Step 1: Verificar que `.gitignore` protege secrets**

```bash
cat .gitignore | grep -E "\.env|\.db"
```

Expected output deve conter:
```
.env*
prisma/dev.db
prisma/dev.db-journal
```

Se não aparecer, adicionar ao `.gitignore`:
```
.env*
prisma/dev.db
prisma/dev.db-journal
```

- [ ] **Step 2: Instalar GitHub CLI (se não tiver)**

```bash
# Windows (PowerShell)
winget install --id GitHub.cli
```

Verificar:
```bash
gh --version
```

Expected: `gh version 2.x.x`

- [ ] **Step 3: Autenticar no GitHub CLI**

```bash
gh auth login
```

Escolher: GitHub.com → HTTPS → Login with a web browser. Seguir instruções no browser.

- [ ] **Step 4: Criar repositório no GitHub**

```bash
cd C:\Users\joaom\Dev\racoes-app
gh repo create racoes-app --private --source=. --remote=origin --push
```

Expected output:
```
✓ Created repository <usuario>/racoes-app on GitHub
✓ Added remote https://github.com/<usuario>/racoes-app.git
✓ Pushed commits to https://github.com/<usuario>/racoes-app.git
```

- [ ] **Step 5: Verificar push**

```bash
git log --oneline -3
git remote -v
```

Expected: remote `origin` apontando para `https://github.com/<usuario>/racoes-app.git`

---

## Task 2: Ajustar `package.json` build script para migrations

**Files:**
- Modify: `package.json` (linha do script `"build"`)

O Vercel roda `npm run build` durante o deploy. Precisamos que as migrations do Prisma sejam aplicadas no banco Turso antes do Next.js compilar. Trocar o script `build` para incluir `prisma migrate deploy` antes do `next build`.

- [ ] **Step 1: Abrir `package.json` e localizar script build**

Arquivo: `package.json`, campo `"scripts"`. Linha atual:
```json
"build": "next build",
```

- [ ] **Step 2: Alterar script build**

Substituir por:
```json
"build": "prisma migrate deploy && next build",
```

O arquivo `package.json` na seção scripts deve ficar assim:
```json
"scripts": {
  "dev": "next dev --turbopack",
  "build": "prisma migrate deploy && next build",
  "start": "next start",
  "lint": "next lint",
  "test": "vitest",
  "db:seed": "tsx prisma/seed.ts"
},
```

(Manter todos os outros scripts intactos — só alterar a linha `"build"`.)

- [ ] **Step 3: Verificar build local ainda funciona**

```bash
cd C:\Users\joaom\Dev\racoes-app
npm run build
```

Expected: build completa sem erros. O `prisma migrate deploy` em ambiente local vai usar `DATABASE_URL=file:./prisma/dev.db` do `.env`.

Se aparecer erro de migrations pendentes, rodar primeiro:
```bash
npx prisma migrate dev
```

- [ ] **Step 4: Atualizar `.env.example` com vars de produção**

Arquivo: `.env.example`. Substituir conteúdo por:
```
# Local SQLite (dev)
DATABASE_URL=file:./prisma/dev.db

# NextAuth v5 — generate with: openssl rand -base64 32
AUTH_SECRET=your_secret_here
AUTH_URL=http://localhost:3000

# Turso (production) — obter com: turso db show racoes-app --url / turso db tokens create racoes-app
TURSO_DATABASE_URL=libsql://racoes-app-[usuario].turso.io
TURSO_AUTH_TOKEN=your_turso_token_here
```

- [ ] **Step 5: Commit**

```bash
git add package.json .env.example
git commit -m "chore: add prisma migrate deploy to build script, update env.example"
git push origin main
```

---

## Task 3: Criar banco Turso e aplicar migrations

**Files:**
- No code changes — apenas comandos Turso CLI

Turso é SQLite remoto via libsql. O `prisma.ts` já usa o adapter libsql. Este task instala o CLI Turso, cria o banco de produção, e aplica o schema via `prisma migrate deploy` apontando para Turso.

- [ ] **Step 1: Instalar Turso CLI**

```bash
# Windows (PowerShell)
winget install turso
```

Ou via npm:
```bash
npm install -g @tursodatabase/turso
```

Verificar:
```bash
turso --version
```

Expected: `turso version x.x.x`

- [ ] **Step 2: Autenticar no Turso**

```bash
turso auth login
```

Abre browser para login. Criar conta gratuita em turso.tech se não tiver.

- [ ] **Step 3: Criar banco de dados**

```bash
turso db create racoes-app
```

Expected output:
```
Created database racoes-app at group default in <região>
```

- [ ] **Step 4: Obter URL do banco**

```bash
turso db show racoes-app --url
```

Expected output (copiar este valor):
```
libsql://racoes-app-<usuario>.turso.io
```

- [ ] **Step 5: Criar token de autenticação**

```bash
turso db tokens create racoes-app
```

Expected output (copiar este valor — aparece uma única vez):
```
eyJ...token_longo...
```

**Salvar ambos os valores** (URL e token) — serão usados no Vercel e no próximo step.

- [ ] **Step 6: Aplicar migrations no banco Turso**

Rodar `prisma migrate deploy` com as vars do Turso apontadas:

```bash
cd C:\Users\joaom\Dev\racoes-app
$env:TURSO_DATABASE_URL="libsql://racoes-app-<usuario>.turso.io"
$env:TURSO_AUTH_TOKEN="eyJ...token..."
npx prisma migrate deploy
```

(Substituir os valores reais obtidos nos steps 4 e 5.)

Expected output:
```
Prisma schema loaded from prisma\schema.prisma
Datasource "db": SQLite database

x migrations found in prisma/migrations
✓ Applied N migrations
```

- [ ] **Step 7: Verificar banco criado**

```bash
turso db shell racoes-app "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;"
```

Expected: lista de tabelas incluindo `User`, `Produto`, `Cliente`, `Pedido`, `ItemPedido`, etc.

---

## Task 4: Configurar Vercel e fazer primeiro deploy

**Files:**
- No code changes — configuração via Vercel CLI/dashboard

Este task cria o projeto no Vercel, configura as variáveis de ambiente de produção, e verifica que o deploy funciona corretamente (login, listagem de pedidos).

- [ ] **Step 1: Instalar Vercel CLI**

```bash
npm install -g vercel
```

Verificar:
```bash
vercel --version
```

Expected: `Vercel CLI x.x.x`

- [ ] **Step 2: Autenticar no Vercel**

```bash
vercel login
```

Escolher "Continue with GitHub" para conectar a mesma conta do GitHub.

- [ ] **Step 3: Criar projeto Vercel linkado ao GitHub**

```bash
cd C:\Users\joaom\Dev\racoes-app
vercel
```

Responder as perguntas:
- "Set up and deploy?" → `Y`
- "Which scope?" → selecionar sua conta
- "Link to existing project?" → `N`
- "What's your project's name?" → `racoes-app`
- "In which directory is your code located?" → `./` (Enter)
- "Want to modify these settings?" → `N`

Expected: primeiro deploy iniciado. Vai falhar por falta de env vars — isso é esperado.

- [ ] **Step 4: Configurar variáveis de ambiente de produção**

```bash
vercel env add TURSO_DATABASE_URL production
```
Colar a URL do Turso: `libsql://racoes-app-<usuario>.turso.io`

```bash
vercel env add TURSO_AUTH_TOKEN production
```
Colar o token Turso.

```bash
vercel env add AUTH_SECRET production
```
Colar o valor de `AUTH_SECRET` do `.env` local (o valor real, não o placeholder).

```bash
vercel env add AUTH_URL production
```
Colar a URL do Vercel após deploy: formato `https://racoes-app-<hash>.vercel.app`

> **Nota:** A `AUTH_URL` precisa da URL final do Vercel. Obter no dashboard após Step 3, ou usar `vercel ls` para ver a URL gerada.

- [ ] **Step 5: Fazer redeploy com as env vars**

```bash
vercel --prod
```

Expected output:
```
✓ Deployed to production. Run `vercel --prod` to overwrite later.
https://racoes-app-<hash>.vercel.app
```

- [ ] **Step 6: Verificar deploy funcional**

Abrir no browser: `https://racoes-app-<hash>.vercel.app`

Verificar:
1. Página de login carrega
2. Login com credenciais funciona (usar usuário criado localmente — **não existe no banco Turso ainda**)
3. Se login falhar por usuário não existir: criar usuário diretamente no Turso:

```bash
turso db shell racoes-app
```

No shell interativo, inserir usuário (substituir hash real — gerar com bcrypt):
```sql
-- O passwordHash abaixo é bcrypt de "admin123" com salt 10
INSERT INTO User (id, name, email, passwordHash, createdAt)
VALUES (
  'cm_admin',
  'Admin',
  'admin@racoes.com',
  '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVFkRBcMlS',
  datetime('now')
);
.quit
```

(O hash acima corresponde à senha `admin123`. Trocar por hash real se necessário — gerar com `node -e "const b=require('bcryptjs');b.hash('suasenha',10).then(console.log)"`)

- [ ] **Step 7: Verificar funcionalidades principais**

No browser em produção:
1. Login → redireciona para dashboard ✓
2. Pedidos → lista carrega ✓
3. Imprimir cupom de um pedido → abre página de impressão ✓
4. Criar novo pedido → salva e aparece na lista ✓

- [ ] **Step 8: Configurar deploy automático (já ativo)**

Qualquer `git push origin main` vai triggerar rebuild automático no Vercel. Verificar no dashboard Vercel → projeto → Deployments.

- [ ] **Step 9: Commit final com link do projeto**

```bash
git add .
git commit -m "chore: production deployed to Vercel + Turso" --allow-empty
git push origin main
```
