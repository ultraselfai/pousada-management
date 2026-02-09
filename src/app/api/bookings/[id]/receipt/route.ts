import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  renderToBuffer,
} from "@react-pdf/renderer";
import { createElement } from "react";

// Cores da marca
const colors = {
  primary: "#E85D5D", // Vermelho claro
  headerBg: "#FEF5F5", // Fundo rosa claro
  tableBorder: "#FECACA",
  tableHeader: "#FEE2E2",
  textPrimary: "#1F2937", // Cinza escuro
  textSecondary: "#6B7280", // Cinza médio
  textMuted: "#9CA3AF", // Cinza claro
  success: "#22C55E", // Verde
  warning: "#F59E0B", // Amarelo
  white: "#FFFFFF",
};

// Estilos do PDF - usando Helvetica (fonte padrão do PDF)
const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 9,
    paddingTop: 30,
    paddingBottom: 30,
    paddingHorizontal: 40,
    backgroundColor: colors.white,
  },
  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "stretch",
    backgroundColor: colors.headerBg,
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  logo: {
    width: 45,
    height: 45,
    marginRight: 10,
  },
  headerInfo: {
    flexDirection: "column",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: colors.primary,
    marginBottom: 2,
  },
  headerContact: {
    fontSize: 7,
    color: colors.textSecondary,
    marginBottom: 1,
  },
  headerRight: {
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  bookingNumber: {
    fontSize: 12,
    fontWeight: 700,
    color: colors.textPrimary,
  },
  emissionContainer: {
    alignItems: "flex-end",
  },
  emissionLabel: {
    fontSize: 7,
    color: colors.textMuted,
    textAlign: "right",
  },
  emissionDate: {
    fontSize: 8,
    color: colors.textSecondary,
    textAlign: "right",
  },
  // Section
  section: {
    marginBottom: 18,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: colors.textPrimary,
    marginRight: 8,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E7EB",
  },
  // Grid rows - 4 columns layout
  row: {
    flexDirection: "row",
    marginBottom: 8,
  },
  // Field items - each takes exactly 25% width
  col4: {
    width: "25%",
    paddingRight: 8,
  },
  col3: {
    width: "33.33%",
    paddingRight: 8,
  },
  col2: {
    width: "50%",
    paddingRight: 8,
  },
  // Legacy field item styles for compatibility
  fieldItem: {
    flex: 1,
    marginRight: 12,
  },
  fieldItemSmall: {
    flex: 0.7,
    marginRight: 12,
  },
  fieldItemLarge: {
    flex: 1.5,
    marginRight: 12,
  },
  fieldLabel: {
    fontSize: 7,
    fontWeight: 600,
    color: colors.textSecondary,
    marginBottom: 1,
  },
  fieldValue: {
    fontSize: 8,
    color: colors.textPrimary,
  },
  // Table
  table: {
    borderWidth: 1,
    borderColor: colors.tableBorder,
    borderRadius: 6,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: colors.tableHeader,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  tableHeaderCell: {
    fontSize: 9,
    fontWeight: 600,
    color: colors.primary,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: colors.tableBorder,
  },
  tableCell: {
    fontSize: 9,
    color: colors.textPrimary,
  },
  tableCellDesc: {
    flex: 3,
  },
  tableCellPayment: {
    flex: 1.5,
    textAlign: "center",
  },
  tableCellDate: {
    flex: 1,
    textAlign: "center",
  },
  tableCellCost: {
    flex: 1,
    textAlign: "right",
  },
  totalRow: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: colors.tableBorder,
    backgroundColor: colors.tableHeader,
  },
  totalLabel: {
    flex: 5.5,
    fontSize: 10,
    fontWeight: 700,
    color: colors.textPrimary,
    textAlign: "center",
  },
  totalValue: {
    flex: 1,
    fontSize: 10,
    fontWeight: 700,
    color: colors.primary,
    textAlign: "right",
  },
  // Status section
  statusItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  statusIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  statusIconSuccess: {
    backgroundColor: colors.success,
  },
  statusIconWarning: {
    backgroundColor: colors.warning,
  },
  checkmark: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 700,
  },
  questionMark: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 700,
  },
  statusText: {
    fontSize: 10,
    color: colors.textPrimary,
  },
  statusTextSuccess: {
    color: colors.success,
  },
  statusTextWarning: {
    color: colors.warning,
  },
});

// Helper para formatar moeda
function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

// Helper para formatar CPF
function formatCPF(cpf: string): string {
  const cleaned = cpf.replace(/\D/g, "");
  if (cleaned.length !== 11) return cpf;
  return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`;
}

// Helper para formatar telefone
function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 11) {
    return `+55 ${cleaned.slice(0, 2)} ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }
  if (cleaned.length === 10) {
    return `+55 ${cleaned.slice(0, 2)} ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}

// Helper para nome e sobrenome
function splitName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(" ");
  const firstName = parts[0] || "";
  const lastName = parts.slice(1).join(" ") || "";
  return { firstName, lastName };
}

// Helper para traduzir método de pagamento
function translatePaymentMethod(method: string): string {
  const methods: Record<string, string> = {
    PIX: "Pix",
    CREDIT_CARD: "Cartão de Crédito",
    DEBIT_CARD: "Cartão de Débito",
    CASH: "Dinheiro",
    TRANSFER: "Transferência",
  };
  return methods[method] || method;
}

// Componente do PDF
interface BookingReceiptProps {
  booking: {
    bookingNumber: string;
    checkIn: Date;
    checkOut: Date;
    adults: number;
    children: number;
    mealsIncluded: boolean;
    totalAmount: number;
    paidAmount: number;
    paymentMethod: string;
    paymentType: string;
    notes: string | null;
    createdAt: Date;
    guest: {
      name: string;
      cpf: string;
      email: string | null;
      phone: string;
      birthDate: Date | null;
      notes: string | null;
    };
    room: {
      name: string;
      category: string;
    };
    transactions: Array<{
      amount: number;
      date: Date;
      description: string;
    }>;
  };
  logoBase64: string;
}

function BookingReceiptDocument({ booking, logoBase64 }: BookingReceiptProps) {
  const { firstName, lastName } = splitName(booking.guest.name);
  const nights = differenceInDays(booking.checkOut, booking.checkIn);
  const dailyRate = nights > 0 ? booking.totalAmount / nights : booking.totalAmount;
  const remainingAmount = booking.totalAmount - booking.paidAmount;
  const isFullPayment = remainingAmount <= 0;
  const emissionDate = new Date();

  // Título do documento: [código] - [suíte] - [hóspede]
  const documentTitle = `${booking.bookingNumber.replace("RES-", "")} - ${booking.room.name} - ${firstName}`;

  return createElement(
    Document,
    { title: documentTitle },
    createElement(
      Page,
      { size: "A4", style: styles.page },
      // Header
      createElement(
        View,
        { style: styles.header },
        createElement(
          View,
          { style: styles.headerLeft },
          createElement(Image, { src: logoBase64, style: styles.logo }),
          createElement(
            View,
            { style: styles.headerInfo },
            createElement(Text, { style: styles.headerTitle }, "Pousada Dois Corações"),
            createElement(Text, { style: styles.headerContact }, "pousadadoiscorações.site"),
            createElement(Text, { style: styles.headerContact }, "+55 17 99646-6495"),
            createElement(
              Text,
              { style: styles.headerContact },
              "Estrada Vicinal João Custódio Sobrinho, Km 01 - Olímpia, SP"
            )
          )
        ),
        createElement(
          View,
          { style: styles.headerRight },
          createElement(Text, { style: styles.bookingNumber }, `Nº: ${booking.bookingNumber.replace("RES-", "")}`),
          createElement(
            View,
            { style: styles.emissionContainer },
            createElement(Text, { style: styles.emissionLabel }, "Data de emissão"),
            createElement(
              Text,
              { style: styles.emissionDate },
              format(emissionDate, "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR })
            )
          )
        )
      ),

      // Informações do Hóspede
      createElement(
        View,
        { style: styles.section },
        createElement(
          View,
          { style: styles.sectionHeader },
          createElement(Text, { style: styles.sectionTitle }, "Informações do Hóspede"),
          createElement(View, { style: styles.sectionLine })
        ),
        // Linha 1: Nome | Sobrenome | Data Nasc | CPF
        createElement(
          View,
          { style: styles.row },
          createElement(
            View,
            { style: styles.col4 },
            createElement(Text, { style: styles.fieldLabel }, "Nome:"),
            createElement(Text, { style: styles.fieldValue }, firstName)
          ),
          createElement(
            View,
            { style: styles.col4 },
            createElement(Text, { style: styles.fieldLabel }, "Sobrenome:"),
            createElement(Text, { style: styles.fieldValue }, lastName || "-")
          ),
          createElement(
            View,
            { style: styles.col4 },
            createElement(Text, { style: styles.fieldLabel }, "Data de Nascimento:"),
            createElement(
              Text,
              { style: styles.fieldValue },
              booking.guest.birthDate
                ? format(booking.guest.birthDate, "dd/MM/yyyy", { locale: ptBR })
                : "-"
            )
          ),
          createElement(
            View,
            { style: styles.col4 },
            createElement(Text, { style: styles.fieldLabel }, "CPF:"),
            createElement(Text, { style: styles.fieldValue }, formatCPF(booking.guest.cpf))
          )
        ),
        // Linha 2: Telefone | Email | Data Nasc (vazio) | Observações - ALINHADO
        createElement(
          View,
          { style: styles.row },
          createElement(
            View,
            { style: styles.col4 },
            createElement(Text, { style: styles.fieldLabel }, "Telefone:"),
            createElement(Text, { style: styles.fieldValue }, formatPhone(booking.guest.phone))
          ),
          createElement(
            View,
            { style: styles.col4 },
            createElement(Text, { style: styles.fieldLabel }, "E-mail:"),
            createElement(Text, { style: styles.fieldValue }, booking.guest.email || "-")
          ),
          createElement(
            View,
            { style: styles.col4 },
            createElement(Text, { style: styles.fieldLabel }, "Observações:"),
            createElement(Text, { style: styles.fieldValue }, booking.guest.notes || "Sem observações")
          ),
          createElement(View, { style: styles.col4 })
        )
      ),

      // Informações da Reserva
      createElement(
        View,
        { style: styles.section },
        createElement(
          View,
          { style: styles.sectionHeader },
          createElement(Text, { style: styles.sectionTitle }, "Informações da reserva"),
          createElement(View, { style: styles.sectionLine })
        ),
        // Linha 1: Acomodação | Período | Diária Média | N° adultos | Alimentação
        createElement(
          View,
          { style: styles.row },
          createElement(
            View,
            { style: { width: "15%", paddingRight: 8 } },
            createElement(Text, { style: styles.fieldLabel }, "Acomodação:"),
            createElement(Text, { style: styles.fieldValue }, booking.room.name)
          ),
          createElement(
            View,
            { style: { width: "30%", paddingRight: 8 } },
            createElement(Text, { style: styles.fieldLabel }, "Período:"),
            createElement(
              Text,
              { style: styles.fieldValue },
              `${format(booking.checkIn, "dd/MM/yyyy", { locale: ptBR })} - ${format(booking.checkOut, "dd/MM/yyyy", { locale: ptBR })} (${nights} diária${nights !== 1 ? "s" : ""})`
            )
          ),
          createElement(
            View,
            { style: { width: "15%", paddingRight: 8 } },
            createElement(Text, { style: styles.fieldLabel }, "Diária Média:"),
            createElement(Text, { style: styles.fieldValue }, formatCurrency(dailyRate))
          ),
          createElement(
            View,
            { style: { width: "15%", paddingRight: 8 } },
            createElement(Text, { style: styles.fieldLabel }, "Nº adultos:"),
            createElement(Text, { style: styles.fieldValue }, String(booking.adults))
          ),
          createElement(
            View,
            { style: { width: "25%", paddingRight: 8 } },
            createElement(Text, { style: styles.fieldLabel }, "Alimentação:"),
            createElement(
              Text,
              { style: styles.fieldValue },
              booking.mealsIncluded ? "Café incluso" : "Não incluso"
            )
          )
        ),
        // Linha 2: Check-in | Check-out | Diárias Total | N° crianças
        createElement(
          View,
          { style: styles.row },
          createElement(
            View,
            { style: { width: "15%", paddingRight: 8 } },
            createElement(Text, { style: styles.fieldLabel }, "Check-in:"),
            createElement(Text, { style: styles.fieldValue }, "14:00")
          ),
          createElement(
            View,
            { style: { width: "30%", paddingRight: 8 } },
            createElement(Text, { style: styles.fieldLabel }, "Check-out:"),
            createElement(Text, { style: styles.fieldValue }, "12:00")
          ),
          createElement(
            View,
            { style: { width: "15%", paddingRight: 8 } },
            createElement(Text, { style: styles.fieldLabel }, "Diárias Total:"),
            createElement(Text, { style: styles.fieldValue }, formatCurrency(booking.totalAmount))
          ),
          createElement(
            View,
            { style: { width: "15%", paddingRight: 8 } },
            createElement(Text, { style: styles.fieldLabel }, "Nº crianças:"),
            createElement(Text, { style: styles.fieldValue }, String(booking.children))
          ),
          createElement(View, { style: { width: "25%" } })
        )
      ),


      // Pagamentos
      createElement(
        View,
        { style: styles.section },
        createElement(
          View,
          { style: styles.sectionHeader },
          createElement(Text, { style: styles.sectionTitle }, "Pagamentos"),
          createElement(View, { style: styles.sectionLine })
        ),
        createElement(
          View,
          { style: styles.table },
          // Table header
          createElement(
            View,
            { style: styles.tableHeader },
            createElement(Text, { style: [styles.tableHeaderCell, styles.tableCellDesc] }, "Descrição"),
            createElement(
              Text,
              { style: [styles.tableHeaderCell, styles.tableCellPayment] },
              "Pagamento em"
            ),
            createElement(Text, { style: [styles.tableHeaderCell, styles.tableCellDate] }, "Data"),
            createElement(Text, { style: [styles.tableHeaderCell, styles.tableCellCost] }, "Custo")
          ),
          // Table rows
          ...(booking.transactions.length > 0
            ? booking.transactions.map((tx, index) =>
                createElement(
                  View,
                  { style: styles.tableRow, key: index },
                  createElement(
                    Text,
                    { style: [styles.tableCell, styles.tableCellDesc] },
                    `${booking.bookingNumber.replace("RES-", "")} - ${booking.room.name} - ${firstName}`
                  ),
                  createElement(
                    Text,
                    { style: [styles.tableCell, styles.tableCellPayment] },
                    translatePaymentMethod(booking.paymentMethod)
                  ),
                  createElement(
                    Text,
                    { style: [styles.tableCell, styles.tableCellDate] },
                    format(tx.date, "dd/MM/yyyy", { locale: ptBR })
                  ),
                  createElement(
                    Text,
                    { style: [styles.tableCell, styles.tableCellCost] },
                    formatCurrency(Number(tx.amount))
                  )
                )
              )
            : [
                createElement(
                  View,
                  { style: styles.tableRow, key: "single" },
                  createElement(
                    Text,
                    { style: [styles.tableCell, styles.tableCellDesc] },
                    `${booking.bookingNumber.replace("RES-", "")} - ${booking.room.name} - ${firstName}`
                  ),
                  createElement(
                    Text,
                    { style: [styles.tableCell, styles.tableCellPayment] },
                    translatePaymentMethod(booking.paymentMethod)
                  ),
                  createElement(
                    Text,
                    { style: [styles.tableCell, styles.tableCellDate] },
                    format(booking.createdAt, "dd/MM/yyyy", { locale: ptBR })
                  ),
                  createElement(
                    Text,
                    { style: [styles.tableCell, styles.tableCellCost] },
                    formatCurrency(booking.paidAmount)
                  )
                ),
              ]),
          // Subtotal row
          createElement(
            View,
            { style: styles.tableRow },
            createElement(Text, { style: [styles.tableCell, { flex: 5.5, textAlign: "center" }] }, "Subtotal"),
            createElement(
              Text,
              { style: [styles.tableCell, styles.tableCellCost] },
              formatCurrency(booking.paidAmount)
            )
          ),
          // Total row
          createElement(
            View,
            { style: styles.totalRow },
            createElement(Text, { style: styles.totalLabel }, "Total"),
            createElement(Text, { style: styles.totalValue }, formatCurrency(booking.totalAmount))
          )
        )
      ),

      // Status
      createElement(
        View,
        { style: styles.section },
        createElement(
          View,
          { style: styles.sectionHeader },
          createElement(Text, { style: styles.sectionTitle }, "Status"),
          createElement(View, { style: styles.sectionLine })
        ),
        isFullPayment
          ? createElement(
              View,
              { style: styles.statusItem },
              createElement(
                View,
                { style: [styles.statusIcon, styles.statusIconSuccess] },
                createElement(Text, { style: styles.checkmark }, "✓")
              ),
              createElement(Text, { style: styles.statusText }, "Pagamento integral confirmado")
            )
          : createElement(
              View,
              null,
              createElement(
                View,
                { style: styles.statusItem },
                createElement(
                  View,
                  { style: [styles.statusIcon, styles.statusIconSuccess] },
                  createElement(Text, { style: styles.checkmark }, "✓")
                ),
                createElement(
                  Text,
                  { style: styles.statusText },
                  `Pagamento parcial confirmado em ${format(
                    booking.transactions[0]?.date || booking.createdAt,
                    "dd 'de' MMM",
                    { locale: ptBR }
                  )}: `,
                  createElement(Text, { style: styles.statusTextSuccess }, formatCurrency(booking.paidAmount))
                )
              ),
              createElement(
                View,
                { style: styles.statusItem },
                createElement(
                  View,
                  { style: [styles.statusIcon, styles.statusIconWarning] },
                  createElement(Text, { style: styles.questionMark }, "!")
                ),
                createElement(
                  Text,
                  { style: styles.statusText },
                  "Restante a ser pago no check-in: ",
                  createElement(Text, { style: styles.statusTextWarning }, formatCurrency(remainingAmount))
                )
              )
            )
      )
    )
  );
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verificar autenticação
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { id } = await params;

    // Buscar reserva com todos os dados necessários
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        guest: {
          select: {
            name: true,
            cpf: true,
            email: true,
            phone: true,
            birthDate: true,
            notes: true,
          },
        },
        room: {
          select: {
            name: true,
            category: true,
          },
        },
        transactions: {
          where: { type: "INCOME" },
          orderBy: { date: "asc" },
          select: {
            amount: true,
            date: true,
            description: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Reserva não encontrada" }, { status: 404 });
    }

    // Carregar logo como base64
    const fs = await import("fs");
    const path = await import("path");
    const logoPath = path.join(process.cwd(), "public", "form-step-7", "favicon.png");
    const logoBuffer = fs.readFileSync(logoPath);
    const logoBase64 = `data:image/png;base64,${logoBuffer.toString("base64")}`;

    // Preparar dados para o PDF
    const bookingData = {
      bookingNumber: booking.bookingNumber,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      adults: booking.adults,
      children: booking.children,
      mealsIncluded: booking.mealsIncluded,
      totalAmount: Number(booking.totalAmount),
      paidAmount: Number(booking.paidAmount),
      paymentMethod: booking.paymentMethod,
      paymentType: booking.paymentType,
      notes: booking.notes,
      createdAt: booking.createdAt,
      guest: {
        ...booking.guest,
        birthDate: booking.guest.birthDate,
      },
      room: booking.room,
      transactions: booking.transactions.map((tx) => ({
        amount: Number(tx.amount),
        date: tx.date,
        description: tx.description,
      })),
    };

    // Renderizar PDF
    const pdfBuffer = await renderToBuffer(
      createElement(BookingReceiptDocument, { booking: bookingData, logoBase64 }) as any
    );

    // Nome do arquivo: [código] - [suíte] - [hóspede]
    const { firstName } = splitName(booking.guest.name);
    const pdfFileName = `${booking.bookingNumber.replace("RES-", "")} - ${booking.room.name} - ${firstName}.pdf`;

    // Retornar PDF
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${pdfFileName}"`,
      },
    });
  } catch (error) {
    console.error("Erro ao gerar PDF:", error);
    return NextResponse.json(
      { error: "Erro ao gerar comprovante" },
      { status: 500 }
    );
  }
}
