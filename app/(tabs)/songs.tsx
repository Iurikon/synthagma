import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import GradientBackground from "../../src/components/GradientBackground";
import SongCard from "../../src/components/SongCard";
import { songs } from "../../src/constants/songs";
import { Colors, FontSize, Spacing } from "../../src/constants/theme";
import { useProgress } from "../../src/context/ProgressContext";

export default function SongsScreen() {
  const router = useRouter();
  const { state } = useProgress();
  const insets = useSafeAreaInsets();

  function isSongLocked(song: (typeof songs)[0]): boolean {
    return !song.requiredLessons.every((lid) =>
      state.completedLessons.includes(lid),
    );
  }

  return (
    <GradientBackground>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + Spacing.lg },
        ]}
      >
        <Text style={styles.title}>🎵 Song Library</Text>
        <Text style={styles.subtitle}>
          Put your skills to the test! Unlock songs by completing the required
          lessons.
        </Text>

        {songs.map((song) => (
          <SongCard
            key={song.id}
            title={song.title}
            composer={song.composer}
            difficulty={song.difficulty}
            xp={song.xp}
            completed={state.completedSongs.includes(song.id)}
            locked={isSongLocked(song)}
            onPress={() => router.push(`/song/${song.id}`)}
          />
        ))}

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
});
