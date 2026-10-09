import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { Colors, FontSize } from "../constants/theme";
import { useMascot } from "../context/MascotContext";
import Mascot from "./Mascot";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

export default function MascotOverlay() {
  const { state, hideMascot } = useMascot();
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (state.visible && (state.message || state.running || state.jumping)) {
      opacity.value = withTiming(1, { duration: 200 });
    } else {
      opacity.value = withTiming(0, { duration: 150 });
    }
  }, [state.visible, state.message, state.running, state.jumping]);

  // Running/jumping animation
  const runX = useSharedValue(-120);
  const runY = useSharedValue(0);
  const jumpScale = useSharedValue(1);
  const jumpOpacity = useSharedValue(1);
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (state.running) {
      runY.value = 0;
      rotation.value = 0;
      runX.value = withTiming(SCREEN_W * 0.4, {
        duration: 1500,
        easing: Easing.inOut(Easing.sin),
      });
    } else if (state.jumping) {
      runX.value = withTiming(SCREEN_W + 150, {
        duration: 800,
        easing: Easing.inOut(Easing.quad),
      });
      // Parabolic jump: up then down
      runY.value = withSequence(
        withTiming(-SCREEN_H * 0.25, {
          duration: 350,
          easing: Easing.out(Easing.quad),
        }),
        withTiming(SCREEN_H * 0.5, {
          duration: 450,
          easing: Easing.in(Easing.quad),
        }),
      );
      jumpScale.value = withTiming(0.3, {
        duration: 800,
        easing: Easing.in(Easing.quad),
      });
      jumpOpacity.value = withTiming(0, {
        duration: 600,
        easing: Easing.in(Easing.quad),
      });
      rotation.value = withTiming(15, {
        duration: 800,
        easing: Easing.out(Easing.quad),
      });
    } else {
      runX.value = -120;
      runY.value = 0;
      jumpScale.value = 1;
      jumpOpacity.value = 1;
      rotation.value = 0;
    }
  }, [state.running, state.jumping]);

  // All animated styles at top level (hooks can't be conditional)
  const runAnimStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: runX.value },
      { translateY: runY.value },
      { scaleX: -1 * jumpScale.value },
      { scaleY: jumpScale.value },
      { rotate: `${rotation.value}deg` },
    ],
    opacity: jumpOpacity.value,
  }));

  const fadeStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  if (!state.visible) return null;

  // Full-screen run/jump animation
  if (state.running || state.jumping) {
    return (
      <View style={styles.fullScreen} pointerEvents="none">
        <Animated.View style={[styles.runChar, runAnimStyle]}>
          <Mascot size={80} running={state.running} jumping={state.jumping} />
        </Animated.View>
      </View>
    );
  }

  // Corner message bubble
  if (!state.message) return null;

  return (
    <Animated.View
      style={[styles.container, fadeStyle]}
      pointerEvents="box-none"
    >
      <View style={styles.bubble}>
        <TouchableOpacity style={styles.closeBtn} onPress={hideMascot}>
          <Ionicons name="close" size={10} color={Colors.textMuted} />
        </TouchableOpacity>
        <Text style={styles.text} numberOfLines={2}>
          {state.message.emoji ? `${state.message.emoji} ` : ""}
          {state.message.text}
        </Text>
      </View>
      <View style={styles.headWrap}>
        <View style={{ transform: [{ scaleX: -1 }] }}>
          <Mascot size={42} peeking />
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 90,
    right: 0,
    zIndex: 1000,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  bubble: {
    maxWidth: 180,
    backgroundColor: Colors.bgElevated,
    borderRadius: 10,
    borderTopRightRadius: 3,
    padding: 6,
    paddingRight: 8,
    marginRight: -4,
    marginTop: 6,
    borderWidth: 1,
    borderColor: Colors.primaryGlow,
    alignSelf: "flex-start",
  },
  closeBtn: {
    position: "absolute",
    top: 2,
    right: 2,
    padding: 2,
    zIndex: 1,
  },
  text: {
    color: Colors.text,
    fontSize: FontSize.xs,
    lineHeight: 15,
    paddingRight: 10,
  },
  headWrap: {
    width: 30,
    overflow: "visible",
  },
  fullScreen: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  runChar: {
    position: "absolute",
    bottom: 100,
    left: 0,
  },
});
