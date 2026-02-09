---
type: doc
name: project-overview
description: High-level overview of the project, its purpose, and key components
category: overview
generated: 2026-01-30
status: filled
scaffoldVersion: "2.0.0"
---

# Visão Geral do Projeto

O **Pousada Management** é um sistema completo de gerenciamento para pousadas e pequenos hotéis, desenvolvido para facilitar a administração de reservas, hóspedes, quartos e finanças.

## Propósito

O sistema foi criado para:

- **Centralizar operações** de pousadas em uma única plataforma
- **Automatizar processos** de reserva e check-in/check-out
- **Fornecer insights** através de dashboards e relatórios
- **Integrar módulos** de forma coesa (reservas, financeiro, tarefas)

## Domínios Principais

### 1. Gestão de Reservas (Bookings)

O coração do sistema. Permite criar, editar e gerenciar reservas com:

- Calendário visual de ocupação
- Mapa de quartos interativo
- Status de reserva (confirmada, pendente, check-in, check-out)
- Integração com módulo financeiro

### 2. Gestão de Hóspedes (Guests)

Cadastro completo de hóspedes com:

- Dados pessoais e documentação
- Histórico de estadias
- Preferências e observações

### 3. Gestão de Quartos (Rooms)

Controle de acomodações incluindo:

- Tipos de quartos e capacidade
- Amenidades e características
- Status de disponibilidade
- Manutenção e limpeza

### 4. Módulo Financeiro

Controle financeiro com:

- Receitas (pagamentos de hospedagem)
- Despesas operacionais
- Relatórios financeiros
- Integração com reservas

### 5. Cotações (Quotes)

Sistema de orçamentos para:

- Grupos e eventos
- Pacotes personalizados
- Conversão em reservas

### 6. Gerenciamento de Tarefas (Tasks)

Organização operacional com:

- Tarefas de limpeza
- Manutenção preventiva
- Atribuição de responsáveis

## Stack Tecnológico

| Camada         | Tecnologia                         |
| -------------- | ---------------------------------- |
| Frontend       | Next.js 15, React 19, TypeScript   |
| Estilização    | Tailwind CSS, Radix UI             |
| Backend        | Next.js API Routes, Server Actions |
| Banco de Dados | PostgreSQL via Prisma ORM          |
| Autenticação   | Better Auth / Auth.js              |
| Deploy         | Railway / Vercel                   |

## Arquitetura de Alto Nível

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Application                       │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   Pages     │  │  Components │  │      Features       │ │
│  │  (Admin)    │  │    (UI)     │  │ (bookings, guests)  │ │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘ │
│         │                │                     │            │
│         └────────────────┼─────────────────────┘            │
│                          │                                  │
│              ┌───────────▼───────────┐                     │
│              │  API Routes / Actions │                     │
│              └───────────┬───────────┘                     │
│                          │                                  │
│              ┌───────────▼───────────┐                     │
│              │     Prisma Client     │                     │
│              └───────────┬───────────┘                     │
└──────────────────────────┼──────────────────────────────────┘
                           │
               ┌───────────▼───────────┐
               │   PostgreSQL (Cloud)  │
               └───────────────────────┘
```

## Getting Started

```bash
# 1. Instalar dependências
pnpm install

# 2. Configurar variáveis de ambiente
cp .env.example .env

# 3. Aplicar migrações
pnpm prisma migrate dev

# 4. Iniciar servidor de desenvolvimento
pnpm dev
```

## Próximos Passos

- Consulte [Architecture](./architecture.md) para detalhes técnicos
- Veja [Development Workflow](./development-workflow.md) para contribuir
- Explore [Tooling](./tooling.md) para ferramentas disponíveis
