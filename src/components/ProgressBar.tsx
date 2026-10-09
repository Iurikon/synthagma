import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View } from "react-native";
import { BorderRadius, Colors, Gradients } from "../constants/theme";

interface Props {
  progress: number; // 0 to 1
  height?: number;
  variant?: "xp" | "progress";
}

export default function ProgressBar({
  progress,
  height = 8,
  variant = "progress",
}: Props) {
  const clamped = Math.min(1, Math.max(0, progress));
  const gradientColors =
    variant === "xp" ? Gradients.xpBar : Gradients.progress;

  return (
    <View style={[styles.track, { height }]}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.fill, { width: `${clamped * 100}%` }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    backgroundColor: Colors.bgSurface,
    borderRadius: BorderRadius.full,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: BorderRadius.full,
  },
});
