import { Stack } from "expo-router";

export default function ContasLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Contas" }} />
      <Stack.Screen name="novo" options={{ title: "Nova conta", presentation: "modal" }} />
      <Stack.Screen name="[id]" options={{ title: "Detalhes da conta" }} />
    </Stack>
  );
}
