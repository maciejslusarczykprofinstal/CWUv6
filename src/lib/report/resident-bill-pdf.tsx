/* eslint-disable @typescript-eslint/no-explicit-any */
import { Document, Page, Text, View, StyleSheet, pdf, Link } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 36, fontSize: 11 },
  h1: { fontSize: 16, fontWeight: 700, marginBottom: 8 },
  h2: { fontSize: 13, fontWeight: 600, marginTop: 14, marginBottom: 6 },
  row: { marginBottom: 4 },
  small: { color: "#666" },
  grid: { display: "flex", flexDirection: "row" },
  col: { flex: 1, marginRight: 18 },
  brandRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  brand: { fontSize: 16, fontWeight: 700 },
  site: { fontSize: 11, color: "#1d4ed8", textDecoration: "none" },
});

function n(v: unknown, d = 2) {
  const x = Number(v);
  return Number.isFinite(x) ? x.toFixed(d) : "-";
}

export async function makeResidentBillPDF(
  input: unknown,
  result: unknown,
  createdAt: Date = new Date()
): Promise<Uint8Array> {
  const i = (input ?? {}) as Record<string, any>;
  const r = (result ?? {}) as Record<string, any>;

  const Doc = (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Branding */}
        <View style={styles.brandRow}>
          <Text style={styles.brand}>PROFINSTAL</Text>
          <Link src="https://profinstal.info" style={styles.site}>profinstal.info</Link>
        </View>
        <Text style={styles.h1}>PROFINSTAL — Raport z obliczeń CWU (Mieszkańcy)</Text>
        <Text style={styles.small}>Data: {createdAt.toLocaleString("pl-PL")}</Text>

        <Text style={styles.h2}>1. Dane wejściowe (z rachunku)</Text>
        <View>
          <Text style={styles.row}>Cena CWU z rachunku: {n(i.cwuPriceFromBill)} zł/m³</Text>
          <Text style={styles.row}>Zużycie w miesiącu: {n(i.monthlyConsumption, 1)} m³</Text>
          <Text style={styles.row}>Temperatura zimnej wody: {n(i.coldTempC, 1)} °C</Text>
          <Text style={styles.row}>Temperatura CWU: {n(i.hotTempC, 1)} °C</Text>
          <Text style={styles.row}>Cena ciepła od miasta: {n(i.heatPriceFromCity)} zł/GJ</Text>
        </View>

        <Text style={styles.h2}>2. Wyniki</Text>
        <View style={styles.grid}>
          <View style={styles.col}>
            <Text style={styles.row}>Energia do podgrzania na m³: {n(r.energyPerM3, 4)} GJ/m³</Text>
            <Text style={styles.row}>Koszt teoretyczny na m³: {n(r.theoreticalCostPerM3)} zł/m³</Text>
            <Text style={styles.row}>Strata energii (na m³): {n(r.energyLossPerM3, 4)} GJ/m³</Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.row}>Płatność teoretyczna (mies.): {n(r.theoreticalMonthlyPayment)} zł/mies.</Text>
            <Text style={styles.row}>Płatność rzeczywista (mies.): {n(r.actualMonthlyPayment)} zł/mies.</Text>
            <Text style={styles.row}>Strata finansowa (mies.): {n(r.monthlyFinancialLoss)} zł/mies.</Text>
          </View>
        </View>

        <Text style={styles.h2}>3. Ekstrapolacja (rok)</Text>
        <View>
          <Text style={styles.row}>Strata energii (rok): {n(r.yearlyEnergyLoss, 3)} GJ/rok</Text>
          <Text style={styles.row}>Strata finansowa (rok): {n(r.yearlyFinancialLoss)} zł/rok</Text>
        </View>

        <Text style={styles.h2}>Szczegółowy podział strat (zakresy i komentarz)</Text>
        {(() => {
          const baseLossGJpm3 = Math.max(Number(r.energyLossPerM3) || 0, 0);
          const baseLossPLNpm3 = Math.max(Number(r.lossPerM3) || 0, 0);
          const fmtGJ = (min: number, max: number) => `${min.toFixed(3)}–${max.toFixed(3)} GJ/m³`;
          const fmtPLN = (min: number, max: number) => `${min.toFixed(2)}–${max.toFixed(2)} zł/m³`;
          const Row = ({ name, min, max }: { name: string; min: number; max: number }) => (
            <View style={{ flexDirection: "row", borderBottom: "1px solid #eee", paddingVertical: 4 }}>
              <Text style={{ flex: 2 }}>{name}</Text>
              <Text style={{ flex: 1 }}>{Math.round(min * 100)}–{Math.round(max * 100)}%</Text>
              <Text style={{ flex: 1 }}>{fmtGJ(baseLossGJpm3 * min, baseLossGJpm3 * max)}</Text>
              <Text style={{ flex: 1 }}>{fmtPLN(baseLossPLNpm3 * min, baseLossPLNpm3 * max)}</Text>
            </View>
          );
          return (
            <View style={{ border: "1px solid #ddd", marginTop: 6 }}>
              <View style={{ flexDirection: "row", backgroundColor: "#f5f5f5", padding: 6, borderBottom: "1px solid #ddd" }}>
                <Text style={{ flex: 2, fontWeight: 700 }}>Obszar/Przyczyna</Text>
                <Text style={{ flex: 1, fontWeight: 700 }}>Udział [%]</Text>
                <Text style={{ flex: 1, fontWeight: 700 }}>Energia</Text>
                <Text style={{ flex: 1, fontWeight: 700 }}>Koszt</Text>
              </View>
              <Row name="Cyrkulacja (wysokie przepływy, małe ΔT)" min={0.30} max={0.50} />
              <Row name="Słaba izolacja pionów/gałązek i węzła" min={0.10} max={0.25} />
              <Row name="Ciągła praca pomp 24/7" min={0.05} max={0.15} />
              <Row name="Nieszczelne zawory / przewiązki (mieszanie)" min={0.05} max={0.15} />
              <Row name="Za wysoka nastawa + antylegionella 'za szeroko'" min={0.05} max={0.10} />
              <Row name="Brak równoważenia pętli cyrkulacyjnych" min={0.05} max={0.10} />
              <Row name="Wyższe rzeczywiste ΔT zimą" min={0.05} max={0.10} />
            </View>
          );
        })()}
        <Text style={styles.small}>
          Uwaga: Suma udziałów nie musi równać się 100%, zjawiska mogą się nakładać. Zakresy są
          poglądowe i wymagają potwierdzenia pomiarami dla konkretnego budynku.
        </Text>

        <Text style={styles.h2}>4. Uwagi</Text>
        <View>
          <Text style={styles.row}>• Energia na m³ liczona jako 0,004186 × (T_CWU − T_zimna) [GJ/m³].</Text>
          <Text style={styles.row}>• Koszt teoretyczny = energia na m³ × cena ciepła [zł/m³].</Text>
          <Text style={styles.row}>• Strata finansowa = (cena z rachunku − koszt teoretyczny) × zużycie [zł].</Text>
          <Text style={styles.row}>• Raport wygenerowano automatycznie na podstawie wprowadzonych danych.</Text>
        </View>
      </Page>
    </Document>
  );

  // Uwaga: w @react-pdf/renderer toBuffer w Node korzysta z callbacku i nie zwraca Promise.
  // Dlatego opakowujemy w Promise, aby zawsze otrzymać Buffer/Uint8Array.
  const buf: Uint8Array = await new Promise((resolve, reject) => {
    try {
      // @ts-expect-error: w runtime Node istnieje wersja z callbackiem
      pdf(Doc).toBuffer((buffer: unknown) => {
        // pdfkit zwraca Buffer (node Buffer => Uint8Array)
        if (buffer instanceof Uint8Array) {
          resolve(buffer);
        } else if (buffer && typeof (buffer as any).byteLength === "number") {
          resolve(new Uint8Array(buffer as ArrayBufferLike));
        } else {
          try {
            // Ostatnia deska: spróbuj skonstruować Buffer i zrzut do Uint8Array
            const b = Buffer.from(buffer as any);
            resolve(new Uint8Array(b));
          } catch (e) {
            reject(e);
          }
        }
      });
    } catch (e) {
      reject(e);
    }
  });
  return buf;
}
