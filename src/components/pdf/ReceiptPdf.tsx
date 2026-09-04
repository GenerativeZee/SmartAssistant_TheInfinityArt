import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { fmtDayYear } from "@/lib/dates";

const INK = "#0F1518";
const SOFT = "#5B6B72";
const FAINT = "#8B979D";
const HAIR = "#DCE3E6";
const ACCENT = "#0083B8";

const styles = StyleSheet.create({
  page: { padding: 36, fontSize: 10, color: INK, fontFamily: "Helvetica" },
  spaceBetween: { flexDirection: "row", justifyContent: "space-between" },
  headerShopName: { fontSize: 16, fontFamily: "Helvetica-Bold" },
  headerLine: { fontSize: 8.5, color: SOFT, marginTop: 1 },
  docTitle: { fontSize: 12, fontFamily: "Helvetica-Bold", color: ACCENT, letterSpacing: 1 },
  docNumber: { fontSize: 9.5, marginTop: 3, fontFamily: "Helvetica-Bold" },
  docMeta: { fontSize: 8.5, color: SOFT, marginTop: 2 },
  hr: { borderBottomWidth: 1, borderBottomColor: HAIR, marginVertical: 16 },
  sectionLabel: { fontSize: 7.5, color: FAINT, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 3 },
  clientName: { fontSize: 11, fontFamily: "Helvetica-Bold" },

  amountBlock: { marginTop: 24, alignItems: "center" },
  amountLabel: { fontSize: 8.5, color: SOFT, textTransform: "uppercase", letterSpacing: 0.5 },
  amountValue: { fontSize: 26, fontFamily: "Helvetica-Bold", marginTop: 4 },

  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 5, borderBottomWidth: 0.5, borderBottomColor: HAIR },
  rowLabel: { fontSize: 9, color: SOFT },
  rowValue: { fontSize: 9, fontFamily: "Helvetica-Bold" },

  detailBlock: { marginTop: 24 },

  footer: {
    position: "absolute",
    bottom: 28,
    left: 36,
    right: 36,
    borderTopWidth: 1,
    borderTopColor: HAIR,
    paddingTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: { fontSize: 7.5, color: FAINT },
});

const inr = (n: number) => "Rs. " + new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(n);

const MODE_LABEL: Record<string, string> = { cash: "Cash", upi: "UPI", bank: "Bank transfer", cheque: "Cheque" };

export interface ReceiptPdfData {
  shop: {
    name: string;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    pincode?: string | null;
    phone?: string | null;
    email?: string | null;
    gstin?: string | null;
    upiId?: string | null;
    builtByCredit?: string | null;
  };
  client: { name: string; company?: string | null };
  receipt: { number: string; receivedAt: string; mode: string; jobLabel?: string | null };
  amount: number;
  balanceAfter: number;
}

export function ReceiptPdf({ shop, client, receipt, amount, balanceAfter }: ReceiptPdfData) {
  const shopAddressLine = [shop.address, shop.city, shop.state, shop.pincode].filter(Boolean).join(", ");
  const shopContactLine = [shop.phone, shop.email].filter(Boolean).join("  ·  ");

  return (
    <Document title={`Receipt ${receipt.number}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.spaceBetween}>
          <View>
            <Text style={styles.headerShopName}>{shop.name}</Text>
            {shopAddressLine ? <Text style={styles.headerLine}>{shopAddressLine}</Text> : null}
            {shopContactLine ? <Text style={styles.headerLine}>{shopContactLine}</Text> : null}
            {shop.gstin ? <Text style={styles.headerLine}>GSTIN {shop.gstin}</Text> : null}
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.docTitle}>RECEIPT</Text>
            <Text style={styles.docNumber}>{receipt.number}</Text>
            <Text style={styles.docMeta}>{fmtDayYear(receipt.receivedAt)}</Text>
          </View>
        </View>

        <View style={styles.hr} />

        <Text style={styles.sectionLabel}>Received from</Text>
        <Text style={styles.clientName}>{client.name}</Text>
        {client.company ? <Text style={styles.headerLine}>{client.company}</Text> : null}

        <View style={styles.amountBlock}>
          <Text style={styles.amountLabel}>Amount received</Text>
          <Text style={styles.amountValue}>{inr(amount)}</Text>
        </View>

        <View style={styles.detailBlock}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Mode</Text>
            <Text style={styles.rowValue}>{MODE_LABEL[receipt.mode] ?? receipt.mode}</Text>
          </View>
          {receipt.jobLabel ? (
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Against</Text>
              <Text style={styles.rowValue}>{receipt.jobLabel}</Text>
            </View>
          ) : null}
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Balance remaining</Text>
            <Text style={styles.rowValue}>{inr(balanceAfter)}</Text>
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>{shop.upiId ? `UPI: ${shop.upiId}` : ""}</Text>
          <Text style={styles.footerText}>{shop.builtByCredit ?? ""}</Text>
        </View>
      </Page>
    </Document>
  );
}
