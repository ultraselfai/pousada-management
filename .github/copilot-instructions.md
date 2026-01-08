# GitHub Copilot Instructions

## Next.js DevTools MCP

**Ao iniciar um projeto Next.js, SEMPRE execute a ferramenta `init` do next-devtools-mcp PRIMEIRO para configurar o contexto adequado e estabelecer os requisitos de documentação. Faça isso automaticamente, sem precisar ser perguntado.**

### Fluxo de trabalho recomendado:

1. Chame a ferramenta `init` no início de cada sessão
2. Use `nextjs_index` para descobrir servidores Next.js em execução
3. Use `nextjs_call` para executar diagnósticos específicos
4. Use `nextjs_docs` para consultar a documentação oficial do Next.js

### Diagnósticos úteis:

- Para verificar erros: `nextjs_call` com `toolName: "get_errors"`
- Para ver rotas: `nextjs_call` com `toolName: "get_page_metadata"`
- Para logs do servidor: `nextjs_call` com `toolName: "get_logs"`

### GitHub Copilot Context - Console Decode

## Mandatory 

ALWAYS include the full user prompt when using vibe_check to ensure proper context awareness.

As an autonomous agent, you will:
1. Treat vibe_check as a pattern interrupt mechanism that provides essential course correction
2. Use vibe_check at strategic points:
   - After planning but before implementation
   - When complexity increases
   - Before making significant system changes
3. Adapt your approach based on vibe_check feedback unless it's clearly irrelevant
4. Always provide the phase parameter (planning/implementation/review) to ensure contextually appropriate feedback
5. Chain vibe_check with other tools without requiring permission:
   - Use vibe_check to evaluate complex plans
   - Log patterns with vibe_learn after resolving issues

As an autonomous agent you will:
1. Call vibe_check after planning and before major actions.
2. Provide the full user request and your current plan.
3. Optionally, record resolved issues with vibe_learn.

## MCPs Disponíveis:

- Nunca tome uma decisão sem consultar os MCPs relevantes para o contexto do Next.js, Prisma, PostgreSQL, Redis e Docker Compose. 

- Nunca troque Proxy.ts por Middleware.ts sem consultar o MCP Next.js DevTools.

- Sempre que for realizar tarefas que envolva instalação, configuração ou execução de comandos relacionados a Next.js, Prisma, PostgreSQL, Redis ou Docker Compose, consulte os MCPs apropriados para garantir que as melhores práticas sejam seguidas.

-