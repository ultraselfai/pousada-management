---
type: doc
name: tooling
description: CLI scripts, IDE configurations, and automation workflows
category: tooling
generated: 2026-01-30
status: filled
scaffoldVersion: "2.0.0"
---

# Ferramentas e Produtividade

## CLI e Scripts

### Scripts do package.json

| Script          | Descrição                                    |
| --------------- | -------------------------------------------- |
| `pnpm dev`      | Servidor de desenvolvimento (localhost:3000) |
| `pnpm build`    | Build de produção                            |
| `pnpm start`    | Executa build de produção                    |
| `pnpm lint`     | ESLint para verificar código                 |
| `pnpm lint:fix` | Corrige problemas de lint automaticamente    |
| `pnpm format`   | Formata código com Prettier                  |

### Prisma CLI

| Comando                     | Descrição                   |
| --------------------------- | --------------------------- |
| `pnpm prisma studio`        | UI visual do banco de dados |
| `pnpm prisma generate`      | Regrerar Prisma Client      |
| `pnpm prisma migrate dev`   | Criar/aplicar migrations    |
| `pnpm prisma migrate reset` | Reset do banco (dev)        |
| `pnpm prisma db push`       | Push schema sem migration   |
| `pnpm prisma db seed`       | Executar seed de dados      |

## Configuração de IDE

### VS Code

#### Extensões Recomendadas

- **ESLint** - Linting em tempo real
- **Prettier** - Formatação
- **Prisma** - Syntax highlighting para schema
- **Tailwind CSS IntelliSense** - Autocomplete de classes
- **TypeScript Vue Plugin** - Suporte TypeScript

#### Settings

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "non-relative"
}
```

### Cursor / Antigravity

O projeto está configurado para uso com AI coding assistants:

- `.context/` contém documentação para contexto
- `.context/agents/` define playbooks de agentes
- MCP integrado para tooling avançado

## Linting e Formatação

### ESLint

Configuração em `eslint.config.mjs`:

- Next.js recommended rules
- TypeScript strict
- Import order

### Prettier

Configuração em `.prettierrc`:

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

## Git Hooks

### Husky (se configurado)

```bash
# Pre-commit
pnpm lint-staged

# Pre-push
pnpm test
```

### lint-staged

```json
{
  "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{json,md}": "prettier --write"
}
```

## Docker

### docker-compose.yml

```yaml
services:
  postgres:
    image: postgres:15
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: pousada
```

### Comandos Docker

```bash
# Subir serviços
docker-compose up -d

# Ver logs
docker-compose logs -f postgres

# Parar
docker-compose down
```

## Debugging

### Next.js

```json
// .vscode/launch.json
{
  "configurations": [
    {
      "name": "Next.js: debug server",
      "type": "node-terminal",
      "request": "launch",
      "command": "pnpm dev"
    }
  ]
}
```

### Browser DevTools

- React DevTools para componentes
- Network tab para Server Actions
- Application tab para cookies/storage

## Automações Úteis

### Gerar Componente

```bash
# Estrutura manual recomendada
mkdir -p src/components/my-component
touch src/components/my-component/index.tsx
touch src/components/my-component/my-component.tsx
```

### Criar Feature

```bash
mkdir -p src/features/new-feature/{actions,components,hooks,types}
```

## Recursos Relacionados

- [Development Workflow](./development-workflow.md)
- [Testing Strategy](./testing-strategy.md)
