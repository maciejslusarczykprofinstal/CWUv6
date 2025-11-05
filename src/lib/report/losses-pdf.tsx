import { Document, Page, Text, View, StyleSheet, Font, Svg, Circle, Path } from "@react-pdf/renderer";

Font.register({
  family: "Roboto",
  fonts: [
    { src: "https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Me5WZLCzYlKw.ttf" },
    { src: "https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlvAx05IsDqlA.ttf", fontWeight: 700 },
  ],
});

// Helper to create pie chart segments
function createPieSlice(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y} Z`;
}

function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Roboto",
    fontSize: 10,
    color: "#1e293b",
  },
  header: {
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: "#3b82f6",
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    color: "#1e40af",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 11,
    color: "#64748b",
  },
  section: {
    marginTop: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: "#0f172a",
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#cbd5e1",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
    paddingVertical: 4,
  },
  label: {
    fontSize: 10,
    color: "#475569",
  },
  value: {
    fontSize: 10,
    fontWeight: 700,
    color: "#0f172a",
  },
  highlight: {
    backgroundColor: "#dbeafe",
    padding: 12,
    borderRadius: 6,
    marginTop: 8,
  },
  highlightText: {
    fontSize: 11,
    color: "#1e40af",
    fontWeight: 700,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 8,
    color: "#94a3b8",
    textAlign: "center",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 8,
  },
});

type LossesData = {
  method: "percent" | "ua";
  circGJ: number;
  costPLN: number;
  // For percent method
  purchasedGJ?: number;
  circulationPct?: number;
  // For UA method
  UA_WK?: number;
  dT_circ?: number;
  hours_circ?: number;
  pricePerGJ: number;
};

export function LossesPDF({ data }: { data: LossesData }) {
  const date = new Date().toLocaleDateString("pl-PL");

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Raport strat cyrkulacji CWU</Text>
          <Text style={styles.subtitle}>PROFINSTAL – Audytorzy • {date}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Metoda obliczeniowa</Text>
          <Text style={styles.label}>
            {data.method === "percent"
              ? "Procentowy udział w zakupionym cieple"
              : "Fizyczna metoda UA×ΔT×t"}
          </Text>
        </View>

        {data.method === "percent" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Parametry wejściowe (procentowy)</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Ciepło zakupione:</Text>
              <Text style={styles.value}>{data.purchasedGJ?.toFixed(2)} GJ/rok</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Udział strat cyrkulacji:</Text>
              <Text style={styles.value}>{data.circulationPct?.toFixed(1)} %</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Cena ciepła:</Text>
              <Text style={styles.value}>{data.pricePerGJ.toFixed(2)} zł/GJ</Text>
            </View>
          </View>
        )}

        {data.method === "ua" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Parametry wejściowe (UA×ΔT×t)</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Współczynnik strat UA:</Text>
              <Text style={styles.value}>{data.UA_WK?.toFixed(1)} W/K</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>ΔT cyrkulacji:</Text>
              <Text style={styles.value}>{data.dT_circ?.toFixed(1)} K</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Godziny pracy/rok:</Text>
              <Text style={styles.value}>{data.hours_circ?.toLocaleString("pl-PL")} h</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Cena ciepła:</Text>
              <Text style={styles.value}>{data.pricePerGJ.toFixed(2)} zł/GJ</Text>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Wyniki analizy</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Straty cyrkulacji roczne:</Text>
            <Text style={styles.value}>{data.circGJ.toFixed(2)} GJ/rok</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Koszt strat roczny:</Text>
            <Text style={styles.value}>{data.costPLN.toLocaleString("pl-PL")} zł/rok</Text>
          </View>
        </View>

        <View style={styles.highlight}>
          <Text style={styles.highlightText}>
            Roczny koszt strat cyrkulacji wynosi {data.costPLN.toLocaleString("pl-PL")} zł
          </Text>
          <Text style={{ ...styles.label, marginTop: 6 }}>
            Rekomenduje się modernizację izolacji przewodów cyrkulacyjnych oraz rozważenie 
            automatycznej regulacji temperatury w celu redukcji strat.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Wizualizacja rozkładu strat</Text>
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 12 }}>
            <View style={{ width: 180, height: 180 }}>
              <Svg width="180" height="180" viewBox="0 0 180 180">
                {/* Background circle */}
                <Circle cx="90" cy="90" r="70" fill="#f1f5f9" />
                {/* Losses slice (red) */}
                <Path
                  d={createPieSlice(90, 90, 70, 0, (data.circGJ / (data.circGJ + 100)) * 360)}
                  fill="#ef4444"
                />
                {/* Useful energy slice (green) */}
                <Path
                  d={createPieSlice(90, 90, 70, (data.circGJ / (data.circGJ + 100)) * 360, 360)}
                  fill="#10b981"
                />
                {/* Center hole for donut effect */}
                <Circle cx="90" cy="90" r="45" fill="white" />
                <Text
                  x="90"
                  y="85"
                  style={{ fontSize: 16, fontWeight: 700, textAnchor: "middle", fill: "#0f172a" }}
                >
                  {((data.circGJ / (data.circGJ + 100)) * 100).toFixed(0)}%
                </Text>
                <Text
                  x="90"
                  y="100"
                  style={{ fontSize: 8, textAnchor: "middle", fill: "#64748b" }}
                >
                  strat
                </Text>
              </Svg>
            </View>
            <View style={{ marginLeft: 20, flex: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                <View style={{ width: 12, height: 12, backgroundColor: "#ef4444", marginRight: 8 }} />
                <Text style={styles.label}>Straty cyrkulacji: {data.circGJ.toFixed(2)} GJ/rok</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View style={{ width: 12, height: 12, backgroundColor: "#10b981", marginRight: 8 }} />
                <Text style={styles.label}>Energia użyteczna (szacunek)</Text>
              </View>
              <Text style={{ ...styles.label, marginTop: 8, fontSize: 9, color: "#64748b" }}>
                Wykres pokazuje udział strat cyrkulacyjnych w całkowitym zużyciu energii cieplnej na CWU.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Potencjalne działania naprawcze</Text>
          <Text style={styles.label}>• Docieplenie przewodów cyrkulacji CWU (materiał PI o λ≤0,04 W/(m·K))</Text>
          <Text style={styles.label}>• Montaż automatycznych zaworów cyrkulacyjnych z termostatami</Text>
          <Text style={styles.label}>• Optymalizacja temperatury cyrkulacji (T min. 50–55°C)</Text>
          <Text style={styles.label}>• Eliminacja wycieków i uszczelnień w systemie</Text>
          <Text style={styles.label}>• Regularne przeglądy i konserwacja układu CWU</Text>
        </View>

        <Text style={styles.footer}>
          Dokument wygenerowany przez PROFINSTAL Kalkulator Audytorski • profinstal.info
        </Text>
      </Page>
    </Document>
  );
}
