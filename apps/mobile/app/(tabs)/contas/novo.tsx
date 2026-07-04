import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import type { CreateContaInput } from "@organizalar/contracts";
import * as contasApi from "../../../src/api/contas.js";
import { ContaForm } from "../../../src/components/ContaForm.js";

export default function NovaContaScreen() {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleCreate(input: CreateContaInput) {
    await contasApi.createConta(input);
    router.back();
  }

  async function handlePickBoleto() {
    setUploadError(null);
    const result = await DocumentPicker.getDocumentAsync({ type: "application/pdf" });
    if (result.canceled || !result.assets?.[0]) return;

    const file = result.assets[0];
    setUploading(true);
    try {
      await contasApi.uploadBoleto({ uri: file.uri, name: file.name, mimeType: "application/pdf" });
      router.back();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Não foi possível enviar o boleto");
    } finally {
      setUploading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <View style={styles.uploadSection}>
        <Text style={styles.uploadTitle}>Tem o PDF do boleto?</Text>
        <Text style={styles.uploadSubtitle}>
          Anexe o arquivo e o sistema tenta preencher os dados automaticamente (fica como rascunho para você revisar).
        </Text>
        <Pressable style={styles.uploadButton} onPress={handlePickBoleto} disabled={uploading}>
          {uploading ? <ActivityIndicator color="#0f172a" /> : <Text style={styles.uploadButtonText}>Anexar boleto PDF</Text>}
        </Pressable>
        {uploadError && <Text style={styles.error}>{uploadError}</Text>}
      </View>

      <View style={styles.divider} />

      <Text style={styles.manualTitle}>Ou preencha manualmente</Text>
      <ContaForm onSubmit={handleCreate} submitLabel="Criar conta" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 32 },
  uploadSection: { padding: 16, gap: 8 },
  uploadTitle: { fontSize: 16, fontWeight: "600" },
  uploadSubtitle: { fontSize: 13, color: "#64748b" },
  uploadButton: {
    borderWidth: 1,
    borderColor: "#0f172a",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 8,
  },
  uploadButtonText: { color: "#0f172a", fontWeight: "600" },
  divider: { height: 1, backgroundColor: "#e2e8f0", marginVertical: 8 },
  manualTitle: { fontSize: 14, color: "#64748b", paddingHorizontal: 16 },
  error: { color: "#ef4444" },
});
