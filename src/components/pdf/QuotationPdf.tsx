import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { fmtDayYear } from "@/lib/dates";

/**
 * The quotation PDF. Rendered client-side only (@react-pdf/renderer touches
 * canvas/fonts) — never import this from a Server Component; go through
 * lib/share-pdf.ts, which dynamic-imports it in the browser.
 */

const INK = "#0F1518";
const SOFT = "#5B6B72";
const FAINT = "#8B979D";
const HAIR = "#DCE3E6";
const ACCENT = "#0083B8";

const styles = StyleSheet.create({
  page: { padding: 36, fontSize: 9.5, color: INK, fontFamily: "Helvetica" },
  row: { flexDirection: "row" },
  spaceBetween: { flexDirection: "row", justifyContent: "space-between" },

  headerShopName: { fontSize: 16, fontFamily: "Helvetica-Bold" },
  headerLine: { fontSize: 8.5, color: SOFT, marginTop: 1 },
  docTitle: { fontSize: 12, fontFamily: "Helvetica-Bold", color: ACCENT, letterSpacing: 1 },
  docNumber: { fontSize: 9.5, marginTop: 3, fontFamily: "Helvetica-Bold" },
  docMeta: { fontSize: 8.5, color: SOFT, marginTop: 2 },

  hr: { borderBottomWidth: 1, borderBottomColor: HAIR, marginVertical: 12 },

  sectionLabel: { fontSize: 7.5, color: FAINT, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 3 },
  clientName: { fontSize: 11, fontFamily: "Helvetica-Bold" },
  clientLine: { fontSize: 9, color: SOFT, marginTop: 1 },

  table: { marginTop: 16 },
  thRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: INK, paddingBottom: 5 },
  th: { fontSize: 7.5, fontFamily: "Helvetica-Bold", textTransform: "uppercase", letterSpacing: 0.3 },
  tRow: { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: HAIR, paddingVertical: 6 },
  tCell: { fontSize: 9 },
  tCellSoft: { fontSize: 7.5, color: SOFT, marginTop: 1 },

  colSr: { width: "6%" },
  colDesc: { width: "42%" },
  colQty: { width: "12%", textAlign: "right" },
  colRate: { width: "16%", textAlign: "right" },
  colGst: { width: "9%", textAlign: "right" },
  colAmt: { width: "15%", textAlign: "right" },

  totalsBlock: { marginTop: 14, alignItems: "flex-end" },
  totalsRow: { flexDirection: "row", width: 220, justifyContent: "space-between", paddingVertical: 2.5 },
  totalsLabel: { fontSize: 9, color: SOFT },
  totalsValue: { fontSize: 9 },
  grandRow: {
    flexDirection: "row",
    width: 220,
    justifyContent: "space-between",
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: INK,
  },
  grandLabel: { fontSize: 10.5, fontFamily: "Helvetica-Bold" },
  grandValue: { fontSize: 12, fontFamily: "Helvetica-Bold" },

  notesBlock: { marginTop: 20 },
  notesText: { fontSize: 8.5, color: SOFT, lineHeight: 1.5 },

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

export interface QuotationPdfData {
  shop: {
    name: string;
    legalName?: string | null;
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
  client: {
    name: string;
    company?: string | null;
    phone?: string | null;
    address?: string | null;
  };
  quotation: {
    number: string;
    quoteDate: string;
    validUntil?: string | null;
    notes?: string | null;
    terms?: string | null;
  };
  items: Array<{
    description: string;
    unit: string;
    qty: number;
    widthFt?: number | null;
    heightFt?: number | null;
    area?: number | null;
    rate: number;
    gstRate: number;
    amount: number;
  }>;
  totals: {
    subtotal: number;
    discount: number;
    taxableAmount: number;
    gstAmount: number;
    cgst: number;
    sgst: number;
    total: number;
  };
}

const inr = (n: number) =>
  "Rs. " + new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(n);

export function QuotationPdf({ shop, client, quotation, items, totals }: QuotationPdfData) {
  const shopAddressLine = [shop.address, shop.city, shop.state, shop.pincode].filter(Boolean).join(", ");
  const shopContactLine = [shop.phone, shop.email].filter(Boolean).join("  ·  ");

  return (
    <Document title={`Quotation ${quotation.number}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.spaceBetween}>
          <View>
            <Text style={styles.headerShopName}>{shop.name}</Text>
            {shopAddressLine ? <Text style={styles.headerLine}>{shopAddressLine}</Text> : null}
            {shopContactLine ? <Text style={styles.headerLine}>{shopContactLine}</Text> : null}
            {shop.gstin ? <Text style={styles.headerLine}>GSTIN {shop.gstin}</Text> : null}
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.docTitle}>QUOTATION</Text>
            <Text style={styles.docNumber}>{quotation.number}</Text>
            <Text style={styles.docMeta}>Date: {fmtDayYear(quotation.quoteDate)}</Text>
            {quotation.validUntil ? (
              <Text style={styles.docMeta}>Valid until: {fmtDayYear(quotation.validUntil)}</Text>
            ) : null}
          </View>
        </View>

        <View style={styles.hr} />

        <View>
          <Text style={styles.sectionLabel}>Quotation for</Text>
          <Text style={styles.clientName}>{client.name}</Text>
          {client.company ? <Text style={styles.clientLine}>{client.company}</Text> : null}
          {client.phone ? <Text style={styles.clientLine}>{client.phone}</Text> : null}
          {client.address ? <Text style={styles.clientLine}>{client.address}</Text> : null}
        </View>

        <View style={styles.table}>
          <View style={styles.thRow}>
            <Text style={[styles.th, styles.colSr]}>#</Text>
            <Text style={[styles.th, styles.colDesc]}>Description</Text>
            <Text style={[styles.th, styles.colQty]}>Qty</Text>
            <Text style={[styles.th, styles.colRate]}>Rate</Text>
            <Text style={[styles.th, styles.colGst]}>GST</Text>
            <Text style={[styles.th, styles.colAmt]}>Amount</Text>
          </View>

          {items.map((item, i) => (
            <View style={styles.tRow} key={i} wrap={false}>
              <Text style={[styles.tCell, styles.colSr]}>{i + 1}</Text>
              <View style={styles.colDesc}>
                <Text style={styles.tCell}>{item.description}</Text>
                {item.unit === "sqft" && item.widthFt && item.heightFt ? (
                  <Text style={styles.tCellSoft}>
                    {trim(item.widthFt)} x {trim(item.heightFt)} ft = {trim(item.area ?? 0)} sq.ft
                  </Text>
                ) : null}
              </View>
              <Text style={[styles.tCell, styles.colQty]}>
                {trim(item.qty)} {item.unit !== "sqft" ? item.unit : ""}
              </Text>
              <Text style={[styles.tCell, styles.colRate]}>{inr(item.rate)}</Text>
              <Text style={[styles.tCell, styles.colGst]}>{trim(item.gstRate)}%</Text>
              <Text style={[styles.tCell, styles.colAmt]}>{inr(item.amount)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totalsBlock}>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Subtotal</Text>
            <Text style={styles.totalsValue}>{inr(totals.subtotal)}</Text>
          </View>
          {totals.discount > 0 ? (
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Discount</Text>
              <Text style={styles.totalsValue}>-{inr(totals.discount)}</Text>
            </View>
          ) : null}
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Taxable value</Text>
            <Text style={styles.totalsValue}>{inr(totals.taxableAmount)}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>CGST</Text>
            <Text style={styles.totalsValue}>{inr(totals.cgst)}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>SGST</Text>
            <Text style={styles.totalsValue}>{inr(totals.sgst)}</Text>
          </View>
          <View style={styles.grandRow}>
            <Text style={styles.grandLabel}>Total</Text>
            <Text style={styles.grandValue}>{inr(totals.total)}</Text>
          </View>
        </View>

        {quotation.notes ? (
          <View style={styles.notesBlock}>
            <Text style={styles.sectionLabel}>Notes</Text>
            <Text style={styles.notesText}>{quotation.notes}</Text>
          </View>
        ) : null}

        {quotation.terms ? (
          <View style={styles.notesBlock}>
            <Text style={styles.sectionLabel}>Terms</Text>
            <Text style={styles.notesText}>{quotation.terms}</Text>
          </View>
        ) : null}

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            {shop.upiId ? `UPI: ${shop.upiId}` : ""}
          </Text>
          <Text style={styles.footerText}>{shop.builtByCredit ?? ""}</Text>
        </View>
      </Page>
    </Document>
  );
}

function trim(n: number): string {
  return Number.isInteger(n) ? String(n) : String(Math.round(n * 100) / 100);
}
