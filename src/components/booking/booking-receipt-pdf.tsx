"use client";

import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Svg,
  Path,
  Circle,
  Line,
} from "@react-pdf/renderer";

// Usando fonte padrão Helvetica (built-in no react-pdf)

const COLORS = {
  primary: "#FF5252",
  grayDark: "#374151",
  grayMedium: "#9CA3AF",
  grayLight: "#E5E7EB",
  grayLighter: "#F3F4F6",
  white: "#FFFFFF",
  green: "#22C55E",
  greenLight: "#DCFCE7",
  yellow: "#D97706",
  yellowLight: "#FEF3C7",
  tableBorder: "#FECACA",
  tableHeaderBg: "#FEF2F2",
};

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: COLORS.grayDark,
    backgroundColor: COLORS.white,
  },
  // Header - altura reduzida
  headerContainer: {
    backgroundColor: COLORS.grayLighter,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 48,
    height: 48,
    marginRight: 12,
  },
  logoTextContainer: {
    justifyContent: "center",
  },
  pousadaName: {
    fontSize: 14,
    fontWeight: 700,
    color: COLORS.primary,
    marginBottom: 2,
  },
  pousadaInfo: {
    fontSize: 8,
    fontWeight: 400,
    color: COLORS.grayMedium,
    lineHeight: 1.5,
  },
  // Header Right - número no topo, data no rodapé
  headerRight: {
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 48,
  },
  bookingNumber: {
    fontSize: 14,
    fontWeight: 700,
    color: COLORS.grayDark,
  },
  emissionContainer: {
    alignItems: "flex-end",
  },
  emissionLabel: {
    fontSize: 8,
    fontWeight: 400,
    color: COLORS.grayMedium,
  },
  emissionDate: {
    fontSize: 8,
    fontWeight: 400,
    color: COLORS.grayMedium,
  },
  // Section
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 600,
    color: COLORS.grayDark,
    marginRight: 10,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.grayLight,
  },
  // Info Grid - Hóspede (3 colunas primeira linha, 2 colunas segunda)
  infoRowGuest: {
    flexDirection: "row",
    marginBottom: 8,
  },
  infoItemGuest1: {
    width: "25%",
  },
  infoItemGuest2: {
    width: "35%",
  },
  infoItemGuest3: {
    width: "40%",
  },
  // Segunda linha hóspede
  infoItemGuestTel: {
    width: "25%",
  },
  infoItemGuestObs: {
    width: "75%",
  },
  // Labels e valores - títulos bold escuro, valores light claro
  infoLabel: {
    fontSize: 9,
    fontWeight: 600,
    color: COLORS.grayDark,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 9,
    fontWeight: 400,
    color: COLORS.grayMedium,
  },
  // Info Grid - Reserva (layout específico)
  infoRowReserva1: {
    flexDirection: "row",
    marginBottom: 8,
  },
  infoRowReserva2: {
    flexDirection: "row",
    marginBottom: 8,
  },
  // Primeira linha: Ocupação, Período (maior), Diária Média, N° adultos, N° bebês
  colOcupacao: {
    width: "12%",
  },
  colPeriodo: {
    width: "32%",
  },
  colDiaria: {
    width: "14%",
  },
  colAdultos: {
    width: "14%",
  },
  colBebes: {
    width: "14%",
  },
  // Segunda linha: Check-in, Check-out, Diárias Total, N° crianças, Alimentação
  colCheckin: {
    width: "12%",
  },
  colCheckout: {
    width: "12%",
  },
  colPeriodoSpace: {
    width: "20%",
  },
  colDiariaTotal: {
    width: "14%",
  },
  colCriancas: {
    width: "14%",
  },
  colAlimentacao: {
    width: "14%",
  },
  // Período - texto menor
  periodoValue: {
    fontSize: 8,
    fontWeight: 400,
    color: COLORS.grayMedium,
  },
  // Table
  table: {
    borderWidth: 1,
    borderColor: COLORS.tableBorder,
    borderRadius: 6,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: COLORS.tableHeaderBg,
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.tableBorder,
  },
  tableHeaderText: {
    fontSize: 9,
    fontWeight: 600,
    color: COLORS.primary,
  },
  tableRow: {
    flexDirection: "row",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.tableBorder,
  },
  tableRowLast: {
    borderBottomWidth: 0,
  },
  tableRowAlt: {
    backgroundColor: COLORS.grayLighter,
  },
  tableCell: {
    fontSize: 9,
    fontWeight: 400,
    color: COLORS.grayDark,
  },
  tableCellRight: {
    textAlign: "right",
  },
  tableCol1: { width: "40%" },
  tableCol2: { width: "20%" },
  tableCol3: { width: "20%" },
  tableCol4: { width: "20%" },
  // Subtotal/Total rows
  subtotalRow: {
    flexDirection: "row",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.tableBorder,
  },
  totalRow: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: COLORS.tableHeaderBg,
  },
  subtotalLabel: {
    fontSize: 9,
    fontWeight: 400,
    color: COLORS.grayMedium,
    width: "80%",
    textAlign: "right",
    paddingRight: 10,
  },
  subtotalValue: {
    fontSize: 9,
    fontWeight: 400,
    color: COLORS.grayMedium,
    width: "20%",
    textAlign: "right",
  },
  totalLabel: {
    fontSize: 10,
    fontWeight: 700,
    color: COLORS.grayDark,
    width: "80%",
    textAlign: "right",
    paddingRight: 10,
  },
  totalValue: {
    fontSize: 10,
    fontWeight: 700,
    color: COLORS.grayDark,
    width: "20%",
    textAlign: "right",
  },
  // Status
  statusContainer: {
    marginTop: 16,
  },
  statusTitle: {
    fontSize: 11,
    fontWeight: 600,
    color: COLORS.grayDark,
    marginBottom: 12,
  },
  statusItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  statusIconContainer: {
    width: 22,
    marginRight: 8,
    alignItems: "center",
  },
  statusTextContainer: {
    flex: 1,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 400,
    color: COLORS.grayDark,
  },
  statusValueGreen: {
    color: COLORS.green,
    fontWeight: 600,
  },
  statusValueYellow: {
    color: COLORS.yellow,
    fontWeight: 600,
  },
  // Timeline connector
  timelineConnector: {
    width: 22,
    alignItems: "center",
    marginBottom: 6,
  },
});

// Ícone de check verde
const CheckIcon = () => (
  <Svg width="18" height="18" viewBox="0 0 20 20">
    <Circle cx="10" cy="10" r="10" fill={COLORS.greenLight} />
    <Circle cx="10" cy="10" r="8" fill={COLORS.green} />
    <Path
      d="M6 10 L9 13 L14 7"
      stroke={COLORS.white}
      strokeWidth="2"
      fill="none"
    />
  </Svg>
);

// Ícone de exclamação amarelo
const WarningIcon = () => (
  <Svg width="18" height="18" viewBox="0 0 20 20">
    <Circle cx="10" cy="10" r="10" fill={COLORS.yellowLight} />
    <Circle cx="10" cy="10" r="8" fill={COLORS.yellow} />
    <Path d="M10 6 L10 11" stroke={COLORS.white} strokeWidth="2" />
    <Circle cx="10" cy="14" r="1" fill={COLORS.white} />
  </Svg>
);

// Conector vertical com chevron
const TimelineConnector = () => (
  <Svg width="18" height="16" viewBox="0 0 20 20">
    <Line x1="10" y1="0" x2="10" y2="12" stroke={COLORS.grayLight} strokeWidth="2" />
    <Path d="M6 8 L10 12 L14 8" stroke={COLORS.grayLight} strokeWidth="2" fill="none" />
  </Svg>
);

interface Payment {
  description: string;
  method: string;
  date: string;
  amount: number;
}

interface BookingReceiptPdfProps {
  bookingNumber: number;
  logoUrl: string;
  guest: {
    firstName: string;
    lastName: string;
    cpf: string;
    phone: string;
    email: string;
    observations?: string;
  };
  booking: {
    accommodation: string;
    periodStart: string;
    periodEnd: string;
    checkInTime: string;
    checkOutTime: string;
    averageDailyRate: number;
    totalDays: number;
    adults: number;
    children: number;
    babies: number;
    meals: string;
  };
  payments: Payment[];
  paymentType: "FULL" | "PARTIAL";
  totalPaid: number;
  remainingAmount: number;
  emissionDate: string;
  emissionTime: string;
}

export const BookingReceiptPdf: React.FC<BookingReceiptPdfProps> = ({
  bookingNumber,
  logoUrl,
  guest,
  booking,
  payments,
  paymentType,
  totalPaid,
  remainingAmount,
  emissionDate,
  emissionTime,
}) => {
  const totalAmount = booking.averageDailyRate * booking.totalDays;

  // Formatar período em uma linha
  const formatPeriod = () => {
    const start = booking.periodStart.split("-");
    const end = booking.periodEnd.split("-");
    return `${start[2]}/${start[1]}/${start[0]} – ${end[2]}/${end[1]}/${end[0]} (${booking.totalDays} ${booking.totalDays === 1 ? "diária" : "diárias"})`;
  };

  // Formatar valor
  const formatCurrency = (value: number) => {
    return `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Formatar data do pagamento
  const formatPaymentDate = (date: string) => {
    if (!date) return "";
    const [year, month, day] = date.split("-");
    return `${day}/${month}/${year}`;
  };

  // Data do primeiro pagamento para o status
  const firstPaymentDate = payments[0]?.date
    ? (() => {
        const [, month, day] = payments[0].date.split("-");
        const months = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
        return `${parseInt(day)} de ${months[parseInt(month) - 1]}`;
      })()
    : "";

  // Título do documento: [código] - [suíte] - [hóspede]
  const documentTitle = `${bookingNumber} - ${booking.accommodation} - ${guest.firstName}`;

  return (
    <Document title={documentTitle}>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <View style={styles.headerLeft}>
            <Image style={styles.logo} src={logoUrl} />
            <View style={styles.logoTextContainer}>
              <Text style={styles.pousadaName}>Pousada Dois Corações</Text>
              <Text style={styles.pousadaInfo}>pousadadoiscoracoes.site</Text>
              <Text style={styles.pousadaInfo}>+55 17 99646-6495</Text>
              <Text style={styles.pousadaInfo}>
                Estrada Vicinal João Custódio Sobrinho, Km 01 - Olímpia, SP
              </Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.bookingNumber}>N°: {bookingNumber}</Text>
            <View style={styles.emissionContainer}>
              <Text style={styles.emissionLabel}>Data de emissão</Text>
              <Text style={styles.emissionDate}>
                {emissionDate} às {emissionTime}
              </Text>
            </View>
          </View>
        </View>

        {/* Informações do Hóspede */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Informações do Hóspede</Text>
            <View style={styles.sectionLine} />
          </View>
          {/* Linha 1: Nome, Sobrenome, E-mail */}
          <View style={styles.infoRowGuest}>
            <View style={styles.infoItemGuest1}>
              <Text style={styles.infoLabel}>Nome:</Text>
              <Text style={styles.infoValue}>{guest.firstName}</Text>
            </View>
            <View style={styles.infoItemGuest2}>
              <Text style={styles.infoLabel}>Sobrenome:</Text>
              <Text style={styles.infoValue}>{guest.lastName}</Text>
            </View>
            <View style={styles.infoItemGuest3}>
              <Text style={styles.infoLabel}>E-mail:</Text>
              <Text style={styles.infoValue}>{guest.email}</Text>
            </View>
          </View>
          {/* Linha 2: Telefone, Observações */}
          <View style={styles.infoRowGuest}>
            <View style={styles.infoItemGuestTel}>
              <Text style={styles.infoLabel}>Telefone:</Text>
              <Text style={styles.infoValue}>{guest.phone}</Text>
            </View>
            <View style={styles.infoItemGuestObs}>
              <Text style={styles.infoLabel}>Observações:</Text>
              <Text style={styles.infoValue}>
                {guest.observations || "Sem observações"}
              </Text>
            </View>
          </View>
        </View>

        {/* Informações da Reserva */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Informações da reserva</Text>
            <View style={styles.sectionLine} />
          </View>
          {/* Linha 1: Ocupação, Período, Diária Média, N° adultos, N° bebês */}
          <View style={styles.infoRowReserva1}>
            <View style={styles.colOcupacao}>
              <Text style={styles.infoLabel}>Ocupação:</Text>
              <Text style={styles.infoValue}>{booking.accommodation}</Text>
            </View>
            <View style={styles.colPeriodo}>
              <Text style={styles.infoLabel}>Período:</Text>
              <Text style={styles.periodoValue}>{formatPeriod()}</Text>
            </View>
            <View style={styles.colDiaria}>
              <Text style={styles.infoLabel}>Diária Média:</Text>
              <Text style={styles.infoValue}>
                {formatCurrency(booking.averageDailyRate)}
              </Text>
            </View>
            <View style={styles.colAdultos}>
              <Text style={styles.infoLabel}>N° adultos:</Text>
              <Text style={styles.infoValue}>{booking.adults}</Text>
            </View>
            <View style={styles.colBebes}>
              <Text style={styles.infoLabel}>N° bebês:</Text>
              <Text style={styles.infoValue}>{booking.babies}</Text>
            </View>
          </View>
          {/* Linha 2: Check-in, Check-out, Diárias Total, N° crianças, Alimentação */}
          <View style={styles.infoRowReserva2}>
            <View style={styles.colCheckin}>
              <Text style={styles.infoLabel}>Check-in:</Text>
              <Text style={styles.infoValue}>{booking.checkInTime}</Text>
            </View>
            <View style={styles.colCheckout}>
              <Text style={styles.infoLabel}>Check-out:</Text>
              <Text style={styles.infoValue}>{booking.checkOutTime}</Text>
            </View>
            <View style={styles.colPeriodoSpace} />
            <View style={styles.colDiariaTotal}>
              <Text style={styles.infoLabel}>Diárias Total:</Text>
              <Text style={styles.infoValue}>
                {formatCurrency(totalAmount)}
              </Text>
            </View>
            <View style={styles.colCriancas}>
              <Text style={styles.infoLabel}>N° crianças:</Text>
              <Text style={styles.infoValue}>{booking.children}</Text>
            </View>
            <View style={styles.colAlimentacao}>
              <Text style={styles.infoLabel}>Alimentação:</Text>
              <Text style={styles.infoValue}>{booking.meals || "-"}</Text>
            </View>
          </View>
        </View>

        {/* Tabela de Pagamentos */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pagamentos</Text>
            <View style={styles.sectionLine} />
          </View>
          <View style={styles.table}>
            {/* Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, styles.tableCol1]}>
                Descrição
              </Text>
              <Text style={[styles.tableHeaderText, styles.tableCol2]}>
                Pagamento em
              </Text>
              <Text style={[styles.tableHeaderText, styles.tableCol3]}>
                Data
              </Text>
              <Text
                style={[
                  styles.tableHeaderText,
                  styles.tableCol4,
                  styles.tableCellRight,
                ]}
              >
                Custo
              </Text>
            </View>
            {/* Rows */}
            {payments.map((payment, index) => (
              <View
                key={index}
                style={[
                  styles.tableRow,
                  index % 2 === 1 ? styles.tableRowAlt : {},
                  index === payments.length - 1 ? styles.tableRowLast : {},
                ]}
              >
                <Text style={[styles.tableCell, styles.tableCol1]}>
                  {payment.description}
                </Text>
                <Text style={[styles.tableCell, styles.tableCol2]}>
                  {payment.method}
                </Text>
                <Text style={[styles.tableCell, styles.tableCol3]}>
                  {formatPaymentDate(payment.date)}
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    styles.tableCol4,
                    styles.tableCellRight,
                  ]}
                >
                  {formatCurrency(payment.amount)}
                </Text>
              </View>
            ))}
            {/* Subtotal */}
            <View style={styles.subtotalRow}>
              <Text style={styles.subtotalLabel}>Subtotal</Text>
              <Text style={styles.subtotalValue}>
                {formatCurrency(totalPaid)}
              </Text>
            </View>
            {/* Total */}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>
                {formatCurrency(totalAmount)}
              </Text>
            </View>
          </View>
        </View>

        {/* Status */}
        <View style={styles.statusContainer}>
          <Text style={styles.statusTitle}>Status</Text>

          {/* Pagamento confirmado */}
          <View style={styles.statusItem}>
            <View style={styles.statusIconContainer}>
              <CheckIcon />
            </View>
            <View style={styles.statusTextContainer}>
              <Text style={styles.statusText}>
                {paymentType === "FULL"
                  ? "Pagamento integral confirmado em "
                  : "Pagamento parcial confirmado em "}
                {firstPaymentDate}:{" "}
                <Text style={styles.statusValueGreen}>
                  {formatCurrency(totalPaid)}
                </Text>
              </Text>
            </View>
          </View>

          {/* Conector e valor restante (só para parcial) */}
          {paymentType === "PARTIAL" && remainingAmount > 0 && (
            <>
              <View style={styles.timelineConnector}>
                <TimelineConnector />
              </View>
              <View style={styles.statusItem}>
                <View style={styles.statusIconContainer}>
                  <WarningIcon />
                </View>
                <View style={styles.statusTextContainer}>
                  <Text style={styles.statusText}>
                    Restante a ser pago no check-in:{" "}
                    <Text style={styles.statusValueYellow}>
                      {formatCurrency(remainingAmount)}
                    </Text>
                  </Text>
                </View>
              </View>
            </>
          )}
        </View>
      </Page>
    </Document>
  );
};
