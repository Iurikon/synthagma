import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text } from "react-native";
import { Colors, FontSize, Gradients, Shadow } from "../src/constants/theme";
import { useAuth } from "../src/context/AuthContext";

export default function AuthGate() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/auth/login");
    } else {
      router.replace("/(tabs)");
    }
  }, [user, loading]);

  return (
    <LinearGradient
      colors={Gradients.bgPrimary}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.splash}
    >
      <LinearGradient colors={Gradients.purpleBright} style={styles.logoCircle}>
        <Text style={styles.logoEmoji}>🎹</Text>
      </LinearGradient>
      <Text style={styles.appName}>Synthagma</Text>
      <ActivityIndicator
        color={Colors.primaryGlow}
        style={{ marginTop: 24 }}
        size="large"
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  splash: { flex: 1, alignItems: "center", justifyContent: "center" },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    ...Shadow.glow,
  },
  logoEmoji: { fontSize: 36 },
  appName: {
    color: Colors.text,
    fontSize: FontSize.xxl,
    fontWeight: "800",
    marginTop: 16,
  },
});
