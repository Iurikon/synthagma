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
  composer: string;
  difficulty: "Beginner" | "Easy" | "Intermediate";
  xp: number;
  completed: boolean;
  locked: boolean;
  onPress: () => void;
}

const difficultyColors: Record<string, string> = {
  Beginner: Colors.success,
  Easy: Colors.warning,
  Intermediate: Colors.error,
};

export default function SongCard({
  title,
  composer,
  difficulty,
  xp,
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
        colors={completed ? Gradients.purpleGlow : Gradients.bgCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.card, completed && styles.cardCompleted]}
      >
        <View style={styles.iconContainer}>
          <Ionicons
            name={
              locked
                ? "lock-closed"
                : completed
                  ? "checkmark-circle"
                  : "musical-notes"
            }
            size={28}
            color={
              locked
                ? Colors.textMuted
                : completed
                  ? Colors.success
                  : Colors.primaryLight
            }
          />
        </View>

        <View style={styles.content}>
          <Text style={[styles.title, locked && styles.textLocked]}>
            {title}
          </Text>
          <Text style={[styles.composer, locked && styles.textLocked]}>
            {composer}
          </Text>
          <View style={styles.metaRow}>
            <View
              style={[
                styles.diffBadge,
                { backgroundColor: difficultyColors[difficulty] + "22" },
              ]}
            >
              <Text
                style={[
                  styles.diffText,
                  { color: difficultyColors[difficulty] },
                ]}
              >
                {difficulty}
              </Text>
            </View>
            <View style={styles.xpRow}>
              <Ionicons name="star" size={12} color={Colors.xp} />
              <Text style={styles.xpText}>+{xp} XP</Text>
            </View>
          </View>
        </View>

        {!locked && !completed && (
          <Ionicons
            name="chevron-forward"
            size={20}
            color={Colors.primaryLight}
          />
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
    opacity: 0.4,
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
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.bgSurface,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.primaryDark,
  },
  content: {
    flex: 1,
  },
  title: {
    color: Colors.text,
    fontSize: FontSize.md,
    fontWeight: "700",
  },
  composer: {
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  textLocked: {
    color: Colors.textMuted,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 8,
  },
  diffBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: "transparent",
  },
  diffText: {
    fontSize: 10,
    fontWeight: "700",
  },
  xpRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  xpText: {
    color: Colors.xp,
    fontSize: FontSize.xs,
    fontWeight: "700",
  },
});
