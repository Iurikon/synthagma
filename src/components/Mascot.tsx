import LottieView from "lottie-react-native";
import { useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";

interface MascotProps {
  size?: number;
  running?: boolean;
  jumping?: boolean;
  peeking?: boolean;
}

const dancingLlama = require("../../assets/dancing_llama.json");
const sideRunLlama = require("../../assets/side_run_loop_llama.json");
const jumpLlama = require("../../assets/jump_loop_llama.json");
const peekLlama = require("../../assets/llama_peek_vector_only.json");

export default function Mascot({
  size = 100,
  running = false,
  jumping = false,
  peeking = false,
}: MascotProps) {
  const lottieRef = useRef<LottieView>(null);

  const source = peeking
    ? peekLlama
    : jumping
      ? jumpLlama
      : running
        ? sideRunLlama
        : dancingLlama;

  useEffect(() => {
    if (lottieRef.current) {
      lottieRef.current.play();
    }
  }, [source]);

  return (
    <View style={[styles.wrapper, { width: size, height: size * 1.3 }]}>
      <View
        style={[styles.shadow, { width: size * 0.5, height: size * 0.07 }]}
      />
      <LottieView
        ref={lottieRef}
        source={source}
        autoPlay
        loop
        speed={peeking ? 0.35 : 1}
        style={{ width: size, height: size * 1.3 }}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: "center", justifyContent: "flex-end" },
  shadow: {
    position: "absolute",
    bottom: 2,
    backgroundColor: "rgba(157,48,255,0.2)",
    borderRadius: 999,
    alignSelf: "center",
    zIndex: 1,
  },
});
