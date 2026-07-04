import { StyleSheet, Text, View } from "react-native";

export default function ComprasScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Compras</Text>
      <Text style={styles.subtitle}>Em breve: lista de mercado inteligente e inventário da despensa.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 8 },
  title: { fontSize: 22, fontWeight: "700" },
  subtitle: { color: "#64748b", textAlign: "center" },
});
