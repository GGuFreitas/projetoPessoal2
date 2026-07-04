import { StyleSheet, Text, View } from "react-native";

export default function FinancasScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Finanças</Text>
      <Text style={styles.subtitle}>Em breve: saldo, metas de economia e cartões de crédito.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 8 },
  title: { fontSize: 22, fontWeight: "700" },
  subtitle: { color: "#64748b", textAlign: "center" },
});
