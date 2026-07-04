import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import type { CreateContaInput } from "@organizalar/contracts";

type Props = {
  onSubmit: (input: CreateContaInput) => Promise<void>;
  submitLabel?: string;
};

export function ContaForm({ onSubmit, submitLabel = "Salvar" }: Props) {
  const [nome, setNome] = useState("");
  const [valor, setValor] = useState(""); // em reais, ex: "120,50"
  const [categoria, setCategoria] = useState("");
  const [vencimento, setVencimento] = useState(""); // AAAA-MM-DD
  const [recorrente, setRecorrente] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError(null);

    const valorNumero = Number(valor.replace(".", "").replace(",", "."));
    if (!nome.trim() || !categoria.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(vencimento) || Number.isNaN(valorNumero)) {
      setError("Preencha nome, categoria, valor e vencimento no formato AAAA-MM-DD.");
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        nome: nome.trim(),
        categoria: categoria.trim(),
        vencimento,
        valorCentavos: Math.round(valorNumero * 100),
        recorrente,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível salvar a conta");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <TextInput style={styles.input} placeholder="Nome (ex: Conta de luz)" value={nome} onChangeText={setNome} />
      <TextInput
        style={styles.input}
        placeholder="Valor (ex: 120,50)"
        keyboardType="decimal-pad"
        value={valor}
        onChangeText={setValor}
      />
      <TextInput
        style={styles.input}
        placeholder="Categoria (ex: Aluguel, Luz, Internet)"
        value={categoria}
        onChangeText={setCategoria}
      />
      <TextInput
        style={styles.input}
        placeholder="Vencimento (AAAA-MM-DD)"
        value={vencimento}
        onChangeText={setVencimento}
      />

      <View style={styles.switchRow}>
        <Text>Conta recorrente (repete todo mês)</Text>
        <Switch value={recorrente} onValueChange={setRecorrente} />
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      <Pressable style={styles.button} onPress={handleSubmit} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{submitLabel}</Text>}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12, padding: 16 },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  switchRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 8 },
  button: { backgroundColor: "#0f172a", borderRadius: 8, paddingVertical: 14, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  error: { color: "#ef4444" },
});
