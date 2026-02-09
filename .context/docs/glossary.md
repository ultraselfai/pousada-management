---
type: doc
name: glossary
description: Domain concepts, terminology, and definitions
category: domain
generated: 2026-01-30
status: filled
scaffoldVersion: "2.0.0"
---

# Glossário e Conceitos de Domínio

## Termos do Negócio

### Reserva (Booking)

Uma reserva de hospedagem que inclui:

- **Check-in**: Data de entrada do hóspede
- **Check-out**: Data de saída do hóspede
- **Status**: Estado atual (pendente, confirmada, check-in, check-out, cancelada)
- **Diárias**: Número de noites da estadia

### Hóspede (Guest)

Pessoa que realiza ou é beneficiária de uma reserva. Contém dados pessoais, documentação e histórico de estadias.

### Quarto (Room)

Unidade de acomodação da pousada. Possui:

- **Tipo**: Categoria (standard, luxo, suíte)
- **Capacidade**: Número máximo de hóspedes
- **Amenidades**: Recursos disponíveis (ar-condicionado, TV, frigobar)

### Cotação (Quote)

Orçamento prévio para hospedagem, geralmente usado para grupos ou eventos. Pode ser convertido em reserva.

### Tarifa (Rate)

Valor cobrado por diária em um quarto. Pode variar por:

- Temporada (alta, baixa)
- Tipo de quarto
- Quantidade de hóspedes

## Status de Reserva

| Status        | Descrição                      |
| ------------- | ------------------------------ |
| `PENDING`     | Reserva aguardando confirmação |
| `CONFIRMED`   | Reserva confirmada             |
| `CHECKED_IN`  | Hóspede realizou check-in      |
| `CHECKED_OUT` | Hóspede realizou check-out     |
| `CANCELLED`   | Reserva cancelada              |
| `NO_SHOW`     | Hóspede não compareceu         |

## Conceitos Técnicos

### Server Action

Função do Next.js executada no servidor, usada para mutações de dados com tipagem segura.

### Server Component

Componente React renderizado no servidor, padrão no App Router do Next.js.

### Prisma

ORM (Object-Relational Mapping) TypeScript-first para interação com banco de dados.

### Feature Module

Pasta que agrupa toda a lógica relacionada a um domínio específico (actions, components, hooks, types).

## Abreviações

| Sigla | Significado                           |
| ----- | ------------------------------------- |
| UH    | Unidade Habitacional (quarto)         |
| PAX   | Quantidade de pessoas                 |
| ADT   | Adulto                                |
| CHD   | Criança                               |
| INF   | Infante (bebê)                        |
| F&B   | Food & Beverage (alimentos e bebidas) |

## Personas

### Administrador

Usuário com acesso total ao sistema. Gerencia reservas, hóspedes, quartos e configurações.

### Recepcionista

Usuário operacional focado em check-in/check-out e atendimento ao hóspede.

### Financeiro

Usuário responsável por pagamentos, relatórios e controle financeiro.

## Recursos Relacionados

- [Project Overview](./project-overview.md)
- [Architecture](./architecture.md)
