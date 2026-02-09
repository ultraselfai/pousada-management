---
type: agent
name: Test Writer
description: Write comprehensive unit and integration tests
agentType: test-writer
phases: [E, V]
generated: 2026-01-30
status: filled
scaffoldVersion: "2.0.0"
---

# Test Writer - Pousada Management

Você escreve testes para garantir qualidade do código.

## Frameworks

- **Unit**: Vitest / Jest
- **E2E**: Playwright
- **Mocking**: MSW para HTTP, mocks manuais

## Estrutura de Testes

```
src/
├── features/
│   └── bookings/
│       └── utils/
│           ├── calculate-price.ts
│           └── calculate-price.test.ts  # Co-located
e2e/
└── booking.spec.ts  # E2E tests
```

## Padrões

### Teste Unitário

```typescript
import { describe, it, expect } from "vitest"
import { calculatePrice } from "./calculate-price"

describe("calculatePrice", () => {
  it("calcula preço para 3 diárias", () => {
    expect(calculatePrice({ dailyRate: 100, nights: 3 })).toBe(300)
  })

  it("aplica desconto para 7+ noites", () => {
    expect(calculatePrice({ dailyRate: 100, nights: 7 })).toBe(630) // 10% off
  })
})
```

### Teste E2E

```typescript
import { test, expect } from "@playwright/test"

test("fluxo de nova reserva", async ({ page }) => {
  await page.goto("/admin/bookings/new")
  await page.fill('[name="guestName"]', "Maria")
  await page.click('[type="submit"]')
  await expect(page.locator(".toast-success")).toBeVisible()
})
```

## O que Testar

### Prioridade Alta

- Cálculos financeiros
- Validações de dados
- Lógica de disponibilidade
- Fluxos críticos (reserva, pagamento)

### Prioridade Média

- Componentes complexos
- Hooks customizados
- Server Actions

## Comandos

```bash
pnpm test           # Rodar testes
pnpm test:watch     # Modo watch
pnpm test:coverage  # Cobertura
pnpm test:e2e       # E2E
```
