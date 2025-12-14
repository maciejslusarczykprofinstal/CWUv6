import { Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    paddingTop: 10,
    borderTop: "1pt solid #d1d5db",
  },
  text: {
    fontSize: 9,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 2,
  },
});

export const PdfFooter = () => (
  <View style={styles.container}>
    <Text style={styles.text}>
      Raport został wygenerowany automatycznie za pomocą serwisu branżowego profinstal.info.
    </Text>
    <Text style={styles.text}>
      © 2025 PROF INSTAL — Wszystkie prawa zastrzeżone. Kopiowanie lub rozpowszechnianie bez zgody autora zabronione.
    </Text>
  </View>
);
