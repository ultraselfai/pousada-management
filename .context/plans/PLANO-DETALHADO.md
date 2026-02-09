# 🏨 Sistema de Gestão Pousada Dois Corações

> Sistema completo de gestão para pousada com mapas visuais, reservas, hóspedes, financeiro, estoque e motor de reservas público. Preparado para integração futura com IA/WhatsApp.

---

## 📋 Visão Geral

| Item | Descrição |
|------|-----------|
| **Cliente** | Pousada Dois Corações - Olímpia/SP |
| **Objetivo** | Transformar template existente em sistema de gestão completo |
| **Stack** | Next.js 16 + React 19 + Prisma 7 + PostgreSQL + shadcn/ui |
| **Integrações Futuras** | WhatsApp Business API + Agente IA |

---

## 🎯 Requisitos Funcionais

### RF01 - Mapas Visuais
- [ ] Mapa dos Quartos: visão geral do dia com badges de status
- [ ] Mapa de Reservas: timeline horizontal com quartos na vertical
- [ ] Cores por status: ocupado (vermelho), disponível (verde), limpeza (amarelo), check-in (azul)

### RF02 - Gestão de Hóspedes
- [ ] Cadastro: nome, CPF, email, telefone, canal de origem
- [ ] Histórico de estadias por hóspede
- [ ] Busca rápida por CPF/nome/telefone

### RF03 - Gestão de Reservas
- [ ] Criar reserva com hóspede novo ou existente
- [ ] Campos: check-in, check-out, adultos, crianças, refeições, pagamento
- [ ] Status: pré-reserva, confirmada, check-in, finalizada, cancelada
- [ ] Métodos de pagamento: cartão, PIX
- [ ] Formas: integral antecipado, 50%+50%

### RF04 - Gestão de Quartos
- [ ] Cadastro: nome, categoria, leitos, banheiro, equipamentos, fotos, preço
- [ ] Categorias: Standard, Luxo, Luxo Superior
- [ ] Tipos de leito: casal, bicama, beliche, solteiro
- [ ] Equipamentos: TV, ar-condicionado, frigobar

### RF05 - Orçamentos
- [ ] Gerador com datas, quarto, descontos, combos
- [ ] Exportação em PDF
- [ ] Histórico de orçamentos enviados

### RF06 - Gestão de Estoque
- [ ] Categorias: café da manhã, piscina, limpeza, equipamentos, manutenções
- [ ] Cadastro de itens com quantidade e estoque mínimo
- [ ] Registro de compras com valores e comprovantes
- [ ] Alertas de estoque baixo

### RF07 - Gestão Financeira
- [ ] Fluxo de caixa automático (entradas - saídas)
- [ ] Despesas por categoria: folha, fixas, variáveis, imprevistos, manutenções, pró-labore
- [ ] Receitas: reservas (automático) + manuais
- [ ] Relatórios: DRE, projeções, exportação PDF

### RF08 - Motor de Reservas Público
- [ ] Buscador: datas, adultos, crianças
- [ ] Listagem de suítes disponíveis com fotos e preços
- [ ] Checkout com formulário de hóspede
- [ ] Integração gateway de pagamento (PIX/cartão)

### RF09 - Usuários e Permissões
- [ ] Criar usuários com login/senha
- [ ] Definir permissões de acesso por módulo
- [ ] Roles: admin, gerente, recepção

---

## 📁 Estrutura da Sidebar

```
├── 🏠 Visão Geral
├── 🗺️ Mapa
│   ├── Mapa dos Quartos
│   └── Mapa de Reservas
├── 👥 Hóspedes
├── 📅 Reservas
│   ├── Todas as Reservas
│   ├── Nova Reserva
│   └── Orçamentos
├── 📦 Estoque
├── 💰 Financeiro
│   ├── Visão Geral
│   ├── Despesas
│   ├── Receitas
│   └── Relatórios
└── ⚙️ Configurações
    ├── Perfil
    └── Usuários
```

---

## 🔄 Fases de Desenvolvimento

---

# FASE 1: Modelagem de Dados (Fundação)

**Objetivo:** Criar schema Prisma completo que será a espinha dorsal do sistema.

## 1.1 Modelo Room (Quarto)

```prisma
model Room {
  id           String   @id @default(cuid())
  name         String   // "Apto 01", "Apto 02"
  category     RoomCategory
  bedTypes     Json     // [{type: "casal", qty: 1}, {type: "solteiro", qty: 2}]
  hasBathroom  Boolean  @default(true)
  equipment    Json     // ["tv", "ar", "frigobar"]
  photos       String[] // URLs do R2
  basePrice    Decimal  @db.Decimal(10, 2)
  status       RoomStatus @default(AVAILABLE)
  description  String?  @db.Text
  maxGuests    Int      @default(2)
  
  bookings     Booking[]
  maintenances RoomMaintenance[]
  
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

enum RoomCategory {
  STANDARD
  LUXO
  LUXO_SUPERIOR
}

enum RoomStatus {
  AVAILABLE
  OCCUPIED
  CLEANING
  MAINTENANCE
  BLOCKED
}
```

## 1.2 Modelo Guest (Hóspede)

```prisma
model Guest {
  id          String   @id @default(cuid())
  name        String
  cpf         String   @unique
  email       String?
  phone       String
  origin      GuestOrigin @default(DIRECT)
  notes       String?  @db.Text
  
  bookings    Booking[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

enum GuestOrigin {
  DIRECT
  BOOKING_COM
  AIRBNB
  WHATSAPP
  INSTAGRAM
  FACEBOOK
  INDICACAO
  MOTOR_RESERVAS
  OUTRO
}
```

## 1.3 Modelo Booking (Reserva)

```prisma
model Booking {
  id              String   @id @default(cuid())
  bookingNumber   String   @unique // "RES-2026-0001"
  
  guest           Guest    @relation(fields: [guestId], references: [id])
  guestId         String
  room            Room     @relation(fields: [roomId], references: [id])
  roomId          String
  
  checkIn         DateTime
  checkOut        DateTime
  adults          Int      @default(1)
  children        Int      @default(0)
  
  mealsIncluded   Boolean  @default(true)
  
  paymentMethod   PaymentMethod
  paymentType     PaymentType
  totalAmount     Decimal  @db.Decimal(10, 2)
  paidAmount      Decimal  @default(0) @db.Decimal(10, 2)
  
  status          BookingStatus @default(PRE_BOOKING)
  
  notes           String?  @db.Text
  
  transactions    Transaction[]
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@index([checkIn, checkOut])
  @@index([status])
}

enum PaymentMethod {
  PIX
  CREDIT_CARD
  DEBIT_CARD
  CASH
  TRANSFER
}

enum PaymentType {
  FULL_UPFRONT      // Integral antecipado
  SPLIT_50_50       // 50% reserva, 50% check-in
}

enum BookingStatus {
  PRE_BOOKING       // Pré-reserva (aguardando confirmação)
  CONFIRMED         // Confirmada
  CHECKED_IN        // Check-in realizado
  CHECKED_OUT       // Check-out realizado
  CANCELLED         // Cancelada
  NO_SHOW           // Não compareceu
}
```

## 1.4 Modelo Quote (Orçamento)

```prisma
model Quote {
  id            String   @id @default(cuid())
  quoteNumber   String   @unique // "ORC-2026-0001"
  
  guestName     String
  guestPhone    String?
  guestEmail    String?
  
  roomId        String?
  roomName      String
  
  checkIn       DateTime
  checkOut      DateTime
  adults        Int
  children      Int
  
  basePrice     Decimal  @db.Decimal(10, 2)
  discount      Decimal  @default(0) @db.Decimal(10, 2)
  discountType  DiscountType @default(PERCENTAGE)
  extras        Json?    // [{name: "Cama extra", price: 50}]
  totalPrice    Decimal  @db.Decimal(10, 2)
  
  status        QuoteStatus @default(PENDING)
  validUntil    DateTime
  pdfUrl        String?
  
  notes         String?  @db.Text
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

enum DiscountType {
  PERCENTAGE
  FIXED
}

enum QuoteStatus {
  PENDING
  SENT
  ACCEPTED
  REJECTED
  EXPIRED
  CONVERTED  // Virou reserva
}
```

## 1.5 Modelos de Estoque

```prisma
model StockCategory {
  id          String   @id @default(cuid())
  name        String   @unique // "Café da Manhã", "Piscina", etc
  slug        String   @unique
  icon        String?
  color       String?
  
  items       StockItem[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model StockItem {
  id            String   @id @default(cuid())
  name          String
  category      StockCategory @relation(fields: [categoryId], references: [id])
  categoryId    String
  
  unit          String   @default("un") // un, kg, L, etc
  currentStock  Decimal  @db.Decimal(10, 2)
  minimumStock  Decimal  @db.Decimal(10, 2)
  
  purchases     StockPurchaseItem[]
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@index([categoryId])
}

model StockPurchase {
  id            String   @id @default(cuid())
  purchaseDate  DateTime
  supplier      String?
  totalAmount   Decimal  @db.Decimal(10, 2)
  receiptUrl    String?  // Comprovante no R2
  notes         String?
  
  items         StockPurchaseItem[]
  transaction   Transaction?
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model StockPurchaseItem {
  id          String   @id @default(cuid())
  purchase    StockPurchase @relation(fields: [purchaseId], references: [id], onDelete: Cascade)
  purchaseId  String
  item        StockItem @relation(fields: [itemId], references: [id])
  itemId      String
  
  quantity    Decimal  @db.Decimal(10, 2)
  unitPrice   Decimal  @db.Decimal(10, 2)
  totalPrice  Decimal  @db.Decimal(10, 2)
}
```

## 1.6 Modelos Financeiros

```prisma
model ExpenseCategory {
  id          String   @id @default(cuid())
  name        String   @unique
  slug        String   @unique
  color       String?
  icon        String?
  
  expenses    Expense[]
  
  createdAt   DateTime @default(now())
}

model Expense {
  id            String   @id @default(cuid())
  description   String
  category      ExpenseCategory @relation(fields: [categoryId], references: [id])
  categoryId    String
  
  amount        Decimal  @db.Decimal(10, 2)
  dueDate       DateTime
  paidAt        DateTime?
  isPaid        Boolean  @default(false)
  
  isRecurring   Boolean  @default(false)
  recurrence    Recurrence?
  
  receiptUrl    String?
  notes         String?
  
  transaction   Transaction?
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@index([dueDate])
  @@index([categoryId])
}

model Revenue {
  id            String   @id @default(cuid())
  description   String
  source        RevenueSource
  
  amount        Decimal  @db.Decimal(10, 2)
  receivedAt    DateTime
  
  bookingId     String?
  notes         String?
  
  transaction   Transaction?
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model Transaction {
  id            String   @id @default(cuid())
  type          TransactionType
  amount        Decimal  @db.Decimal(10, 2)
  date          DateTime
  description   String
  
  // Relacionamentos opcionais (apenas um será preenchido)
  booking       Booking?  @relation(fields: [bookingId], references: [id])
  bookingId     String?   @unique
  expense       Expense?  @relation(fields: [expenseId], references: [id])
  expenseId     String?   @unique
  revenue       Revenue?  @relation(fields: [revenueId], references: [id])
  revenueId     String?   @unique
  purchase      StockPurchase? @relation(fields: [purchaseId], references: [id])
  purchaseId    String?   @unique
  
  createdAt     DateTime @default(now())
  
  @@index([date])
  @@index([type])
}

enum TransactionType {
  INCOME      // Entrada
  EXPENSE     // Saída
}

enum RevenueSource {
  BOOKING           // Reserva
  EXTRA_SERVICE     // Serviço extra
  PRODUCT_SALE      // Venda de produto
  OTHER             // Outro
}

enum Recurrence {
  MONTHLY
  WEEKLY
  YEARLY
}
```

## 1.7 Modelo de Manutenção

```prisma
model RoomMaintenance {
  id          String   @id @default(cuid())
  room        Room     @relation(fields: [roomId], references: [id])
  roomId      String
  
  type        MaintenanceType
  status      MaintenanceStatus @default(PENDING)
  description String?
  
  startedAt   DateTime?
  completedAt DateTime?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([roomId])
}

enum MaintenanceType {
  CLEANING    // Limpeza pós check-out
  REPAIR      // Reparo
  INSPECTION  // Inspeção
}

enum MaintenanceStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
}
```

## 1.8 Modelo de Configurações do Sistema

```prisma
model SystemConfig {
  id          String   @id @default(cuid())
  key         String   @unique
  value       Json
  updatedAt   DateTime @updatedAt
}
```

---

# FASE 2: Backend - Features e Server Actions

**Objetivo:** Implementar toda a lógica de negócio seguindo o padrão do projeto.

## 2.1 Feature: rooms

```
src/features/rooms/
├── actions.ts          # CRUD de quartos
├── schemas.ts          # Validação Zod
├── types.ts            # TypeScript interfaces
├── components/         # Componentes específicos
│   ├── room-form.tsx
│   ├── room-card.tsx
│   └── room-status-badge.tsx
└── hooks/
    └── use-rooms.ts
```

**Actions:**
- `getRooms()` - Listar todos os quartos
- `getRoom(id)` - Buscar quarto por ID
- `createRoom(data)` - Criar quarto
- `updateRoom(id, data)` - Atualizar quarto
- `deleteRoom(id)` - Excluir quarto
- `updateRoomStatus(id, status)` - Alterar status
- `checkAvailability(roomId, checkIn, checkOut)` - Verificar disponibilidade

## 2.2 Feature: guests

```
src/features/guests/
├── actions.ts
├── schemas.ts
├── types.ts
├── components/
│   ├── guest-form.tsx
│   ├── guest-search.tsx
│   └── guest-history.tsx
└── hooks/
    └── use-guests.ts
```

**Actions:**
- `getGuests(filters)` - Listar com paginação e busca
- `getGuest(id)` - Buscar por ID
- `getGuestByCpf(cpf)` - Buscar por CPF
- `createGuest(data)` - Criar hóspede
- `updateGuest(id, data)` - Atualizar
- `getGuestHistory(id)` - Histórico de estadias

## 2.3 Feature: bookings

```
src/features/bookings/
├── actions.ts
├── schemas.ts
├── types.ts
├── utils/
│   ├── calculate-price.ts
│   ├── generate-booking-number.ts
│   └── validate-dates.ts
├── components/
│   ├── booking-form/
│   │   ├── index.tsx
│   │   ├── step-guest.tsx
│   │   ├── step-room.tsx
│   │   ├── step-dates.tsx
│   │   ├── step-details.tsx
│   │   └── step-payment.tsx
│   ├── booking-card.tsx
│   ├── booking-status-badge.tsx
│   └── booking-timeline.tsx
└── hooks/
    └── use-bookings.ts
```

**Actions:**
- `getBookings(filters)` - Listar com filtros
- `getBooking(id)` - Buscar por ID
- `createBooking(data)` - Criar reserva (com validação de conflitos)
- `updateBooking(id, data)` - Atualizar
- `updateBookingStatus(id, status)` - Alterar status
- `cancelBooking(id, reason)` - Cancelar
- `checkIn(id)` - Registrar check-in
- `checkOut(id)` - Registrar check-out
- `getTodayArrivals()` - Entradas do dia
- `getTodayDepartures()` - Saídas do dia
- `getConflicts(roomId, checkIn, checkOut)` - Verificar conflitos

## 2.4 Feature: quotes

```
src/features/quotes/
├── actions.ts
├── schemas.ts
├── types.ts
├── components/
│   ├── quote-form.tsx
│   ├── quote-preview.tsx
│   └── quote-pdf.tsx      # Template @react-pdf/renderer
└── hooks/
    └── use-quotes.ts
```

**Actions:**
- `getQuotes(filters)` - Listar orçamentos
- `getQuote(id)` - Buscar por ID
- `createQuote(data)` - Criar orçamento
- `updateQuote(id, data)` - Atualizar
- `generatePdf(id)` - Gerar PDF
- `convertToBooking(id)` - Converter em reserva
- `markAsSent(id)` - Marcar como enviado

## 2.5 Feature: stock

```
src/features/stock/
├── actions.ts
├── schemas.ts
├── types.ts
├── components/
│   ├── category-card.tsx
│   ├── item-form.tsx
│   ├── item-list.tsx
│   ├── purchase-form.tsx
│   └── low-stock-alert.tsx
└── hooks/
    └── use-stock.ts
```

**Actions:**
- `getCategories()` - Listar categorias
- `getItems(categoryId)` - Listar itens por categoria
- `createItem(data)` - Criar item
- `updateItem(id, data)` - Atualizar
- `adjustStock(id, quantity, reason)` - Ajustar estoque
- `getPurchases(filters)` - Listar compras
- `createPurchase(data)` - Registrar compra (atualiza estoque)
- `getLowStockItems()` - Itens abaixo do mínimo

## 2.6 Feature: financial

```
src/features/financial/
├── actions.ts
├── schemas.ts
├── types.ts
├── utils/
│   ├── calculate-dre.ts
│   ├── calculate-projections.ts
│   └── cash-flow.ts
├── components/
│   ├── cash-flow-card.tsx
│   ├── expense-form.tsx
│   ├── revenue-form.tsx
│   ├── category-breakdown.tsx
│   ├── financial-chart.tsx
│   └── dre-report.tsx
└── hooks/
    └── use-financial.ts
```

**Actions:**
- `getCashFlow(dateRange)` - Saldo atual e movimentações
- `getExpenses(filters)` - Listar despesas
- `createExpense(data)` - Criar despesa
- `updateExpense(id, data)` - Atualizar
- `markExpenseAsPaid(id)` - Marcar como pago
- `getRevenues(filters)` - Listar receitas
- `createRevenue(data)` - Criar receita manual
- `getExpensesByCategory(dateRange)` - Agrupar por categoria
- `getDRE(period)` - Gerar DRE
- `getProjections(months)` - Projeções financeiras

---

# FASE 3: Dashboards e Mapas Visuais

**Objetivo:** Criar as páginas visuais principais para gestão diária.

## 3.1 Página: Visão Geral do Dia

```
src/app/(admin)/overview/
├── page.tsx
└── components/
    ├── stats-cards.tsx         # Entradas, Saídas, Hóspedes
    ├── status-badges.tsx       # todos, disponível, ocupado, limpeza
    ├── room-grid.tsx           # Grid de quartos
    └── room-card.tsx           # Card individual do quarto
```

**Componentes:**
- **StatsCards**: 3 cards com ícones (Entradas Hoje, Saídas Hoje, Hóspedes na Casa)
- **StatusBadges**: Filtros visuais (todos: 12, disponível: 5, ocupado: 4, em limpeza: 2, entra hoje: 3, sai hoje: 2)
- **RoomGrid**: Grid responsivo de cards de quartos
- **RoomCard**: 
  - Header colorido por status
  - Nome do quarto
  - Nome do hóspede (se ocupado)
  - Datas de estadia
  - Badges de ações (hospedando, check-in, check-out)
  - Menu de ações rápidas

## 3.2 Página: Mapa de Reservas

```
src/app/(admin)/map/reservations/
├── page.tsx
└── components/
    ├── date-navigator.tsx      # Navegação de datas
    ├── reservation-grid.tsx    # Grid principal
    ├── room-row.tsx            # Linha de quarto
    ├── booking-block.tsx       # Bloco de reserva
    └── legend.tsx              # Legenda de cores
```

**Componentes:**
- **DateNavigator**: Seletor de período com navegação < > e calendário
- **ReservationGrid**: 
  - Coluna fixa com quartos agrupados por categoria
  - Colunas de datas (SEG, TER, QUA...)
  - Linha de hoje destacada
- **BookingBlock**: 
  - Bloco colorido por status
  - Nome do hóspede
  - Valor (opcional)
  - Drag-and-drop para mover (futuro)
- **Legend**: Confirmada (verde), Pré-Reserva (amarelo), Bloqueado (vermelho), Check-in (azul)

---

# FASE 4: Gestão de Hóspedes e Reservas

## 4.1 Página: Listagem de Hóspedes

```
src/app/(admin)/guests/
├── page.tsx
├── columns.tsx
└── components/
    ├── guest-table.tsx
    ├── guest-actions.tsx
    └── guest-dialog.tsx
```

## 4.2 Página: Listagem de Reservas

```
src/app/(admin)/bookings/
├── page.tsx
├── columns.tsx
├── [id]/
│   └── page.tsx              # Detalhes da reserva
└── new/
    └── page.tsx              # Nova reserva (wizard)
```

## 4.3 Página: Orçamentos

```
src/app/(admin)/bookings/quotes/
├── page.tsx
├── columns.tsx
└── new/
    └── page.tsx
```

---

# FASE 5: Gestão de Estoque

```
src/app/(admin)/stock/
├── page.tsx                  # Cards de categorias
├── [category]/
│   ├── page.tsx              # Itens da categoria
│   └── components/
│       ├── item-table.tsx
│       └── item-dialog.tsx
└── purchases/
    ├── page.tsx
    └── new/
        └── page.tsx
```

**Categorias pré-cadastradas:**
1. ☕ Café da Manhã
2. 🏊 Produtos de Piscina
3. 🧹 Produtos de Limpeza
4. 🔧 Equipamentos
5. 🛠️ Manutenções

---

# FASE 6: Gestão Financeira

```
src/app/(admin)/financial/
├── page.tsx                  # Visão geral
├── expenses/
│   ├── page.tsx
│   └── new/
│       └── page.tsx
├── revenues/
│   ├── page.tsx
│   └── new/
│       └── page.tsx
└── reports/
    ├── page.tsx
    ├── dre/
    │   └── page.tsx
    └── projections/
        └── page.tsx
```

**Categorias de despesas pré-cadastradas:**
1. 👷 Folha Salarial
2. 🏠 Despesas Fixas (água, luz, internet, aluguel)
3. 🛒 Despensa/Estoque
4. 🔧 Equipamentos
5. 📊 Variáveis
6. ⚠️ Imprevistos
7. 🔨 Manutenções
8. 💼 Pró-labore

---

# FASE 7: Motor de Reservas Público

```
src/app/(public)/reservas/
├── page.tsx                  # Buscador
├── search/
│   └── page.tsx              # Resultados (suítes disponíveis)
├── [roomId]/
│   └── page.tsx              # Detalhes da suíte
└── checkout/
    ├── page.tsx              # Formulário de checkout
    ├── success/
    │   └── page.tsx
    └── components/
        ├── guest-form.tsx
        ├── payment-form.tsx
        └── booking-summary.tsx
```

---

# FASE 8: Sidebar e Navegação

Reestruturar sidebar existente com nova estrutura:

```tsx
const navigation = [
  { name: "Visão Geral", href: "/overview", icon: Home },
  { 
    name: "Mapa", 
    icon: Map,
    children: [
      { name: "Mapa dos Quartos", href: "/map/rooms" },
      { name: "Mapa de Reservas", href: "/map/reservations" },
    ]
  },
  { name: "Hóspedes", href: "/guests", icon: Users },
  { 
    name: "Reservas", 
    icon: Calendar,
    children: [
      { name: "Todas as Reservas", href: "/bookings" },
      { name: "Nova Reserva", href: "/bookings/new" },
      { name: "Orçamentos", href: "/bookings/quotes" },
    ]
  },
  { name: "Estoque", href: "/stock", icon: Package },
  { 
    name: "Financeiro", 
    icon: DollarSign,
    children: [
      { name: "Visão Geral", href: "/financial" },
      { name: "Despesas", href: "/financial/expenses" },
      { name: "Receitas", href: "/financial/revenues" },
      { name: "Relatórios", href: "/financial/reports" },
    ]
  },
  { 
    name: "Configurações", 
    icon: Settings,
    children: [
      { name: "Perfil", href: "/settings/profile" },
      { name: "Usuários", href: "/settings/users" },
    ]
  },
];
```

---

# FASE 9: Seeds e Dados Iniciais

Criar seed com:
- 12 quartos (4 Standard, 4 Luxo, 4 Luxo Superior)
- Categorias de estoque
- Categorias de despesas
- Configurações iniciais

---

# FASE 10: Testes e Validação

- [ ] Testar criação de reserva sem conflitos
- [ ] Testar conflito de datas (deve bloquear)
- [ ] Testar fluxo de caixa após pagamento
- [ ] Testar motor de reservas público
- [ ] Testar atualização de estoque após compra
- [ ] Testar geração de relatórios

---

# 🔮 Fase Futura: Integração IA/WhatsApp

**Não será implementado agora, mas a arquitetura está preparada:**

1. API REST para consultas do agente IA
2. Webhooks para receber comandos do WhatsApp
3. Histórico de interações com IA
4. Ações permitidas via IA (consultar, criar reserva, atualizar status)

---

## ⚠️ Regras Importantes

1. **Sempre usar componentes shadcn existentes** - Nunca criar do zero
2. **Seguir padrão de features** - actions.ts, schemas.ts, types.ts
3. **Validação de conflitos obrigatória** - Não permitir reservas duplicadas
4. **Fluxo de caixa automático** - Toda transação atualiza o saldo
5. **Upload via R2** - Fotos e comprovantes no Cloudflare R2
6. **Responsividade** - Tudo deve funcionar em mobile

---

## 📊 Progresso

| Fase | Status | Progresso |
|------|--------|-----------|
| Fase 1 - Modelagem | ⏳ Pendente | 0% |
| Fase 2 - Backend | ⏳ Pendente | 0% |
| Fase 3 - Dashboards | ⏳ Pendente | 0% |
| Fase 4 - Hóspedes/Reservas | ⏳ Pendente | 0% |
| Fase 5 - Estoque | ⏳ Pendente | 0% |
| Fase 6 - Financeiro | ⏳ Pendente | 0% |
| Fase 7 - Motor Público | ⏳ Pendente | 0% |
| Fase 8 - Sidebar | ⏳ Pendente | 0% |
| Fase 9 - Seeds | ⏳ Pendente | 0% |
| Fase 10 - Testes | ⏳ Pendente | 0% |

---

*Última atualização: 30/01/2026*
