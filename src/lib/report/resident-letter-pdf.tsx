/* eslint-disable @typescript-eslint/no-explicit-any */
import { Document, Page, Text, View, StyleSheet, pdf } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 48, fontSize: 12, lineHeight: 1.35 },
  header: { marginBottom: 18 },
  h1: { fontSize: 16, fontWeight: 700, marginBottom: 6 },
  small: { color: "#666" },
  para: { marginBottom: 10 },
  bullet: { marginLeft: 12, marginBottom: 4 },
  sign: { marginTop: 24 },
});

function n(v: unknown, d = 2) {
  const x = Number(v);
  return Number.isFinite(x) ? x.toFixed(d) : "-";
}

export async function makeResidentLetterPDF(
  input: unknown,
  result: unknown,
  createdAt: Date = new Date()
): Promise<Uint8Array> {
  const i = (input ?? {}) as Record<string, any>;
  const r = (result ?? {}) as Record<string, any>;

  const Doc = (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.h1}>Pismo do Zarządcy — analiza kosztów CWU</Text>
          <Text style={styles.small}>Data: {createdAt.toLocaleString("pl-PL")}</Text>
        </View>

        <Text style={styles.para}>Szanowni Państwo,</Text>

        <Text style={styles.para}>
          W oparciu o analizę rachunku za ciepłą wodę użytkową (CWU) oraz podstawowe parametry techniczne
          dokonano porównania kosztu teoretycznego (wynikającego z fizyki podgrzewania wody) z płatnościami
          rzeczywistymi. Wnioski wskazują na istotne odchylenie kosztów.
        </Text>

        <Text style={styles.para}>Podsumowanie kluczowych wyników:</Text>
        <View>
          <Text style={styles.bullet}>• Cena CWU z rachunku: {n(i.cwuPriceFromBill)} zł/m³</Text>
          <Text style={styles.bullet}>• Cena ciepła (miasto): {n(i.heatPriceFromCity)} zł/GJ</Text>
          <Text style={styles.bullet}>• Energia do podgrzania na m³: {n(r.energyPerM3, 4)} GJ/m³</Text>
          <Text style={styles.bullet}>• Koszt teoretyczny na m³: {n(r.theoreticalCostPerM3)} zł/m³</Text>
          <Text style={styles.bullet}>• Różnica (na m³): {n(r.lossPerM3)} zł/m³</Text>
          <Text style={styles.bullet}>• Strata finansowa (mies.): {n(r.monthlyFinancialLoss)} zł/mies.</Text>
          <Text style={styles.bullet}>• Strata finansowa (rok): {n(r.yearlyFinancialLoss)} zł/rok</Text>
        </View>

        <Text style={styles.para}>
          Uprzejmie prosimy o weryfikację przyczyn występującej różnicy oraz o poinformowanie mieszkańców o podjętych działaniach.
          Rekomendujemy w szczególności:
        </Text>
        <View>
          <Text style={styles.bullet}>• przegląd strat na cyrkulacji CWU (izolacja, równoważenie, tryb pracy),</Text>
          <Text style={styles.bullet}>• weryfikację parametrów rozliczenia CWU i stawek jednostkowych,</Text>
          <Text style={styles.bullet}>• rozważenie działań ograniczających straty w godzinach nocnych.</Text>
        </View>

        <Text style={styles.para}>
          Prosimy o odpowiedź w terminie 14 dni. Powyższe zestawienie opiera się na wprowadzonych przez mieszkańca danych
          oraz publicznie dostępnej cenie ciepła (zł/GJ). W razie potrzeby udostępnimy pełny raport z obliczeń.
        </Text>

        <View style={styles.sign}>
          <Text>Z poważaniem,</Text>
          <Text>__________________________________</Text>
          <Text>Mieszkaniec</Text>
        </View>
      </Page>
    </Document>
  );

  const buf = (await pdf(Doc).toBuffer()) as unknown as Uint8Array;
  return buf;
}
