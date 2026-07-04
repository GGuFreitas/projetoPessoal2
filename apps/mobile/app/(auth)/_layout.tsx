import { Redirect, Stack } from "expo-router";
import { useAuth } from "../../src/auth/AuthContext.js";

export default function AuthLayout() {
  const { token, isLoading } = useAuth();

  if (isLoading) return null;
  if (token) return <Redirect href="/(tabs)/contas" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
