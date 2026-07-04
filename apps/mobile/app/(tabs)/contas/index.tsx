import { useCallback, useState } from "react";
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import type { Conta } from "@organizalar/contracts";
import * as contasApi from "../../../src/api/contas.js";
import { ContaListItem } from "../../../src/components/ContaListItem.js";

export default function ContasIndexScreen() {
  const router = useRouter();
  const [contas, setContas] = useState<Conta[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setContas(await contasApi.listContas());
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={contas}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ContaListItem conta={item} onPress={() => router.push(`/(tabs)/contas/${item.id}`)} />
        )}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Nenhuma conta cadastrada ainda.</Text>
            </View>
          ) : null
        }
      />

      <Pressable style={styles.fab} onPress={() => router.push("/(tabs)/contas/novo")}>
        <Text style={styles.fabText}>+ Nova conta</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  empty: { padding: 32, alignItems: "center" },
  emptyText: { color: "#64748b" },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 16,
    backgroundColor: "#0f172a",
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  fabText: { color: "#fff", fontWeight: "600" },
});
