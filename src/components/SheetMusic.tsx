import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";

const SLOT_WIDTH = 36;

type Interp = ReturnType<Animated.Value["interpolate"]>;

interface PopAnim {
  value: Animated.Value;
  ringScale: Interp;
  ringOpacity: Interp;
  sparkScale: Interp;
  sparkOpacity: Interp;
}
import {
  BorderRadius,
  Colors,
  FontSize,
  Gradients,
  Shadow,
} from "../constants/theme";

interface Props {
  notes: string[];
  currentNoteIndex: number;
  playedNotes: boolean[];
  wrongNote?: string | null; // e.g. "F4" — shown in red above/below the expected note
}

function parseNote(noteStr: string): {
  name: string;
  octave: number;
  isSharp: boolean;
  isFlat: boolean;
} {
  const match = noteStr.match(/^([A-G])([#b]?)(\d)$/);
  if (!match) return { name: noteStr, octave: 4, isSharp: false, isFlat: false };
  return {
    name: match[1],
    octave: parseInt(match[3]),
    isSharp: match[2] === "#",
    isFlat: match[2] === "b",
  };
}

function getStaffPosition(noteStr: string): number {
  const { name, octave } = parseNote(noteStr);
  const noteValues: Record<string, number> = {
    C: 0,
    D: 1,
    E: 2,
    F: 3,
    G: 4,
    A: 5,
    B: 6,
  };
  // Staff lines at y=24,44,64,84,104 (from top of 140px staff)
  // E4 = bottom line = y=104
  const e4Pos = 104;
  const stepsFromE = noteValues[name] - 2; // E=0, F=1, G=2, ... C=-2, D=-1
  const octOffset = (octave - 4) * 35;
  return e4Pos - stepsFromE * 10 - octOffset;
}

export default function SheetMusic({
  notes,
  currentNoteIndex,
  playedNotes,
  wrongNote,
}: Props) {
  const staffLines = [0, 1, 2, 3, 4];
  const wrongPos = wrongNote ? getStaffPosition(wrongNote) : null;

  const notesScrollRef = useRef<ScrollView>(null);
  const namesScrollRef = useRef<ScrollView>(null);
  const popAnims = useRef<Map<number, PopAnim>>(new Map());
  const prevPlayedRef = useRef<boolean[]>([]);
  const [viewportWidth, setViewportWidth] = useState(0);

  const getPopAnim = (index: number): PopAnim => {
    const existing = popAnims.current.get(index);
    if (existing) return existing;
    const value = new Animated.Value(0);
    const anim: PopAnim = {
      value,
      ringScale: value.interpolate({
        inputRange: [0, 1],
        outputRange: [0.7, 1.9],
      }),
      ringOpacity: value.interpolate({
        inputRange: [0, 0.15, 1],
        outputRange: [0, 0.9, 0],
      }),
      sparkScale: value.interpolate({
        inputRange: [0, 0.3, 1],
        outputRange: [0, 1.3, 1],
      }),
      sparkOpacity: value.interpolate({
        inputRange: [0, 0.2, 0.75, 1],
        outputRange: [0, 1, 1, 0],
      }),
    };
    popAnims.current.set(index, anim);
    return anim;
  };

  // Pop + twinkle when a note is played correctly
  useEffect(() => {
    const prev = prevPlayedRef.current;
    for (let i = 0; i < playedNotes.length; i++) {
      if (playedNotes[i] && !prev[i]) {
        const anim = getPopAnim(i);
        anim.value.setValue(0);
        Animated.timing(anim.value, {
          toValue: 1,
          duration: 650,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start();
      }
    }
    prevPlayedRef.current = playedNotes;
  }, [playedNotes]);

  // Keep the current note in view with upcoming notes ahead as the song progresses
  useEffect(() => {
    if (viewportWidth <= 0) return;
    const target = Math.max(
      0,
      currentNoteIndex * SLOT_WIDTH - (viewportWidth - SLOT_WIDTH) * 0.6,
    );
    notesScrollRef.current?.scrollTo({ x: target, animated: true });
    namesScrollRef.current?.scrollTo({ x: target, animated: true });
  }, [currentNoteIndex, viewportWidth]);

  // Keep the two rows in sync when the user drags either one
  const syncScroll =
    (from: "notes" | "names") =>
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const x = event.nativeEvent.contentOffset.x;
      if (from === "notes") {
        namesScrollRef.current?.scrollTo({ x, animated: false });
      } else {
        notesScrollRef.current?.scrollTo({ x, animated: false });
      }
    };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={Gradients.bgCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.sheet}
      >
        {/* Staff */}
        <View style={styles.staff}>
          {/* 5 staff lines at fixed positions */}
          {[0, 1, 2, 3, 4].map((line) => (
            <View
              key={line}
              style={[styles.staffLine, { top: 24 + line * 20 }]}
            />
          ))}

          {/* Notes */}
          <ScrollView
            ref={notesScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.notesScroll}
            onLayout={(e) => setViewportWidth(e.nativeEvent.layout.width)}
            onScroll={syncScroll("notes")}
            scrollEventThrottle={16}
          >
            <View style={styles.notesRow}>
              {notes.map((noteStr, i) => {
                const pos = getStaffPosition(noteStr);
                const isCurrent = i === currentNoteIndex;
                const isPlayed = playedNotes[i];
                const isSharp = noteStr.includes("#");
                const pop = isPlayed ? getPopAnim(i) : null;

                return (
                  <View key={i} style={[styles.noteSlot]}>
                    {/* Sharp accidental */}
                    {isSharp && (
                      <Text style={[styles.sharpSign, { top: pos - 12 }]}>
                        ♯
                      </Text>
                    )}
                    {/* Note head */}
                    <View
                      style={[
                        styles.noteHead,
                        { top: pos - 14 },
                        isCurrent && styles.noteHeadCurrent,
                        isPlayed && styles.noteHeadPlayed,
                      ]}
                    >
                      <Text
                        style={[
                          styles.noteText,
                          (isCurrent || isPlayed) && styles.noteTextActive,
                        ]}
                      >
                        {noteStr.replace("#", "♯")}
                      </Text>
                    </View>
                    {pop && (
                      <View pointerEvents="none">
                        <Animated.View
                          style={[
                            styles.popRing,
                            {
                              top: pos - 17,
                              opacity: pop.ringOpacity,
                              transform: [{ scale: pop.ringScale }],
                            },
                          ]}
                        />
                        <Animated.Text
                          style={[
                            styles.sparkle,
                            {
                              top: pos - 40,
                              opacity: pop.sparkOpacity,
                              transform: [{ scale: pop.sparkScale }],
                            },
                          ]}
                        >
                          ✨
                        </Animated.Text>
                      </View>
                    )}
                    {/* Ledger line for middle C */}
                    {noteStr === "C4" && (
                      <View style={[styles.ledgerLine, { top: pos }]} />
                    )}
                    {/* Wrong note marker */}
                    {wrongPos !== null && isCurrent && wrongNote && (
                      <View
                        style={[styles.wrongNoteHead, { top: wrongPos - 14 }]}
                      >
                        <Text style={styles.wrongNoteText}>
                          {wrongNote.replace("#", "♯")}
                        </Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* Note name row */}
        <ScrollView
          ref={namesScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.noteNamesScroll}
          onScroll={syncScroll("names")}
          scrollEventThrottle={16}
        >
          <View style={styles.noteNamesRow}>
            {notes.map((noteStr, i) => (
              <View key={i} style={[styles.noteNameSlot]}>
                <Text
                  style={[
                    styles.noteNameText,
                    i === currentNoteIndex && styles.noteNameCurrent,
                    playedNotes[i] && styles.noteNamePlayed,
                  ]}
                >
                  {noteStr.replace("#", "♯")}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    ...Shadow.glow,
  },
  sheet: {
    padding: 16,
    paddingBottom: 8,
    borderRadius: BorderRadius.lg,
  },
  staff: {
    height: 150,
    position: "relative",
    overflow: "visible",
  },
  staffLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: Colors.textMuted,
    opacity: 0.25,
  },
  notesScroll: {
    position: "absolute",
    top: 0,
    left: 40,
    right: 0,
    bottom: 0,
    zIndex: 2,
  },
  notesRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    height: "100%",
    paddingLeft: 8,
  },
  noteSlot: {
    width: 36,
    height: "100%",
    position: "relative",
    alignItems: "center",
  },
  noteHead: {
    position: "absolute",
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.bgSurface,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    left: 4,
    zIndex: 3,
  },
  noteHeadCurrent: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primaryGlow,
    transform: [{ scale: 1.2 }],
    ...Shadow.glow,
  },
  noteHeadPlayed: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
    opacity: 0.5,
  },
  noteText: {
    color: Colors.primaryLight,
    fontSize: 9,
    fontWeight: "700",
  },
  noteTextActive: {
    color: Colors.white,
  },
  ledgerLine: {
    position: "absolute",
    width: 36,
    height: 1,
    backgroundColor: Colors.textMuted,
    left: -2,
  },
  wrongNoteHead: {
    position: "absolute",
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,82,82,0.2)",
    borderWidth: 2,
    borderColor: Colors.error,
    left: 4,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 4,
  },
  wrongNoteText: {
    color: Colors.error,
    fontSize: 9,
    fontWeight: "700",
  },
  sharpSign: {
    position: "absolute",
    left: 0,
    top: 10,
    color: Colors.accent,
    fontSize: 14,
    fontWeight: "700",
    zIndex: 3,
  },
  noteNamesScroll: {
    marginTop: 4,
  },
  noteNamesRow: {
    flexDirection: "row",
    paddingLeft: 48,
  },
  noteNameSlot: {
    width: 36,
    alignItems: "center",
  },
  noteNameText: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    fontWeight: "600",
  },
  noteNameCurrent: {
    color: Colors.primaryGlow,
    fontWeight: "800",
  },
  noteNamePlayed: {
    color: Colors.success,
  },
  popRing: {
    position: "absolute",
    left: 1,
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    borderColor: Colors.success,
    zIndex: 4,
  },
  sparkle: {
    position: "absolute",
    left: 0,
    width: SLOT_WIDTH,
    textAlign: "center",
    fontSize: 16,
    zIndex: 5,
  },
});
