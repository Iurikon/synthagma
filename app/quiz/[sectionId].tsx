import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import GradientBackground from "../../src/components/GradientBackground";
import ProgressBar from "../../src/components/ProgressBar";
import { sectionQuizzes, sections } from "../../src/constants/sections";
import {
  BorderRadius,
  Colors,
  FontSize,
  Gradients,
  Shadow,
  Spacing,
} from "../../src/constants/theme";
import { useProgress } from "../../src/context/ProgressContext";

export default function QuizScreen() {
  const { sectionId } = useLocalSearchParams<{ sectionId: string }>();
  const router = useRouter();
  const { state, completeLesson } = useProgress();

  const section = sections.find((s) => s.id === sectionId);
  const quiz = sectionQuizzes.find((q) => q.sectionId === sectionId);
  const questions = quiz?.questions ?? [];

  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [finished, setFinished] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const question = questions[currentQ];
  const totalXP = Math.round(
    questions.length > 0 ? (score / questions.length) * 100 : 0,
  );

  useEffect(() => {
    if (!question) return;
    setTimeLeft(question.timeLimit);
    setSelected(null);
    setAnswered(false);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentQ]);

  useEffect(() => {
    if (timeLeft === 0 && !answered) {
      handleAnswer(-1); // Time's up — count as wrong
    }
  }, [timeLeft]);

  const handleAnswer = (index: number) => {
    if (answered) return;
    setAnswered(true);
    setSelected(index);
    if (timerRef.current) clearInterval(timerRef.current);

    if (question && index === question.correctIndex) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    if (currentQ + 1 < questions.length) {
      setCurrentQ(currentQ + 1);
    } else {
      setFinished(true);
      // Award XP for quiz completion
      const earned = Math.round((score / questions.length) * 100);
      if (earned > 0 && section) {
        completeLesson(`quiz-${section.id}`, earned);
      }
    }
  };

  if (!section || questions.length === 0) {
    return (
      <GradientBackground>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Quiz not found</Text>
        </View>
      </GradientBackground>
    );
  }

  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    const passed = pct >= 60;
    return (
      <GradientBackground>
        <ScrollView contentContainerStyle={styles.resultContent}>
          <LinearGradient
            colors={Gradients.purpleBright}
            style={styles.resultIcon}
          >
            <Ionicons
              name={passed ? "trophy" : "school"}
              size={48}
              color={Colors.white}
            />
          </LinearGradient>
          <Text style={styles.resultTitle}>
            {passed ? "Section Complete!" : "Keep Practicing!"}
          </Text>
          <Text style={styles.resultScore}>
            {score} / {questions.length} correct
          </Text>
          <Text style={styles.resultXP}>+{totalXP} XP earned</Text>
          <ProgressBar
            progress={pct / 100}
            variant={passed ? "progress" : "xp"}
            height={8}
          />
          <Text style={styles.resultPct}>{pct}%</Text>

          <TouchableOpacity
            style={styles.resultButton}
            onPress={() => router.replace("/(tabs)/lessons")}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={Gradients.accentButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.resultButtonGradient}
            >
              <Text style={styles.resultButtonText}>Back to Lessons</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <View style={styles.quizContent}>
        {/* Header */}
        <View style={styles.quizHeader}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.exitBtn}
          >
            <Ionicons name="close" size={22} color={Colors.textSecondary} />
          </TouchableOpacity>
          <View style={styles.quizProgress}>
            <Text style={styles.quizProgressText}>
              Question {currentQ + 1} of {questions.length}
            </Text>
            <ProgressBar
              progress={(currentQ + 1) / questions.length}
              variant="progress"
              height={4}
            />
          </View>
        </View>

        {/* Timer */}
        <View style={styles.timerRow}>
          <Ionicons
            name="timer-outline"
            size={18}
            color={timeLeft <= 5 ? Colors.error : Colors.textSecondary}
          />
          <Text
            style={[styles.timerText, timeLeft <= 5 && styles.timerWarning]}
          >
            {timeLeft}s
          </Text>
        </View>

        {/* Question */}
        <Text style={styles.questionText}>{question.question}</Text>

        {/* Options */}
        <View style={styles.optionsList}>
          {question.options.map((option, i) => {
            let bg = Colors.bgSurface;
            let border = Colors.bgElevated;
            if (answered) {
              if (i === question.correctIndex) {
                bg = "rgba(105,240,174,0.15)";
                border = Colors.success;
              } else if (i === selected && i !== question.correctIndex) {
                bg = "rgba(255,82,82,0.15)";
                border = Colors.error;
              }
            }

            return (
              <TouchableOpacity
                key={i}
                style={[
                  styles.optionButton,
                  { backgroundColor: bg, borderColor: border },
                ]}
                onPress={() => handleAnswer(i)}
                disabled={answered}
                activeOpacity={0.7}
              >
                <Text style={styles.optionLetter}>{"ABCD"[i]}</Text>
                <Text style={styles.optionText}>{option}</Text>
                {answered && i === question.correctIndex && (
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={Colors.success}
                  />
                )}
                {answered && i === selected && i !== question.correctIndex && (
                  <Ionicons
                    name="close-circle"
                    size={20}
                    color={Colors.error}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Explanation */}
        {answered && (
          <View style={styles.explanationCard}>
            <LinearGradient
              colors={Gradients.bgCard}
              style={styles.explanationInner}
            >
              <Ionicons
                name={
                  selected === question.correctIndex
                    ? "checkmark-circle"
                    : "information-circle"
                }
                size={20}
                color={
                  selected === question.correctIndex
                    ? Colors.success
                    : Colors.accent
                }
              />
              <Text style={styles.explanationText}>{question.explanation}</Text>
            </LinearGradient>
          </View>
        )}

        {/* Next button */}
        {answered && (
          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNext}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={Gradients.accentButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.nextGradient}
            >
              <Text style={styles.nextText}>
                {currentQ + 1 < questions.length
                  ? "Next Question →"
                  : "See Results"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  errorText: { color: Colors.error, fontSize: FontSize.lg },
  quizContent: { flex: 1, padding: Spacing.lg },
  quizHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  exitBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.bgSurface,
    alignItems: "center",
    justifyContent: "center",
  },
  quizProgress: { flex: 1, gap: 4 },
  quizProgressText: {
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
    textAlign: "right",
  },
  timerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  timerText: {
    color: Colors.textSecondary,
    fontSize: FontSize.lg,
    fontWeight: "700",
  },
  timerWarning: { color: Colors.error },
  questionText: {
    color: Colors.text,
    fontSize: FontSize.xl,
    fontWeight: "800",
    marginBottom: Spacing.xl,
    lineHeight: 30,
  },
  optionsList: { gap: Spacing.sm, flex: 1 },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    gap: Spacing.md,
  },
  optionLetter: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.bgElevated,
    color: Colors.primaryGlow,
    fontSize: FontSize.sm,
    fontWeight: "800",
    textAlign: "center",
    lineHeight: 28,
    overflow: "hidden",
  },
  optionText: {
    flex: 1,
    color: Colors.text,
    fontSize: FontSize.md,
    fontWeight: "500",
  },
  explanationCard: {
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    marginTop: Spacing.md,
  },
  explanationInner: {
    flexDirection: "row",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.bgSurface,
    gap: Spacing.sm,
    alignItems: "flex-start",
  },
  explanationText: {
    flex: 1,
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
  nextButton: {
    borderRadius: BorderRadius.full,
    overflow: "hidden",
    marginTop: Spacing.lg,
    ...Shadow.glow,
  },
  nextGradient: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  nextText: { color: Colors.white, fontSize: FontSize.lg, fontWeight: "800" },
  // Results
  resultContent: {
    padding: Spacing.xl,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  resultIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  resultTitle: {
    color: Colors.text,
    fontSize: FontSize.xxl,
    fontWeight: "800",
    marginBottom: Spacing.sm,
  },
  resultScore: {
    color: Colors.textSecondary,
    fontSize: FontSize.lg,
    fontWeight: "600",
    marginBottom: 4,
  },
  resultXP: {
    color: Colors.xp,
    fontSize: FontSize.md,
    fontWeight: "700",
    marginBottom: Spacing.lg,
  },
  resultPct: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  resultButton: {
    borderRadius: BorderRadius.full,
    overflow: "hidden",
    width: "100%",
    ...Shadow.glow,
  },
  resultButtonGradient: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  resultButtonText: {
    color: Colors.white,
    fontSize: FontSize.lg,
    fontWeight: "800",
  },
});
