---
type: doc
name: security
description: Authentication model, secrets management, compliance requirements
category: security
generated: 2026-01-30
status: filled
scaffoldVersion: "2.0.0"
---

# Segurança e Compliance

## Modelo de Autenticação

### Provedor

O sistema utiliza **Better Auth** (ou Auth.js) para autenticação, suportando:

- Email/senha com hash seguro (bcrypt)
- OAuth (Google, GitHub - se configurado)
- Sessões JWT armazenadas em cookies HttpOnly

### Fluxo de Login

```
1. Usuário submete credenciais
2. Server Action valida no banco
3. Sessão criada com token JWT
4. Cookie HttpOnly setado
5. Redirect para área protegida
```

### Middleware de Proteção

Rotas administrativas (`/admin/*`) são protegidas via middleware:

```typescript
// middleware.ts
export const config = {
  matcher: ["/admin/:path*"],
}
```

## Autorização

### Níveis de Acesso

| Role      | Permissões                            |
| --------- | ------------------------------------- |
| `admin`   | Acesso total ao sistema               |
| `manager` | Gerenciar reservas, hóspedes, quartos |
| `staff`   | Visualizar e operar check-in/out      |
| `viewer`  | Apenas visualização                   |

### Proteção de Rotas

- **Server Components**: Verificação de sessão no servidor
- **Server Actions**: Validação de permissões antes de mutações
- **API Routes**: Middleware de autenticação

## Gerenciamento de Secrets

### Variáveis de Ambiente

Secrets armazenados em `.env` (não commitado):

```env
DATABASE_URL=postgresql://...
AUTH_SECRET=...
NEXTAUTH_URL=...
```

### Boas Práticas

- `.env` no `.gitignore`
- Secrets diferentes por ambiente (dev/staging/prod)
- Rotação periódica de credenciais
- Uso de secret managers em produção (Railway, Vercel)

## Proteções de Segurança

### CSRF

- Tokens automáticos em Server Actions
- Headers de origem validados

### SQL Injection

- Prisma ORM com queries parametrizadas
- Nunca interpolação de strings em SQL

### XSS

- React escapa HTML por padrão
- CSP headers configurados
- Sanitização de inputs quando necessário

### Dados Sensíveis

- Senhas com hash bcrypt (salt rounds: 12)
- Dados de cartão NÃO armazenados
- CPF/RG armazenados de forma segura

## Compliance

### LGPD (Lei Geral de Proteção de Dados)

- Consentimento para coleta de dados
- Direito de exclusão de dados
- Logs de acesso a dados pessoais

### Retenção de Dados

| Tipo             | Retenção                    |
| ---------------- | --------------------------- |
| Reservas         | 5 anos                      |
| Dados de hóspede | Até solicitação de exclusão |
| Logs de acesso   | 1 ano                       |

## Auditoria

### Campos de Auditoria

Todas as entidades principais possuem:

- `createdAt`: Data de criação
- `updatedAt`: Data de última atualização
- `createdBy`: Usuário que criou (quando aplicável)

### Logs de Ações Críticas

- Criação/edição de reservas
- Alterações financeiras
- Login/logout de usuários

## Recursos Relacionados

- [Architecture](./architecture.md)
- [Development Workflow](./development-workflow.md)
