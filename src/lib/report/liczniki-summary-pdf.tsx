import { Document, Page, Text, View, StyleSheet, Link, Svg, Rect, Line } from "@react-pdf/renderer";

export interface LicznikiSummaryData {
  waterVolumeM3: number; // m³ (rok/okres)
  pricePerM3: number; // zł/m³ (z rachunku)
  pricePerGJ: number; // zł/GJ (cena energii)
  totalPaid?: number; // opcjonalnie – wyliczymy jeśli brak
  totalCost?: number; // opcjonalnie – wyliczymy jeśli brak
  createdAt?: string; // ISO data utworzenia (opcjonalnie)
  // Rozszerzenia: różne wolumeny dla rachunku i teorii
  paidVolumeM3?: number;
  theoreticalVolumeM3?: number;
}

const styles = StyleSheet.create({
  page: { padding: 36, fontSize: 11 },
  h1: { fontSize: 16, fontWeight: 700, marginBottom: 8 },
  h2: { fontSize: 13, fontWeight: 600, marginTop: 14, marginBottom: 6 },
  row: { marginBottom: 4 },
  small: { color: "#666" },
  brandRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  brand: { fontSize: 16, fontWeight: 700 },
  site: { fontSize: 11, color: "#1d4ed8", textDecoration: "none" },
  box: { border: "1px solid #e5e7eb", borderRadius: 4, padding: 8, marginTop: 6 },
});

function fmt(v: number, digits = 2) {
  return Number(v).toLocaleString("pl-PL", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

function computeFrom(data: LicznikiSummaryData) {
  const w = Math.max(0, Number(data.waterVolumeM3) || 0);
  const wPaid = Number.isFinite(Number(data.paidVolumeM3)) ? Math.max(0, Number(data.paidVolumeM3)) : w;
  const wTheo = Number.isFinite(Number(data.theoreticalVolumeM3)) ? Math.max(0, Number(data.theoreticalVolumeM3)) : w;
  const pM3 = Math.max(0, Number(data.pricePerM3) || 0);
  const pGJ = Math.max(0, Number(data.pricePerGJ) || 0);
  // Energia na 1 m³ dla 10→55°C: 0.004186 × 45 = ~0.18837 GJ/m³
  const energyPerM3GJ = 0.004186 * 45;
  const totalPaid = Number.isFinite(Number(data.totalPaid)) ? Number(data.totalPaid) : wPaid * pM3;
  // Cena teoretyczna na m³ liczymy niezależnie od wolumenu
  const theoreticalPerM3 = energyPerM3GJ * pGJ;
  const totalCost = Number.isFinite(Number(data.totalCost)) ? Number(data.totalCost) : wTheo * theoreticalPerM3;
  // Cena z rachunku na m³ pochodzi bezpośrednio z wejścia
  const paidPerM3 = pM3;
  const diff = totalPaid - totalCost; // + nadpłata, − niedopłata
  return { w, wPaid, wTheo, pM3, pGJ, energyPerM3GJ, totalPaid, totalCost, paidPerM3, theoreticalPerM3, diff };
}

export function LicznikiSummaryPDF({ data }: { data: LicznikiSummaryData }) {
  const createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
  const c = computeFrom(data);
  const isOverpay = c.diff > 0;
  const isUnderpay = c.diff < 0;

  const BarChart = ({
    title,
    unit,
    values,
    width = 300,
    height = 140,
  }: {
    title: string;
    unit: string;
    values: { label: string; value: number; color: string }[];
    width?: number;
    height?: number;
  }) => {
    const margin = { top: 18, right: 20, bottom: 28, left: 40 } as const;
    const iw = width - margin.left - margin.right;
    const ih = height - margin.top - margin.bottom;
    const nums = values.map(v => Math.max(0, Number(v.value) || 0));
    const max = Math.max(1, ...nums);
    const barSpace = iw / values.length;
    const barWidth = Math.max(18, Math.min(56, barSpace * 0.6));
    return (
      <View style={{ marginTop: 8, marginBottom: 8 }}>
        <Text style={{ fontSize: 11, fontWeight: 600, marginBottom: 4 }}>{title} ({unit})</Text>
        <Svg width={width} height={height}>
          <Line x1={margin.left} y1={margin.top} x2={margin.left} y2={margin.top + ih} stroke="#999" strokeWidth={1} />
          <Line x1={margin.left} y1={margin.top + ih} x2={margin.left + iw} y2={margin.top + ih} stroke="#999" strokeWidth={1} />
          {values.map((d, idx) => {
            const val = Math.max(0, Number(d.value) || 0);
            const h = (val / max) * (ih - 10);
            const x = margin.left + idx * barSpace + (barSpace - barWidth) / 2;
            const y = margin.top + ih - h;
            return <Rect key={`bar-${idx}`} x={x} y={y} width={barWidth} height={h} fill={d.color} />;
          })}
        </Svg>
        <View style={{ marginTop: 4 }}>
          {values.map((d, idx) => (
            <View key={`legend-${idx}`} style={{ flexDirection: "row", alignItems: "center", marginBottom: 2 }}>
              <View style={{ width: 10, height: 10, backgroundColor: d.color, marginRight: 6 }} />
              <Text style={{ fontSize: 10 }}>{d.label}: {fmt(Number(d.value) || 0)} {unit}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Branding */}
        <View style={styles.brandRow}>
          <Text style={styles.brand}>PROFINSTAL</Text>
          <Link src="https://profinstal.info" style={styles.site}>profinstal.info</Link>
        </View>
        <Text style={styles.h1}>PROFINSTAL — Podsumowanie liczniki CWU</Text>
        <Text style={styles.small}>Data: {createdAt.toLocaleString("pl-PL")}</Text>

        <Text style={styles.h2}>1. Dane wejściowe</Text>
        <View>
          <Text style={styles.row}>Zużycie wody (rachunek): {fmt(c.wPaid, 2)} m³</Text>
          <Text style={styles.row}>Zużycie wody (teoria): {fmt(c.wTheo, 2)} m³</Text>
          <Text style={styles.row}>Cena z rachunku: {fmt(c.pM3)} zł/m³</Text>
          <Text style={styles.row}>Cena energii: {fmt(c.pGJ)} zł/GJ</Text>
          <Text style={styles.row}>Założenie: ΔT = 45°C, energia na m³ ≈ {fmt(c.energyPerM3GJ, 5)} GJ/m³</Text>
        </View>

        <Text style={styles.h2}>2. Wyniki</Text>
        <View>
          <Text style={styles.row}>Zapłacili (z rachunku): {fmt(c.totalPaid)} zł</Text>
          <Text style={styles.row}>Koszt całkowity podgrzania (teoria): {fmt(c.totalCost)} zł</Text>
          <Text style={styles.row}>Cena z rachunku (przeliczona): {fmt(c.paidPerM3)} zł/m³</Text>
          <Text style={styles.row}>Cena teoretyczna (energia): {fmt(c.theoreticalPerM3)} zł/m³</Text>
        </View>

        {/* Wykres słupkowy porównawczy */}
        <BarChart
          title="Porównanie kosztów"
          unit="zł"
          values={[
            { label: "Koszt teoretyczny", value: c.totalCost, color: "#60a5fa" },
            { label: "Zapłacili", value: c.totalPaid, color: "#34d399" },
            { label: "Różnica", value: Math.abs(c.diff), color: "#f87171" },
          ]}
        />

        {/* Różnica w wyróżnionym boksie */}
        <Text style={styles.h2}>3. Różnica</Text>
        <View style={[styles.box, { backgroundColor: isOverpay ? "#ecfdf5" : isUnderpay ? "#fef2f2" : "#f8fafc", borderColor: isOverpay ? "#a7f3d0" : isUnderpay ? "#fecaca" : "#e5e7eb" }]}>
          <Text style={{ fontSize: 12, fontWeight: 700, color: isOverpay ? "#065f46" : isUnderpay ? "#7f1d1d" : "#0f172a" }}>
            {isOverpay ? "Nadpłata" : isUnderpay ? "Niedopłata" : "Brak różnicy"}
          </Text>
          <Text style={{ fontSize: 18, fontWeight: 700, marginTop: 4, color: isOverpay ? "#065f46" : isUnderpay ? "#7f1d1d" : "#0f172a" }}>
            {fmt(Math.abs(c.diff))} zł
          </Text>
          <Text style={{ marginTop: 2, color: "#334155" }}>Zapłacili − Koszt całkowity podgrzania</Text>
        </View>

        <Text style={styles.h2}>4. Uwagi</Text>
        <View>
          <Text style={styles.row}>• Energia na 1 m³ przyjęta dla 10→55°C (ΔT 45°C) i ciepła właściwego wody 4,186 kJ/kgK.</Text>
          <Text style={styles.row}>• Różnice mogą wynikać z opłat stałych, abonamentów, strat cyrkulacji i specyfiki rozliczeń dostawcy.</Text>
          <Text style={styles.row}>• Wynik jest punktem wyjścia do rozmowy z zarządcą i weryfikacji instalacji.</Text>
          <Text style={styles.row}>• W raporcie możesz podać różne wolumeny dla części „Zapłacili” i „Teoria” — narzędzie to uwzględnia.</Text>
        </View>
      </Page>
    </Document>
  );
}
