---
adr: 2
titulo: Monorepo TypeScript, RLS e FSRS
status: Proposta
data: 2026-09-10
tags: [arquitetura, seguranca, agendamento]
---

## Contexto

Recall deve oferecer flashcards privados por usuário, revisões espaçadas e ferramentas MCP, com deploy independente dos três apps na Vercel. O código precisa ser fácil de navegar por humanos e LLMs.

## Decisão

Usar pnpm/Turborepo com apps/web (Next.js e Radix Themes), apps/api (Express 5) e apps/mcp (SDK MCP TypeScript estável sobre Express). Compartilhar contratos Zod, cliente HTTP e domínio FSRS em packages. MCP usa a API; somente a API acessa os dados.

Usar Supabase Auth e Postgres. Cada usuário recebe um tenant pessoal; colaboração entre usuários não integra o escopo inicial. Todas as operações de conteúdo executam em transação com papel authenticated e claims do usuário verificado, sujeitas a RLS. O tenant nunca vem de um parâmetro confiado ao cliente. Tokens MCP aleatórios são armazenados apenas como hash, expiram e podem ser revogados. Apenas a consulta de autenticação do token ocorre fora da transação RLS.

Usar ts-fsrs atrás de um adaptador de domínio, com previews e datas calculados no servidor. Registrar revisão, versão e estado FSRS atomicamente; request_id torna retries idempotentes e a versão impede duas avaliações concorrentes do mesmo estado.

Executar Supabase local por sua CLI oficial (containers Docker) e os três apps por Docker Compose. Mesmos schemas, autenticação e protocolo MCP nos testes locais. Em produção, usar Supabase gerenciado e três projetos Vercel; nunca publicar credenciais locais.

## Consequências

Uma linguagem e contratos compartilhados reduzem divergências. Radix fornece acessibilidade e componentes; CSS próprio define a aparência. A API requer a URL do pooler Postgres do Supabase além das credenciais públicas de Auth. O MCP stateless funciona em serverless sem manter sessões em memória. Uma mudança futura para organizações compartilhadas exige outro ADR e migração explícita das políticas.

## Referências

- https://github.com/open-spaced-repetition/ts-fsrs
- https://supabase.com/docs/guides/database/postgres/row-level-security
- https://github.com/modelcontextprotocol/typescript-sdk/tree/v1.x
- https://vercel.com/docs/frameworks/backend/express
