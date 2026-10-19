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
import LessonCard from "../../src/components/LessonCard";
import ProgressBar from "../../src/components/ProgressBar";
import { lessons } from "../../src/constants/lessons";
import {
  QUIZ_PASS_THRESHOLD,
  QUIZ_SCORE_UNKNOWN,
  Section,
  sectionQuizzes,
  sections,
} from "../../src/constants/sections";
import {
  BorderRadius,
  Colors,
  FontSize,
  Gradients,
  Shadow,
  Spacing,
} from "../../src/constants/theme";
import { useProgress } from "../../src/context/ProgressContext";

function isLessonLocked(lessonIdx: number, completed: string[]): boolean {
  if (lessonIdx === 0) return false;
  return !completed.includes(lessons[lessonIdx - 1].id);
}

function sectionCompleted(section: Section, completed: string[]): boolean {
  return section.lessonIds.every((id) => completed.includes(id));
}

function sectionInProgress(section: Section, completed: string[]): boolean {
  return (
    section.lessonIds.some((id) => completed.includes(id)) &&
    !sectionCompleted(section, completed)
  );
}

export default function LessonsScreen() {
  const router = useRouter();
  const { state } = useProgress();
  const insets = useSafeAreaInsets();

  const passedQuizCount = sectionQuizzes.filter(
    (quiz) =>
      (state.quizScores[quiz.sectionId] ?? QUIZ_SCORE_UNKNOWN) >=
      QUIZ_PASS_THRESHOLD,
  ).length;
  const nextQuizSection = sections.find(
    (section) =>
      sectionCompleted(section, state.completedLessons) &&
      (state.quizScores[section.id] ?? QUIZ_SCORE_UNKNOWN) <
        QUIZ_PASS_THRESHOLD,
  );
  const quizSummaryText = nextQuizSection
    ? `Next quiz: ${nextQuizSection.title}`
    : passedQuizCount === sectionQuizzes.length
      ? "All section quizzes passed! 🎉"
      : "Finish a section to unlock its quiz";

  return (
    <GradientBackground>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + Spacing.lg },
        ]}
      >
        <Text style={styles.title}>🎹 Piano Path</Text>
        <Text style={styles.subtitle}>
          Master the piano one step at a time. Complete each section, then test
          your knowledge!
        </Text>

        <LinearGradient colors={Gradients.bgCard} style={styles.quizSummary}>
          <View style={styles.quizSummaryHeader}>
            <View style={styles.quizSummaryText}>
              <Text style={styles.quizSummaryTitle}>Section Quizzes</Text>
              <Text style={styles.quizSummarySub}>{quizSummaryText}</Text>
            </View>
            <Text style={styles.quizSummaryCount}>
              {passedQuizCount}/{sectionQuizzes.length}
            </Text>
          </View>
          <ProgressBar
            progress={
              sectionQuizzes.length
                ? passedQuizCount / sectionQuizzes.length
                : 0
            }
            variant="progress"
            height={6}
          />
        </LinearGradient>

        {sections.map((section) => {
          const completed = sectionCompleted(section, state.completedLessons);
          const inProgress = sectionInProgress(section, state.completedLessons);
          const sectionLessons = section.lessonIds
            .map((id) => lessons.find((l) => l.id === id)!)
            .filter(Boolean);
          const completedLessonCount = section.lessonIds.filter((id) =>
            state.completedLessons.includes(id),
          ).length;
          const quizScore = state.quizScores[section.id];
          const quizAttempted = quizScore !== undefined;
          const quizPassed =
            quizScore !== undefined && quizScore >= QUIZ_PASS_THRESHOLD;
          const quizScoreKnown = quizScore !== undefined && quizScore >= 0;
          const darkQuizText = completed && (quizPassed || quizAttempted);
          const quizContentColor = !completed
            ? Colors.textMuted
            : darkQuizText
              ? Colors.bg
              : Colors.white;
          const quizTitle = !completed
            ? "Quiz locked"
            : quizPassed
              ? "Quiz Passed"
              : quizAttempted
                ? quizScoreKnown
                  ? "Retake Quiz"
                  : "Retake to Record Score"
                : "Take Section Quiz";
          const quizSubtitle = !completed
            ? "Complete all lessons to unlock"
            : quizPassed
              ? quizScoreKnown
                ? `Best score: ${quizScore}% · Tap to retake`
                : "Score not recorded · Tap to retake"
              : quizAttempted
                ? quizScoreKnown
                  ? `Best score: ${quizScore}% · Pass at ${QUIZ_PASS_THRESHOLD}%`
                  : `Score not recorded · Pass at ${QUIZ_PASS_THRESHOLD}%`
                : `Pass at ${QUIZ_PASS_THRESHOLD}% · Up to 100 XP`;

          return (
            <View key={section.id} style={styles.sectionCard}>
              {/* Section header */}
              <LinearGradient
                colors={quizPassed ? Gradients.purpleGlow : Gradients.bgCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                  styles.sectionHeader,
                  completed && !quizPassed && styles.sectionHeaderReady,
                  quizPassed && styles.sectionHeaderDone,
                ]}
              >
                <View style={styles.sectionHeaderLeft}>
                  <View
                    style={[
                      styles.sectionBadge,
                      completed && !quizPassed && styles.sectionBadgeReady,
                      quizPassed && styles.sectionBadgeDone,
                    ]}
                  >
                    {quizPassed ? (
                      <Ionicons
                        name="checkmark-circle"
                        size={22}
                        color={Colors.success}
                      />
                    ) : completed ? (
                      <Ionicons
                        name="ribbon"
                        size={20}
                        color={Colors.primaryGlow}
                      />
                    ) : (
                      <Text style={styles.sectionBadgeText}>
                        {section.order}
                      </Text>
                    )}
                  </View>
                  <View>
                    <Text style={styles.sectionTitle}>{section.title}</Text>
                    <Text style={styles.sectionSub}>{section.subtitle}</Text>
                    <Text
                      style={[
                        styles.sectionLessonCount,
                        completed && styles.sectionLessonCountDone,
                      ]}
                    >
                      {completedLessonCount}/{section.lessonIds.length} lessons
                    </Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.diffBadge,
                    {
                      backgroundColor:
                        section.difficulty === "Beginner"
                          ? Colors.success + "22"
                          : Colors.warning + "22",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.diffText,
                      {
                        color:
                          section.difficulty === "Beginner"
                            ? Colors.success
                            : Colors.warning,
                      },
                    ]}
                  >
                    {section.difficulty}
                  </Text>
                </View>
              </LinearGradient>

              {/* Lessons in section */}
              {sectionLessons.map((lesson, i) => {
                const lessonIdx = lessons.findIndex((l) => l.id === lesson.id);
                const locked = isLessonLocked(
                  lessonIdx,
                  state.completedLessons,
                );
                const done = state.completedLessons.includes(lesson.id);
                return (
                  <LessonCard
                    key={lesson.id}
                    title={lesson.title}
                    subtitle={lesson.subtitle}
                    xp={lesson.xp}
                    order={lesson.order}
                    completed={done}
                    locked={locked}
                    onPress={() => router.push(`/lesson/${lesson.id}`)}
                  />
                );
              })}

              {/* Quiz button */}
              <TouchableOpacity
                style={[
                  styles.quizButton,
                  completed && !quizPassed && styles.quizButtonReady,
                ]}
                onPress={() => router.push(`/quiz/${section.id}`)}
                disabled={!completed}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={
                    !completed
                      ? (["#1A1A2E", "#16213E"] as const)
                      : quizPassed
                        ? (["#69F0AE", "#00C853"] as const)
                        : quizAttempted
                          ? (["#FFD740", "#FFAB00"] as const)
                          : Gradients.accentButton
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.quizGradient}
                >
                  <Ionicons
                    name={
                      !completed
                        ? "lock-closed"
                        : quizPassed
                          ? "checkmark-circle"
                          : quizAttempted
                            ? "refresh"
                            : "ribbon"
                    }
                    size={20}
                    color={quizContentColor}
                  />
                  <View style={styles.quizCopy}>
                    <Text
                      style={[
                        styles.quizText,
                        !completed && styles.quizTextLocked,
                        completed && darkQuizText && styles.quizTextDark,
                      ]}
                    >
                      {quizTitle}
                    </Text>
                    <Text
                      style={[
                        styles.quizSubtext,
                        !completed && styles.quizTextLocked,
                        completed && darkQuizText && styles.quizTextDark,
                      ]}
                    >
                      {quizSubtitle}
                    </Text>
                  </View>
                  {completed && !quizPassed && (
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color={quizContentColor}
                    />
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          );
        })}

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
    marginBottom: 4,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    marginBottom: Spacing.lg,
    lineHeight: 20,
  },
  sectionCard: { marginBottom: Spacing.xl },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.bgSurface,
  },
  sectionHeaderDone: { borderColor: Colors.success },
  sectionHeaderReady: { borderColor: Colors.primary },
  sectionHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  sectionBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.bgSurface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.primaryDark,
  },
  sectionBadgeDone: {
    borderColor: Colors.success,
    backgroundColor: "rgba(105,240,174,0.15)",
  },
  sectionBadgeReady: {
    borderColor: Colors.primary,
  },
  sectionBadgeText: {
    color: Colors.primaryLight,
    fontSize: FontSize.md,
    fontWeight: "800",
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: FontSize.lg,
    fontWeight: "700",
  },
  sectionSub: { color: Colors.textSecondary, fontSize: FontSize.xs },
  sectionLessonCount: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },
  sectionLessonCountDone: { color: Colors.success },
  diffBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  diffText: { fontSize: 11, fontWeight: "700" },
  quizButton: {
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    ...Shadow.card,
  },
  quizButtonReady: { ...Shadow.glow },
  quizGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  quizCopy: { flex: 1 },
  quizText: { color: Colors.white, fontSize: FontSize.sm, fontWeight: "700" },
  quizSubtext: {
    color: Colors.white,
    fontSize: FontSize.xs,
    fontWeight: "600",
    marginTop: 2,
    opacity: 0.9,
  },
  quizTextDark: { color: Colors.bg },
  quizTextLocked: { color: Colors.textMuted },
  quizSummary: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.bgSurface,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  quizSummaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  quizSummaryText: { flex: 1, paddingRight: Spacing.md },
  quizSummaryTitle: {
    color: Colors.text,
    fontSize: FontSize.md,
    fontWeight: "800",
  },
  quizSummarySub: {
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  quizSummaryCount: {
    color: Colors.primaryGlow,
    fontSize: FontSize.xl,
    fontWeight: "800",
  },
});
