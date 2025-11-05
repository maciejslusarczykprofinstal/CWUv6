import { Document, Page, Text, View, StyleSheet, Link, Font, Image, Svg, Rect, Line } from "@react-pdf/renderer";
import type { ResidentReportInput, ResidentReportResult } from "@/lib/report/types";

// Rejestracja czcionki Roboto z lokalnych plików (TTF z pełnym wsparciem polskich znaków)
Font.register({
  family: "Roboto",
  fonts: [
    {
      src: "/fonts/Roboto-Regular.ttf",
      fontWeight: 400,
    },
    {
      src: "/fonts/Roboto-Bold.ttf",
      fontWeight: 700,
    },
  ],
});

const styles = StyleSheet.create({
  page: { padding: 36, fontSize: 11, fontFamily: "Roboto" },
  h1: { fontSize: 16, fontWeight: 700, marginBottom: 8 },
  h2: { fontSize: 13, fontWeight: 600, marginTop: 14, marginBottom: 6 },
  row: { marginBottom: 4 },
  small: { color: "#666" },
  grid: { display: "flex", flexDirection: "row" },
  col: { flex: 1, marginRight: 18 },
  brandRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  brand: { fontSize: 16, fontWeight: 700 },
  site: { fontSize: 11, color: "#1d4ed8", textDecoration: "none" },
  logo: { width: 40, height: 40, marginRight: 8 },
  brandLeft: { flexDirection: "row", alignItems: "center" },
});

function n(v: unknown, d = 2) {
  const x = Number(v);
  return Number.isFinite(x) ? x.toFixed(d) : "-";
}


export function ResidentBillPDFDocument({
  input,
  result,
  createdAt = new Date(),
}: {
  input: ResidentReportInput;
  result: ResidentReportResult;
  createdAt?: Date;
}) {
  const i = input;
  const r = result;

  // Helper for section headers
  const Section = ({ title }: { title: string }) => (
    <Text style={styles.h2}>{title}</Text>
  );

  // Prosty komponent wykresu słupkowego (SVG) do @react-pdf/renderer
  const BarChart = ({
    title,
    unit,
    data,
    width = 500,
    height = 160,
    autoLog = true,
  }: {
    title: string;
    unit: string;
    data: { label: string; value: number; color: string }[];
    width?: number;
    height?: number;
    autoLog?: boolean;
  }) => {
    const margin = { top: 20, right: 20, bottom: 40, left: 40 };
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
    const barWidth = Math.max(20, Math.min(60, barSpace * 0.6));
    return (
      <View style={{ marginTop: 8, marginBottom: 8, position: "relative" }}>
        <Text style={{ fontSize: 11, fontWeight: 600, marginBottom: 4 }}>{title} ({unit})</Text>
        <Svg width={width} height={height}>
          {/* Oś X i Y */}
          <Line x1={margin.left} y1={margin.top} x2={margin.left} y2={margin.top + ih} stroke="#999" strokeWidth={1} />
          <Line x1={margin.left} y1={margin.top + ih} x2={margin.left + iw} y2={margin.top + ih} stroke="#999" strokeWidth={1} />

          {/* Siatka pozioma */}
          {Array.from({ length: 4 }).map((_, k) => {
            const t = (k + 1) / 5; // 20%, 40%, 60%, 80%
            const y = margin.top + ih - t * (ih - 10);
            return <Line key={`grid-${k}`} x1={margin.left} y1={y} x2={margin.left + iw} y2={y} stroke="#e5e7eb" strokeWidth={1} />;
          })}

          {/* Słupki */}
          {data.map((d, idx) => {
            const val = Math.max(0, Number(d.value) || 0);
            const h = scale(val);
            const x = margin.left + idx * barSpace + (barSpace - barWidth) / 2;
            const y = margin.top + ih - h;
            return (
              <Rect key={`bar-${idx}`} x={x} y={y} width={barWidth} height={h} fill={d.color} />
            );
          })}
        </Svg>
        {/* Etykiety osi (poza SVG) przy liniach siatki */}
        <View style={{ position: "absolute", top: 0, left: width + 6, height }}>
          {Array.from({ length: 4 }).map((_, k) => {
            const t = (k + 1) / 5;
            const y = margin.top + ih - t * (ih - 10) - 6;
            const val = useLog ? Math.pow(10, t * (logDen || 1)) - 1 : t * maxVal;
            return (
              <Text key={`ytick-${k}`} style={{ position: "absolute", top: y, left: 0, fontSize: 8, color: "#666" }}>
                {Math.round(t * 100)}% ≈ {val.toFixed(2)} {unit}
              </Text>
            );
          })}
        </View>

        {/* Legenda i wartości pod wykresem */}
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

  // 100% stacked bar: udział użyteczne vs straty
  const ShareBar = ({
    title,
    useful,
    loss,
    width = 500,
    height = 60,
  }: { title: string; useful: number; loss: number; width?: number; height?: number }) => {
    const margin = { top: 20, right: 20, bottom: 10, left: 40 };
    const iw = width - margin.left - margin.right;
    const ih = height - margin.top - margin.bottom;
    const total = Math.max(0.0001, (useful || 0) + (loss || 0));
    const pu = (useful || 0) / total;
    const pl = (loss || 0) / total;
    const uW = iw * pu;
    const lW = iw * pl;
    const x0 = margin.left;
    const y0 = margin.top;
    return (
      <View style={{ marginTop: 8, marginBottom: 8 }}>
        <Text style={{ fontSize: 11, fontWeight: 600, marginBottom: 4 }}>{title}</Text>
        <Svg width={width} height={height}>
          <Rect x={margin.left} y={y0} width={iw} height={ih} fill="#f3f4f6" stroke="#d1d5db" strokeWidth={1} />
          <Rect x={x0} y={y0} width={uW} height={ih} fill="#60a5fa" />
          <Rect x={x0 + uW} y={y0} width={lW} height={ih} fill="#fbbf24" />
        </Svg>
        <View style={{ marginTop: 6 }}>
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

  // Helper for page footer
  const Footer = () => (
    <View style={{ marginTop: 24, paddingTop: 12, borderTop: "1px solid #ddd" }}>
      <Text style={{ fontSize: 9, color: "#666", textAlign: "center" }}>
        © 2025 PROF INSTAL Maciej Ślusarczyk. Wszelkie prawa zastrzeżone.
      </Text>
    </View>
  );

  // Footer fixed - render on every physical page of the flowing content
  const FooterFixed = () => (
    <Text
      fixed
      style={{ position: "absolute", fontSize: 9, color: "#666", bottom: 24, left: 36, right: 36, textAlign: "center" }}
    >
      © 2025 PROF INSTAL Maciej Ślusarczyk. Wszelkie prawa zastrzeżone.
    </Text>
  );

  return (
    <Document>
      {/* Strona 1: Okładka i wstęp */}
      <Page size="A4" style={styles.page}>
        <View style={styles.brandRow}>
          <View style={styles.brandLeft}>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image src="/logo.png" style={styles.logo} />
            <Text style={styles.brand}>PROFINSTAL</Text>
          </View>
          <Link src="https://profinstal.info" style={styles.site}>
            profinstal.info
          </Link>
        </View>
        <Text style={styles.h1}>Raport ekspercki z analizy kosztów CWU</Text>
        <Text style={styles.small}>Data wygenerowania: {createdAt.toLocaleString("pl-PL")}</Text>
        <View style={{ marginTop: 40 }}>
          <Text style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>
            Analiza kosztów i strat ciepła dla mieszkańców na podstawie rzeczywistych rachunków oraz danych technicznych.
          </Text>
          <Text style={styles.row}>
            Niniejszy raport został przygotowany przez ekspertów firmy PROF INSTAL na podstawie wprowadzonych danych oraz autorskich algorytmów analitycznych. Zawiera szczegółowe wyliczenia, interpretacje, rekomendacje oraz słownik pojęć.
          </Text>
        </View>
        <Footer />
      </Page>

      {/* Strona 2+: Płynny, ciągły raport (automatyczne łamanie stron) */}
      <Page size="A4" style={styles.page}>
        {/* Stała stopka na każdej fizycznej stronie */}
        <FooterFixed />

        <Section title="1. Dane wejściowe (z rachunku)" />
        <View>
          <Text style={styles.row}>Cena CWU z rachunku: {n(i.cwuPriceFromBill)} zł/m³</Text>
          <Text style={styles.row}>Zużycie w miesiącu: {n(i.monthlyConsumption, 1)} m³</Text>
          <Text style={styles.row}>Temperatura zimnej wody: {n(i.coldTempC, 1)} °C</Text>
          <Text style={styles.row}>Temperatura CWU: {n(i.hotTempC, 1)} °C</Text>
          <Text style={styles.row}>Cena ciepła od miasta: {n(i.heatPriceFromCity)} zł/GJ</Text>
        </View>

        <Section title="2. Metodologia i założenia" />
        <View>
          <Text style={styles.row}>Proces analizy kosztów CWU opiera się na precyzyjnych wzorach fizycznych oraz praktycznych założeniach branżowych. Energia niezbędna do podgrzania 1 m³ wody wyliczana jest według wzoru: 0,004186 × (T_CWU − T_zimna) [GJ/m³], gdzie 0,004186 to współczynnik przeliczeniowy wynikający z ciepła właściwego wody. W praktyce oznacza to, że każda różnica temperatury o 1°C przekłada się na proporcjonalny wzrost zużycia energii. W analizie uwzględniono rzeczywiste temperatury wody zimnej i ciepłej, a także aktualne ceny ciepła systemowego, co pozwala na uzyskanie wiarygodnych wyników.</Text>
          <Text style={styles.row}>Koszt teoretyczny podgrzania wody obliczany jest jako iloczyn energii potrzebnej do podgrzania 1 m³ oraz ceny ciepła dostarczanej przez miejską sieć ciepłowniczą. Warto podkreślić, że wartości te mogą się różnić w zależności od sezonu grzewczego, sprawności wymienników ciepła oraz jakości izolacji przewodów. Strata finansowa, będąca różnicą pomiędzy ceną z rachunku a kosztem teoretycznym, wskazuje na potencjalne nieefektywności w systemie dystrybucji ciepła lub błędy w rozliczeniach.</Text>
          <Text style={styles.row}>W analizie przyjęto, że zużycie wody jest rozliczane miesięcznie, a wszelkie odchylenia od wartości teoretycznych mogą wynikać z czynników takich jak: nieprawidłowa regulacja cyrkulacji, nieszczelności instalacji, zbyt długie przewody bez odpowiedniej izolacji czy też nieprecyzyjne pomiary liczników. Dodatkowo, uwzględniono wpływ taryf i opłat stałych, które mogą znacząco zawyżać końcowy koszt dla mieszkańca.</Text>
        </View>

        <Section title="3. Wyniki obliczeń" />
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

        {/* Wykresy do sekcji "Wyniki obliczeń" */}
        <View style={{ marginTop: 8 }}>
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
        </View>

        <ShareBar
          title="Udział energii: użyteczne vs straty"
          useful={Number(r.energyPerM3) || 0}
          loss={Number(r.energyLossPerM3) || 0}
        />

        {/* Założenia i ograniczenia metody */}
        <Section title="Założenia i ograniczenia metody" />
        <View>
          <Text style={styles.row}>• Stałe właściwości wody: gęstość 1000 kg/m³ i ciepło właściwe 4,186 kJ/kgK; brak korekt na domieszki i osady.</Text>
          <Text style={styles.row}>• Temperatury uśrednione: wartości T_zimnej i T_CWU traktowane jako średnie; brak pełnego profilu dobowego i sezonowego.</Text>
          <Text style={styles.row}>• Sprawności i straty lokalne: nie modelujemy szczegółowo wymienników, zaworów i izolacji; ujęto je wskaźnikowo w różnicy kosztów.</Text>
          <Text style={styles.row}>• Cenniki i opłaty stałe: obliczenia bazują na cenie [zł/GJ]; opłaty stałe/abonamentowe mogą zwiększać rozbieżności z rachunkiem.</Text>
          <Text style={styles.row}>• Zależność od danych: wyniki są tak dobre, jak dane wejściowe (rachunki, nastawy, zużycie, temperatury) i dokładność liczników.</Text>
          <Text style={styles.row}>• Skala wykresów: automatyczny log-scale służy porównawczo; nie jest interpretacją bezwzględnej „skali problemu”.</Text>
        </View>
        <View style={{ marginTop: 4 }}>
          <Text style={[styles.small, { fontWeight: 600 }]}>Co to oznacza dla Ciebie:</Text>
          <Text style={styles.small}>Te liczby to wiarygodny start do rozmowy i decyzji – pełna diagnoza wymaga audytu z pomiarami w budynku.</Text>
          <Text style={styles.small}>Najczęściej szybkie efekty daje korekta nastaw CWU, opomiarowanie strat cyrkulacji i przegląd opłat stałych.</Text>
        </View>

        <Section title="4. Ekstrapolacja roczna" />
        <View>
          <Text style={styles.row}>Strata energii (rok): {n(r.yearlyEnergyLoss, 3)} GJ/rok</Text>
          <Text style={styles.row}>Strata finansowa (rok): {n(r.yearlyFinancialLoss)} zł/rok</Text>
        </View>

        {/* Szczegółowy podział strat na zakresy */}
        <Section title="Szczegółowy podział strat (zakresy i komentarz)" />
        <View>
          {(() => {
            const baseLossGJpm3 = Math.max(Number(r.energyLossPerM3) || 0, 0);
            const baseLossPLNpm3 = Math.max(Number(r.lossPerM3) || 0, 0);
            const fmtGJ = (x: number) => `${x.toFixed(3)} GJ/m³`;
            const fmtPLN = (x: number) => `${x.toFixed(2)} zł/m³`;
            const Row = ({ name, min, max }: { name: string; min: number; max: number }) => (
              <View style={{ flexDirection: "row", borderBottom: "1px solid #eee", paddingVertical: 4 }}>
                <Text style={{ flex: 2 }}>{name}</Text>
                <Text style={{ flex: 1 }}>{Math.round(min * 100)}–{Math.round(max * 100)}%</Text>
                <Text style={{ flex: 1 }}>{fmtGJ(baseLossGJpm3 * min)}–{fmtGJ(baseLossGJpm3 * max)}</Text>
                <Text style={{ flex: 1 }}>{fmtPLN(baseLossPLNpm3 * min)}–{fmtPLN(baseLossPLNpm3 * max)}</Text>
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
          <Text style={[styles.small, { marginTop: 6 }]}>
            Uwaga: Suma udziałów nie musi równać się 100%, zjawiska mogą się nakładać. Zakresy są
            poglądowe i wymagają potwierdzenia pomiarami dla konkretnego budynku.
          </Text>
        </View>

        <Section title="5. Interpretacja i komentarz ekspercki" />
        <View>
          <Text style={styles.row}>
            Wyniki przeprowadzonej analizy jednoznacznie wskazują, że rzeczywiste koszty CWU ponoszone przez mieszkańców są wyższe od kosztów teoretycznych o {n(r.monthlyFinancialLoss)} zł miesięcznie, co w skali roku daje stratę rzędu {n(r.yearlyFinancialLoss)} zł. Taka rozbieżność jest typowa dla budynków wielorodzinnych z rozbudowaną instalacją cyrkulacyjną, gdzie straty ciepła mogą sięgać nawet 30% całkowitego zużycia energii na podgrzanie wody. W praktyce oznacza to, że znaczna część energii jest tracona zanim dotrze do punktu poboru, a mieszkańcy płacą nie tylko za faktycznie zużytą wodę, ale również za nieefektywności systemu.
          </Text>
          <Text style={styles.row}>
            Do najczęstszych przyczyn nadpłat należą:
            - Straty ciepła w przewodach rozprowadzających, szczególnie w przypadku braku lub degradacji izolacji termicznej.
            - Nieoptymalna regulacja cyrkulacji, prowadząca do ciągłego przepływu wody i niepotrzebnego podgrzewania.
            - Przestarzała armatura i zawory, które nie zapewniają szczelności i precyzyjnej regulacji.
            - Błędy w rozliczeniach, np. nieprawidłowe odczyty liczników, stosowanie uśrednionych taryf lub nieuwzględnianie rzeczywistych strat.
            - Zjawisko tzw. „zimnej cyrkulacji”, gdzie woda krąży w instalacji bez poboru, powodując nieustanne straty energii.
          </Text>
          <Text style={styles.row}>
            Warto podkreślić, że nawet niewielkie nieszczelności lub nieprawidłowości w pracy zaworów mogą generować znaczne, trudne do wykrycia straty. Przykładowo, nieszczelność rzędu 0,1 l/min przez cały miesiąc to ponad 4 m³ wody, za którą użytkownik zapłaci, mimo że jej nie wykorzystał. Dodatkowo, w budynkach o dużej liczbie pionów i rozległej instalacji, efekt skali potęguje straty, a ich identyfikacja wymaga specjalistycznych pomiarów i audytów.
          </Text>
          <Text style={styles.row}>
            Rekomendujemy przeprowadzenie szczegółowego audytu instalacji CWU, obejmującego pomiary strat ciepła, ocenę stanu izolacji, analizę pracy cyrkulacji oraz weryfikację rozliczeń. Tylko kompleksowe podejście pozwoli na identyfikację głównych źródeł strat i wdrożenie skutecznych działań naprawczych. Warto również rozważyć wdrożenie systemów monitoringu zużycia oraz automatyzacji regulacji cyrkulacji, co w dłuższej perspektywie może przynieść wymierne oszczędności.
          </Text>
        </View>

        <Section title="6. Porównanie wariantów i symulacje" />
        <View>
          <Text style={styles.row}>
            Poniżej przedstawiono symulację kosztów i strat dla różnych wariantów modernizacji instalacji CWU (np. wymiana izolacji, modernizacja cyrkulacji, zmiana taryfy):
          </Text>
          <Text style={styles.row}>• Wariant 1: Modernizacja izolacji – potencjalna oszczędność do 20%</Text>
          <Text style={styles.row}>• Wariant 2: Optymalizacja cyrkulacji – oszczędność do 15%</Text>
          <Text style={styles.row}>• Wariant 3: Zmiana taryfy – oszczędność do 10%</Text>
          <Text style={styles.row}>Łączny potencjał redukcji strat: nawet {n(r.yearlyFinancialLoss * 0.4)} zł/rok.</Text>
        </View>

        <Section title="7. Rekomendacje i działania" />
        <View>
          <Text style={styles.row}>1. Przeprowadzić szczegółowy audyt instalacji CWU pod kątem strat ciepła, obejmujący pomiary termowizyjne, analizę stanu izolacji oraz ocenę pracy zaworów i armatury. Wskazane jest wykonanie inspekcji kamerą termowizyjną, która pozwala na szybkie wykrycie miejsc o podwyższonych stratach energii.</Text>
          <Text style={styles.row}>2. Skonsultować taryfy i sposób rozliczania z zarządcą budynku, zwracając uwagę na strukturę opłat stałych i zmiennych oraz ewentualne nieprawidłowości w naliczaniu kosztów. Warto poprosić o szczegółowe rozliczenie i porównać je z rzeczywistym zużyciem oraz danymi z liczników.</Text>
          <Text style={styles.row}>3. Rozważyć modernizację izolacji przewodów oraz wymianę przestarzałej armatury na nowoczesne, energooszczędne rozwiązania. Inwestycja w wysokiej jakości izolację może przynieść zwrot już po kilku sezonach grzewczych, a nowoczesne zawory i automatyka pozwalają na precyzyjną regulację przepływu i temperatury.</Text>
          <Text style={styles.row}>4. Wdrożyć system monitoringu zużycia i strat CWU, umożliwiający bieżącą kontrolę parametrów pracy instalacji oraz szybkie wykrywanie anomalii. Nowoczesne systemy pozwalają na zdalny odczyt danych, generowanie raportów i alarmowanie o nieprawidłowościach, co znacząco ułatwia zarządzanie budynkiem.</Text>
          <Text style={styles.row}>5. Przeprowadzić cykliczne szkolenia dla mieszkańców i personelu technicznego z zakresu efektywnego korzystania z instalacji CWU oraz podstawowych zasad eksploatacji, co pozwala na ograniczenie niepotrzebnych strat i podniesienie świadomości użytkowników.</Text>
        </View>

        <Section title="8. Słownik pojęć" />
        <View>
          <Text style={styles.row}><Text style={{ fontWeight: 700 }}>CWU</Text> – Ciepła Woda Użytkowa</Text>
          <Text style={styles.row}><Text style={{ fontWeight: 700 }}>GJ</Text> – Gigadżul, jednostka energii</Text>
          <Text style={styles.row}><Text style={{ fontWeight: 700 }}>Cyrkulacja</Text> – obieg wody w instalacji zapewniający natychmiastowy dostęp do ciepłej wody</Text>
          <Text style={styles.row}><Text style={{ fontWeight: 700 }}>Taryfa</Text> – sposób rozliczania kosztów energii</Text>
        </View>

        <Section title="9. Źródła i bibliografia" />
        <View>
          <Text style={styles.row}>1. Rozporządzenie Ministra Infrastruktury ws. warunków technicznych budynków</Text>
          <Text style={styles.row}>2. PN-EN 806-2:2015-10 Instalacje wodociągowe</Text>
          <Text style={styles.row}>3. Materiały własne PROF INSTAL</Text>
        </View>

        <Section title="10. Podsumowanie i kontakt" />
        <View>
          <Text style={styles.row}>Raport przygotowano automatycznie na podstawie wprowadzonych danych. W celu uzyskania indywidualnej analizy lub konsultacji prosimy o kontakt z ekspertami PROF INSTAL.</Text>
          <Text style={styles.row}>E-mail: biuro@profinstal.info</Text>
          <Text style={styles.row}>Telefon: 600 123 456</Text>
        </View>
      </Page>
    </Document>
  );
}
