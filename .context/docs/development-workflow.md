---
type: doc
name: development-workflow
description: Day-to-day engineering processes, branching, and contribution guidelines
category: workflow
generated: 2026-01-30
status: filled
scaffoldVersion: "2.0.0"
---

# Fluxo de Desenvolvimento

## Processo de Desenvolvimento

### Ciclo Típico

1. **Entender** o requisito ou bug
2. **Criar branch** a partir de `main`
3. **Implementar** a feature/fix
4. **Testar** localmente
5. **Commit** com mensagem descritiva
6. **Push** e criar PR
7. **Review** e merge

## Branching & Releases

### Modelo de Branching

Usamos um modelo **Trunk-Based Development** simplificado:

```
main (produção)
  │
  ├── feature/booking-calendar
  ├── feature/guest-import
  ├── fix/payment-calculation
  └── chore/update-deps
```

### Convenções de Branch

- `feature/` - Novas funcionalidades
- `fix/` - Correção de bugs
- `chore/` - Manutenção e refatoração
- `docs/` - Documentação

### Releases

- Deploy automático em `main`
- Tags semânticas: `v1.0.0`, `v1.1.0`
- Changelog mantido manualmente

## Desenvolvimento Local

### Pré-requisitos

- Node.js 20+
- pnpm 8+
- PostgreSQL (local ou Docker)

### Setup Inicial

```bash
# Clonar repositório
git clone <repo-url>
cd pousada-management

# Instalar dependências
pnpm install

# Configurar ambiente
cp .env.example .env
# Editar .env com suas credenciais

# Configurar banco de dados
pnpm prisma generate
pnpm prisma migrate dev

# Iniciar servidor
pnpm dev
```

### Comandos Principais

| Comando                   | Descrição                   |
| ------------------------- | --------------------------- |
| `pnpm dev`                | Servidor de desenvolvimento |
| `pnpm build`              | Build de produção           |
| `pnpm lint`               | Verificar linting           |
| `pnpm prisma studio`      | UI do Prisma                |
| `pnpm prisma migrate dev` | Aplicar migrations          |

### Docker Compose (opcional)

```bash
# Subir PostgreSQL local
docker-compose up -d

# Verificar logs
docker-compose logs -f
```

## Code Review

### Checklist de PR

- [ ] Código segue padrões do projeto
- [ ] Testes passando
- [ ] TypeScript sem erros
- [ ] Lint sem warnings
- [ ] Documentação atualizada (se necessário)

### Revisão de Código

- Pelo menos 1 aprovação necessária
- Verificar impacto em performance
- Validar segurança de dados
- Testar fluxo completo da feature

### Convenções de Commit

Seguimos **Conventional Commits**:

```
feat: adiciona filtro por data no calendário
fix: corrige cálculo de diárias
chore: atualiza dependências
docs: melhora README
refactor: extrai hook useBookingForm
```

## Onboarding

### Primeiros Passos

1. Configurar ambiente local (ver acima)
2. Ler [Project Overview](./project-overview.md)
3. Explorar estrutura de pastas
4. Rodar `pnpm dev` e navegar pelo sistema
5. Fazer uma pequena mudança de teste

### Recursos Úteis

- [Arquitetura](./architecture.md) - Entender camadas
- [Ferramentas](./tooling.md) - CLIs e scripts
- [Prisma Docs](https://www.prisma.io/docs) - ORM
- [Next.js Docs](https://nextjs.org/docs) - Framework

## Recursos Relacionados

- [Testing Strategy](./testing-strategy.md)
- [Tooling](./tooling.md)
