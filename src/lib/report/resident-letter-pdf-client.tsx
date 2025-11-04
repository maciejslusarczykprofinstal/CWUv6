/* eslint-disable @typescript-eslint/no-explicit-any */
import { Document, Page, Text, View, StyleSheet, Link, Font } from "@react-pdf/renderer";

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
  page: { padding: 48, fontSize: 12, lineHeight: 1.4, fontFamily: "Roboto" },
  header: { marginBottom: 18 },
  h1: { fontSize: 16, fontWeight: 700, marginBottom: 6 },
  h2: { fontSize: 14, fontWeight: 700, marginTop: 20, marginBottom: 10 },
  h3: { fontSize: 12, fontWeight: 700, marginTop: 14, marginBottom: 6 },
  small: { color: "#666", fontSize: 10 },
  para: { marginBottom: 10, textAlign: "justify" },
  bullet: { marginLeft: 16, marginBottom: 4 },
  sign: { marginTop: 30 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  box: { width: "48%" },
  bold: { fontWeight: 600 },
  topRight: { alignSelf: "flex-end", marginBottom: 16 },
  brandRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  brand: { fontSize: 18, fontWeight: 700 },
  site: { fontSize: 12, color: "#1d4ed8", textDecoration: "none" },
  table: { marginVertical: 10, borderWidth: 1, borderColor: "#ddd" },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderColor: "#ddd" },
  tableCell: { flex: 1, padding: 6, fontSize: 10 },
  tableCellBold: { flex: 1, padding: 6, fontSize: 10, fontWeight: 700, backgroundColor: "#f5f5f5" },
  highlight: { backgroundColor: "#fef3c7", padding: 8, marginVertical: 8, borderRadius: 4 },
  section: { marginBottom: 16 },
  pageBreak: { marginTop: 40 },
});

function n(v: unknown, d = 2) {
  const x = Number(v);
  return Number.isFinite(x) ? x.toFixed(d) : "-";
}

export function ResidentLetterPDFDocument({
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
  const managerName = (i.managerName as string) || "";
  const managerAddress = (i.managerAddress as string) || "";
  const buildingAddress = (i.buildingAddress as string) || "";
  const apartmentNumber = (i.apartmentNumber as string) || "";
  const residentName = (i.residentName as string) || "";
  const letterCity = (i.letterCity as string) || "";
  const letterDate = createdAt.toLocaleDateString("pl-PL");
  const residentEmail = (i.residentEmail as string) || "";
  const residentPhone = (i.residentPhone as string) || "";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Branding */}
        <View style={styles.brandRow}>
          <Text style={styles.brand}>PROFINSTAL</Text>
          <Link src="https://profinstal.info" style={styles.site}>
            profinstal.info
          </Link>
        </View>
        <View style={styles.header}>
          <Text style={styles.h1}>Pismo do Zarządcy — analiza kosztów CWU</Text>
          <Text style={styles.small}>Data: {createdAt.toLocaleString("pl-PL")}</Text>
        </View>

        {(letterCity || letterDate) && (
          <View style={styles.topRight}>
            <Text>{[letterCity, letterDate].filter(Boolean).join(", ")}</Text>
          </View>
        )}

        {(managerName || managerAddress || buildingAddress) && (
          <View style={styles.row}>
            <View style={styles.box}>
              <Text style={styles.bold}>Adresat:</Text>
              {managerName ? <Text>{managerName}</Text> : null}
              {managerAddress ? <Text>{managerAddress}</Text> : null}
            </View>
            <View style={styles.box}>
              <Text style={styles.bold}>Dotyczy:</Text>
              {buildingAddress ? <Text>Budynek: {buildingAddress}</Text> : null}
              {apartmentNumber ? <Text>Lokal: {apartmentNumber}</Text> : null}
            </View>
          </View>
        )}

        <Text style={styles.para}>Szanowni Państwo,</Text>

        <Text style={styles.para}>
          Zwracam się z prośbą o przeprowadzenie weryfikacji systemu przygotowania i dystrybucji
          ciepłej wody użytkowej (CWU) w budynku, w związku z rozbieżnościami między faktycznymi
          kosztami a wartościami teoretycznymi, wynikającymi z fizyki procesu podgrzewania wody.
        </Text>

        <Text style={styles.h2}>1. WPROWADZENIE I CEL ANALIZY</Text>

        <Text style={styles.para}>
          Przeprowadzona analiza miała na celu ocenę efektywności ekonomicznej systemu CWU oraz
          identyfikację potencjalnych źródeł nadmiernych kosztów ponoszonych przez mieszkańców.
          Porównano rzeczywiste koszty CWU widniejące w rachunkach z kosztami teoretycznymi,
          obliczonymi na podstawie parametrów termodynamicznych oraz taryfy ciepła sieciowego.
        </Text>

        <Text style={styles.para}>
          Analiza objęła następujące aspekty:
        </Text>
        <View style={styles.section}>
          <Text style={styles.bullet}>
            • Weryfikację zgodności stawek CWU z rzeczywistymi kosztami energii cieplnej
          </Text>
          <Text style={styles.bullet}>
            • Oszacowanie strat ciepła w systemie przygotowania i dystrybucji CWU
          </Text>
          <Text style={styles.bullet}>
            • Ocenę opłacalności obecnego modelu rozliczeń
          </Text>
          <Text style={styles.bullet}>
            • Identyfikację obszarów wymagających interwencji technicznej
          </Text>
        </View>

        <Text style={styles.h2}>2. PARAMETRY WEJŚCIOWE ANALIZY</Text>

        <Text style={styles.para}>
          Obliczenia przeprowadzono w oparciu o następujące dane wejściowe, pochodzące z rachunku
          oraz parametrów technicznych instalacji:
        </Text>

        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={styles.tableCellBold}>Parametr</Text>
            <Text style={styles.tableCellBold}>Wartość</Text>
            <Text style={styles.tableCellBold}>Jednostka</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>Cena CWU z rachunku</Text>
            <Text style={styles.tableCell}>{n(i.cwuPriceFromBill)}</Text>
            <Text style={styles.tableCell}>zł/m³</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>Cena ciepła sieciowego</Text>
            <Text style={styles.tableCell}>{n(i.heatPriceFromCity)}</Text>
            <Text style={styles.tableCell}>zł/GJ</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>Zużycie CWU (miesięczne)</Text>
            <Text style={styles.tableCell}>{n(i.monthlyConsumption)}</Text>
            <Text style={styles.tableCell}>m³/mies.</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>Temperatura wody zimnej</Text>
            <Text style={styles.tableCell}>{n(i.coldWaterTemp)}</Text>
            <Text style={styles.tableCell}>°C</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>Temperatura CWU</Text>
            <Text style={styles.tableCell}>{n(i.hotWaterTemp)}</Text>
            <Text style={styles.tableCell}>°C</Text>
          </View>
        </View>

        <Text style={styles.h2}>3. WYNIKI OBLICZEŃ TEORETYCZNYCH</Text>

        <Text style={styles.para}>
          Na podstawie pierwszej zasady termodynamiki oraz właściwości cieplnych wody obliczono
          teoretyczne zapotrzebowanie na energię do podgrzania 1 m³ wody oraz wynikający z tego
          koszt jednostkowy:
        </Text>

        <View style={styles.highlight}>
          <Text style={{ fontWeight: 700, marginBottom: 6 }}>Kluczowe wyniki:</Text>
          <Text>• Energia na 1 m³: {n(r.energyPerM3, 4)} GJ/m³</Text>
          <Text>• Koszt teoretyczny: {n(r.theoreticalCostPerM3)} zł/m³</Text>
          <Text>• Cena CWU z rachunku: {n(i.cwuPriceFromBill)} zł/m³</Text>
          <Text style={{ marginTop: 6, fontWeight: 700 }}>
            • Nadpłata na m³: {n(r.lossPerM3)} zł/m³
          </Text>
        </View>

        <Text style={styles.h2}>4. ANALIZA ROZBIEŻNOŚCI KOSZTOWYCH</Text>

        <Text style={styles.para}>
          Różnica między ceną CWU z rachunku a kosztem teoretycznym wskazuje na występowanie strat
          w systemie. Możliwe przyczyny obejmują:
        </Text>

        <Text style={styles.h3}>4.1. Straty ciepła w cyrkulacji CWU</Text>
        <Text style={styles.para}>
          Nieizolowane lub źle zaizolowane przewody cyrkulacyjne powodują ciągłe straty ciepła,
          szczególnie w godzinach nocnych, gdy pobór wody jest minimalny. Szacuje się, że w
          starszych budynkach straty te mogą wynosić 30-50% całkowitego zużycia energii na CWU.
        </Text>

        <Text style={styles.h3}>4.2. Niezrównoważenie hydrauliczne instalacji</Text>
        <Text style={styles.para}>
          Brak równoważenia hydraulicznego prowadzi do nadmiernych przepływów w niektórych
          odcinkach cyrkulacji, co zwiększa straty oraz wymusza wyższe temperatury zasilania.
        </Text>

        <Text style={styles.h3}>4.3. Nieefektywny tryb pracy pompy cyrkulacyjnej</Text>
        <Text style={styles.para}>
          Pompa cyrkulacyjna pracująca 24h/dobę w okresach małego zapotrzebowania generuje
          niepotrzebne straty. Zaleca się stosowanie sterowania czasowego lub sterowania na
          podstawie temperatury powrotu.
        </Text>

        <Text style={styles.h3}>4.4. Marża zarządcy/dostawcy</Text>
        <Text style={styles.para}>
          Część różnicy może wynikać z narzutu administracyjnego, konserwacyjnego lub opłat za
          utrzymanie węzła. Wysokość takiej marży powinna być transparentna i uzasadniona kosztami
          rzeczywistymi.
        </Text>

        {/* Przejście na drugą stronę */}
        <View style={styles.pageBreak} break>
          <Text style={styles.h2}>5. SKUTKI FINANSOWE DLA MIESZKAŃCÓW</Text>

          <Text style={styles.para}>
            Łączne skutki finansowe występującej rozbieżności przedstawiają się następująco:
          </Text>

          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={styles.tableCellBold}>Pozycja</Text>
              <Text style={styles.tableCellBold}>Kwota</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Nadpłata miesięczna (lokal)</Text>
              <Text style={styles.tableCell}>{n(r.monthlyFinancialLoss)} zł</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Nadpłata roczna (lokal)</Text>
              <Text style={styles.tableCell}>{n(r.yearlyFinancialLoss)} zł</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Nadpłata roczna (budynek)*</Text>
              <Text style={styles.tableCell}>
                {n((r.yearlyFinancialLoss ?? 0) * ((i.apartmentsCount as number) || 40))} zł
              </Text>
            </View>
          </View>

          <Text style={styles.small}>
            * Szacunek dla całego budynku przy założeniu {(i.apartmentsCount as number) || 40}{" "}
            lokali o zbliżonym zużyciu
          </Text>

          <Text style={[styles.para, { marginTop: 10 }]}>
            Skala problemu jest znacząca. W perspektywie wieloletniej (np. 10 lat) łączne straty
            finansowe mieszkańców mogą osiągnąć wartość kilkudziesięciu tysięcy złotych, co
            uzasadnia podjęcie działań naprawczych nawet przy założeniu istotnych nakładów
            inwestycyjnych.
          </Text>

          <Text style={styles.h2}>6. REKOMENDACJE I DZIAŁANIA NAPRAWCZE</Text>

          <Text style={styles.para}>
            W celu ograniczenia kosztów CWU i poprawy efektywności systemu zaleca się rozważenie
            następujących działań:
          </Text>

          <Text style={styles.h3}>6.1. Działania krótkoterminowe (0-3 miesiące)</Text>
          <View style={styles.section}>
            <Text style={styles.bullet}>
              • Weryfikacja faktycznej struktury kosztów CWU i przedstawienie jej mieszkańcom
            </Text>
            <Text style={styles.bullet}>
              • Audyt izolacji cieplnej przewodów cyrkulacyjnych (termowizja, pomiary temperatury)
            </Text>
            <Text style={styles.bullet}>
              • Sprawdzenie ustawień pompy cyrkulacyjnej i możliwości wprowadzenia sterowania
              czasowego
            </Text>
            <Text style={styles.bullet}>
              • Kontrola temperatury zasilania CWU (czy nie jest zawyżona ponad normy)
            </Text>
          </View>

          <Text style={styles.h3}>6.2. Działania średnioterminowe (3-12 miesięcy)</Text>
          <View style={styles.section}>
            <Text style={styles.bullet}>
              • Docieplenie przewodów cyrkulacyjnych (szczególnie w piwnicach i szachtach)
            </Text>
            <Text style={styles.bullet}>
              • Równoważenie hydrauliczne instalacji CWU (zastawki regulacyjne, pomiary)
            </Text>
            <Text style={styles.bullet}>
              • Modernizacja automatyki węzła cieplnego (sterownik pogodowy, harmonogramy czasowe)
            </Text>
            <Text style={styles.bullet}>
              • Wymiana pompy cyrkulacyjnej na wysokosprawną z możliwością regulacji wydajności
            </Text>
          </View>

          <Text style={styles.h3}>6.3. Działania długoterminowe (12-36 miesięcy)</Text>
          <View style={styles.section}>
            <Text style={styles.bullet}>
              • Rozważenie decentralizacji przygotowania CWU (przepływowe podgrzewacze w lokalach)
            </Text>
            <Text style={styles.bullet}>
              • Analiza opłacalności instalacji kolektorów słonecznych (wspomaganie przygotowania
              CWU)
            </Text>
            <Text style={styles.bullet}>
              • Wymiana węzła cieplnego na nowoczesny z zasobnikiem warstwowym
            </Text>
            <Text style={styles.bullet}>
              • Instalacja inteligentnego systemu monitoringu zużycia i strat energii
            </Text>
          </View>
        </View>

        {/* Trzecia strona */}
        <View style={styles.pageBreak} break>
          <Text style={styles.h2}>7. ASPEKTY PRAWNE I OBOWIĄZKI ZARZĄDCY</Text>

          <Text style={styles.para}>
            Zgodnie z art. 4 ust. 1 ustawy o własności lokali, zarządca jest obowiązany do
            należytego zarządu nieruchomością wspólną, co obejmuje zapewnienie prawidłowego
            funkcjonowania instalacji oraz racjonalne gospodarowanie środkami finansowymi
            właścicieli.
          </Text>

          <Text style={styles.para}>
            Przepisy rozporządzenia Ministra Infrastruktury w sprawie warunków technicznych
            budynków i ich usytuowania nakładają wymagania dotyczące izolacji cieplnej instalacji
            oraz efektywności systemów grzewczych. Nadmierne straty ciepła mogą świadczyć o
            niespełnieniu tych wymagań.
          </Text>

          <Text style={styles.para}>
            W świetle powyższego, zwracam się z wnioskiem o:
          </Text>
          <View style={styles.section}>
            <Text style={styles.bullet}>
              1. Przedstawienie szczegółowego rozliczenia kosztów CWU za ostatni rok kalendarzowy
            </Text>
            <Text style={styles.bullet}>
              2. Zlecenie audytu energetycznego instalacji CWU przez uprawnionego rzeczoznawcę
            </Text>
            <Text style={styles.bullet}>
              3. Opracowanie planu działań naprawczych z harmonogramem i kosztorysem
            </Text>
            <Text style={styles.bullet}>
              4. Przedstawienie wyników audytu i planu działań na zebraniu wspólnoty mieszkaniowej
            </Text>
          </View>

          <Text style={styles.h2}>8. POTENCJALNE OSZCZĘDNOŚCI</Text>

          <Text style={styles.para}>
            Na podstawie doświadczeń z podobnych modernizacji można oszacować potencjalne
            oszczędności:
          </Text>

          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={styles.tableCellBold}>Zakres prac</Text>
              <Text style={styles.tableCellBold}>Redukcja kosztów</Text>
              <Text style={styles.tableCellBold}>Nakład inwestycyjny*</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Docieplenie przewodów</Text>
              <Text style={styles.tableCell}>10-15%</Text>
              <Text style={styles.tableCell}>15 000 - 30 000 zł</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Równoważenie hydrauliczne</Text>
              <Text style={styles.tableCell}>5-10%</Text>
              <Text style={styles.tableCell}>5 000 - 15 000 zł</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Sterowanie pompą</Text>
              <Text style={styles.tableCell}>15-25%</Text>
              <Text style={styles.tableCell}>3 000 - 8 000 zł</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Kompleksowa modernizacja</Text>
              <Text style={styles.tableCell}>30-50%</Text>
              <Text style={styles.tableCell}>50 000 - 150 000 zł</Text>
            </View>
          </View>

          <Text style={styles.small}>* Szacunki dla budynku 40-60 lokali</Text>

          <Text style={[styles.para, { marginTop: 10 }]}>
            Przy założeniu oszczędności na poziomie 30% (realistyczny scenariusz po kompleksowej
            modernizacji), roczne oszczędności dla całego budynku mogłyby wynieść ok.{" "}
            {n((r.yearlyFinancialLoss ?? 0) * ((i.apartmentsCount as number) || 40) * 0.3)} zł,
            co daje okres zwrotu inwestycji na poziomie 3-5 lat.
          </Text>

          <Text style={styles.h2}>9. PODSUMOWANIE I WNIOSKI</Text>

          <Text style={styles.para}>
            Przeprowadzona analiza wykazała istotną rozbieżność między teoretycznymi kosztami
            przygotowania CWU a kwotami faktycznie płaconymi przez mieszkańców. Skala problemu
            uzasadnia podjęcie działań weryfikacyjnych i modernizacyjnych.
          </Text>

          <Text style={styles.para}>
            Należy podkreślić, że przedstawione wyniki bazują na danych wprowadzonych przez
            mieszkańca oraz publicznie dostępnych taryfach ciepła. W celu dokładniejszej diagnozy
            konieczne jest przeprowadzenie profesjonalnego audytu energetycznego z pomiarami
            in-situ.
          </Text>

          <View style={styles.highlight}>
            <Text style={{ fontWeight: 700 }}>Prośba o odpowiedź:</Text>
            <Text style={{ marginTop: 4 }}>
              Uprzejmie proszę o pisemną odpowiedź na niniejsze pismo w terminie 14 dni od daty
              otrzymania, zawierającą stanowisko Zarządcy w sprawie przedstawionych ustaleń oraz
              informację o planowanych działaniach naprawczych.
            </Text>
          </View>

          <Text style={styles.para}>
            W razie potrzeby jestem gotów przedstawić pełną dokumentację obliczeń oraz wziąć udział
            w spotkaniu w celu omówienia szczegółów analizy.
          </Text>

          <View style={styles.sign}>
            <Text>Z poważaniem,</Text>
            <Text style={{ marginTop: 16 }}>__________________________________</Text>
            <Text style={{ marginTop: 4 }}>{residentName || "Mieszkaniec"}</Text>
            {apartmentNumber && (
              <Text style={{ fontSize: 10, marginTop: 2 }}>Lokal nr {apartmentNumber}</Text>
            )}
            {(residentEmail || residentPhone) && (
              <Text style={{ marginTop: 10, fontSize: 10 }}>
                Kontakt: {[residentEmail, residentPhone].filter(Boolean).join(" | ")}
              </Text>
            )}
          </View>

          <Text style={[styles.small, { marginTop: 24, textAlign: "center" }]}>
            Dokument wygenerowany automatycznie przez system PROFINSTAL (profinstal.info)
          </Text>
          <Text style={[styles.small, { textAlign: "center" }]}>
            Data wygenerowania: {createdAt.toLocaleString("pl-PL")}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
