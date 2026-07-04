import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import type { Conta } from "@organizalar/contracts";
import * as contasApi from "../../../src/api/contas.js";
import { corDaConta, formatDateBR, formatMoney } from "../../../src/utils/format.js";

export default function ContaDetalheScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [conta, setConta] = useState<Conta | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setConta(await contasApi.getConta(id));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function marcarComoPago() {
    setSaving(true);
    try {
      setConta(await contasApi.updateConta(id, { status: "pago" }));
    } finally {
      setSaving(false);
    }
  }

  function confirmarExclusao() {
    Alert.alert("Excluir conta", "Tem certeza que deseja excluir esta conta?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          await contasApi.deleteConta(id);
          router.back();
        },
      },
    ]);
  }

  if (loading || !conta) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={[styles.badge, { backgroundColor: corDaConta(conta.status, conta.vencimento) }]}>
        <Text style={styles.badgeText}>{conta.status}</Text>
      </View>

      <Text style={styles.nome}>{conta.nome}</Text>
      <Text style={styles.valor}>{formatMoney(conta.valorCentavos)}</Text>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Categoria</Text>
        <Text style={styles.value}>{conta.categoria}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.label}>Vencimento</Text>
        <Text style={styles.value}>{formatDateBR(conta.vencimento)}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.label}>Recorrente</Text>
        <Text style={styles.value}>{conta.recorrente ? "Sim" : "Não"}</Text>
      </View>
      {conta.linhaDigitavel && (
        <View style={styles.infoRow}>
          <Text style={styles.label}>Linha digitável</Text>
          <Text style={styles.value}>{conta.linhaDigitavel}</Text>
        </View>
      )}

      {conta.status !== "pago" && (
        <Pressable style={styles.button} onPress={marcarComoPago} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Marcar como pago</Text>}
        </Pressable>
      )}

      <Pressable style={styles.deleteButton} onPress={confirmarExclusao}>
        <Text style={styles.deleteButtonText}>Excluir conta</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  container: { padding: 16, gap: 8 },
  badge: { alignSelf: "flex-start", borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { color: "#fff", fontSize: 12, fontWeight: "600", textTransform: "uppercase" },
  nome: { fontSize: 22, fontWeight: "700", marginTop: 8 },
  valor: { fontSize: 20, fontWeight: "600", color: "#0f172a", marginBottom: 12 },
  infoRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#e2e8f0" },
  label: { color: "#64748b" },
  value: { fontWeight: "500" },
  button: { backgroundColor: "#0f172a", borderRadius: 8, paddingVertical: 14, alignItems: "center", marginTop: 20 },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  deleteButton: { alignItems: "center", paddingVertical: 14 },
  deleteButtonText: { color: "#ef4444", fontWeight: "600" },
});
