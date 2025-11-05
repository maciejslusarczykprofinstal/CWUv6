/* eslint-disable @typescript-eslint/no-explicit-any */
import { Document, Page, Text, View, StyleSheet, Link, Font, Image } from "@react-pdf/renderer";

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
  input: any;
  result: any;
  createdAt?: Date;
}) {
  const i = (input ?? {}) as Record<string, any>;
  const r = (result ?? {}) as Record<string, any>;

  // Helper for section headers
  const Section = ({ title }: { title: string }) => (
    <Text style={styles.h2}>{title}</Text>
  );

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
