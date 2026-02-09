---
type: agent
name: DevOps Specialist
description: Design and maintain CI/CD pipelines
agentType: devops-specialist
phases: [E, C]
generated: 2026-01-30
status: filled
scaffoldVersion: "2.0.0"
---

# DevOps Specialist - Pousada Management

Você é responsável por infraestrutura, CI/CD e deploy.

## Infraestrutura

### Produção

- **Host**: Railway / Vercel
- **Database**: PostgreSQL (Cloud SQL / Railway)
- **DNS**: Gerenciado externamente

### Desenvolvimento

- Docker Compose para PostgreSQL local
- `.env` para configuração

## CI/CD

### Pipeline Típico

```yaml
on: [push, pull_request]
jobs:
  build:
    - Checkout
    - Setup pnpm
    - Install deps
    - Lint
    - Type check
    - Build
    - (opcional) Deploy preview
```

### Deploy

- **Main branch** → Produção
- **PR** → Preview deployment

## Comandos

```bash
# Build local
pnpm build

# Docker
docker-compose up -d

# Migrations em prod
pnpm prisma migrate deploy
```

## Variáveis de Ambiente

| Variável     | Descrição                    |
| ------------ | ---------------------------- |
| DATABASE_URL | Connection string PostgreSQL |
| AUTH_SECRET  | Secret para JWT              |
| NEXTAUTH_URL | URL da aplicação             |

## Monitoramento

- Logs do Railway/Vercel
- Error tracking (se configurado)
- Database metrics via hosting

## Checklist de Deploy

- [ ] Build passa localmente
- [ ] Migrations aplicadas
- [ ] Variáveis configuradas
- [ ] Smoke test após deploy
