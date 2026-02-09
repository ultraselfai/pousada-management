---
type: doc
name: testing-strategy
description: Testing approach, coverage requirements, and CI gates
category: testing
generated: 2026-01-30
status: filled
scaffoldVersion: "2.0.0"
---

# Estratégia de Testes

## Visão Geral

O projeto utiliza uma abordagem de testes em camadas, focando em garantir qualidade sem sacrificar velocidade de desenvolvimento.

## Pirâmide de Testes

```
        ╱╲
       ╱  ╲
      ╱ E2E ╲         Poucos, críticos
     ╱────────╲
    ╱Integration╲     Fluxos principais
   ╱──────────────╲
  ╱    Unit Tests   ╲  Muitos, rápidos
 ╱────────────────────╲
```

## Tipos de Teste

### Testes Unitários

- **Escopo**: Funções isoladas, hooks, utils
- **Framework**: Vitest / Jest
- **Localização**: `*.test.ts` próximo ao código

```typescript
// utils/price.test.ts
describe("calculateTotalPrice", () => {
  it("calcula corretamente para 3 diárias", () => {
    expect(calculateTotalPrice(100, 3)).toBe(300)
  })
})
```

### Testes de Integração

- **Escopo**: Server Actions, queries Prisma
- **Framework**: Vitest com banco de teste
- **Foco**: Fluxos de dados completos

### Testes E2E

- **Escopo**: Fluxos críticos do usuário
- **Framework**: Playwright
- **Foco**: Happy paths principais

```typescript
// e2e/booking.spec.ts
test("criar nova reserva", async ({ page }) => {
  await page.goto("/admin/bookings/new")
  await page.fill('[name="guestName"]', "João Silva")
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL(/\/bookings\//)
})
```

## Comandos de Teste

| Comando              | Descrição                       |
| -------------------- | ------------------------------- |
| `pnpm test`          | Executa testes unitários        |
| `pnpm test:watch`    | Modo watch para desenvolvimento |
| `pnpm test:coverage` | Gera relatório de cobertura     |
| `pnpm test:e2e`      | Executa testes E2E              |

## Cobertura

### Metas

- Funções utilitárias: 90%+
- Server Actions: 80%+
- Componentes: 70%+

### Áreas Críticas

Manter alta cobertura em:

- Cálculos financeiros
- Validações de reserva
- Lógica de disponibilidade

## CI/CD

### Pipeline de Testes

```yaml
# .github/workflows/test.yml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - Checkout
      - Setup Node
      - Install deps
      - Lint
      - Type check
      - Unit tests
      - Build
```

### Gates de Qualidade

- ✅ Lint sem erros
- ✅ TypeScript compila
- ✅ Testes passando
- ✅ Cobertura mínima (se configurado)

## Mocking

### Prisma (banco de dados)

```typescript
import { prismaMock } from "./prisma-mock"

prismaMock.booking.findMany.mockResolvedValue([
  { id: "1", status: "CONFIRMED" },
])
```

### APIs Externas

- MSW (Mock Service Worker) para HTTP
- Mocks manuais para serviços simples

## Recursos Relacionados

- [Development Workflow](./development-workflow.md)
- [Tooling](./tooling.md)
