import { Pressable, StyleSheet, Text, View } from "react-native";
import type { Conta } from "@organizalar/contracts";
import { corDaConta, formatDateBR, formatMoney } from "../utils/format.js";

type Props = {
  conta: Conta;
  onPress: () => void;
};

export function ContaListItem({ conta, onPress }: Props) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <View style={[styles.dot, { backgroundColor: corDaConta(conta.status, conta.vencimento) }]} />
      <View style={styles.info}>
        <Text style={styles.nome}>{conta.nome}</Text>
        <Text style={styles.detalhe}>
          {conta.categoria} · vence {formatDateBR(conta.vencimento)}
        </Text>
      </View>
      <Text style={styles.valor}>{formatMoney(conta.valorCentavos)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  info: { flex: 1 },
  nome: { fontSize: 16, fontWeight: "600" },
  detalhe: { fontSize: 13, color: "#64748b", marginTop: 2 },
  valor: { fontSize: 15, fontWeight: "600" },
});
