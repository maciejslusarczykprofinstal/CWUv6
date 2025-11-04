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

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Branding */}
        <View style={styles.brandRow}>
          <View style={styles.brandLeft}>
            <Image 
              src="https://avatars.githubusercontent.com/u/maciejslusarczykprofinstal" 
              style={styles.logo}
            />
            <Text style={styles.brand}>PROFINSTAL</Text>
          </View>
          <Link src="https://profinstal.info" style={styles.site}>
            profinstal.info
          </Link>
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
            <Text style={styles.row}>
              Płatność teoretyczna (mies.): {n(r.theoreticalMonthlyPayment)} zł/mies.
            </Text>
            <Text style={styles.row}>
              Płatność rzeczywista (mies.): {n(r.actualMonthlyPayment)} zł/mies.
            </Text>
            <Text style={styles.row}>
              Strata finansowa (mies.): {n(r.monthlyFinancialLoss)} zł/mies.
            </Text>
          </View>
        </View>

        <Text style={styles.h2}>3. Ekstrapolacja (rok)</Text>
        <View>
          <Text style={styles.row}>Strata energii (rok): {n(r.yearlyEnergyLoss, 3)} GJ/rok</Text>
          <Text style={styles.row}>Strata finansowa (rok): {n(r.yearlyFinancialLoss)} zł/rok</Text>
        </View>

        <Text style={styles.h2}>4. Uwagi</Text>
        <View>
          <Text style={styles.row}>
            • Energia na m³ liczona jako 0,004186 × (T_CWU − T_zimna) [GJ/m³].
          </Text>
          <Text style={styles.row}>
            • Koszt teoretyczny = energia na m³ × cena ciepła [zł/m³].
          </Text>
          <Text style={styles.row}>
            • Strata finansowa = (cena z rachunku − koszt teoretyczny) × zużycie [zł].
          </Text>
          <Text style={styles.row}>
            • Raport wygenerowano automatycznie na podstawie wprowadzonych danych.
          </Text>
        </View>

        <View style={{ marginTop: 24, paddingTop: 12, borderTop: "1px solid #ddd" }}>
          <Text style={{ fontSize: 9, color: "#666", textAlign: "center" }}>
            © 2025 PROF INSTAL Maciej Ślusarczyk. Wszelkie prawa zastrzeżone.
          </Text>
        </View>
      </Page>
    </Document>
  );
}
