import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import GradientBackground from "../../src/components/GradientBackground";
import Mascot from "../../src/components/Mascot";
import ProgressBar from "../../src/components/ProgressBar";
import { lessons } from "../../src/constants/lessons";
import {
  BorderRadius,
  Colors,
  FontSize,
  Gradients,
  Shadow,
  Spacing,
} from "../../src/constants/theme";
import { useMascot } from "../../src/context/MascotContext";
import { useProgress } from "../../src/context/ProgressContext";

export default function HomeScreen() {
  const router = useRouter();
  const { state } = useProgress();
  const { showMessage } = useMascot();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const [mascotDismissed, setMascotDismissed] = useState(false);
  const isSmall = screenWidth < 380;

  const nextLesson = lessons.find(
    (l) => !state.completedLessons.includes(l.id),
  );
  const totalXP = state.xp;
  const level = Math.floor(totalXP / 200) + 1;
  const xpToNext = totalXP % 200;

  return (
    <GradientBackground>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + Spacing.lg },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>🎹 Welcome back!</Text>
            <Text style={styles.levelText}>Level {level} Pianist</Text>
          </View>
          <View style={styles.streakBadge}>
            <Ionicons name="flame" size={20} color={Colors.streak} />
            <Text style={styles.streakText}>{state.streak}</Text>
          </View>
        </View>

        {/* XP Card */}
        <LinearGradient
          colors={Gradients.purpleBright}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.xpCard}
        >
          <View style={styles.xpHeader}>
            <Text style={styles.xpTitle}>Daily Progress</Text>
            <Text style={styles.xpValue}>{totalXP} XP</Text>
          </View>
          <ProgressBar progress={xpToNext / 200} variant="xp" height={10} />
          <Text style={styles.xpSubtext}>
            {200 - xpToNext} XP to Level {level + 1}
          </Text>
        </LinearGradient>

        {/* Hearts */}
        <View style={styles.heartsRow}>
          {Array.from({ length: state.maxHearts }).map((_, i) => (
            <Ionicons
              key={i}
              name={i < state.hearts ? "heart" : "heart-outline"}
              size={isSmall ? 16 : 20}
              color={i < state.hearts ? Colors.error : Colors.textMuted}
              style={{ marginRight: 3 }}
            />
          ))}
        </View>

        {/* Mascot greeting — dismissible */}
        {!mascotDismissed && (
          <TouchableOpacity
            style={styles.mascotRow}
            onPress={() => {
              showMessage("idle_encouragement");
              setMascotDismissed(true);
            }}
            activeOpacity={0.7}
          >
            <Mascot size={isSmall ? 36 : 44} />
            <View style={styles.mascotBubble}>
              <Text style={styles.mascotText}>Tap me for a tip! 💜</Text>
            </View>
            <Ionicons
              name="close"
              size={14}
              color={Colors.textMuted}
              style={{ marginLeft: 4 }}
            />
          </TouchableOpacity>
        )}

        {/* Continue Learning */}
        <Text style={styles.sectionTitle}>Continue Learning</Text>
        {nextLesson ? (
          <TouchableOpacity
            style={styles.nextLessonCard}
            onPress={() => router.push(`/lesson/${nextLesson.id}`)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={Gradients.accentButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.nextLessonGradient}
            >
              <View style={styles.nextLessonContent}>
                <View style={styles.nextLessonBadge}>
                  <Text style={styles.nextLessonBadgeText}>
                    {nextLesson.order}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.nextLessonLabel}>NEXT LESSON</Text>
                  <Text style={styles.nextLessonTitle}>{nextLesson.title}</Text>
                  <Text style={styles.nextLessonSub}>
                    {nextLesson.subtitle}
                  </Text>
                </View>
                <Ionicons name="play-circle" size={40} color={Colors.white} />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <View style={styles.allDoneCard}>
            <LinearGradient
              colors={Gradients.bgCard}
              style={styles.allDoneInner}
            >
              <Ionicons name="trophy" size={48} color={Colors.xp} />
              <Text style={styles.allDoneText}>All lessons complete! 🎉</Text>
              <Text style={styles.allDoneSub}>
                Check out the Songs tab to keep practicing.
              </Text>
            </LinearGradient>
          </View>
        )}

        {/* Quick Stats */}
        <Text style={styles.sectionTitle}>Your Stats</Text>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <LinearGradient colors={Gradients.bgCard} style={styles.statInner}>
              <Text style={styles.statNumber}>
                {state.completedLessons.length}
              </Text>
              <Text style={styles.statLabel}>Lessons Done</Text>
            </LinearGradient>
          </View>
          <View style={styles.statCard}>
            <LinearGradient colors={Gradients.bgCard} style={styles.statInner}>
              <Text style={styles.statNumber}>
                {state.completedSongs.length}
              </Text>
              <Text style={styles.statLabel}>Songs Mastered</Text>
            </LinearGradient>
          </View>
          <View style={styles.statCard}>
            <LinearGradient colors={Gradients.bgCard} style={styles.statInner}>
              <Text style={styles.statNumber}>{state.streak} 🔥</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </LinearGradient>
          </View>
        </View>
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  greeting: {
    color: Colors.text,
    fontSize: FontSize.lg,
    fontWeight: "800",
  },
  levelText: {
    color: Colors.primaryGlow,
    fontSize: FontSize.sm,
    fontWeight: "600",
    marginTop: 2,
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,110,64,0.15)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  streakText: {
    color: Colors.streak,
    fontSize: FontSize.md,
    fontWeight: "800",
  },
  xpCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadow.glow,
  },
  xpHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  xpTitle: {
    color: Colors.white,
    fontSize: FontSize.md,
    fontWeight: "700",
  },
  xpValue: {
    color: Colors.xp,
    fontSize: FontSize.xl,
    fontWeight: "800",
  },
  xpSubtext: {
    color: "rgba(255,255,255,0.7)",
    fontSize: FontSize.xs,
    marginTop: 6,
    textAlign: "right",
  },
  heartsRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: Spacing.md,
    marginTop: Spacing.xs,
  },
  mascotRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.bgSurface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.bgElevated,
  },
  mascotBubble: {
    flex: 1,
    marginLeft: Spacing.sm,
    backgroundColor: Colors.bgElevated,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
  },
  mascotText: {
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
    fontStyle: "italic",
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: FontSize.md,
    fontWeight: "800",
    marginBottom: Spacing.sm,
    marginTop: Spacing.xs,
  },
  nextLessonCard: {
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    marginBottom: Spacing.lg,
    ...Shadow.glow,
  },
  nextLessonGradient: {
    padding: Spacing.md,
  },
  nextLessonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  nextLessonBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  nextLessonBadgeText: {
    color: Colors.white,
    fontSize: FontSize.lg,
    fontWeight: "800",
  },
  nextLessonLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
  },
  nextLessonTitle: {
    color: Colors.white,
    fontSize: FontSize.lg,
    fontWeight: "800",
    marginTop: 2,
  },
  nextLessonSub: {
    color: "rgba(255,255,255,0.8)",
    fontSize: FontSize.sm,
    marginTop: 2,
  },
  allDoneCard: {
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    marginBottom: Spacing.lg,
  },
  allDoneInner: {
    padding: Spacing.xl,
    alignItems: "center",
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  allDoneText: {
    color: Colors.text,
    fontSize: FontSize.lg,
    fontWeight: "800",
    marginTop: Spacing.md,
  },
  allDoneSub: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  statCard: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
  },
  statInner: {
    padding: Spacing.md,
    alignItems: "center",
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.bgSurface,
  },
  statNumber: {
    color: Colors.primaryGlow,
    fontSize: FontSize.xl,
    fontWeight: "800",
  },
  statLabel: {
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
    marginTop: 4,
    textAlign: "center",
  },
});
