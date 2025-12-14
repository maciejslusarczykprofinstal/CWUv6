/* eslint-disable @typescript-eslint/no-explicit-any */
import { Document, Font, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { PdfFooter } from "./components/PdfFooter";

const PDF_FONT_FAMILY = "Roboto";

// Rejestracja czcionek tylko w przeglądarce.
// W aplikacji PDF generujemy po stronie klienta, więc wystarczy URL z `public/`.
// Testy Node rejestrują te same fonty lokalnie (ścieżką do pliku).
if (typeof window !== "undefined") {
  try {
    Font.register({
      family: PDF_FONT_FAMILY,
      fonts: [
        { src: "/fonts/Roboto-Regular.ttf", fontWeight: 400 },
        { src: "/fonts/Roboto-Bold.ttf", fontWeight: 700 },
      ],
    });
  } catch {
    // brak: wielokrotne rejestracje w HMR nie powinny wywracać renderu
  }
}

const styles = StyleSheet.create({
  page: {
    paddingTop: 48,
    paddingBottom: 200,
    paddingHorizontal: 48,
    fontSize: 11,
    lineHeight: 1.35,
    fontFamily: PDF_FONT_FAMILY,
    color: "#111",
  },

  headerRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 18 },
  headerColLeft: { width: "52%" },
  headerColRight: { width: "45%", alignItems: "flex-end" },
  blockTitle: { fontSize: 10, fontWeight: 700, marginBottom: 3 },
  monoSmall: { fontSize: 10, color: "#444" },
  bold: { fontWeight: 700 },
  label: { fontWeight: 700 },
  title: { fontSize: 13, fontWeight: 700, textAlign: "center", marginVertical: 14 },
  sectionTitle: { fontSize: 12, fontWeight: 700, marginTop: 12, marginBottom: 6 },
  para: { marginBottom: 8, textAlign: "justify" },
  listItem: { marginLeft: 14, marginBottom: 3 },
  reasonBox: { marginTop: 8, paddingTop: 6, borderTopWidth: 1, borderTopColor: "#ddd" },
  reasonTitle: { fontSize: 11, fontWeight: 700, marginBottom: 4 },

  table: { marginTop: 6, borderWidth: 1, borderColor: "#ddd" },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#ddd" },
  tableRowLast: { flexDirection: "row" },
  tableKey: { width: "58%", padding: 6, fontSize: 10, fontWeight: 700, backgroundColor: "#f5f5f5" },
  tableVal: { width: "42%", padding: 6, fontSize: 10 },

  footer: {
    position: "absolute",
    left: 48,
    right: 48,
    bottom: 90,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#999",
  },
  footerRow: { flexDirection: "row", justifyContent: "space-between" },
  signatureBox: { width: "48%" },
  signatureLine: { marginTop: 18, borderBottomWidth: 1, borderBottomColor: "#111" },
  footerNote: { fontSize: 9, color: "#444", marginTop: 6 },
  pageNumber: { position: "absolute", right: 0, top: 0, fontSize: 9, color: "#444" },

  pdfFooterFixed: {
    position: "absolute",
    left: 48,
    right: 48,
    bottom: 24,
  },
});

function n(v: unknown, d = 2) {
  const x = Number(v);
  return Number.isFinite(x) ? x.toFixed(d) : "-";
}

function moneyPLN(v: unknown) {
  const x = Number(v);
  if (!Number.isFinite(x)) return "-";
  return x.toLocaleString("pl-PL", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " zł";
}

function cityDatePL(city: string, createdAt: Date) {
  const d = createdAt.toLocaleDateString("pl-PL");
  const c = (city ?? "").trim();
  return c ? `${c}, ${d}` : d;
}

function renderMultiline(text: string) {
  return (text ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, idx) => <Text key={`${idx}-${line}`}>{line}</Text>);
}

export type IssueLetterReason = {
  id: string;
  label: string;
  title: string;
  technicalDescription: string;
  consequences: string[];
  recommendedActions: string[];
};

export type ResidentCwuIssueLetterInput = {
  reasons?: IssueLetterReason[];
  otherReason?: string;
  description?: string;
};

export type ResidentCwuIssueFormSnapshot = {
  fullName: string;
  email: string;
  phone: string;
  street: string;
  buildingNumber: string;
  apartmentNumber: string;

  letterCity: string;

  managerName: string;
  managerAddress: string;
  managerEmail: string;

  problemType: "brak_cwu" | "niska_temp" | "dlugi_czas" | "wahania" | "zawyzony_koszt" | "inne";
  otherProblem: string;

  symptoms: {
    longFlush: boolean;
    coolsFast: boolean;
    unstableTemp: boolean;
    specificHours: boolean;
    longTime: boolean;
  };

  description: string;
  goal: "sprawdzenie" | "interwencja" | "analiza_kosztow" | "informacja";
};

export function ResidentCwuIssueLetterPDFDocument({
  input,
  result,
  complaint,
  issue,
  createdAt = new Date(),
}: {
  input: any;
  result: any;
  complaint: ResidentCwuIssueLetterInput;
  issue?: ResidentCwuIssueFormSnapshot;
  createdAt?: Date;
}) {
  const i = (input ?? {}) as Record<string, any>;
  const r = (result ?? {}) as Record<string, any>;

  const reasons = (complaint?.reasons ?? []).filter(Boolean) as IssueLetterReason[];
  const otherReason = (complaint?.otherReason ?? "").trim();
  const complaintExtraDescription = (complaint?.description ?? "").trim();

  const issueProblemLabelMap: Record<ResidentCwuIssueFormSnapshot["problemType"], string> = {
    brak_cwu: "Brak ciepłej wody",
    niska_temp: "Zbyt niska temperatura ciepłej wody",
    dlugi_czas: "Długi czas oczekiwania na ciepłą wodę",
    wahania: "Duże wahania temperatury",
    zawyzony_koszt: "Podejrzenie zawyżonych kosztów CWU",
    inne: "Inny problem",
  };

  const issueGoalLabelMap: Record<ResidentCwuIssueFormSnapshot["goal"], string> = {
    sprawdzenie: "Prośba o sprawdzenie instalacji",
    interwencja: "Prośba o interwencję techniczną",
    analiza_kosztow: "Prośba o analizę kosztów CWU",
    informacja: "Informacja do administracji",
  };

  const issueSymptomsPicked = (() => {
    const s = issue?.symptoms;
    if (!s) return [] as string[];
    const list: Array<[boolean, string]> = [
      [s.longFlush, "Ciepła woda pojawia się dopiero po długim spuszczaniu"],
      [s.coolsFast, "Woda szybko stygnie"],
      [s.unstableTemp, "Temperatura jest niestabilna"],
      [s.specificHours, "Problem występuje tylko w określonych godzinach"],
      [s.longTime, "Problem występuje od dłuższego czasu"],
    ];
    return list.filter(([v]) => v).map(([, label]) => label);
  })();

  const senderName = issue?.fullName?.trim() || "";
  const senderEmail = issue?.email?.trim() || "";
  const senderPhone = issue?.phone?.trim() || "";
  const senderAddress = issue
    ? `${issue.street || ""} ${issue.buildingNumber || ""}${issue.apartmentNumber ? `/${issue.apartmentNumber}` : ""}`.trim()
    : "";

  const recipientName = issue?.managerName?.trim() || "";
  const recipientAddress = issue?.managerAddress?.trim() || "";
  const recipientEmail = issue?.managerEmail?.trim() || "";
  const letterCity = issue?.letterCity?.trim() || "";

  const hasAnyCostData =
    Number.isFinite(Number(i.cwuPriceFromBill)) ||
    Number.isFinite(Number(r.theoreticalCostPerM3)) ||
    Number.isFinite(Number(r.lossPerM3)) ||
    Number.isFinite(Number(r.monthlyFinancialLoss)) ||
    Number.isFinite(Number(r.yearlyFinancialLoss));

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <View style={styles.headerColLeft}>
            <Text style={styles.blockTitle}>Nadawca (mieszkaniec)</Text>
            <Text style={styles.bold}>{senderName || "—"}</Text>
            {senderAddress ? <Text>{senderAddress}</Text> : <Text>—</Text>}
            {senderEmail ? <Text>E-mail: {senderEmail}</Text> : null}
            {senderPhone ? <Text>Tel.: {senderPhone}</Text> : null}
          </View>

          <View style={styles.headerColRight}>
            <Text style={styles.monoSmall}>{cityDatePL(letterCity, createdAt)}</Text>
            <View style={{ marginTop: 10, alignItems: "flex-end" }}>
              <Text style={styles.blockTitle}>Adresat (Zarządca/Administracja)</Text>
              <Text style={styles.bold}>{recipientName || "—"}</Text>
              {recipientAddress ? renderMultiline(recipientAddress) : <Text>—</Text>}
              {recipientEmail ? <Text>E-mail: {recipientEmail}</Text> : null}
            </View>
          </View>
        </View>

        <Text style={styles.title}>
          Zgłoszenie nieprawidłowości w kosztach podgrzania ciepłej wody użytkowej (CWU)
        </Text>

        <Text style={styles.para}>Szanowni Państwo,</Text>
        <Text style={styles.para}>
          Zgłaszam wątpliwości dotyczące wysokości kosztów podgrzania ciepłej wody użytkowej (CWU) wykazywanych w
          rozliczeniach oraz proszę o wyjaśnienie sposobu naliczania opłat i weryfikację techniczną pracy instalacji CWU i
          cyrkulacji w budynku.
        </Text>

        <Text style={styles.sectionTitle}>1. Opis zgłoszenia</Text>
        {issue ? (
          <>
            <Text style={styles.para}>
              <Text style={styles.label}>Adres lokalu:</Text> {issue.street || "—"} {issue.buildingNumber || "—"}
              {issue.apartmentNumber ? `/${issue.apartmentNumber}` : ""}
            </Text>
            <Text style={styles.para}>
              <Text style={styles.label}>Rodzaj problemu:</Text> {issueProblemLabelMap[issue.problemType]}
              {issue.problemType === "inne" && issue.otherProblem.trim() ? ` (doprecyzowanie: ${issue.otherProblem.trim()})` : ""}
            </Text>

            {issueSymptomsPicked.length ? (
              <>
                <Text style={styles.para}>
                  <Text style={styles.label}>Zaobserwowane objawy:</Text>
                </Text>
                <View style={{ marginBottom: 6 }}>
                  {issueSymptomsPicked.map((x) => (
                    <Text key={x} style={styles.listItem}>
                      • {x}
                    </Text>
                  ))}
                </View>
              </>
            ) : null}

            {issue.description.trim() ? (
              <>
                <Text style={styles.para}>
                  <Text style={styles.label}>Opis sytuacji:</Text>
                </Text>
                <Text style={styles.para}>{issue.description.trim()}</Text>
              </>
            ) : null}

            <Text style={styles.para}>
              <Text style={styles.label}>Cel zgłoszenia:</Text> {issueGoalLabelMap[issue.goal]}
            </Text>
          </>
        ) : (
          <Text style={styles.para}>—</Text>
        )}

        {otherReason || complaintExtraDescription ? (
          <>
            <Text style={styles.para}>
              <Text style={styles.label}>Dodatkowe uwagi:</Text>
            </Text>
            {otherReason ? <Text style={styles.para}>Inne: {otherReason}</Text> : null}
            {complaintExtraDescription ? <Text style={styles.para}>{complaintExtraDescription}</Text> : null}
          </>
        ) : null}

        <Text style={styles.sectionTitle}>2. Potencjalne przyczyny techniczne i rekomendowane działania</Text>
        {reasons.length ? (
          <>
            {reasons.map((reason) => (
              <View key={reason.id} style={styles.reasonBox}>
                <Text style={styles.reasonTitle}>{reason.title || reason.label}</Text>
                <Text style={styles.para}>
                  <Text style={styles.label}>Opis techniczny:</Text> {reason.technicalDescription}
                </Text>

                {reason.consequences?.length ? (
                  <>
                    <Text style={styles.para}>
                      <Text style={styles.label}>Konsekwencje:</Text>
                    </Text>
                    {reason.consequences.map((c) => (
                      <Text key={c} style={styles.listItem}>
                        • {c}
                      </Text>
                    ))}
                  </>
                ) : null}

                {reason.recommendedActions?.length ? (
                  <>
                    <Text style={[styles.para, { marginTop: 6 }]}>
                      <Text style={styles.label}>Rekomendowane działania:</Text>
                    </Text>
                    {reason.recommendedActions.map((a) => (
                      <Text key={a} style={styles.listItem}>
                        • {a}
                      </Text>
                    ))}
                  </>
                ) : null}
              </View>
            ))}
          </>
        ) : (
          <Text style={styles.para}>Nie wskazano przyczyn technicznych w formularzu.</Text>
        )}

        <Text style={styles.sectionTitle}>3. Podsumowanie kosztowe (na podstawie danych wprowadzonych do kalkulatora)</Text>
        {hasAnyCostData ? (
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={styles.tableKey}>Cena CWU z rachunku</Text>
              <Text style={styles.tableVal}>{moneyPLN(i.cwuPriceFromBill)} / m³</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableKey}>Koszt teoretyczny (podgrzanie 1 m³)</Text>
              <Text style={styles.tableVal}>{moneyPLN(r.theoreticalCostPerM3)} / m³</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableKey}>Różnica (nadpłata) na 1 m³</Text>
              <Text style={styles.tableVal}>{moneyPLN(r.lossPerM3)} / m³</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableKey}>Zużycie miesięczne (z danych mieszkańca)</Text>
              <Text style={styles.tableVal}>{n(i.monthlyConsumption, 2)} m³/mies.</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableKey}>Szacowana nadpłata miesięczna</Text>
              <Text style={styles.tableVal}>{moneyPLN(r.monthlyFinancialLoss)} / mies.</Text>
            </View>
            <View style={styles.tableRowLast}>
              <Text style={styles.tableKey}>Szacowana nadpłata roczna</Text>
              <Text style={styles.tableVal}>{moneyPLN(r.yearlyFinancialLoss)} / rok</Text>
            </View>
          </View>
        ) : (
          <Text style={styles.para}>Brak wystarczających danych do podsumowania kosztowego.</Text>
        )}

        <Text style={styles.sectionTitle}>4. Prośba o działania naprawcze i wyjaśnienie rozliczeń</Text>
        <Text style={styles.para}>Wnoszę o:</Text>
        <Text style={styles.listItem}>• Pisemne wyjaśnienie metody naliczania opłat CWU oraz składowych ceny CWU.</Text>
        <Text style={styles.listItem}>
          • Weryfikację techniczną parametrów pracy instalacji CWU i cyrkulacji (m.in. nastawy, czasy pracy, regulacja,
          izolacja).
        </Text>
        <Text style={styles.listItem}>• Informację o planowanych działaniach i przewidywanym terminie realizacji.</Text>

        <Text style={[styles.para, { marginTop: 10 }]}>
          Warto rozważyć wykonanie kompleksowego audytu instalacji CWU, który pozwoli precyzyjnie określić źródła strat
          oraz zaplanować najbardziej opłacalny wariant modernizacji.
        </Text>

        <Text style={[styles.para, { marginTop: 8 }]}>Z poważaniem,</Text>
        <Text style={styles.bold}>{senderName || "(podpis mieszkańca)"}</Text>

        <View style={styles.footer} fixed>
          <Text
            style={styles.pageNumber}
            render={({ pageNumber, totalPages }) => `Strona ${pageNumber} / ${totalPages}`}
            fixed
          />
          <View style={styles.footerRow}>
            <View style={styles.signatureBox}>
              <Text style={styles.blockTitle}>Podpis mieszkańca</Text>
              <View style={styles.signatureLine} />
              {senderName ? <Text style={styles.footerNote}>{senderName}</Text> : null}
            </View>
            <View style={styles.signatureBox}>
              <Text style={styles.blockTitle}>Podpis / potwierdzenie Zarządcy</Text>
              <View style={styles.signatureLine} />
              <Text style={styles.footerNote}>Data i podpis</Text>
            </View>
          </View>
        </View>

        <View style={styles.pdfFooterFixed} fixed>
          <PdfFooter />
        </View>
      </Page>
    </Document>
  );
}
