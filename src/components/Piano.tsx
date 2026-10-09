import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import type { Note, NoteName } from "../constants/lessons";
import { BorderRadius, Colors } from "../constants/theme";
import { playNote } from "../utils/soundEngine";

interface Props {
  highlightedNotes: Note[];
  onNotePress: (note: Note) => void;
  showLabels?: boolean;
  octaveRange?: [number, number];
}

const WHITE_KEYS: NoteName[] = ["C", "D", "E", "F", "G", "A", "B"];

const BLACK_KEYS: { follows: NoteName; label: string }[] = [
  { follows: "C", label: "C♯" },
  { follows: "D", label: "D♯" },
  { follows: "F", label: "F♯" },
  { follows: "G", label: "G♯" },
  { follows: "A", label: "A♯" },
];

const KEY_HEIGHT = 150;
const BLACK_KEY_HEIGHT_RATIO = 0.62;

function isHighlighted(note: Note, list: Note[]): boolean {
  return list.some(
    (n) =>
      n.name === note.name &&
      n.octave === note.octave &&
      (n.isSharp ?? false) === (note.isSharp ?? false) &&
      (n.isFlat ?? false) === (note.isFlat ?? false),
  );
}

function keyId(note: Note): string {
  const suffix = note.isSharp ? "s" : note.isFlat ? "f" : "";
  return `${note.name}${note.octave}${suffix}`;
}

// Map flat notes to the black key they correspond to (the white key it follows)
const FLAT_TO_BLACK_KEY: Partial<Record<NoteName, NoteName>> = {
  D: 'C',
  E: 'D',
  G: 'F',
  A: 'G',
  B: 'A',
};

export default function Piano({
  highlightedNotes,
  onNotePress,
  showLabels = true,
  octaveRange = [3, 4],
}: Props) {
  const [width, setWidth] = useState(0);
  const [low, high] = octaveRange;
  const octaves: number[] = [];
  for (let o = low; o <= high; o++) octaves.push(o);

  const wkW = width / 7;
  const bkW = wkW * 0.55;
  const bkH = KEY_HEIGHT * BLACK_KEY_HEIGHT_RATIO;

  return (
    <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {octaves.map((octave) => (
        <View key={octave} style={styles.octave}>
          {/* White keys */}
          <View style={[styles.whiteRow, { height: KEY_HEIGHT }]}>
            {WHITE_KEYS.map((name, i) => {
              const note: Note = { name, octave: octave as 3 | 4 };
              const active = isHighlighted(note, highlightedNotes);
              return (
                <TouchableOpacity
                  key={keyId(note)}
                  activeOpacity={0.7}
                  onPress={() => {
                    playNote(note);
                    onNotePress(note);
                  }}
                  style={[
                    styles.whiteKey,
                    {
                      width: wkW,
                      height: KEY_HEIGHT,
                      borderLeftWidth: i === 0 ? 0 : 1,
                    },
                    active && styles.whiteKeyActive,
                  ]}
                >
                  {showLabels && (
                    <Text style={[styles.label, active && styles.labelActive]}>
                      {name}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Black keys */}
          {width > 0 &&
            BLACK_KEYS.map((bk) => {
              const idx = WHITE_KEYS.indexOf(bk.follows);
              const sharpNote: Note = {
                name: bk.follows,
                octave: octave as 3 | 4,
                isSharp: true,
              };
              // Also check if a flat note highlights this same black key
              const active =
                isHighlighted(sharpNote, highlightedNotes) ||
                highlightedNotes.some(
                  (n) =>
                    n.isFlat &&
                    FLAT_TO_BLACK_KEY[n.name] === bk.follows &&
                    n.octave === octave,
                );
              const left = (idx + 1) * wkW - bkW / 2;
              // Determine which note to play when pressed
              const flatMatch = highlightedNotes.find(
                (n) =>
                  n.isFlat &&
                  FLAT_TO_BLACK_KEY[n.name] === bk.follows &&
                  n.octave === octave,
              );
              const playNote_ = flatMatch ?? sharpNote;
              return (
                <Pressable
                  key={keyId(sharpNote)}
                  onPress={() => {
                    playNote(playNote_);
                    onNotePress(playNote_);
                  }}
                  style={({ pressed }) => [
                    styles.blackKey,
                    { left, width: bkW, height: bkH },
                    pressed && styles.blackKeyPressed,
                    active && styles.blackKeyActive,
                  ]}
                >
                  {showLabels && (
                    <Text
                      style={[styles.blackLabel, active && styles.labelActive]}
                    >
                      {bk.label}
                    </Text>
                  )}
                </Pressable>
              );
            })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  octave: {
    position: "relative",
    marginBottom: 2,
  },
  whiteRow: {
    flexDirection: "row",
    alignItems: "stretch",
  },
  whiteKey: {
    backgroundColor: Colors.keyWhite,
    borderLeftColor: "rgba(0,0,0,0.12)",
    borderBottomLeftRadius: BorderRadius.sm,
    borderBottomRightRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 12,
  },
  whiteKeyActive: {
    backgroundColor: Colors.primaryGlow,
  },
  label: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: "700",
  },
  labelActive: {
    color: Colors.white,
  },
  blackKey: {
    position: "absolute",
    top: 0,
    backgroundColor: Colors.keyBlack,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    zIndex: 2,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 8,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "rgba(0,0,0,0.3)",
  },
  blackKeyActive: {
    backgroundColor: Colors.primary,
  },
  blackKeyPressed: {
    backgroundColor: "#3A1A5E",
  },
  blackLabel: {
    color: Colors.textSecondary,
    fontSize: 9,
    fontWeight: "600",
  },
});
