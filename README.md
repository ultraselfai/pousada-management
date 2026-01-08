# Decode Console Multi-tenant Template v1.0

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js_16-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma_7-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

> 🚀 Template profissional para aplicações SaaS multi-tenant com Next.js 16

---

## 📋 Índice

1. [Visão Geral](#-visão-geral)
2. [Features Incluídas](#-features-incluídas)
3. [Requisitos do Sistema](#-requisitos-do-sistema)
4. [Instalação Local](#-instalação-local)
5. [Estrutura do Projeto](#-estrutura-do-projeto)
6. [Arquitetura Multi-Tenant](#-arquitetura-multi-tenant)
7. [Sistema de Autenticação](#-sistema-de-autenticação)
8. [Sistema de Feature Flags](#-sistema-de-feature-flags)
9. [Personalização](#-personalização)
10. [Deploy em Produção](#-deploy-em-produção)
11. [Regras de Uso e Licença](#-regras-de-uso-e-licença)
12. [Suporte](#-suporte)

---

## 🎯 Visão Geral

O **Decode Console Multi-tenant Template v1.0** é um boilerplate completo para criação de aplicações SaaS multi-tenant. Com ele, você economiza meses de desenvolvimento e pode focar no que realmente importa: as funcionalidades específicas do seu negócio.

### Por que usar este template?

| Benefício | Descrição |
|-----------|-----------|
| ⏱️ **Economia de Tempo** | +200 horas de desenvolvimento já prontas |
| 🏗️ **Arquitetura Sólida** | Multi-tenancy, auth, roles já configurados |
| 🎨 **UI Profissional** | 50+ componentes shadcn/ui customizados |
| 🔐 **Segurança** | Autenticação robusta com Better-Auth |
| 📱 **Responsivo** | Funciona em desktop, tablet e mobile |
| 🌙 **Dark Mode** | Tema claro/escuro com persistência |
| 🚀 **Performance** | Next.js 16 com Turbopack |

---

## ✨ Features Incluídas

### 🔐 Autenticação Completa
- ✅ Login/Registro com email e senha
- ✅ Recuperação de senha
- ✅ Separação Admin vs Usuário
- ✅ OAuth pronto para Google/GitHub (visual implementado)
- ✅ Sessões seguras com tokens
- ✅ Toggle de visibilidade de senha

### 🏢 Multi-Tenancy
- ✅ Isolamento completo por organização
- ✅ Roteamento path-based (`app.com/{slug}/...`)
- ✅ Cada cliente tem seu próprio dashboard
- ✅ Dados segregados por tenant

### 👑 Painel Administrativo
- ✅ Dashboard com métricas
- ✅ CRUD de clientes/organizações
- ✅ Ativação de features por cliente
- ✅ Impersonation (entrar como cliente)
- ✅ Gestão de planos (Free, Sandbox, Enterprise)

### 👋 Onboarding
- ✅ Fluxo de primeiro acesso animado
- ✅ Criação automática de organização
- ✅ Geração de slug sanitizado
- ✅ Verificação de disponibilidade em tempo real

### 🎛️ Módulos de Template (UI Pronta)
- 📅 Calendário
- 💬 Chat
- ✉️ Email
- ✅ Tarefas (Kanban)
- ⚙️ Configurações
- ❓ FAQs
- 💰 Pricing

### 📤 Upload de Arquivos
- ✅ Integração Cloudflare R2
- ✅ Drag & drop
- ✅ Preview de imagens
- ✅ Presigned URLs (seguro)

### 🎨 UI/UX
- ✅ 50+ componentes shadcn/ui
- ✅ Theme customizer
- ✅ Dark/Light mode
- ✅ Sidebar collapsible
- ✅ Animações Framer Motion
- ✅ Totalmente responsivo

---

## 💻 Requisitos do Sistema

### Ambiente de Desenvolvimento

| Requisito | Versão Mínima | Recomendada |
|-----------|---------------|-------------|
| Node.js | 18.x | 20.x ou 22.x |
| pnpm | 8.x | 9.x |
| PostgreSQL | 14.x | 16.x |
| Git | 2.x | Última |

### Contas/Serviços Necessários

| Serviço | Uso | Obrigatório |
|---------|-----|-------------|
| PostgreSQL | Banco de dados | ✅ Sim |
| Cloudflare R2 | Upload de arquivos | ⚠️ Opcional |
| Resend | Envio de emails | ⚠️ Opcional |

---

## 🛠️ Instalação Local

### 1. Clone o Repositório

```bash
git clone https://github.com/seu-usuario/template-supremo.git
cd template-supremo
```

### 2. Instale as Dependências

```bash
pnpm install
```

### 3. Configure as Variáveis de Ambiente

Copie o arquivo de exemplo e configure:

```bash
cp .env.example .env
```

Edite o arquivo `.env`:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/template_supremo"

# Better Auth
BETTER_AUTH_SECRET="sua-chave-secreta-aqui-minimo-32-caracteres"
BETTER_AUTH_URL="http://localhost:3000"

# Cloudflare R2 (opcional)
R2_ACCESS_KEY_ID="sua-access-key"
R2_SECRET_ACCESS_KEY="sua-secret-key"
R2_BUCKET_NAME="seu-bucket"
R2_ACCOUNT_ID="seu-account-id"
R2_PUBLIC_URL="https://seu-bucket.r2.dev"

# Resend (opcional)
RESEND_API_KEY="re_xxxxxxxxxxxx"
```

### 4. Suba o Banco de Dados (Docker)

```bash
docker-compose up -d
```

### 5. Configure o Banco de Dados

```bash
# Gera o cliente Prisma
pnpm db:generate

# Aplica as migrations
pnpm db:migrate

# (Opcional) Popula com dados de teste
pnpm db:seed
```

### 6. Inicie o Servidor de Desenvolvimento

```bash
pnpm dev
```

Acesse: **http://localhost:3000**

### Credenciais de Teste (após seed)

| Tipo | Email | Senha |
|------|-------|-------|
| Admin | admin@decode.ink | Admin@123 |

---

## 📁 Estrutura do Projeto

```
template-supremo/
├── prisma/
│   ├── schema.prisma      # Modelos do banco
│   ├── seed.ts            # Dados iniciais
│   └── migrations/        # Histórico de migrations
├── public/                # Assets estáticos
├── src/
│   ├── app/
│   │   ├── (admin)/       # Painel administrativo
│   │   ├── (app)/         # Área dos clientes
│   │   │   └── [tenantId]/ # Rotas multi-tenant
│   │   ├── (auth)/        # Autenticação
│   │   ├── api/           # API routes
│   │   └── landing/       # Landing page
│   ├── components/
│   │   ├── ui/            # Componentes shadcn
│   │   ├── layout/        # Sidebar, Header, etc.
│   │   └── landing/       # Componentes da landing
│   ├── config/
│   │   └── features.ts    # Registry de features
│   ├── contexts/          # React Contexts
│   ├── features/          # Lógica de domínio
│   ├── hooks/             # Custom hooks
│   ├── lib/               # Utilitários
│   └── types/             # TypeScript types
├── docs/                  # Documentação VitePress
└── docker-compose.yml     # PostgreSQL local
```

---

## 🏛️ Arquitetura Multi-Tenant

### Como Funciona

O template utiliza **path-based multi-tenancy**, onde cada organização tem seu próprio "espaço" na URL:

```
seuapp.com/acme/dashboard    →  Dashboard da empresa ACME
seuapp.com/techcorp/users    →  Usuários da TechCorp
seuapp.com/dashboard         →  Painel Admin (você)
```

### Fluxo de Requisição

```
Requisição → Proxy (proxy.ts) → Identifica tenant → Roteia para (app)/[tenantId]/...
```

### Isolamento de Dados

Cada organização tem:
- Seu próprio slug único na URL
- Features ativas configuráveis
- Membros e roles isolados
- Dados completamente segregados

### Route Groups

| Grupo | Caminho | Propósito |
|-------|---------|-----------|
| `(admin)` | `/dashboard`, `/organizations` | Seu painel de controle |
| `(app)` | `/{slug}/dashboard` | Área dos seus clientes |
| `(auth)` | `/login`, `/onboarding` | Autenticação |

---

## 🔐 Sistema de Autenticação

### Tecnologia: Better-Auth

O template usa [Better-Auth](https://better-auth.com), uma biblioteca moderna de autenticação para Next.js.

### Plugins Configurados

| Plugin | Função |
|--------|--------|
| `organization` | Multi-tenancy nativo |
| `admin` | Roles e impersonation |

### Roles do Sistema

| Role | Acesso |
|------|--------|
| `admin` | Painel admin completo |
| `owner` | Painel admin + dono do sistema |
| `user` | Apenas área do cliente |

### Impersonation

Admins podem "entrar" como qualquer cliente para debug/suporte. Um banner amarelo indica quando você está impersonando.

---

## 🚩 Sistema de Feature Flags

### Como Funciona

Cada feature do sistema pode ser ativada/desativada por organização:

```typescript
// src/config/features.ts
{
  key: 'calendar',
  label: 'Calendário',
  status: 'stable',  // 'dev' | 'beta' | 'stable'
  showInSidebar: true,
}
```

### Status das Features

| Status | Visibilidade |
|--------|-------------|
| `stable` | Todos os clientes |
| `beta` | Clientes selecionados |
| `dev` | Apenas sandbox (desenvolvimento) |

### Ativando Features

No painel admin → Organizações → Editar cliente → Selecionar features

### Sidebar Dinâmico

O sidebar do cliente mostra apenas as features ativas para sua organização.

---

## 🎨 Personalização

### Cores e Tema

Edite `src/app/globals.css` para customizar cores:

```css
:root {
  --primary: oklch(0.205 0 0);
  --background: oklch(1 0 0);
  /* ... */
}
```

### Logo

Substitua os arquivos em `/public/`:
- `logo.svg` - Logo principal
- `favicon.ico` - Ícone do navegador

### Componentes

Todos os componentes shadcn/ui estão em `src/components/ui/`. Você pode customizá-los livremente.

---

## 🚀 Deploy em Produção

### Opção Recomendada: Coolify

[Coolify](https://coolify.io) é uma plataforma self-hosted para deploy de aplicações. É como ter seu próprio Vercel/Heroku.

#### Por que Coolify?

- ✅ Self-hosted (você controla tudo)
- ✅ Suporte nativo a Docker
- ✅ SSL automático
- ✅ PostgreSQL integrado
- ✅ Backups automáticos
- ✅ Custo zero (além do servidor)

### Requisitos para Produção

| Requisito | Especificação |
|-----------|---------------|
| VPS/Servidor | 2GB RAM mínimo, 4GB recomendado |
| Sistema | Ubuntu 22.04+ ou Debian 12+ |
| Coolify | v4.x instalado |
| Domínio | Com DNS configurado |

### Passo a Passo: Deploy no Coolify

#### 1. Instale o Coolify no seu servidor

```bash
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```

#### 2. Acesse o Coolify

```
https://seu-servidor:8000
```

#### 3. Crie um novo projeto

- Clique em "New Project"
- Conecte seu repositório GitHub/GitLab

#### 4. Configure o ambiente

No Coolify, adicione as variáveis de ambiente:

```env
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=...
BETTER_AUTH_URL=https://seudominio.com
NODE_ENV=production
```

#### 5. Configure o Build

```
Build Command: pnpm build
Start Command: pnpm start
```

#### 6. PostgreSQL no Coolify

- Vá em "Resources" → "New" → "PostgreSQL"
- Copie a connection string gerada
- Use no `DATABASE_URL`

#### 7. Deploy

Clique em "Deploy" e aguarde. O Coolify:
- Clona o repositório
- Instala dependências
- Executa o build
- Inicia a aplicação
- Configura SSL automaticamente

### Checklist de Produção

- [ ] Variáveis de ambiente configuradas
- [ ] `BETTER_AUTH_SECRET` é uma string forte e única
- [ ] `BETTER_AUTH_URL` aponta para o domínio de produção
- [ ] PostgreSQL configurado e acessível
- [ ] Migrations aplicadas (`pnpm db:migrate`)
- [ ] SSL/HTTPS ativo
- [ ] Backup de banco configurado

---

## 📜 Regras de Uso e Licença

### Licença

Este template é vendido sob licença **comercial**. Ao adquirir, você tem direito a:

#### ✅ Permitido

- Usar em projetos ilimitados (seus ou de clientes)
- Modificar o código livremente
- Remover créditos e atribuições
- Usar comercialmente
- Criar produtos derivados

#### ❌ Não Permitido

- Revender o template como template
- Distribuir o código fonte
- Compartilhar acesso com terceiros
- Usar para criar templates concorrentes

### Atualizações

Sua licença inclui atualizações por 12 meses. Após, você pode:
- Continuar usando a versão atual
- Renovar para receber novas atualizações

---

## 🆘 Suporte

### Documentação

- `/docs` - Documentação completa em VitePress
- Este README - Guia rápido

### Comunidade

- Discord: [link do discord]
- Email: suporte@seudominio.com

### Reportar Bugs

Abra uma issue no repositório privado com:
1. Descrição do problema
2. Passos para reproduzir
3. Screenshots (se aplicável)
4. Versão do template

---

## 🎉 Começando seu Projeto

1. **Clone e configure** seguindo a seção de instalação
2. **Explore o código** - comece por `src/app/(admin)/`
3. **Customize a landing** - edite `src/app/landing/`
4. **Adicione suas features** - crie em `src/features/`
5. **Deploy** - siga o guia do Coolify

### Próximos Passos Sugeridos

1. Customize cores e logo
2. Edite a landing page
3. Configure OAuth (Google/GitHub)
4. Adicione suas features de negócio
5. Configure billing (Stripe)

---

## 🔧 Scripts Disponíveis

```bash
pnpm dev          # Inicia servidor de desenvolvimento
pnpm build        # Build de produção
pnpm start        # Inicia servidor de produção
pnpm lint         # Verifica código
pnpm db:generate  # Gera cliente Prisma
pnpm db:migrate   # Aplica migrations
pnpm db:seed      # Popula banco com dados de teste
pnpm db:studio    # Abre Prisma Studio
```

---

**Bom desenvolvimento! 🚀**

*Decode Console Multi-tenant Template v1.0 - Desenvolvido com ❤️ por Decode.ink*
