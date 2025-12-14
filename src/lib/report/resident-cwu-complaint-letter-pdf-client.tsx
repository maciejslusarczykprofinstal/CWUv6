/* eslint-disable @typescript-eslint/no-explicit-any */
import { Document, Font, Image, Link, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

Font.register({
  family: "Roboto",
  fonts: [
    { src: "/fonts/Roboto-Regular.ttf", fontWeight: 400 },
    { src: "/fonts/Roboto-Bold.ttf", fontWeight: 700 },
  ],
});

const styles = StyleSheet.create({
  page: { padding: 48, fontSize: 12, lineHeight: 1.4, fontFamily: "Roboto" },
  header: { marginBottom: 18 },
  h1: { fontSize: 16, fontWeight: 700, marginBottom: 6 },
  h2: { fontSize: 13, fontWeight: 700, marginTop: 16, marginBottom: 8 },
  small: { color: "#666", fontSize: 10 },
  para: { marginBottom: 10, textAlign: "justify" },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  box: { width: "48%" },
  bold: { fontWeight: 700 },
  topRight: { alignSelf: "flex-end", marginBottom: 16 },
  brandRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  brand: { fontSize: 18, fontWeight: 700 },
  site: { fontSize: 12, color: "#1d4ed8", textDecoration: "none" },
  logo: { width: 45, height: 45, marginRight: 10 },
  brandLeft: { flexDirection: "row", alignItems: "center" },
  highlight: { backgroundColor: "#fef3c7", padding: 8, marginVertical: 8, borderRadius: 4 },
  listItem: { marginLeft: 16, marginBottom: 4 },
  table: { marginVertical: 10, borderWidth: 1, borderColor: "#ddd" },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderColor: "#ddd" },
  tableCell: { flex: 1, padding: 6, fontSize: 10 },
  tableCellBold: { flex: 1, padding: 6, fontSize: 10, fontWeight: 700, backgroundColor: "#f5f5f5" },
  sign: { marginTop: 26 },
});

function n(v: unknown, d = 2) {
  const x = Number(v);
  return Number.isFinite(x) ? x.toFixed(d) : "-";
}

export type IssueLetterReason = {
  id: string;
  label: string;
};

export type ResidentCwuIssueLetterInput = {
  reasons?: IssueLetterReason[];
  otherReason?: string;
  description?: string;
};

export function ResidentCwuIssueLetterPDFDocument({
  input,
  result,
  complaint,
  createdAt = new Date(),
}: {
  input: any;
  result: any;
  complaint: ResidentCwuIssueLetterInput;
  createdAt?: Date;
}) {
  const i = (input ?? {}) as Record<string, any>;
  const r = (result ?? {}) as Record<string, any>;

  const managerName = (i.managerName as string) || "";
  const managerAddress = (i.managerAddress as string) || "";
  const buildingAddress = (i.buildingAddress as string) || "";
  const apartmentNumber = (i.apartmentNumber as string) || "";
  const residentName = (i.residentName as string) || "";
  const residentEmail = (i.residentEmail as string) || "";
  const residentPhone = (i.residentPhone as string) || "";
  const letterCity = (i.letterCity as string) || "";
  const letterDate = createdAt.toLocaleDateString("pl-PL");

  const reasons = (complaint?.reasons ?? []).filter(Boolean);
  const otherReason = (complaint?.otherReason ?? "").trim();
  const description = (complaint?.description ?? "").trim();

  const hasAddressBlock = managerName || managerAddress || buildingAddress || apartmentNumber;
  const hasSender = residentName || residentEmail || residentPhone;

  return (
    <Document>
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

        <View style={styles.header}>
          <Text style={styles.h1}>Zgłoszenie wysokich kosztów CWU — prośba o wyjaśnienie i weryfikację</Text>
          <Text style={styles.small}>Data: {createdAt.toLocaleString("pl-PL")}</Text>
        </View>

        {(letterCity || letterDate) && (
          <View style={styles.topRight}>
            <Text>{[letterCity, letterDate].filter(Boolean).join(", ")}</Text>
          </View>
        )}

        {hasAddressBlock && (
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

        {hasSender && (
          <View style={{ marginBottom: 12 }}>
            <Text style={styles.bold}>Nadawca:</Text>
            {residentName ? <Text>{residentName}</Text> : null}
            {residentEmail ? <Text>E-mail: {residentEmail}</Text> : null}
            {residentPhone ? <Text>Tel.: {residentPhone}</Text> : null}
          </View>
        )}

        <Text style={styles.para}>Szanowni Państwo,</Text>

        <Text style={styles.para}>
          W związku z kosztami podgrzania ciepłej wody użytkowej (CWU) wykazywanymi w rozliczeniach,
          zgłaszam wątpliwości co do zasadności i sposobu naliczania opłat oraz proszę o pisemne wyjaśnienie
          podstaw kalkulacji ceny CWU i o weryfikację techniczną instalacji CWU/cyrkulacji w budynku.
        </Text>

        <Text style={styles.h2}>1. Podstawa i skrót analizy</Text>

        <Text style={styles.para}>
          Poniżej przedstawiam porównanie kosztów teoretycznych podgrzania 1 m³ wody (wynikających z
          fizyki procesu i ceny ciepła) z kosztami faktycznie naliczanymi mieszkańcom.
        </Text>

        <View style={styles.highlight}>
          <Text style={{ fontWeight: 700, marginBottom: 6 }}>Kluczowe wartości (z kalkulacji):</Text>
          <Text>• Cena CWU z rachunku: {n(i.cwuPriceFromBill)} zł/m³</Text>
          <Text>• Koszt teoretyczny: {n(r.theoreticalCostPerM3)} zł/m³</Text>
          <Text style={{ marginTop: 6, fontWeight: 700 }}>• Różnica / nadpłata: {n(r.lossPerM3)} zł/m³</Text>
          <Text>• Strata energii (ekwiwalent): {n(r.energyLossPerM3, 4)} GJ/m³</Text>
          <Text>• Skutek miesięczny (lokal): {n(r.monthlyFinancialLoss)} zł</Text>
          <Text>• Skutek roczny (lokal): {n(r.yearlyFinancialLoss)} zł</Text>
        </View>

        <Text style={styles.h2}>2. Wskazywane przyczyny / wątpliwości</Text>

        {reasons.length === 0 && !otherReason && (
          <Text style={styles.para}>
            Na tym etapie nie wskazuję jednej przesądzającej przyczyny, natomiast oczekuję rzetelnej
            weryfikacji parametrów pracy instalacji oraz transparentnego rozbicia składowych kosztów.
          </Text>
        )}

        {(reasons.length > 0 || otherReason) && (
          <View style={{ marginBottom: 10 }}>
            {reasons.map((x) => (
              <Text key={x.id} style={styles.listItem}>
                • {x.label}
              </Text>
            ))}
            {otherReason ? <Text style={styles.listItem}>• Inne: {otherReason}</Text> : null}
          </View>
        )}

        {description ? (
          <>
            <Text style={styles.h2}>3. Opis sytuacji</Text>
            <Text style={styles.para}>{description}</Text>
          </>
        ) : null}

        <Text style={styles.h2}>4. Wnioski i żądania</Text>

        <Text style={styles.para}>Proszę o:</Text>
        <View style={{ marginBottom: 10 }}>
          <Text style={styles.listItem}>• przedstawienie sposobu kalkulacji ceny CWU (w tym opłat stałych i zmiennych),</Text>
          <Text style={styles.listItem}>• wskazanie parametrów pracy instalacji CWU/cyrkulacji i sposobu sterowania pompami,</Text>
          <Text style={styles.listItem}>• przedstawienie działań ograniczających straty (izolacja, regulacja hydrauliczna, nastawy),</Text>
          <Text style={styles.listItem}>
            • wykonanie rzetelnego przeglądu efektywności instalacji CWU (pomiary temperatur, przepływów i bilansu energii)
            oraz przedstawienie planu działań naprawczych.
          </Text>
        </View>

        <Text style={styles.para}>
          Z uwagi na wskazaną skalę rozbieżności proszę o odpowiedź w formie pisemnej oraz o wskazanie
          terminu planowanej weryfikacji technicznej.
        </Text>

        <Text style={styles.h2}>Załączniki</Text>
        <View style={{ marginBottom: 10 }}>
          <Text style={styles.listItem}>• wynik kalkulacji kosztów i strat CWU (wydruk / PDF),</Text>
          <Text style={styles.listItem}>• kopia fragmentu rachunku z ceną CWU i zużyciem (jeśli dostępna).</Text>
        </View>

        <View style={styles.sign}>
          <Text>Z poważaniem,</Text>
          <Text style={{ marginTop: 18 }}>.............................................</Text>
          {residentName ? <Text style={{ marginTop: 6 }}>{residentName}</Text> : null}
        </View>

        <Text style={{ marginTop: 18, fontSize: 9, color: "#666" }}>
          Uwaga: dokument jest generowany automatycznie na podstawie danych wprowadzonych przez użytkownika.
        </Text>
      </Page>
    </Document>
  );
}
