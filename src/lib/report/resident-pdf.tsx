/* eslint-disable @typescript-eslint/no-explicit-any */
import { Document, Page, Text, View, StyleSheet, pdf } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 36, fontSize: 11 },
  h1: { fontSize: 16, fontWeight: 700, marginBottom: 8 },
  h2: { fontSize: 13, fontWeight: 600, marginTop: 14, marginBottom: 6 },
  row: { marginBottom: 4 },
  small: { color: "#666" },
  listItem: { marginLeft: 12, marginBottom: 2 },
});

function round(n: number, d = 3) {
  return Number.isFinite(n) ? Number(n).toFixed(d) : "-";
}

export async function makeResidentPDF(
  input: unknown,
  result: unknown,
  createdAt: Date = new Date()
): Promise<Uint8Array> {
  const i = (input ?? {}) as Record<string, any>;
  const r = (result ?? {}) as Record<string, any>;

  const purchasedGJ = Number(r.purchasedGJ ?? 0);
  const circGJ = Number(r.circGJ ?? 0);
  const shareLoss = purchasedGJ > 0 ? (circGJ / purchasedGJ) * 100 : 0;

  const Doc = (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.h1}>PROFINSTAL  Raport CWU (Mieszkańcy)</Text>
        <Text style={styles.small}>Data: {createdAt.toLocaleString()}</Text>

        <Text style={styles.h2}>1. Dane wejściowe</Text>
        <View>
          <Text style={styles.row}>Zużycie wody: {i.waterM3} m</Text>
          <Text style={styles.row}>Temperatura zimnej: {i.coldTempC} C</Text>
          <Text style={styles.row}>Temperatura CWU: {i.hotTempC} C</Text>
          <Text style={styles.row}>Cena z MPEC: {i.pricePerGJ ?? "-"} zł/GJ</Text>
          <Text style={styles.row}>Wpłaty mieszkańców: {i.residentPaymentsPLN} PLN</Text>
          <Text style={styles.row}>Straty cyrkulacji (założenie): {i.circulationLossPct ?? "-"} %</Text>
        </View>

        <Text style={styles.h2}>2. Wyniki energii</Text>
        <View>
          <Text style={styles.row}>Zapotrzebowanie (fizyka): {round(r.needGJ)} GJ</Text>
          <Text style={styles.row}>Ciepło zakupione: {round(r.purchasedGJ)} GJ</Text>
          <Text style={styles.row}>Straty cyrkulacji: {round(r.circGJ)} GJ</Text>
          <Text style={styles.row}>Energia użyteczna: {round(r.usefulGJ)} GJ</Text>
        </View>

        <Text style={styles.h2}>3. Koszty</Text>
        <View>
          <Text style={styles.row}>Koszt energii (MPEC): {Math.round(Number(r.costPLN ?? 0))} PLN</Text>
          <Text style={styles.row}>Wpłaty mieszkańców: {Math.round(Number(i.residentPaymentsPLN ?? 0))} PLN</Text>
          <Text style={styles.row}>Różnica: {Math.round(Number(r.diffPLN ?? 0))} PLN</Text>
        </View>

        <Text style={styles.h2}>4. Wnioski (skrót)</Text>
        <View>
          <Text style={styles.listItem}> Udział strat cyrkulacji: {shareLoss.toFixed(1)}% ciepła zakupionego.</Text>
          <Text style={styles.listItem}> Rekomendacja: audyt cyrkulacji (izolacja, regulacja przepływów, czas pracy).</Text>
          <Text style={styles.listItem}> Potencjał oszczędności = redukcja strat  cena [zł/GJ].</Text>
          <Text style={styles.listItem}> Raport wygenerowano automatycznie na podstawie podanych danych.</Text>
        </View>
      </Page>
    </Document>
  );

  // W Node @react-pdf/renderer zwraca Buffer (dziedziczy po Uint8Array).
  const buf = (await pdf(Doc).toBuffer()) as unknown as Uint8Array;
  return buf;
}
