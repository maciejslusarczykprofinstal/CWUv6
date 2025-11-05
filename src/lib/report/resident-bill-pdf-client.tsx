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

      {/* Strona 2: Dane wejściowe */}
      <Page size="A4" style={styles.page}>
        <Section title="1. Dane wejściowe (z rachunku)" />
        <View>
          <Text style={styles.row}>Cena CWU z rachunku: {n(i.cwuPriceFromBill)} zł/m³</Text>
          <Text style={styles.row}>Zużycie w miesiącu: {n(i.monthlyConsumption, 1)} m³</Text>
          <Text style={styles.row}>Temperatura zimnej wody: {n(i.coldTempC, 1)} °C</Text>
          <Text style={styles.row}>Temperatura CWU: {n(i.hotTempC, 1)} °C</Text>
          <Text style={styles.row}>Cena ciepła od miasta: {n(i.heatPriceFromCity)} zł/GJ</Text>
        </View>
        <Footer />
      </Page>

      {/* Strona 3: Metodologia i założenia */}
      <Page size="A4" style={styles.page}>
        <Section title="2. Metodologia i założenia" />
        <View>
          <Text style={styles.row}>• Energia do podgrzania 1 m³ wody: 0,004186 × (T_CWU − T_zimna) [GJ/m³]</Text>
          <Text style={styles.row}>• Koszt teoretyczny: energia × cena ciepła [zł/m³]</Text>
          <Text style={styles.row}>• Strata finansowa: (cena z rachunku − koszt teoretyczny) × zużycie [zł]</Text>
          <Text style={styles.row}>• Uwzględniono rzeczywiste temperatury i ceny z danego okresu rozliczeniowego.</Text>
        </View>
        <Footer />
      </Page>

      {/* Strona 4: Wyniki i szczegółowa analiza */}
      <Page size="A4" style={styles.page}>
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
        <Footer />
      </Page>

      {/* Strona 5: Interpretacja wyników */}
      <Page size="A4" style={styles.page}>
        <Section title="5. Interpretacja i komentarz ekspercki" />
        <View>
          <Text style={styles.row}>
            Wyniki wskazują, że rzeczywiste koszty CWU są wyższe od teoretycznych o {n(r.monthlyFinancialLoss)} zł miesięcznie, co w skali roku daje stratę rzędu {n(r.yearlyFinancialLoss)} zł. Oznacza to, że mieszkańcy płacą więcej niż wynikałoby to z czystych kosztów energii potrzebnej do podgrzania wody.
          </Text>
          <Text style={styles.row}>
            Najczęstsze przyczyny nadpłat to: straty ciepła w instalacji, nieoptymalna regulacja cyrkulacji, przestarzała armatura, błędy w rozliczeniach lub taryfach.
          </Text>
          <Text style={styles.row}>
            Rekomendujemy szczegółowy audyt instalacji oraz analizę taryf i sposobu rozliczania CWU przez zarządcę budynku.
          </Text>
        </View>
        <Footer />
      </Page>

      {/* Strona 6: Porównanie wariantów i symulacje */}
      <Page size="A4" style={styles.page}>
        <Section title="6. Porównanie wariantów i symulacje" />
        <View>
          <Text style={styles.row}>
            Poniżej przedstawiono symulację kosztów i strat dla różnych wariantów modernizacji instalacji CWU (np. wymiana izolacji, modernizacja cyrkulacji, zmiana taryfy):
          </Text>
          <Text style={styles.row}>• Wariant 1: Modernizacja izolacji – potencjalna oszczędność do 20%</Text>
          <Text style={styles.row}>• Wariant 2: Optymalizacja cyrkulacji – oszczędność do 15%</Text>
          <Text style={styles.row}>• Wariant 3: Zmiana taryfy – oszczędność do 10%</Text>
          <Text style={styles.row}>
            Łączny potencjał redukcji strat: nawet {n(r.yearlyFinancialLoss * 0.4)} zł/rok.
          </Text>
        </View>
        <Footer />
      </Page>

      {/* Strona 7: Rekomendacje i działania */}
      <Page size="A4" style={styles.page}>
        <Section title="7. Rekomendacje i działania" />
        <View>
          <Text style={styles.row}>1. Przeprowadzić audyt instalacji CWU pod kątem strat ciepła.</Text>
          <Text style={styles.row}>2. Skonsultować taryfy i sposób rozliczania z zarządcą budynku.</Text>
          <Text style={styles.row}>3. Rozważyć modernizację izolacji i armatury.</Text>
          <Text style={styles.row}>4. Wdrożyć monitoring zużycia i strat CWU.</Text>
        </View>
        <Footer />
      </Page>

      {/* Strona 8: Słownik pojęć */}
      <Page size="A4" style={styles.page}>
        <Section title="8. Słownik pojęć" />
        <View>
          <Text style={styles.row}><Text style={{ fontWeight: 700 }}>CWU</Text> – Ciepła Woda Użytkowa</Text>
          <Text style={styles.row}><Text style={{ fontWeight: 700 }}>GJ</Text> – Gigadżul, jednostka energii</Text>
          <Text style={styles.row}><Text style={{ fontWeight: 700 }}>Cyrkulacja</Text> – obieg wody w instalacji zapewniający natychmiastowy dostęp do ciepłej wody</Text>
          <Text style={styles.row}><Text style={{ fontWeight: 700 }}>Taryfa</Text> – sposób rozliczania kosztów energii</Text>
        </View>
        <Footer />
      </Page>

      {/* Strona 9: Źródła i bibliografia */}
      <Page size="A4" style={styles.page}>
        <Section title="9. Źródła i bibliografia" />
        <View>
          <Text style={styles.row}>1. Rozporządzenie Ministra Infrastruktury ws. warunków technicznych budynków</Text>
          <Text style={styles.row}>2. PN-EN 806-2:2015-10 Instalacje wodociągowe</Text>
          <Text style={styles.row}>3. Materiały własne PROF INSTAL</Text>
        </View>
        <Footer />
      </Page>

      {/* Strona 10: Podsumowanie i kontakt */}
      <Page size="A4" style={styles.page}>
        <Section title="10. Podsumowanie i kontakt" />
        <View>
          <Text style={styles.row}>
            Raport przygotowano automatycznie na podstawie wprowadzonych danych. W celu uzyskania indywidualnej analizy lub konsultacji prosimy o kontakt z ekspertami PROF INSTAL.
          </Text>
          <Text style={styles.row}>E-mail: biuro@profinstal.info</Text>
          <Text style={styles.row}>Telefon: 600 123 456</Text>
        </View>
        <Footer />
      </Page>
    </Document>
  );
}
