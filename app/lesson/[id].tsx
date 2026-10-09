import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import GradientBackground from "../../src/components/GradientBackground";
import Piano from "../../src/components/Piano";
import ProgressBar from "../../src/components/ProgressBar";
import SheetMusic from "../../src/components/SheetMusic";
import Waveform from "../../src/components/Waveform";
import { lessons, Note } from "../../src/constants/lessons";
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
import { useMicrophone } from "../../src/hooks/useMicrophone";
import { detectedNoteToPianoNote } from "../../src/utils/pitchDetector";
import { isMuted, playBuzzer, setMuted } from "../../src/utils/soundEngine";

function Confetti() {
  const screenW = useWindowDimensions().width;
  const particles = useRef(
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * screenW,
      startY: -20 - Math.random() * 50,
      size: 6 + Math.random() * 8,
      color: ["#9B30FF", "#E040FB", "#FFD740", "#69F0AE", "#FF5252", "#C77DFF"][
        i % 6
      ],
      duration: 1500 + Math.random() * 2000,
      delay: Math.random() * 500,
      anim: new Animated.Value(0),
    })),
  ).current;

  useEffect(() => {
    const animations = particles.map((p) =>
      Animated.timing(p.anim, {
        toValue: 1,
        duration: p.duration,
        delay: p.delay,
        useNativeDriver: true,
      }),
    );
    Animated.parallel(animations).start();
  }, []);

  return (
    <View style={confettiStyles.container} pointerEvents="none">
      {particles.map((p) => (
        <Animated.View
          key={p.id}
          style={[
            confettiStyles.particle,
            {
              left: p.x,
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              borderRadius: p.size / 2,
              opacity: p.anim.interpolate({
                inputRange: [0, 0.3, 1],
                outputRange: [1, 1, 0],
              }),
              transform: [
                {
                  translateY: p.anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [p.startY, 600],
                  }),
                },
                {
                  rotate: p.anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0deg", `${360 + Math.random() * 720}deg`],
                  }),
                },
                {
                  scale: p.anim.interpolate({
                    inputRange: [0, 0.8, 1],
                    outputRange: [1, 1, 0.3],
                  }),
                },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
}

const confettiStyles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  particle: { position: "absolute" },
});

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { state, completeLesson, loseHeart, checkStreak } = useProgress();
  const { showMessage, showRunJump } = useMascot();
  const {
    isListening,
    detectedNote,
    audioLevel,
    startListening,
    stopListening,
  } = useMicrophone();

  const lesson = lessons.find((l) => l.id === id);
  const nextLesson = lessons.find((l) => l.order === (lesson?.order ?? 0) + 1);

  const [currentStep, setCurrentStep] = useState(0);
  const [currentNoteIndex, setCurrentNoteIndex] = useState(0);
  const [playedNotes, setPlayedNotes] = useState<boolean[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [totalMistakes, setTotalMistakes] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [perfect, setPerfect] = useState(false);
  const [wrongNote, setWrongNote] = useState<string | null>(null); // e.g. "F4"
  const [muted, setMutedState] = useState(isMuted());

  const toggleMute = () => {
    const next = !muted;
    setMutedState(next);
    setMuted(next);
  };

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    checkStreak(today);
  }, []);

  useEffect(() => {
    if (lesson) {
      setPlayedNotes(new Array(lesson.sheetNotes.length).fill(false));
      setCurrentNoteIndex(0);
      setCompleted(false);
      setPerfect(false);
      setMistakes(0);
      setTotalMistakes(0);
      setCurrentStep(0);
      // Mascot greeting
      const isFirst = !state.completedLessons.length;
      showMessage(isFirst ? "first_lesson" : "lesson_start");
    }
  }, [lesson]);

  const expectedNote = lesson ? lesson.sheetNotes[currentNoteIndex] : null;

  function parseNoteStr(noteStr: string): Note {
    const match = noteStr.match(/^([A-G])([#b]?)(\d)$/);
    if (!match) return { name: "C", octave: 4 };
    return {
      name: match[1] as Note["name"],
      octave: parseInt(match[3]) as 3 | 4,
      isSharp: match[2] === "#",
      isFlat: match[2] === "b",
    };
  }

  // Convert a Note to a MIDI semitone number for enharmonic-agnostic comparison
  function noteToSemitone(note: Note): number {
    const noteValues: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
    const base = noteValues[note.name] ?? 0;
    const offset = note.isSharp ? 1 : note.isFlat ? -1 : 0;
    return base + offset + (note.octave - 4) * 12;
  }

  function noteToLabel(note: Note): string {
    const accidental = note.isSharp ? "#" : note.isFlat ? "♭" : "";
    return `${note.name}${accidental}${note.octave}`;
  }

  const processNoteMatch = useCallback(
    (note: Note) => {
      if (!expectedNote) return;
      const expected = parseNoteStr(expectedNote);
      const isCorrect =
        noteToSemitone(note) === noteToSemitone(expected);

      if (isCorrect) {
        const newPlayed = [...playedNotes];
        newPlayed[currentNoteIndex] = true;
        setPlayedNotes(newPlayed);

        // Mascot encouragement on correct note (occasionally)
        if (Math.random() < 0.3) {
          showMessage("note_correct");
        }

        if (currentNoteIndex + 1 >= lesson!.sheetNotes.length) {
          setCompleted(true);
          if (totalMistakes === 0) setPerfect(true);
          completeLesson(lesson!.id, lesson!.xp);
          // Mascot celebration
          showMessage(
            totalMistakes === 0 ? "lesson_perfect" : "lesson_complete",
          );
        } else {
          setCurrentNoteIndex(currentNoteIndex + 1);
        }
      } else {
        // Track wrong note for visual feedback
        const wrongLabel = noteToLabel(note);
        setWrongNote(wrongLabel);
        playBuzzer();
        // Mascot encouragement after mistakes
        if (mistakes >= 1) {
          showMessage("note_wrong");
        }
        setTimeout(() => setWrongNote(null), 800);
        setMistakes((m) => m + 1);
        setTotalMistakes((m) => m + 1);
        if (mistakes + 1 >= 3) {
          loseHeart();
          setMistakes(0);
        }
      }
    },
    [
      expectedNote,
      playedNotes,
      currentNoteIndex,
      lesson,
      totalMistakes,
      mistakes,
    ],
  );

  const handleNotePress = useCallback(
    (note: Note) => {
      if (currentStep !== 1 || completed) return;
      processNoteMatch(note);
    },
    [currentStep, completed, processNoteMatch],
  );

  // Wire microphone-detected notes to the practice flow
  const lastMicMatchRef = useRef(0);
  useEffect(() => {
    if (!isListening || !detectedNote || currentStep !== 1 || completed) return;
    if (!expectedNote) return;

    const pianoNote = detectedNoteToPianoNote(detectedNote);
    const expected = parseNoteStr(expectedNote);
    const isMatch =
      pianoNote.name === expected.name &&
      pianoNote.octave === expected.octave &&
      (pianoNote.isSharp ?? false) === (expected.isSharp ?? false);

    if (isMatch && detectedNote.confidence > 0.5) {
      // Debounce: don't fire more than once per 500ms
      const now = Date.now();
      if (now - lastMicMatchRef.current < 500) return;
      lastMicMatchRef.current = now;
      processNoteMatch(expected);
    }
  }, [
    detectedNote,
    isListening,
    currentStep,
    completed,
    expectedNote,
    processNoteMatch,
  ]);

  if (!lesson) {
    return (
      <GradientBackground>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Lesson not found</Text>
        </View>
      </GradientBackground>
    );
  }

  const isLessonComplete = state.completedLessons.includes(lesson.id);

  // Compute octave range from sheet notes so the piano always shows the right keys
  const noteOctaves = lesson.sheetNotes.map((n) =>
    parseInt(n.match(/\d$/)![0]),
  );
  const minOctave = Math.min(...noteOctaves);
  const maxOctave = Math.max(...noteOctaves);
  const octaveRange: [number, number] = [minOctave, maxOctave];

  return (
    <GradientBackground>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* Progress indicator + exit */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.exitButton}
            onPress={() => router.replace("/(tabs)")}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={22} color={Colors.textSecondary} />
          </TouchableOpacity>
          <View style={styles.stepIndicator}>
            <View
              style={[styles.stepDot, currentStep >= 0 && styles.stepDotActive]}
            />
            <View style={styles.stepLine} />
            <View
              style={[styles.stepDot, currentStep >= 1 && styles.stepDotActive]}
            />
          </View>
          <Text style={styles.stepLabel}>
            {currentStep === 0 ? "Learn" : "Practice"}
          </Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>{lesson.title}</Text>
        <Text style={styles.subtitle}>{lesson.subtitle}</Text>

        {/* Concept step */}
        {currentStep === 0 && (
          <View style={styles.conceptSection}>
            <LinearGradient
              colors={Gradients.bgCard}
              style={styles.conceptCard}
            >
              <View style={styles.conceptHeader}>
                <Ionicons name="bulb" size={24} color={Colors.xp} />
                <Text style={styles.conceptTitle}>Concept</Text>
              </View>
              <Text style={styles.conceptText}>{lesson.concept}</Text>
            </LinearGradient>

            {/* Show the relevant piano keys */}
            <Text style={styles.pianoLabel}>Your notes for this lesson:</Text>
            <Piano
              highlightedNotes={lesson.notes}
              onNotePress={() => {}}
              showLabels={true}
              octaveRange={octaveRange}
            />

            <View style={styles.micRow}>
              <TouchableOpacity
                style={[
                  styles.micButton,
                  isListening && styles.micButtonActive,
                ]}
                onPress={isListening ? stopListening : startListening}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={isListening ? "mic" : "mic-outline"}
                  size={20}
                  color={isListening ? Colors.white : Colors.primaryLight}
                />
                <Text
                  style={[styles.micText, isListening && styles.micTextActive]}
                >
                  {isListening ? "Listening..." : "Use Real Piano"}
                </Text>
                {isListening && <Waveform level={audioLevel} barCount={7} />}
              </TouchableOpacity>
              {/* Mute toggle */}
              <TouchableOpacity
                style={styles.muteButton}
                onPress={toggleMute}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={muted ? "volume-mute" : "volume-high"}
                  size={18}
                  color={muted ? Colors.textMuted : Colors.primaryLight}
                />
              </TouchableOpacity>
              {detectedNote && isListening && (
                <View style={styles.micDetected}>
                  <Text style={styles.micDetectedLabel}>Heard:</Text>
                  <LinearGradient
                    colors={Gradients.purpleBright}
                    style={styles.micDetectedBadge}
                  >
                    <Text style={styles.micDetectedText}>
                      {detectedNote.name}
                      {detectedNote.octave}
                    </Text>
                  </LinearGradient>
                </View>
              )}
            </View>

            <TouchableOpacity
              style={[styles.continueButton, styles.continueSolid]}
              onPress={() => setCurrentStep(1)}
              activeOpacity={0.7}
            >
              <Text style={styles.continueText}>Got it! Let's Play</Text>
              <Ionicons name="arrow-forward" size={20} color={Colors.white} />
            </TouchableOpacity>
          </View>
        )}

        {/* Practice step */}
        {currentStep === 1 && (
          <View style={styles.practiceSection}>
            {/* Sheet music */}
            <Text style={styles.sectionLabel}>Follow the notes:</Text>
            <SheetMusic
              notes={lesson.sheetNotes}
              currentNoteIndex={currentNoteIndex}
              playedNotes={playedNotes}
              wrongNote={wrongNote}
            />

            {/* Progress */}
            <View style={styles.practiceProgress}>
              <Text style={styles.progressText}>
                {playedNotes.filter(Boolean).length} of{" "}
                {lesson.sheetNotes.length} notes played
              </Text>
              <ProgressBar
                progress={
                  playedNotes.filter(Boolean).length / lesson.sheetNotes.length
                }
                variant="progress"
                height={8}
              />
            </View>

            {/* Current note prompt */}
            {expectedNote && !completed && (
              <View style={styles.nowPlaying}>
                <Text style={styles.nowPlayingLabel}>Now play:</Text>
                <LinearGradient
                  colors={Gradients.purpleBright}
                  style={styles.nowPlayingBadge}
                >
                  <Text style={styles.nowPlayingText}>
                    {expectedNote.replace("#", "♯")}
                  </Text>
                </LinearGradient>
              </View>
            )}

            {/* Wrong note feedback */}
            {wrongNote && !completed && (
              <View style={styles.wrongNoteRow}>
                <Ionicons name="alert-circle" size={16} color={Colors.error} />
                <Text style={styles.wrongNoteText}>
                  Wrong: {wrongNote.replace("#", "♯")}
                </Text>
              </View>
            )}

            {completed && (
              <View style={styles.completedBanner}>
                {perfect && <Confetti />}
                <LinearGradient
                  colors={Gradients.purpleGlow}
                  style={styles.completedInner}
                >
                  <Ionicons
                    name={perfect ? "trophy" : "checkmark-circle"}
                    size={40}
                    color={perfect ? Colors.xp : Colors.success}
                  />
                  <Text style={styles.completedText}>
                    {perfect ? "Perfect!" : "Lesson Complete!"}
                  </Text>
                  <Text style={styles.completedXP}>+{lesson.xp} XP</Text>
                  {perfect && (
                    <Text style={styles.perfectTag}>Zero mistakes! 🎉</Text>
                  )}
                  {nextLesson ? (
                    <TouchableOpacity
                      style={styles.nextLessonButton}
                      onPress={() =>
                        showRunJump(() =>
                          router.replace(`/lesson/${nextLesson.id}`),
                        )
                      }
                      activeOpacity={0.7}
                    >
                      <Text style={styles.nextLessonText}>
                        Next: {nextLesson.title} →
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={styles.nextLessonButton}
                      onPress={() => router.replace("/(tabs)")}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.nextLessonText}>Back to Lessons</Text>
                    </TouchableOpacity>
                  )}
                </LinearGradient>
              </View>
            )}

            {/* Piano */}
            <Piano
              highlightedNotes={(() => {
                const notes: any[] = [];
                if (expectedNote) notes.push(parseNoteStr(expectedNote));
                if (isListening && detectedNote)
                  notes.push(detectedNoteToPianoNote(detectedNote));
                return notes;
              })()}
              onNotePress={handleNotePress}
              showLabels={true}
              octaveRange={octaveRange}
            />

            {/* Microphone toggle for practice */}
            <TouchableOpacity
              style={[
                styles.micButton,
                styles.micButtonSmall,
                isListening && styles.micButtonActive,
              ]}
              onPress={isListening ? stopListening : startListening}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isListening ? "mic" : "mic-outline"}
                size={16}
                color={isListening ? Colors.white : Colors.primaryLight}
              />
              {isListening && <Waveform level={audioLevel} barCount={5} />}
              <Text
                style={[
                  styles.micTextSmall,
                  isListening && styles.micTextActive,
                ]}
              >
                {isListening ? "Mic on" : "Mic off"}
              </Text>
              {isListening && <Waveform level={audioLevel} barCount={3} />}
            </TouchableOpacity>

            {/* Sound mute toggle */}
            <TouchableOpacity
              style={[styles.micButton, styles.micButtonSmall]}
              onPress={toggleMute}
              activeOpacity={0.7}
            >
              <Ionicons
                name={muted ? "volume-mute" : "volume-high"}
                size={16}
                color={muted ? Colors.textMuted : Colors.primaryLight}
              />
              <Text style={styles.micTextSmall}>
                {muted ? "Muted" : "Sound on"}
              </Text>
            </TouchableOpacity>

            {/* Back to concept */}
            {!completed && (
              <TouchableOpacity
                style={styles.backToConcept}
                onPress={() => setCurrentStep(0)}
              >
                <Text style={styles.backToConceptText}>
                  ← Review the concept
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: Spacing.lg },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  errorText: { color: Colors.error, fontSize: FontSize.lg },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  exitButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.bgSurface,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  stepIndicator: {
    flexDirection: "row",
    alignItems: "center",
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.bgSurface,
    borderWidth: 2,
    borderColor: Colors.textMuted,
  },
  stepDotActive: {
    backgroundColor: Colors.primaryGlow,
    borderColor: Colors.primaryGlow,
  },
  stepLine: {
    width: 32,
    height: 2,
    backgroundColor: Colors.textMuted,
    marginHorizontal: 4,
  },
  stepLabel: {
    color: Colors.primaryGlow,
    fontSize: FontSize.sm,
    fontWeight: "600",
    marginLeft: Spacing.sm,
  },
  title: {
    color: Colors.text,
    fontSize: FontSize.xl,
    fontWeight: "800",
    marginBottom: 2,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    marginBottom: Spacing.md,
  },
  conceptSection: {
    gap: Spacing.sm,
  },
  conceptCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.bgSurface,
  },
  conceptHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  conceptTitle: {
    color: Colors.text,
    fontSize: FontSize.lg,
    fontWeight: "700",
  },
  conceptText: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    lineHeight: 22,
  },
  pianoLabel: {
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
    fontWeight: "600",
    marginTop: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  continueButton: {
    borderRadius: BorderRadius.full,
    overflow: "hidden",
    marginTop: Spacing.md,
    ...Shadow.glow,
  },
  continueSolid: {
    backgroundColor: Colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 24,
    gap: Spacing.sm,
  },
  continueGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 32,
    gap: Spacing.sm,
  },
  continueText: {
    color: Colors.white,
    fontSize: FontSize.lg,
    fontWeight: "800",
  },
  practiceSection: {
    gap: Spacing.md,
  },
  sectionLabel: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: "600",
  },
  practiceProgress: {
    gap: 4,
  },
  progressText: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    textAlign: "right",
  },
  nowPlaying: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.md,
  },
  nowPlayingLabel: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
    fontWeight: "600",
  },
  nowPlayingBadge: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    ...Shadow.glow,
  },
  nowPlayingText: {
    color: Colors.white,
    fontSize: FontSize.xl,
    fontWeight: "800",
  },
  wrongNoteRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  wrongNoteText: {
    color: Colors.error,
    fontSize: FontSize.md,
    fontWeight: "700",
  },
  completedBanner: {
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
  },
  completedInner: {
    padding: Spacing.xl,
    alignItems: "center",
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.success,
    gap: Spacing.sm,
  },
  completedText: {
    color: Colors.text,
    fontSize: FontSize.xl,
    fontWeight: "800",
  },
  completedXP: {
    color: Colors.xp,
    fontSize: FontSize.lg,
    fontWeight: "700",
  },
  backToConcept: {
    alignItems: "center",
    paddingVertical: Spacing.md,
  },
  backToConceptText: {
    color: Colors.primaryLight,
    fontSize: FontSize.sm,
    fontWeight: "600",
  },
  perfectTag: {
    color: Colors.success,
    fontSize: FontSize.sm,
    fontWeight: "700",
    marginTop: -4,
  },
  nextLessonButton: {
    marginTop: Spacing.md,
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  nextLessonText: {
    color: Colors.white,
    fontSize: FontSize.md,
    fontWeight: "700",
    textAlign: "center",
  },
  micRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  micButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.bgSurface,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.primaryDark,
  },
  micButtonSmall: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: Spacing.sm,
    alignSelf: "center",
  },
  micButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primaryGlow,
  },
  muteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.bgSurface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.bgElevated,
  },
  micText: {
    color: Colors.primaryLight,
    fontSize: FontSize.sm,
    fontWeight: "600",
  },
  micTextSmall: {
    color: Colors.primaryLight,
    fontSize: FontSize.xs,
    fontWeight: "600",
  },
  micTextActive: {
    color: Colors.white,
  },
  micDetected: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  micDetectedLabel: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
  },
  micDetectedBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  micDetectedText: {
    color: Colors.white,
    fontSize: FontSize.sm,
    fontWeight: "700",
  },
});
