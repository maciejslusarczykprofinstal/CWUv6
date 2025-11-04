/* eslint-disable @typescript-eslint/no-explicit-any */
import { Document, Page, Text, View, StyleSheet, Link, Font } from "@react-pdf/renderer";

// Rejestracja fontów z polskimi znakami
Font.register({
  family: "Roboto",
  fonts: [
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf",
      fontWeight: 300,
    },
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf",
      fontWeight: 400,
    },
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf",
      fontWeight: 500,
    },
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf",
      fontWeight: 700,
    },
  ],
});

const styles = StyleSheet.create({
  page: { padding: 48, fontSize: 12, lineHeight: 1.35, fontFamily: "Roboto" },
  header: { marginBottom: 18 },
  h1: { fontSize: 16, fontWeight: 700, marginBottom: 6 },
  small: { color: "#666" },
  para: { marginBottom: 10 },
  bullet: { marginLeft: 12, marginBottom: 4 },
  sign: { marginTop: 24 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  box: { width: "48%" },
  bold: { fontWeight: 600 },
  topRight: { alignSelf: "flex-end", marginBottom: 12 },
  brandRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  brand: { fontSize: 18, fontWeight: 700 },
  site: { fontSize: 12, color: "#1d4ed8", textDecoration: "none" },
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
          W oparciu o analizę rachunku za ciepłą wodę użytkową (CWU) oraz podstawowe parametry
          techniczne dokonano porównania kosztu teoretycznego (wynikającego z fizyki podgrzewania
          wody) z płatnościami rzeczywistymi. Wnioski wskazują na istotne odchylenie kosztów.
        </Text>

        <Text style={styles.para}>Podsumowanie kluczowych wyników:</Text>
        <View>
          <Text style={styles.bullet}>• Cena CWU z rachunku: {n(i.cwuPriceFromBill)} zł/m³</Text>
          <Text style={styles.bullet}>• Cena ciepła (miasto): {n(i.heatPriceFromCity)} zł/GJ</Text>
          <Text style={styles.bullet}>
            • Energia do podgrzania na m³: {n(r.energyPerM3, 4)} GJ/m³
          </Text>
          <Text style={styles.bullet}>
            • Koszt teoretyczny na m³: {n(r.theoreticalCostPerM3)} zł/m³
          </Text>
          <Text style={styles.bullet}>• Różnica (na m³): {n(r.lossPerM3)} zł/m³</Text>
          <Text style={styles.bullet}>
            • Strata finansowa (mies.): {n(r.monthlyFinancialLoss)} zł/mies.
          </Text>
          <Text style={styles.bullet}>
            • Strata finansowa (rok): {n(r.yearlyFinancialLoss)} zł/rok
          </Text>
        </View>

        <Text style={styles.para}>
          Uprzejmie prosimy o weryfikację przyczyn występującej różnicy oraz o poinformowanie
          mieszkańców o podjętych działaniach. Rekomendujemy w szczególności:
        </Text>
        <View>
          <Text style={styles.bullet}>
            • przegląd strat na cyrkulacji CWU (izolacja, równoważenie, tryb pracy),
          </Text>
          <Text style={styles.bullet}>
            • weryfikację parametrów rozliczenia CWU i stawek jednostkowych,
          </Text>
          <Text style={styles.bullet}>
            • rozważenie działań ograniczających straty w godzinach nocnych.
          </Text>
        </View>

        <Text style={styles.para}>
          Prosimy o odpowiedź w terminie 14 dni. Powyższe zestawienie opiera się na wprowadzonych
          przez mieszkańca danych oraz publicznie dostępnej cenie ciepła (zł/GJ). W razie potrzeby
          udostępnimy pełny raport z obliczeń.
        </Text>

        <View style={styles.sign}>
          <Text>Z poważaniem,</Text>
          <Text>__________________________________</Text>
          <Text>{residentName || "Mieszkaniec"}</Text>
          {(residentEmail || residentPhone) && (
            <Text style={{ marginTop: 8 }}>
              Dane kontaktowe: {[residentEmail, residentPhone].filter(Boolean).join(" | ")}
            </Text>
          )}
        </View>
      </Page>
    </Document>
  );
}
