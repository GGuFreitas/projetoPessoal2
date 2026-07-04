import { Redirect, Tabs } from "expo-router";
import { useAuth } from "../../src/auth/AuthContext.js";

export default function TabsLayout() {
  const { token, isLoading } = useAuth();

  if (isLoading) return null;
  if (!token) return <Redirect href="/(auth)/login" />;

  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="contas" options={{ title: "Contas" }} />
      <Tabs.Screen name="financas" options={{ title: "Finanças" }} />
      <Tabs.Screen name="compras" options={{ title: "Compras" }} />
    </Tabs>
  );
}
