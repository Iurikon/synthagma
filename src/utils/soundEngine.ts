// Platform-aware sound engine for piano note playback
import { Platform } from 'react-native';
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import { Directory, File, Paths } from 'expo-file-system';

type NoteName = 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B';

interface Note {
  name: NoteName;
  octave: number;
  isSharp?: boolean;
  isFlat?: boolean;
}

const NOTE_BASE: Record<string, number> = {
  C: -9, D: -7, E: -5, F: -4, G: -2, A: 0, B: 2,
};

function noteToFrequency(note: Note): number {
  const base = NOTE_BASE[note.name] ?? 0;
  const accidentalOffset = note.isSharp ? 1 : note.isFlat ? -1 : 0;
  const semitones = base + accidentalOffset + (note.octave - 4) * 12;
  return 440 * Math.pow(2, semitones / 12);
}

// Web Audio API engine
class WebSoundEngine {
  private ctx: AudioContext | null = null;
  private muted = false;

  private getContext(): AudioContext {
    if (!this.ctx || this.ctx.state === 'closed') {
      this.ctx = new AudioContext();
    }
    return this.ctx;
  }

  setMuted(m: boolean) { this.muted = m; }
  isMuted() { return this.muted; }

  playNote(note: Note) {
    if (this.muted) return;
    try {
      const ctx = this.getContext();
      const freq = noteToFrequency(note);

      // Carrier — fundamental
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = freq;

      // Subtle harmonic overtone for piano-like timbre
      const osc2 = ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.value = freq * 2;

      // Gain envelope (ADSR-like)
      const gain = ctx.createGain();
      const now = ctx.currentTime;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.3, now + 0.01); // attack
      gain.gain.linearRampToValueAtTime(0.2, now + 0.1);  // decay
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2); // release

      const gain2 = ctx.createGain();
      gain2.gain.setValueAtTime(0, now);
      gain2.gain.linearRampToValueAtTime(0.06, now + 0.01);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

      osc.connect(gain);
      osc2.connect(gain2);
      gain.connect(ctx.destination);
      gain2.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 1.3);
      osc2.start(now);
      osc2.stop(now + 0.9);
    } catch {
      // Audio not available — silently ignore
    }
  }

  playBuzzer() {
    if (this.muted) return;
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      // Low discordant buzz
      const osc = ctx.createOscillator();
      osc.type = 'square';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.linearRampToValueAtTime(80, now + 0.3);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.15, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.5);
    } catch {}
  }

  destroy() {
    if (this.ctx && this.ctx.state !== 'closed') {
      this.ctx.close();
      this.ctx = null;
    }
  }
}

// Native engine — synthesizes tones as WAV files, caches them, plays via expo-audio
const SAMPLE_RATE = 22050;

function noteToMidi(note: Note): number {
  const base = NOTE_BASE[note.name] ?? 0;
  const accidental = note.isSharp ? 1 : note.isFlat ? -1 : 0;
  return 69 + base + accidental + (note.octave - 4) * 12; // A4 = 69
}

function encodeWav(samples: Float32Array): Uint8Array {
  const dataSize = samples.length * 2;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);
  const writeStr = (offset: number, text: string) => {
    for (let i = 0; i < text.length; i++) view.setUint8(offset + i, text.charCodeAt(i));
  };
  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true); // PCM fmt chunk size
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, SAMPLE_RATE, true);
  view.setUint32(28, SAMPLE_RATE * 2, true); // byte rate
  view.setUint16(32, 2, true); // block align
  view.setUint16(34, 16, true); // bits per sample
  writeStr(36, 'data');
  view.setUint32(40, dataSize, true);
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return new Uint8Array(buffer);
}

function synthesizeNote(midi: number): Uint8Array {
  const freq = 440 * Math.pow(2, (midi - 69) / 12);
  const duration = 1.3;
  const total = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(total);
  const releaseAt = duration - 0.15;
  for (let i = 0; i < total; i++) {
    const t = i / SAMPLE_RATE;
    const attack = Math.min(1, t / 0.008);
    const decay = Math.exp(-t * 3.2);
    const release = t > releaseAt ? Math.max(0, (duration - t) / 0.15) : 1;
    const env = attack * decay * release;
    const triangle = (2 / Math.PI) * Math.asin(Math.sin(2 * Math.PI * freq * t));
    const overtone = Math.sin(2 * Math.PI * freq * 2 * t);
    samples[i] = env * (0.55 * triangle + 0.18 * overtone);
  }
  return encodeWav(samples);
}

function synthesizeBuzzer(): Uint8Array {
  const duration = 0.5;
  const total = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(total);
  let phase = 0;
  for (let i = 0; i < total; i++) {
    const t = i / SAMPLE_RATE;
    const freq = 150 - 70 * (t / duration); // 150 → 80 Hz sweep
    phase += (2 * Math.PI * freq) / SAMPLE_RATE;
    samples[i] = 0.4 * Math.exp(-t * 6) * (Math.sin(phase) >= 0 ? 1 : -1);
  }
  return encodeWav(samples);
}

class NativeSoundEngine {
  private muted = false;
  private players = new Map<string, AudioPlayer>();
  private sourceUris = new Map<string, string>();
  private soundDir: Directory | null = null;
  private audioModeReady: Promise<void> | null = null;

  private getDir(): Directory {
    if (!this.soundDir) {
      this.soundDir = new Directory(Paths.cache, 'synthagma-sounds');
      try {
        this.soundDir.create({ intermediates: true, idempotent: true });
      } catch {}
    }
    return this.soundDir;
  }

  private ensureAudioMode(): Promise<void> {
    if (!this.audioModeReady) {
      this.audioModeReady = setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
    }
    return this.audioModeReady;
  }

  private getSourceUri(key: string, synth: () => Uint8Array): string {
    const cached = this.sourceUris.get(key);
    if (cached) return cached;
    const file = new File(this.getDir(), `${key}.wav`);
    try {
      if (!file.exists) {
        file.create();
        file.write(synth());
      }
    } catch {}
    this.sourceUris.set(key, file.uri);
    return file.uri;
  }

  private async playSource(key: string, synth: () => Uint8Array) {
    if (this.muted) return;
    try {
      await this.ensureAudioMode();
      const uri = this.getSourceUri(key, synth);
      let player = this.players.get(key);
      if (!player) {
        player = createAudioPlayer(uri);
        this.players.set(key, player);
      }
      player.volume = 1;
      try {
        await player.seekTo(0);
      } catch {}
      player.play();
    } catch {
      // Playback unavailable — silently ignore
    }
  }

  playNote(note: Note) {
    const midi = noteToMidi(note);
    void this.playSource(`note-${midi}`, () => synthesizeNote(midi));
  }

  playBuzzer() {
    void this.playSource('buzzer', synthesizeBuzzer);
  }

  setMuted(m: boolean) {
    this.muted = m;
    if (m) {
      for (const player of this.players.values()) {
        try { player.pause(); } catch {}
      }
    }
  }

  isMuted() { return this.muted; }

  destroy() {
    for (const player of this.players.values()) {
      try { player.remove(); } catch {}
    }
    this.players.clear();
  }
}

const engine: WebSoundEngine | NativeSoundEngine =
  Platform.OS === 'web' ? new WebSoundEngine() : new NativeSoundEngine();

export function playNote(note: Note) {
  engine.playNote(note);
}

export function playBuzzer() {
  engine.playBuzzer();
}

export function setMuted(muted: boolean) {
  engine.setMuted(muted);
}

export function isMuted(): boolean {
  return engine.isMuted();
}

export function destroySoundEngine() {
  engine.destroy();
}
