import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import MascotOverlay from "../src/components/MascotOverlay";
import { AuthProvider } from "../src/context/AuthContext";
import { MascotProvider } from "../src/context/MascotContext";
import { ProgressProvider } from "../src/context/ProgressContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <ProgressProvider>
        <MascotProvider>
          <StatusBar style="light" translucent backgroundColor="transparent" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="auth" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="lesson/[id]"
              options={{
                headerShown: true,
                headerTitle: "Lesson",
                headerStyle: { backgroundColor: "#0D0221" },
                headerTintColor: "#C77DFF",
                headerTitleStyle: { fontWeight: "700" },
              }}
            />
            <Stack.Screen
              name="song/[id]"
              options={{
                headerShown: true,
                headerTitle: "Song",
                headerStyle: { backgroundColor: "#0D0221" },
                headerTintColor: "#C77DFF",
                headerTitleStyle: { fontWeight: "700" },
              }}
            />
            <Stack.Screen
              name="quiz/[sectionId]"
              options={{
                headerShown: true,
                headerTitle: "Quiz",
                headerStyle: { backgroundColor: "#0D0221" },
                headerTintColor: "#C77DFF",
                headerTitleStyle: { fontWeight: "700" },
              }}
            />
          </Stack>
          <MascotOverlay />
        </MascotProvider>
      </ProgressProvider>
    </AuthProvider>
  );
}
