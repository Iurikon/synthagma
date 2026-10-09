import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { DetectedNote, detectPitch } from '../utils/pitchDetector';

interface UseMicrophoneReturn {
  isListening: boolean;
  detectedNote: DetectedNote | null;
  audioLevel: number;
  startListening: () => Promise<void>;
  stopListening: () => void;
  hasPermission: boolean | null;
  error: string | null;
}

export function useMicrophone(): UseMicrophoneReturn {
  const [isListening, setIsListening] = useState(false);
  const [detectedNote, setDetectedNote] = useState<DetectedNote | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);

  const stopWebAudio = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    analyserRef.current = null;
  }, []);

  const processWebAudio = useCallback(() => {
    if (!analyserRef.current) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.fftSize;
    const timeData = new Float32Array(bufferLength);
    analyser.getFloatTimeDomainData(timeData);

    // Compute RMS audio level
    let rms = 0;
    for (let i = 0; i < timeData.length; i++) rms += timeData[i] * timeData[i];
    rms = Math.sqrt(rms / timeData.length);
    setAudioLevel(Math.min(1, rms * 30)); // Scale up so normal speech hits ~0.5

    const result = detectPitch(timeData, audioContextRef.current?.sampleRate || 44100);
    if (result) {
      setDetectedNote(result);
    } else {
      // Fade out detected note when no pitch
    }

    rafRef.current = requestAnimationFrame(processWebAudio);
  }, []);

  const startWebAudio = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      });
      streamRef.current = stream;

      const ctx = new AudioContext();
      audioContextRef.current = ctx;

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0;
      source.connect(analyser);
      analyserRef.current = analyser;

      setIsListening(true);
      setError(null);
      processWebAudio();
    } catch (e: any) {
      setError(e.message || 'Microphone access denied');
      setIsListening(false);
    }
  }, [processWebAudio]);

  const startNativeAudio = useCallback(async () => {
    setError('Microphone not supported on native yet (expo-av removed)');
  }, []);

  const stopNativeAudio = useCallback(() => {
    // No-op
  }, []);

  const startListening = useCallback(async () => {
    if (Platform.OS === 'web') {
      await startWebAudio();
    } else {
      await startNativeAudio();
    }
  }, [startWebAudio, startNativeAudio]);

  const stopListening = useCallback(() => {
    if (Platform.OS === 'web') {
      stopWebAudio();
    } else {
      stopNativeAudio();
    }
    setIsListening(false);
    setDetectedNote(null);
    setAudioLevel(0);
  }, [stopWebAudio, stopNativeAudio]);

  useEffect(() => {
    return () => {
      stopWebAudio();
      stopNativeAudio();
    };
  }, []);

  return { isListening, detectedNote, audioLevel, startListening, stopListening, hasPermission, error };
}
