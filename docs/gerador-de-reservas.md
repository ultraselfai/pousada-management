# 📄 Gerador de Comprovantes de Reserva - Pousada Dois Corações

Sistema completo para gerar PDFs profissionais de comprovantes de reserva.

## 🎯 Acesso

**URL:** http://localhost:3000/gerador-de-reservas

**Localização:** Painel Admin > Sidebar > "Gerador de Reservas"

## 📋 Funcionalidades

### 1. Dados do Hóspede
- Nome e Sobrenome
- CPF
- Telefone
- Email
- Observações (opcional)

### 2. Detalhes da Reserva
- Acomodação (ex: Suíte Família)
- Datas de Check-in e Check-out
- Valor da diária média
- Número total de diárias
- Quantidade de adultos, crianças e bebês
- Tipo de alimentação (opcional)

### 3. Tipos de Pagamento

#### 🟢 FULL (Pagamento Integral)
- Cliente pagou 100% do valor
- PDF mostra: "Pagamento integral confirmado"
- Tabela lista apenas os pagamentos realizados

#### 🟡 PARTIAL (Pagamento Parcial - 50/50)
- Cliente pagou 50% de entrada
- Restante será pago no check-in
- PDF mostra:
  - Linha 1: "Pagamento parcial confirmado em [data]: R$ [valor]"
  - Linha 2: "Restante a ser pago no check-in: R$ [restante]"
- Tabela inclui automaticamente linha futura do restante

### 4. Pagamentos
- Adicione quantos pagamentos foram realizados
- Para cada pagamento:
  - Descrição (ex: "Entrada 50%", "Pagamento total")
  - Método: PIX ou Cartão
  - Data do pagamento
  - Valor em R$

## 🎨 Design do PDF

O PDF gerado inclui:

✅ **Cabeçalho** - Logo e dados da Pousada Dois Corações
✅ **Seção Hóspede** - Informações completas do cliente
✅ **Seção Reserva** - Detalhes da acomodação e período
✅ **Tabela de Pagamentos** - Visual profissional com linhas alternadas
✅ **Status do Pagamento** - Mensagens personalizadas (FULL vs PARTIAL)
✅ **Timestamp** - Data e hora de geração do documento

## 🚀 Fluxo de Uso

1. **Acesse** o painel admin e clique em "Gerador de Reservas"
2. **Preencha** todos os campos obrigatórios (marcados com *)
3. **Selecione** o tipo de pagamento (FULL ou PARTIAL)
4. **Adicione** os pagamentos realizados
5. **Clique** em "Gerar PDF"
6. **Baixe** o PDF clicando em "Baixar PDF"

## 💡 Exemplos de Uso

### Exemplo 1: Pagamento Integral (Rafael)
```
Tipo: FULL
Pagamento: R$ 1.800,00 via PIX em 10/01/2026
```
**Resultado:** PDF com status "Pagamento integral confirmado"

### Exemplo 2: Pagamento Parcial (Ricardo)
```
Tipo: PARTIAL
Entrada: R$ 900,00 via PIX em 10/01/2026
Check-in: 20/01/2026
Total: R$ 1.800,00
```
**Resultado:** 
- PDF mostra entrada de R$ 900,00
- Adiciona linha automática: "Restante a pagar" R$ 900,00 no check-in
- Status: "Pagamento parcial confirmado" + "Restante a ser pago no check-in"

## 🔧 Validações

O sistema valida automaticamente:
- ✅ Campos obrigatórios preenchidos
- ✅ Formato de email válido
- ✅ CPF com mínimo 11 caracteres
- ✅ Valores numéricos corretos
- ✅ Pelo menos um pagamento adicionado

## 📁 Arquivos Criados

```
src/
├── lib/
│   └── booking-receipt-schema.ts       # Schema Zod + helper functions
├── components/
│   └── booking/
│       └── booking-receipt-pdf.tsx     # Componente PDF
└── app/
    └── (admin)/
        └── gerador-de-reservas/
            └── page.tsx                # Página com formulário
```

## 🎯 Tecnologias Utilizadas

- **@react-pdf/renderer** - Geração de PDFs
- **react-hook-form** - Gerenciamento de formulários
- **zod** - Validação de dados
- **shadcn/ui** - Componentes de UI

---

**Desenvolvido para Pousada Dois Corações** 🏖️❤️
