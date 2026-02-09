# 📁 Estrutura _disabled-multi-tenant

Esta pasta contém todas as rotas e funcionalidades multi-tenant que foram **desabilitadas temporariamente** para o projeto da pousada.

## 🎯 Por que está desabilitado?

O projeto da pousada atualmente só precisa de:
- ✅ Site público da pousada (/)
- ✅ Painel admin para gestão

O sistema multi-tenant completo está preservado aqui para **futuro uso** caso seja necessário transformar o sistema em uma plataforma multi-tenant.

## 📂 O que está aqui?

```
_disabled-multi-tenant/
├── (auth)/                    # Rotas de autenticação de usuários
│   ├── login/                 # Login de usuários (não admin)
│   ├── sign-in/               # Variações de login
│   ├── sign-up/               # Registro de usuários
│   ├── onboarding/            # Fluxo de primeiro acesso
│   └── ...
├── (app)/                     # Área multi-tenant
│   └── [tenantId]/            # Dashboard por organização
│       ├── dashboard/
│       ├── calendar/
│       ├── tasks/
│       └── ...
└── proxy.ts                   # Middleware multi-tenant
```

## 🔄 Como reativar o multi-tenant?

Se no futuro você quiser transformar isso em multi-tenant:

1. **Mover pastas de volta:**
   ```bash
   mv src/_disabled-multi-tenant/(auth) src/app/(auth)
   mv src/_disabled-multi-tenant/(app) src/app/(app)
   mv src/_disabled-multi-tenant/proxy.ts src/proxy.ts
   ```

2. **Remover admin-login standalone:**
   ```bash
   rm -rf src/app/admin-login
   ```

3. **Atualizar page.tsx:** Voltar o redirect para `/login`

4. **Pronto!** O sistema multi-tenant volta a funcionar.

## 🏗️ Estrutura Atual (Single-Tenant)

```
src/app/
├── page.tsx                   # Site da pousada (/)
├── (website)/                 # Páginas públicas
│   ├── contato/
│   └── layout.tsx
├── (admin)/                   # Painel admin (preservado)
│   ├── dashboard/
│   ├── organizations/
│   └── ...
└── admin-login/               # Login admin (movido de (auth))
```

---

**Nota:** Next.js ignora automaticamente pastas que começam com `_`, então nada aqui afeta o build ou runtime.
