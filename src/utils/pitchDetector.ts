// Autocorrelation-based pitch detection
// Maps detected frequency to the nearest musical note

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const A4_FREQ = 440;
const A4_MIDI = 69;

function midiToNote(midi: number): { name: string; octave: number; cents: number } {
  const noteIndex = Math.round(midi) % 12;
  const octave = Math.floor(Math.round(midi) / 12) - 1;
  const cents = Math.round((midi - Math.round(midi)) * 100);
  return { name: NOTE_NAMES[noteIndex], octave, cents };
}

function frequencyToMidi(freq: number): number {
  return 12 * Math.log2(freq / A4_FREQ) + A4_MIDI;
}

export interface DetectedNote {
  name: string;
  octave: number;
  frequency: number;
  confidence: number;
}

/**
 * Detect pitch from a time-domain audio buffer using autocorrelation.
 * Returns the detected note or null if no clear pitch was found.
 */
export function detectPitch(buffer: Float32Array, sampleRate: number): DetectedNote | null {
  if (buffer.length < 256) return null;

  // Compute RMS to check if there's enough signal
  let rms = 0;
  for (let i = 0; i < buffer.length; i++) {
    rms += buffer[i] * buffer[i];
  }
  rms = Math.sqrt(rms / buffer.length);
  if (rms < 0.01) return null; // Too quiet

  // Autocorrelation
  const maxLag = Math.min(buffer.length - 1, Math.floor(sampleRate / 65)); // ~65 Hz minimum
  const minLag = Math.max(1, Math.floor(sampleRate / 2100)); // ~2100 Hz maximum
  const correlations = new Float32Array(maxLag);

  for (let lag = minLag; lag < maxLag; lag++) {
    let sum = 0;
    for (let i = 0; i < buffer.length - lag; i++) {
      sum += buffer[i] * buffer[i + lag];
    }
    correlations[lag] = sum;
  }

  // Find the peak in autocorrelation
  let bestLag = minLag;
  let bestCorr = correlations[minLag];

  for (let lag = minLag + 1; lag < maxLag; lag++) {
    if (correlations[lag] > bestCorr) {
      bestCorr = correlations[lag];
      bestLag = lag;
    }
  }

  // Parabolic interpolation for better accuracy
  const prev = correlations[bestLag - 1] || 0;
  const curr = correlations[bestLag];
  const next = correlations[bestLag + 1] || 0;
  const delta = 0.5 * (prev - next) / (prev - 2 * curr + next);
  const refinedLag = bestLag + (isNaN(delta) ? 0 : delta);

  const frequency = sampleRate / refinedLag;

  // Confidence based on correlation strength
  const confidence = Math.min(1, bestCorr / (correlations[bestLag] * 1.1) * 3);

  if (frequency < 60 || frequency > 2000 || confidence < 0.3) return null;

  const midi = frequencyToMidi(frequency);
  const { name, octave, cents } = midiToNote(midi);

  // Only return if we're close to a real note (within 40 cents)
  if (Math.abs(cents) > 40) return null;

  return {
    name,
    octave,
    frequency: Math.round(frequency * 10) / 10,
    confidence: Math.round(confidence * 100) / 100,
  };
}

/**
 * Convert detected note to the format used by the Piano component
 */
export function detectedNoteToPianoNote(detected: DetectedNote): { name: string; octave: number; isSharp: boolean } {
  return {
    name: detected.name.replace('#', '') as 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B',
    octave: detected.octave,
    isSharp: detected.name.includes('#'),
  };
}
