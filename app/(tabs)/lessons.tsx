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
import { lessons } from "../../src/constants/lessons";
import { Section, sections } from "../../src/constants/sections";
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

        {sections.map((section) => {
          const completed = sectionCompleted(section, state.completedLessons);
          const inProgress = sectionInProgress(section, state.completedLessons);
          const sectionLessons = section.lessonIds
            .map((id) => lessons.find((l) => l.id === id)!)
            .filter(Boolean);

          return (
            <View key={section.id} style={styles.sectionCard}>
              {/* Section header */}
              <LinearGradient
                colors={completed ? Gradients.purpleGlow : Gradients.bgCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                  styles.sectionHeader,
                  completed && styles.sectionHeaderDone,
                ]}
              >
                <View style={styles.sectionHeaderLeft}>
                  <View
                    style={[
                      styles.sectionBadge,
                      completed && styles.sectionBadgeDone,
                    ]}
                  >
                    {completed ? (
                      <Ionicons
                        name="checkmark-circle"
                        size={22}
                        color={Colors.success}
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
                style={[styles.quizButton, completed && styles.quizButtonReady]}
                onPress={() => router.push(`/quiz/${section.id}`)}
                disabled={!completed}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={
                    completed ? Gradients.accentButton : ["#1A1A2E", "#16213E"]
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.quizGradient}
                >
                  <Ionicons
                    name={completed ? "ribbon" : "lock-closed"}
                    size={18}
                    color={completed ? Colors.white : Colors.textMuted}
                  />
                  <Text
                    style={[
                      styles.quizText,
                      !completed && styles.quizTextLocked,
                    ]}
                  >
                    {completed
                      ? "Take Section Quiz"
                      : "Complete all lessons to unlock quiz"}
                  </Text>
                  {completed && <Text style={styles.quizXP}>+100 XP</Text>}
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
  sectionHeaderDone: { borderColor: Colors.primary },
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
    justifyContent: "center",
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  quizText: { color: Colors.white, fontSize: FontSize.sm, fontWeight: "700" },
  quizTextLocked: { color: Colors.textMuted },
  quizXP: { color: Colors.xp, fontSize: FontSize.xs, fontWeight: "700" },
});
