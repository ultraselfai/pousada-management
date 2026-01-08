### GitHub Copilot Context - Console Decode

## Projeto
**Decode Console** - Dashboard administrativo multi-tenant SaaS construído com Next.js 16, React 19, Prisma 7, Better-Auth 1.4.5 e Shadcn UI.

---

## Mandatory - Metodologia de Trabalho

### 1. Planejamento Antes de Codar
- **Liste todas as features:** "O usuário deveria poder fazer X, Y, Z..."
- **Identifique dependências:** O que precisa estar pronto antes do quê?
- **Só então comece a desenvolver** - evite improvisos e bugs sistêmicos

### 2. DRY (Don't Repeat Yourself)
- Centralize valores repetidos (cores, endpoints, strings)
- Funções usadas em múltiplos lugares → arquivo utilitário
- Componentes visuais repetidos → componente reutilizável
- **Toda repetição é um convite a bug futuro**

### 3. KISS (Keep It Simple, Stupid)
- Sempre opte pela solução mais simples que resolve
- Se não consegue explicar em 2 minutos, está complicado demais
- Resista ao overengineering
- "Primeiro funciona, depois otimiza"

### 4. YAGNI (You Aren't Gonna Need It)
- Só implemente o que é necessário AGORA
- Não crie features "preventivas" para o futuro
- Toda nova feature deve provar que é precisa agora
- Corte do backlog o que está parado há meses

### 5. Organização por Feature
```
src/
  features/
    auth/
      components/
      actions.ts
      schemas.ts
    projetos/
      components/
      actions.ts
```
- Cada feature tem sua pasta com tudo relacionado
- Não misture arquivos genéricos com específicos

### 6. Separation of Concerns
- Uma responsabilidade = um arquivo
- Não misture lógica, visual, config e integração
- Nomes claros: `apiConfig.ts`, `loginService.ts`, `LoginForm.tsx`

---

## Stack Técnica

| Tecnologia | Versão | Notas |
|------------|--------|-------|
| Next.js | 16.0.7 | Turbopack, usa `proxy.ts` (não middleware.ts) |
| React | 19.2.1 | - |
| Prisma | 7.1.0 | Provider: `prisma-client`, output: `../src/generated/prisma` |
| Better-Auth | 1.4.5 | Scrypt: N=16384, r=16, p=1, dkLen=64 |
| PostgreSQL | 17 | Via Docker |
| TypeScript | 5.x | Strict mode |

---

## Arquivos Críticos

| Arquivo | Função |
|---------|--------|
| `src/proxy.ts` | Proteção de rotas, detecção de tenant, redirecionamento auth |
| `src/lib/auth.ts` | Config server-side Better-Auth |
| `src/lib/auth-client.ts` | Client-side auth hooks |
| `prisma/schema.prisma` | Schema do banco com multi-tenancy |
| `prisma/seed.ts` | Seed com hash scrypt compatível Better-Auth |

---

## Credenciais Dev

- **Admin:** `admin@decode.ink` / `Admin@123`

---

## Checklist Antes de Cada Feature

- [ ] Listei os "usuários devem poder..."?
- [ ] Identifiquei as dependências?
- [ ] Estou aplicando DRY, KISS, YAGNI?
- [ ] Cada arquivo tem uma única responsabilidade?
- [ ] Fiz commit incremental com mensagem clara?

---

## Segurança

- Secrets nunca vão para o repositório
- Banco começa proibindo tudo, autorize só o mínimo
- Toda entrada do usuário deve ser sanitizada
- Auth obrigatória mesmo para apps internos

