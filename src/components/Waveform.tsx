import { useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import Svg, {
  Defs,
  FeGaussianBlur,
  FeMerge,
  FeMergeNode,
  Filter,
  Path,
} from "react-native-svg";

interface Props {
  level: number; // 0 to 1
  barCount?: number; // unused now, kept for API compat
  color?: string;
}

const LINE_COLOR = "#FFD740";
const GLOW_COLOR = "#FFB300";
const WIDTH = 72;
const HEIGHT = 22;
const SEGMENTS = 50;

function buildWavePath(amplitude: number, phase: number): string {
  const dx = WIDTH / SEGMENTS;
  const cy = HEIGHT / 2;
  let d = `M 0,${cy}`;

  for (let i = 0; i <= SEGMENTS; i++) {
    const x = i * dx;
    const y = cy + Math.sin(i * 0.35 + phase) * amplitude;
    d += ` L ${x},${y}`;
  }

  return d;
}

export default function Waveform({ level, color = LINE_COLOR }: Props) {
  const phaseRef = useRef(0);
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      phaseRef.current += 0.2;
      setTick((t) => t + 1);
    }, 30);
    return () => clearInterval(interval);
  }, []);

  const clamped = Math.min(1, Math.max(0, level));
  const amplitude = 0.5 + clamped * 10;
  const pathData = buildWavePath(amplitude, phaseRef.current);

  return (
    <View style={styles.container}>
      <Svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
        <Defs>
          <Filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <FeGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
            <FeMerge>
              <FeMergeNode in="blur" />
              <FeMergeNode in="SourceGraphic" />
            </FeMerge>
          </Filter>
        </Defs>
        {/* Glow layer */}
        <Path
          d={pathData}
          stroke={GLOW_COLOR}
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.4 + clamped * 0.4}
          filter="url(#glow)"
        />
        {/* Core line */}
        <Path
          d={pathData}
          stroke={color}
          strokeWidth="1.2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.7 + clamped * 0.3}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
});
