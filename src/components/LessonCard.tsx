import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {
  BorderRadius,
  Colors,
  FontSize,
  Gradients,
  Shadow,
  Spacing,
} from "../constants/theme";

interface Props {
  title: string;
  subtitle: string;
  xp: number;
  order: number;
  completed: boolean;
  locked: boolean;
  onPress: () => void;
}

export default function LessonCard({
  title,
  subtitle,
  xp,
  order,
  completed,
  locked,
  onPress,
}: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={locked}
      activeOpacity={0.8}
      style={[styles.wrapper, locked && styles.lockedWrapper]}
    >
      <LinearGradient
        colors={
          completed
            ? Gradients.purpleGlow
            : locked
              ? ["#1A1A2E", "#16213E"]
              : Gradients.bgCard
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.card, completed && styles.cardCompleted]}
      >
        {/* Order badge */}
        <View
          style={[styles.orderBadge, completed && styles.orderBadgeCompleted]}
        >
          {completed ? (
            <Ionicons
              name="checkmark-circle"
              size={24}
              color={Colors.success}
            />
          ) : locked ? (
            <Ionicons name="lock-closed" size={16} color={Colors.textMuted} />
          ) : (
            <Text style={styles.orderText}>{order}</Text>
          )}
        </View>

        <View style={styles.content}>
          <Text style={[styles.title, locked && styles.textLocked]}>
            {title}
          </Text>
          <Text style={[styles.subtitle, locked && styles.textLocked]}>
            {subtitle}
          </Text>
          <View style={styles.xpRow}>
            <Ionicons name="star" size={14} color={Colors.xp} />
            <Text style={styles.xpText}>+{xp} XP</Text>
          </View>
        </View>

        {!locked && !completed && (
          <View style={styles.playButton}>
            <LinearGradient
              colors={Gradients.accentButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.playButtonGradient}
            >
              <Ionicons name="play" size={20} color={Colors.white} />
            </LinearGradient>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.lg,
    ...Shadow.card,
  },
  lockedWrapper: {
    opacity: 0.5,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.bgSurface,
  },
  cardCompleted: {
    borderColor: Colors.primary,
    borderWidth: 1.5,
  },
  orderBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.bgSurface,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.primaryDark,
  },
  orderBadgeCompleted: {
    borderColor: Colors.success,
    backgroundColor: "rgba(105, 240, 174, 0.15)",
  },
  orderText: {
    color: Colors.primaryLight,
    fontSize: FontSize.lg,
    fontWeight: "800",
  },
  content: {
    flex: 1,
  },
  title: {
    color: Colors.text,
    fontSize: FontSize.md,
    fontWeight: "700",
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    marginTop: 2,
  },
  textLocked: {
    color: Colors.textMuted,
  },
  xpRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 4,
  },
  xpText: {
    color: Colors.xp,
    fontSize: FontSize.xs,
    fontWeight: "700",
  },
  playButton: {
    marginLeft: Spacing.sm,
  },
  playButtonGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    ...Shadow.glow,
  },
});
