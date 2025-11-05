/* eslint-disable @typescript-eslint/no-explicit-any */
import { Document, Page, Text, View, StyleSheet, pdf, Link, Svg, Rect, Line, Path } from "@react-pdf/renderer";
import type { ResidentReportInput, ResidentReportResult } from "@/lib/report/types";

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
  input: ResidentReportInput,
  result: ResidentReportResult,
  createdAt: Date = new Date()
): Promise<Uint8Array> {
  const i = input;
  const r = result;

  // Prosty wykres słupkowy (SVG) — używany w sekcji wyników
  const BarChart = ({
    title,
    unit,
    data,
    width = 480,
    height = 150,
    autoLog = true,
  }: {
    title: string;
    unit: string;
    data: { label: string; value: number; color: string }[];
    width?: number;
    height?: number;
    autoLog?: boolean;
  }) => {
    const margin = { top: 18, right: 20, bottom: 34, left: 36 };
    const iw = width - margin.left - margin.right;
    const ih = height - margin.top - margin.bottom;
    const values = data.map((d) => Math.max(0, Number(d.value) || 0));
    const maxVal = Math.max(1, ...values);
    const positives = values.filter((v) => v > 0);
    const minPos = positives.length ? Math.min(...positives) : 0;
    const useLog = autoLog && minPos > 0 && maxVal / minPos >= 20;
    const log = (y: number) => Math.log10(1 + y);
    const logDen = log(maxVal);
    const scale = (v: number) => {
      const x = Math.max(0, v);
      if (!useLog) return (x / maxVal) * (ih - 10);
      return (log(x) / (logDen || 1)) * (ih - 10);
    };
    const barSpace = iw / data.length;
    const barWidth = Math.max(18, Math.min(56, barSpace * 0.6));
    return (
      <View style={{ marginTop: 6, marginBottom: 6 }}>
        <Text style={{ fontSize: 11, fontWeight: 600, marginBottom: 4 }}>{title} ({unit})</Text>
        <Svg width={width} height={height}>
          <Line x1={margin.left} y1={margin.top} x2={margin.left} y2={margin.top + ih} stroke="#999" strokeWidth={1} />
          <Line x1={margin.left} y1={margin.top + ih} x2={margin.left + iw} y2={margin.top + ih} stroke="#999" strokeWidth={1} />
          {Array.from({ length: 4 }).map((_, k) => {
            const t = (k + 1) / 5; // 20-80%
            const y = margin.top + ih - t * (ih - 10);
            return <Line key={`grid-${k}`} x1={margin.left} y1={y} x2={margin.left + iw} y2={y} stroke="#e5e7eb" strokeWidth={1} />;
          })}
          {data.map((d, idx) => {
            const val = Math.max(0, Number(d.value) || 0);
            const h = scale(val);
            const x = margin.left + idx * barSpace + (barSpace - barWidth) / 2;
            const y = margin.top + ih - h;
            return <Rect key={`bar-${idx}`} x={x} y={y} width={barWidth} height={h} fill={d.color} />;
          })}
        </Svg>
        {/* Etykiety osi poza SVG */}
        <View style={{ marginTop: 2 }}>
          {Array.from({ length: 4 }).map((_, k) => {
            const t = (k + 1) / 5;
            const val = useLog ? Math.pow(10, t * (logDen || 1)) - 1 : t * maxVal;
            return (
              <Text key={`ytick-${k}`} style={{ fontSize: 8, color: "#666" }}>
                Linia siatki {Math.round(t * 100)}% ≈ {val.toFixed(2)} {unit}
              </Text>
            );
          })}
        </View>
        <View style={{ marginTop: 6 }}>
          {data.map((d, idx) => (
            <View key={`leg-${idx}`} style={{ flexDirection: "row", alignItems: "center", marginBottom: 2 }}>
              <View style={{ width: 10, height: 10, backgroundColor: d.color, marginRight: 6 }} />
              <Text style={{ fontSize: 10, color: "#333" }}>{d.label}: {Number(d.value || 0).toFixed(2)} {unit}</Text>
            </View>
          ))}
          <Text style={{ fontSize: 9, color: "#666", marginTop: 2 }}>
            Skala: {useLog ? "logarytmiczna (auto)" : "liniowa"} • Maks: {maxVal.toFixed(2)} {unit}
          </Text>
        </View>
      </View>
    );
  };

  // Wykres kołowy: udział użyteczne vs straty
  const PieChart = ({
    title,
    useful,
    loss,
    size = 140,
  }: { title: string; useful: number; loss: number; size?: number }) => {
    const total = Math.max(0.0001, (useful || 0) + (loss || 0));
    const pu = (useful || 0) / total;
    const pl = (loss || 0) / total;
    
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - 10;
    
    // Kąt startowy dla użytecznej (od góry, 12 o'clock)
    const startAngleUseful = -90; // -90° = góra
    const endAngleUseful = startAngleUseful + (pu * 360);
    
    // Kąt dla strat
    const startAngleLoss = endAngleUseful;
    const endAngleLoss = startAngleLoss + (pl * 360);
    
    // Funkcja do obliczenia ścieżki łuku
    const getArcPath = (startAngle: number, endAngle: number, r: number) => {
      const startRad = (startAngle * Math.PI) / 180;
      const endRad = (endAngle * Math.PI) / 180;
      
      const x1 = centerX + r * Math.cos(startRad);
      const y1 = centerY + r * Math.sin(startRad);
      const x2 = centerX + r * Math.cos(endRad);
      const y2 = centerY + r * Math.sin(endRad);
      
      const largeArc = endAngle - startAngle > 180 ? 1 : 0;
      
      return `M ${centerX} ${centerY} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    };
    
    return (
      <View style={{ marginTop: 8, marginBottom: 8, alignItems: "center" }}>
        <Text style={{ fontSize: 11, fontWeight: 600, marginBottom: 8 }}>{title}</Text>
        <Svg width={size} height={size}>
          {/* Użyteczne - niebieski */}
          <Path d={getArcPath(startAngleUseful, endAngleUseful, radius)} fill="#60a5fa" stroke="#fff" strokeWidth={2} />
          {/* Straty - żółty */}
          <Path d={getArcPath(startAngleLoss, endAngleLoss, radius)} fill="#fbbf24" stroke="#fff" strokeWidth={2} />
        </Svg>
        <View style={{ marginTop: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 2 }}>
            <View style={{ width: 10, height: 10, backgroundColor: "#60a5fa", marginRight: 6 }} />
            <Text style={{ fontSize: 10, color: "#333" }}>Użyteczne: {(pu * 100).toFixed(0)}% ({(useful || 0).toFixed(3)} GJ/m³)</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={{ width: 10, height: 10, backgroundColor: "#fbbf24", marginRight: 6 }} />
            <Text style={{ fontSize: 10, color: "#333" }}>Straty: {(pl * 100).toFixed(0)}% ({(loss || 0).toFixed(3)} GJ/m³)</Text>
          </View>
        </View>
      </View>
    );
  };

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

        {/* Wykresy dla sekcji wyników */}
        <BarChart
          title="Koszty miesięczne"
          unit="zł/mies."
          data={[
            { label: "Teoretyczny", value: Number(r.theoreticalMonthlyPayment) || 0, color: "#60a5fa" },
            { label: "Rzeczywisty", value: Number(r.actualMonthlyPayment) || 0, color: "#34d399" },
            { label: "Różnica", value: Number(r.monthlyFinancialLoss) || 0, color: "#f87171" },
          ]}
        />
        <BarChart
          title="Energia na m³"
          unit="GJ/m³"
          data={[
            { label: "Teoria", value: Number(r.energyPerM3) || 0, color: "#60a5fa" },
            { label: "Strata", value: Number(r.energyLossPerM3) || 0, color: "#fbbf24" },
          ]}
        />
        <PieChart
          title="Udział energii: użyteczne vs straty"
          useful={Number(r.energyPerM3) || 0}
          loss={Number(r.energyLossPerM3) || 0}
        />

        <Text style={styles.h2}>Założenia i ograniczenia metody</Text>
        <View>
          <Text style={styles.row}>• Stałe właściwości wody: przyjęto gęstość 1000 kg/m³ i ciepło właściwe 4,186 kJ/kgK (bez wpływu domieszek czy zakamienienia).</Text>
          <Text style={styles.row}>• Temperatury uśrednione: T_zimnej i T_CWU traktowane jako wartości średnie; nie modelujemy pełnego profilu dobowo-sezonowego.</Text>
          <Text style={styles.row}>• Sprawności lokalne: nie uwzględniamy szczegółowej sprawności wymienników/armatury; straty poza rachunkiem są szacowane wskaźnikowo.</Text>
          <Text style={styles.row}>• Ceny i opłaty: analiza posługuje się ceną energii [zł/GJ]; opłaty stałe/abonamentowe mogą powodować rozbieżności względem rzeczywistych rozliczeń.</Text>
          <Text style={styles.row}>• Dane wejściowe i pomiary: dokładność wyniku zależy od poprawności danych z rachunku/liczników oraz przyjętych nastaw temperatur.</Text>
          <Text style={styles.row}>• Wykresy: skala logarytmiczna włącza się automatycznie przy dużej rozpiętości wartości – służy porównaniu, nie bezwzględnej ocenie poziomów.</Text>
        </View>
        <View style={{ marginTop: 4 }}>
          <Text style={[styles.small, { fontWeight: 600 }]}>Co to oznacza dla Ciebie:</Text>
          <Text style={styles.small}>Wyniki traktuj jako dobry punkt odniesienia do rozmowy z zarządcą i wstępnej diagnozy, a nie audyt zastępujący pomiary.</Text>
          <Text style={styles.small}>Największy wpływ na różnice mają straty cyrkulacji, opłaty stałe i nastawy temperatur – to tam zwykle najszybciej odzyskasz pieniądze.</Text>
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
