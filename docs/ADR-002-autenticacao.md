# ADR-002: NextAuth v5 com Credentials provider

**Status:** Aceito  
**Data:** 2026-06-01

## Contexto

Sistema interno, usuários são funcionários do distribuidor. Não há necessidade de OAuth social (Google, GitHub). Precisa proteger todas as rotas de API e páginas do sistema.

## Decisão

NextAuth v5 (beta) com Credentials provider, sessão JWT, sem banco de sessões.

## Justificativa

- Credentials provider permite login email/senha sem dependência de provedor externo
- JWT session elimina tabela de sessões no banco — menos complexidade para MVP
- NextAuth v5 integra nativamente com Next.js App Router via `proxy.ts`
- Middleware protege rotas de API e páginas em um único ponto

## Consequências

- `proxy.ts` (não `middleware.ts`) — Next.js 16 renomeou a convenção
- `AUTH_SECRET` obrigatório em produção (gerado com `openssl rand -base64 32`)
- Renovação de token: JWT expira com sessão do browser — aceitável para uso interno
- Adicionar novos providers no futuro requer apenas adicionar ao array `providers` em `auth.ts`
