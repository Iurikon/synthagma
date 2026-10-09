import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";
import { useAuth } from "../../src/context/AuthContext";

export default function AuthLayout() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.replace("/(tabs)");
    }
  }, [user]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
}
