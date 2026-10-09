import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import GradientBackground from "../../src/components/GradientBackground";
import Piano from "../../src/components/Piano";
import ProgressBar from "../../src/components/ProgressBar";
import SheetMusic from "../../src/components/SheetMusic";
import { Note } from "../../src/constants/lessons";
import { songs } from "../../src/constants/songs";
import {
  BorderRadius,
  Colors,
  FontSize,
  Gradients,
  Shadow,
  Spacing,
} from "../../src/constants/theme";
import { useProgress } from "../../src/context/ProgressContext";
import { useMicrophone } from "../../src/hooks/useMicrophone";
import { detectedNoteToPianoNote } from "../../src/utils/pitchDetector";

export default function SongScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { state, completeSong, loseHeart } = useProgress();
  const { isListening, detectedNote, startListening, stopListening } =
    useMicrophone();

  const song = songs.find((s) => s.id === id);

  const [currentNoteIndex, setCurrentNoteIndex] = useState(0);
  const [playedNotes, setPlayedNotes] = useState<boolean[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (song) {
      setPlayedNotes(new Array(song.notes.length).fill(false));
    }
  }, [song]);

  function parseNoteStr(noteStr: string): Note {
    const match = noteStr.match(/^([A-G])(#?)(\d)$/);
    if (!match) return { name: "C", octave: 4 };
    return {
      name: match[1] as Note["name"],
      octave: parseInt(match[3]) as 3 | 4,
      isSharp: match[2] === "#",
    };
  }

  const expectedNote = song ? song.notes[currentNoteIndex] : null;

  // Compute octave range from song notes
  const noteOctaves = song
    ? song.notes.map((n) => parseInt(n.match(/\d$/)![0]))
    : [4];
  const songOctaveRange: [number, number] = [
    Math.min(...noteOctaves),
    Math.max(...noteOctaves),
  ];

  const handleNotePress = useCallback(
    (note: Note) => {
      if (!started || completed || !expectedNote) return;

      const expected = parseNoteStr(expectedNote);
      const isCorrect =
        note.name === expected.name &&
        note.octave === expected.octave &&
        (note.isSharp ?? false) === (expected.isSharp ?? false);

      if (isCorrect) {
        const newPlayed = [...playedNotes];
        newPlayed[currentNoteIndex] = true;
        setPlayedNotes(newPlayed);

        if (currentNoteIndex + 1 >= song!.notes.length) {
          setCompleted(true);
          completeSong(song!.id, song!.xp);
          Alert.alert("🎵 Song Mastered!", `You earned ${song!.xp} XP!`, [
            { text: "Back to Songs", onPress: () => router.back() },
          ]);
        } else {
          setCurrentNoteIndex(currentNoteIndex + 1);
        }
      } else {
        setMistakes((m) => m + 1);
        if (mistakes + 1 >= 3) {
          loseHeart();
          Alert.alert("💔 Heart Lost!", "Too many mistakes! Try again.");
          setMistakes(0);
        }
      }
    },
    [
      currentNoteIndex,
      expectedNote,
      playedNotes,
      completed,
      mistakes,
      started,
      song,
    ],
  );

  if (!song) {
    return (
      <GradientBackground>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Song not found</Text>
        </View>
      </GradientBackground>
    );
  }

  const isSongComplete = state.completedSongs.includes(song.id);

  return (
    <GradientBackground>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* Exit button */}
        <TouchableOpacity
          style={styles.exitButton}
          onPress={() => router.replace("/(tabs)/songs")}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={22} color={Colors.textSecondary} />
        </TouchableOpacity>

        {/* Song Info */}
        <View style={styles.songInfo}>
          <LinearGradient colors={Gradients.bgCard} style={styles.songCard}>
            <View style={styles.songHeader}>
              <Ionicons
                name="musical-notes"
                size={32}
                color={Colors.primaryGlow}
              />
              <View style={styles.songHeaderText}>
                <Text style={styles.songTitle}>{song.title}</Text>
                <Text style={styles.songComposer}>{song.composer}</Text>
              </View>
            </View>
            <View style={styles.songMeta}>
              <View style={styles.diffBadge}>
                <Text style={styles.diffText}>{song.difficulty}</Text>
              </View>
              <View style={styles.xpBadge}>
                <Ionicons name="star" size={14} color={Colors.xp} />
                <Text style={styles.xpText}>+{song.xp} XP</Text>
              </View>
            </View>
            <Text style={styles.songDescription}>{song.description}</Text>
          </LinearGradient>
        </View>

        {/* Start button */}
        {!started && !isSongComplete && (
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => setStarted(true)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={Gradients.accentButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.startGradient}
            >
              <Ionicons name="play" size={24} color={Colors.white} />
              <Text style={styles.startText}>Start Playing</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {isSongComplete && !started && (
          <View style={styles.alreadyDone}>
            <LinearGradient
              colors={Gradients.bgCard}
              style={styles.alreadyDoneInner}
            >
              <Ionicons
                name="checkmark-circle"
                size={40}
                color={Colors.success}
              />
              <Text style={styles.alreadyDoneText}>Already Mastered!</Text>
              <TouchableOpacity onPress={() => setStarted(true)}>
                <Text style={styles.replayText}>Play again</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        )}

        {/* Playing UI */}
        {started && (
          <>
            {/* Sheet music */}
            <Text style={styles.sectionLabel}>Sheet Music:</Text>
            <SheetMusic
              notes={song.notes}
              currentNoteIndex={currentNoteIndex}
              playedNotes={playedNotes}
            />

            {/* Progress */}
            <View style={styles.practiceProgress}>
              <Text style={styles.progressText}>
                Note {currentNoteIndex + 1} of {song.notes.length}
              </Text>
              <ProgressBar
                progress={currentNoteIndex / song.notes.length}
                variant="progress"
                height={6}
              />
            </View>

            {/* Current note */}
            {expectedNote && !completed && (
              <View style={styles.nowPlaying}>
                <Text style={styles.nowPlayingLabel}>Play:</Text>
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

            {completed && (
              <View style={styles.completedBanner}>
                <LinearGradient
                  colors={Gradients.purpleGlow}
                  style={styles.completedInner}
                >
                  <Ionicons name="trophy" size={40} color={Colors.xp} />
                  <Text style={styles.completedText}>Song Mastered!</Text>
                  <Text style={styles.completedXP}>+{song.xp} XP</Text>
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
              octaveRange={songOctaveRange}
            />

            {/* Microphone toggle */}
            <TouchableOpacity
              style={[styles.micButton, isListening && styles.micButtonActive]}
              onPress={isListening ? stopListening : startListening}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isListening ? "mic" : "mic-outline"}
                size={16}
                color={isListening ? Colors.white : Colors.primaryLight}
              />
              <Text
                style={[styles.micLabel, isListening && styles.micLabelActive]}
              >
                {isListening ? "Mic on" : "Use Real Piano"}
              </Text>
            </TouchableOpacity>

            {/* Reset */}
            {!completed && (
              <TouchableOpacity
                style={styles.resetButton}
                onPress={() => {
                  setCurrentNoteIndex(0);
                  setPlayedNotes(new Array(song.notes.length).fill(false));
                  setMistakes(0);
                }}
              >
                <Text style={styles.resetText}>↺ Start Over</Text>
              </TouchableOpacity>
            )}
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
  exitButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.bgSurface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  errorText: { color: Colors.error, fontSize: FontSize.lg },
  songInfo: { marginBottom: Spacing.lg },
  songCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.bgSurface,
  },
  songHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  songHeaderText: { flex: 1 },
  songTitle: {
    color: Colors.text,
    fontSize: FontSize.xl,
    fontWeight: "800",
  },
  songComposer: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    marginTop: 2,
  },
  songMeta: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  diffBadge: {
    backgroundColor: Colors.primaryDark + "44",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  diffText: {
    color: Colors.primaryGlow,
    fontSize: FontSize.xs,
    fontWeight: "700",
  },
  xpBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,215,64,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  xpText: {
    color: Colors.xp,
    fontSize: FontSize.xs,
    fontWeight: "700",
  },
  songDescription: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
  startButton: {
    borderRadius: BorderRadius.full,
    overflow: "hidden",
    marginBottom: Spacing.lg,
    ...Shadow.glow,
  },
  startGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: Spacing.sm,
  },
  startText: {
    color: Colors.white,
    fontSize: FontSize.lg,
    fontWeight: "800",
  },
  alreadyDone: {
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    marginBottom: Spacing.lg,
  },
  alreadyDoneInner: {
    padding: Spacing.xl,
    alignItems: "center",
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.success,
    gap: Spacing.sm,
  },
  alreadyDoneText: {
    color: Colors.text,
    fontSize: FontSize.lg,
    fontWeight: "800",
  },
  replayText: {
    color: Colors.primaryGlow,
    fontSize: FontSize.md,
    fontWeight: "600",
  },
  sectionLabel: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  practiceProgress: {
    gap: 4,
    marginVertical: Spacing.sm,
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
    marginVertical: Spacing.sm,
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
  completedBanner: {
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    marginVertical: Spacing.sm,
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
  resetButton: {
    alignItems: "center",
    paddingVertical: Spacing.md,
  },
  resetText: {
    color: Colors.primaryLight,
    fontSize: FontSize.sm,
    fontWeight: "600",
  },
  micButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.bgSurface,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.primaryDark,
    marginTop: Spacing.sm,
    alignSelf: "center",
  },
  micButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primaryGlow,
  },
  micLabel: {
    color: Colors.primaryLight,
    fontSize: FontSize.xs,
    fontWeight: "600",
  },
  micLabelActive: {
    color: Colors.white,
  },
});
