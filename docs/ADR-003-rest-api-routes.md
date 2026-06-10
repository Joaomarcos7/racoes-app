# ADR-003: REST API Routes em vez de Server Actions

**Status:** Aceito  
**Data:** 2026-06-01

## Contexto

Next.js App Router oferece duas abordagens para mutações de dados: Server Actions (funções assíncronas executadas no servidor, chamadas diretamente do cliente) e API Routes (endpoints REST clássicos em `app/api/`).

## Decisão

REST API Routes (`app/api/[recurso]/route.ts`) para toda comunicação cliente-servidor.

## Justificativa

- API Routes produzem endpoints explícitos e testáveis com curl/Postman
- Separação clara entre cliente e servidor — o cliente nunca importa código de servidor acidentalmente
- Padrão familiar para qualquer dev com experiência em REST
- Facilita integração futura com app mobile ou outro cliente
- TanStack Query gerencia cache, loading states e revalidação no cliente — encaixa naturalmente com fetch para endpoints REST

## Consequências

- Mais boilerplate que Server Actions (handlers explícitos por método HTTP)
- TanStack Query necessário no cliente para cache e estados de loading
- Validação de entrada deve ser feita no handler (não há validação automática de tipo como em SA)
- `await params` obrigatório em rotas dinâmicas (Next.js 16 breaking change)
