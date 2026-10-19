import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import GradientBackground from "../../src/components/GradientBackground";
import ProgressBar from "../../src/components/ProgressBar";
import { lessons } from "../../src/constants/lessons";
import {
  QUIZ_PASS_THRESHOLD,
  QUIZ_SCORE_UNKNOWN,
  sectionQuizzes,
} from "../../src/constants/sections";
import { songs } from "../../src/constants/songs";
import {
  BorderRadius,
  Colors,
  FontSize,
  Gradients,
  Shadow,
  Spacing,
} from "../../src/constants/theme";
import { useAuth } from "../../src/context/AuthContext";
import { useProgress } from "../../src/context/ProgressContext";

export default function ProfileScreen() {
  const { state, refillHearts } = useProgress();
  const { user, logout } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleLogout = async () => {
    await logout();
    router.replace("/auth/login");
  };

  const totalXP = state.xp;
  const level = Math.floor(totalXP / 200) + 1;
  const xpToNext = totalXP % 200;
  const completedLessonCount = lessons.filter((lesson) =>
    state.completedLessons.includes(lesson.id),
  ).length;
  const totalLessons = lessons.length;
  const completedSongCount = songs.filter((song) =>
    state.completedSongs.includes(song.id),
  ).length;
  const totalSongs = songs.length;
  const passedQuizCount = sectionQuizzes.filter(
    (quiz) =>
      (state.quizScores[quiz.sectionId] ?? QUIZ_SCORE_UNKNOWN) >=
      QUIZ_PASS_THRESHOLD,
  ).length;
  const halfwayPoint = Math.ceil(totalLessons / 2);

  return (
    <GradientBackground>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + Spacing.lg },
        ]}
      >
        <Text style={styles.title}>Profile</Text>

        {/* Avatar & Level */}
        <View style={styles.avatarSection}>
          <LinearGradient
            colors={Gradients.purpleBright}
            style={styles.avatarCircle}
          >
            <Text style={styles.avatarEmoji}>🎹</Text>
          </LinearGradient>
          <Text style={styles.levelTitle}>Level {level} Pianist</Text>
          <Text style={styles.xpTotal}>{totalXP} Total XP</Text>
          <View style={styles.levelBar}>
            <ProgressBar
              progress={xpToNext / 200}
              variant="progress"
              height={8}
            />
            <Text style={styles.levelProgress}>
              {200 - xpToNext} XP to next level
            </Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <LinearGradient
              colors={Gradients.bgCard}
              style={styles.statBoxInner}
            >
              <Ionicons
                name="checkmark-done"
                size={28}
                color={Colors.success}
              />
              <Text style={styles.statValue}>
                {completedLessonCount}/{totalLessons}
              </Text>
              <Text style={styles.statLabel}>Lessons</Text>
            </LinearGradient>
          </View>
          <View style={styles.statBox}>
            <LinearGradient
              colors={Gradients.bgCard}
              style={styles.statBoxInner}
            >
              <Ionicons
                name="musical-notes"
                size={28}
                color={Colors.primaryLight}
              />
              <Text style={styles.statValue}>
                {completedSongCount}/{totalSongs}
              </Text>
              <Text style={styles.statLabel}>Songs</Text>
            </LinearGradient>
          </View>
          <View style={styles.statBox}>
            <LinearGradient
              colors={Gradients.bgCard}
              style={styles.statBoxInner}
            >
              <Ionicons name="flame" size={28} color={Colors.streak} />
              <Text style={styles.statValue}>{state.streak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </LinearGradient>
          </View>
          <View style={styles.statBox}>
            <LinearGradient
              colors={Gradients.bgCard}
              style={styles.statBoxInner}
            >
              <Ionicons name="star" size={28} color={Colors.xp} />
              <Text style={styles.statValue}>{totalXP}</Text>
              <Text style={styles.statLabel}>Total XP</Text>
            </LinearGradient>
          </View>
        </View>

        {/* Section quizzes */}
        <Text style={styles.sectionTitle}>Section Quizzes</Text>
        <View style={styles.quizCard}>
          <LinearGradient colors={Gradients.bgCard} style={styles.quizInner}>
            <View style={styles.quizRow}>
              <Ionicons
                name="ribbon"
                size={24}
                color={Colors.primaryGlow}
              />
              <Text style={styles.quizValue}>
                {passedQuizCount}/{sectionQuizzes.length}
              </Text>
              <Text style={styles.quizLabel}>quizzes passed</Text>
            </View>
            <ProgressBar
              progress={
                sectionQuizzes.length
                  ? passedQuizCount / sectionQuizzes.length
                  : 0
              }
              variant="progress"
              height={8}
            />
          </LinearGradient>
        </View>

        {/* Hearts */}
        <Text style={styles.sectionTitle}>Hearts</Text>
        <View style={styles.heartsCard}>
          <LinearGradient colors={Gradients.bgCard} style={styles.heartsInner}>
            <View style={styles.heartsDisplay}>
              {Array.from({ length: state.maxHearts }).map((_, i) => (
                <Ionicons
                  key={i}
                  name={i < state.hearts ? "heart" : "heart-outline"}
                  size={32}
                  color={i < state.hearts ? Colors.error : Colors.textMuted}
                  style={{ marginRight: 6 }}
                />
              ))}
            </View>
            {state.hearts < state.maxHearts && (
              <TouchableOpacity
                onPress={refillHearts}
                style={styles.refillButton}
              >
                <LinearGradient
                  colors={Gradients.accentButton}
                  style={styles.refillGradient}
                >
                  <Text style={styles.refillText}>Refill Hearts</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </LinearGradient>
        </View>

        {/* Achievements */}
        <Text style={styles.sectionTitle}>Achievements</Text>
        <View style={styles.achievementCard}>
          <LinearGradient
            colors={Gradients.bgCard}
            style={styles.achievementInner}
          >
            {completedLessonCount >= 1 && (
              <View style={styles.achievementRow}>
                <Ionicons
                  name="musical-note"
                  size={20}
                  color={Colors.primaryGlow}
                />
                <Text style={styles.achievementText}>
                  First Note — Completed!
                </Text>
              </View>
            )}
            {completedLessonCount >= halfwayPoint && (
              <View style={styles.achievementRow}>
                <Ionicons name="school" size={20} color={Colors.primaryGlow} />
                <Text style={styles.achievementText}>
                  Halfway There — {halfwayPoint} lessons done!
                </Text>
              </View>
            )}
            {completedLessonCount >= totalLessons && (
              <View style={styles.achievementRow}>
                <Ionicons name="trophy" size={20} color={Colors.xp} />
                <Text style={styles.achievementText}>
                  Piano Path Complete! 🏆
                </Text>
              </View>
            )}
            {sectionQuizzes.length > 0 &&
              passedQuizCount === sectionQuizzes.length && (
                <View style={styles.achievementRow}>
                  <Ionicons name="ribbon" size={20} color={Colors.success} />
                  <Text style={styles.achievementText}>
                    Quiz Master — All section quizzes passed!
                  </Text>
                </View>
              )}
            {state.streak >= 7 && (
              <View style={styles.achievementRow}>
                <Ionicons name="flame" size={20} color={Colors.streak} />
                <Text style={styles.achievementText}>7-Day Streak!</Text>
              </View>
            )}
            {completedLessonCount === 0 && (
              <Text style={styles.noAchievements}>
                Complete lessons to earn achievements!
              </Text>
            )}
          </LinearGradient>
        </View>

        {/* Account */}
        {user && (
          <>
            <Text style={styles.sectionTitle}>Account</Text>
            <View style={styles.accountCard}>
              <LinearGradient
                colors={Gradients.bgCard}
                style={styles.accountInner}
              >
                <View style={styles.accountRow}>
                  <Ionicons
                    name="mail-outline"
                    size={18}
                    color={Colors.textSecondary}
                  />
                  <Text style={styles.accountEmail}>{user.email}</Text>
                </View>
                <TouchableOpacity
                  style={[styles.logoutButton, styles.logoutSolid]}
                  onPress={() => handleLogout()}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="log-out-outline"
                    size={18}
                    color={Colors.white}
                  />
                  <Text style={styles.logoutText}>Sign Out</Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: Spacing.lg },
  title: {
    color: Colors.text,
    fontSize: FontSize.xxl,
    fontWeight: "800",
    marginBottom: Spacing.lg,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
    ...Shadow.glow,
  },
  avatarEmoji: {
    fontSize: 36,
  },
  levelTitle: {
    color: Colors.text,
    fontSize: FontSize.xl,
    fontWeight: "800",
  },
  xpTotal: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    marginTop: 2,
    marginBottom: Spacing.sm,
  },
  levelBar: {
    width: "80%",
    alignItems: "center",
  },
  levelProgress: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  statBox: {
    width: "47%",
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
  },
  statBoxInner: {
    padding: Spacing.md,
    alignItems: "center",
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.bgSurface,
  },
  statValue: {
    color: Colors.text,
    fontSize: FontSize.xl,
    fontWeight: "800",
    marginTop: 4,
  },
  statLabel: {
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  quizCard: {
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    marginBottom: Spacing.lg,
  },
  quizInner: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.bgSurface,
    gap: Spacing.sm,
  },
  quizRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  quizValue: {
    color: Colors.text,
    fontSize: FontSize.xl,
    fontWeight: "800",
  },
  quizLabel: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: FontSize.lg,
    fontWeight: "800",
    marginBottom: Spacing.md,
    marginTop: Spacing.sm,
  },
  heartsCard: {
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    marginBottom: Spacing.lg,
  },
  heartsInner: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.bgSurface,
    alignItems: "center",
  },
  heartsDisplay: {
    flexDirection: "row",
    marginBottom: Spacing.md,
  },
  refillButton: {
    borderRadius: BorderRadius.full,
    overflow: "hidden",
    ...Shadow.glow,
  },
  refillGradient: {
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  refillText: {
    color: Colors.white,
    fontWeight: "700",
    fontSize: FontSize.sm,
  },
  achievementCard: {
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
  },
  achievementInner: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.bgSurface,
  },
  achievementRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  achievementText: {
    color: Colors.text,
    fontSize: FontSize.sm,
    fontWeight: "600",
  },
  noAchievements: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    textAlign: "center",
    fontStyle: "italic",
  },
  accountCard: {
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    marginBottom: Spacing.md,
  },
  accountInner: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.bgSurface,
    gap: Spacing.md,
  },
  accountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  accountEmail: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: "500",
  },
  logoutButton: {
    borderRadius: BorderRadius.full,
    overflow: "hidden",
  },
  logoutSolid: {
    backgroundColor: "#D32F2F",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: Spacing.sm,
  },
  logoutGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: Spacing.sm,
  },
  logoutText: {
    color: Colors.white,
    fontSize: FontSize.md,
    fontWeight: "700",
  },
});
