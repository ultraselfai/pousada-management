---
type: doc
name: README
description: Index of all documentation for this repository
category: index
generated: 2026-01-30
status: filled
scaffoldVersion: "2.0.0"
---

# Pousada Management - Documentação

Bem-vindo à base de conhecimento do projeto **Pousada Management**. Este é um sistema de gerenciamento completo para pousadas, desenvolvido com Next.js, Prisma e PostgreSQL.

## Guias Principais

| Guia                                                  | Descrição                                         |
| ----------------------------------------------------- | ------------------------------------------------- |
| [Visão Geral do Projeto](./project-overview.md)       | Alto nível, propósito e componentes principais    |
| [Arquitetura](./architecture.md)                      | Camadas do sistema, padrões e decisões de design  |
| [Fluxo de Desenvolvimento](./development-workflow.md) | Processos de engenharia, branching e contribuição |
| [Estratégia de Testes](./testing-strategy.md)         | Configuração de testes e CI/CD                    |
| [Glossário](./glossary.md)                            | Conceitos de domínio e terminologia               |
| [Segurança](./security.md)                            | Modelo de autenticação e compliance               |
| [Ferramentas](./tooling.md)                           | CLIs, scripts e workflows de automação            |

## Stack Tecnológico

- **Framework**: Next.js 15 (App Router)
- **Linguagem**: TypeScript
- **ORM**: Prisma
- **Banco de Dados**: PostgreSQL (Cloud SQL)
- **UI Components**: Radix UI + Tailwind CSS
- **Autenticação**: Auth.js / Better Auth
- **Estado**: React Query / TanStack Query

## Estrutura do Repositório

```
src/
├── app/                  # Rotas do Next.js (App Router)
│   ├── (admin)/         # Páginas administrativas
│   ├── (public)/        # Páginas públicas
│   └── api/             # API Routes
├── components/          # Componentes React reutilizáveis
│   ├── ui/             # Componentes de UI base
│   ├── layout/         # Layouts e wrappers
│   └── booking/        # Componentes de reserva
├── features/           # Features organizadas por domínio
│   ├── bookings/       # Gerenciamento de reservas
│   ├── guests/         # Gerenciamento de hóspedes
│   ├── rooms/          # Gerenciamento de quartos
│   ├── financial/      # Módulo financeiro
│   ├── quotes/         # Cotações
│   └── auth/           # Autenticação
├── lib/                # Utilitários e configurações
├── hooks/              # Custom React hooks
└── utils/              # Funções utilitárias
```

## Módulos Principais

1. **Reservas (Bookings)** - CRUD completo de reservas com calendário visual
2. **Hóspedes (Guests)** - Cadastro e histórico de hóspedes
3. **Quartos (Rooms)** - Gerenciamento de acomodações
4. **Financeiro** - Controle de receitas e despesas
5. **Cotações (Quotes)** - Sistema de orçamentos
6. **Tarefas (Tasks)** - Gestão de tarefas operacionais
7. **Dashboard** - Visão geral e métricas

## Recursos Relacionados

- [Agent Handbook](../agents/README.md) - Playbooks para agentes AI
- [Planos](../plans/) - Planos de implementação
