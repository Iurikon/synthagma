import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import { db } from "../config/firebase";
import {
  QUIZ_PASS_THRESHOLD,
  QUIZ_SCORE_UNKNOWN,
} from "../constants/sections";
import { useAuth } from "./AuthContext";

interface ProgressState {
  xp: number;
  streak: number;
  lastActiveDate: string | null;
  completedLessons: string[];
  completedSongs: string[];
  quizScores: Record<string, number>;
  hearts: number;
  maxHearts: number;
}

type ProgressAction =
  | { type: "COMPLETE_LESSON"; lessonId: string; xpGained: number }
  | { type: "COMPLETE_SONG"; songId: string; xpGained: number }
  | { type: "COMPLETE_QUIZ"; sectionId: string; score: number; xpGained: number }
  | { type: "LOSE_HEART" }
  | { type: "REFILL_HEARTS" }
  | { type: "CHECK_STREAK"; today: string }
  | { type: "LOAD_STATE"; state: ProgressState };

const initialState: ProgressState = {
  xp: 0,
  streak: 0,
  lastActiveDate: null,
  completedLessons: [],
  completedSongs: [],
  quizScores: {},
  hearts: 5,
  maxHearts: 5,
};

// Legacy key from the localStorage/AsyncStorage-only implementation. It is
// read once to migrate existing progress into Firestore and never written again.
const LEGACY_STORAGE_KEY = "@synthagma_progress";

function normalizeQuizScores(raw: unknown): Record<string, number> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};

  return Object.fromEntries(
    Object.entries(raw)
      .filter(([, score]) => typeof score === "number" && Number.isFinite(score))
      .map(([sectionId, score]) => [
        sectionId,
        Math.max(QUIZ_SCORE_UNKNOWN, Math.min(100, score as number)),
      ]),
  );
}

function normalizeProgress(raw: unknown): ProgressState {
  const data = (raw ?? {}) as Partial<ProgressState>;

  const storedLessons = Array.isArray(data.completedLessons)
    ? data.completedLessons.filter((id): id is string => typeof id === "string")
    : [];
  const quizScores = normalizeQuizScores(data.quizScores);

  // Older versions stored quiz completions (without scores) in completedLessons.
  // Move them to quizScores so completedLessons only ever contains lessons.
  for (const id of storedLessons) {
    if (!id.startsWith("quiz-")) continue;
    const sectionId = id.slice("quiz-".length);
    if (sectionId && quizScores[sectionId] === undefined) {
      quizScores[sectionId] = QUIZ_SCORE_UNKNOWN;
    }
  }

  return {
    xp: typeof data.xp === "number" && Number.isFinite(data.xp) ? data.xp : 0,
    streak:
      typeof data.streak === "number" && Number.isFinite(data.streak)
        ? data.streak
        : 0,
    lastActiveDate:
      typeof data.lastActiveDate === "string" ? data.lastActiveDate : null,
    completedLessons: storedLessons.filter((id) => !id.startsWith("quiz-")),
    completedSongs: Array.isArray(data.completedSongs)
      ? data.completedSongs.filter((id): id is string => typeof id === "string")
      : [],
    quizScores,
    hearts:
      typeof data.hearts === "number" && Number.isFinite(data.hearts)
        ? Math.max(0, data.hearts)
        : initialState.hearts,
    maxHearts:
      typeof data.maxHearts === "number" && Number.isFinite(data.maxHearts)
        ? data.maxHearts
        : initialState.maxHearts,
  };
}

function progressReducer(
  state: ProgressState,
  action: ProgressAction,
): ProgressState {
  switch (action.type) {
    case "COMPLETE_LESSON":
      return {
        ...state,
        xp: state.xp + action.xpGained,
        completedLessons: state.completedLessons.includes(action.lessonId)
          ? state.completedLessons
          : [...state.completedLessons, action.lessonId],
      };
    case "COMPLETE_SONG":
      return {
        ...state,
        xp: state.xp + action.xpGained,
        completedSongs: state.completedSongs.includes(action.songId)
          ? state.completedSongs
          : [...state.completedSongs, action.songId],
      };
    case "COMPLETE_QUIZ": {
      const previousBest = state.quizScores[action.sectionId];
      const best = Math.max(previousBest ?? QUIZ_SCORE_UNKNOWN, action.score);
      return {
        ...state,
        xp: state.xp + action.xpGained,
        quizScores: { ...state.quizScores, [action.sectionId]: best },
      };
    }
    case "LOSE_HEART":
      return { ...state, hearts: Math.max(0, state.hearts - 1) };
    case "REFILL_HEARTS":
      return { ...state, hearts: state.maxHearts };
    case "CHECK_STREAK": {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];
      if (state.lastActiveDate === action.today) return state;
      if (state.lastActiveDate === yesterdayStr) {
        return {
          ...state,
          streak: state.streak + 1,
          lastActiveDate: action.today,
        };
      }
      return { ...state, streak: 1, lastActiveDate: action.today };
    }
    case "LOAD_STATE":
      return action.state;
    default:
      return state;
  }
}

interface ProgressContextType {
  state: ProgressState;
  completeLesson: (lessonId: string, xpGained: number) => void;
  completeSong: (songId: string, xpGained: number) => void;
  completeQuiz: (sectionId: string, score: number, xpGained: number) => void;
  loseHeart: () => void;
  refillHearts: () => void;
  checkStreak: (today: string) => void;
}

const ProgressContext = createContext<ProgressContextType | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const uid = user?.uid ?? null;
  const [state, dispatch] = useReducer(progressReducer, initialState);
  // UID whose progress has been reconciled with Firestore. Until this is set,
  // local changes must never be written back (they could overwrite cloud data).
  const [hydratedUid, setHydratedUid] = useState<string | null>(null);
  const lastSavedRef = useRef<string | null>(null);

  useEffect(() => {
    dispatch({ type: "LOAD_STATE", state: initialState });
    lastSavedRef.current = null;
    setHydratedUid(null);

    if (!uid) return;

    const userDoc = doc(db, "users", uid);
    let cancelled = false;
    let migrationStarted = false;

    const applyCloudProgress = (progress: ProgressState) => {
      lastSavedRef.current = JSON.stringify(progress);
      dispatch({ type: "LOAD_STATE", state: progress });
      setHydratedUid(uid);
      // Cloud is authoritative now; the legacy local copy is obsolete.
      AsyncStorage.removeItem(LEGACY_STORAGE_KEY).catch(() => {});
    };

    const migrateLegacyProgress = async () => {
      let legacy: ProgressState | null = null;
      try {
        const json = await AsyncStorage.getItem(LEGACY_STORAGE_KEY);
        if (json) legacy = normalizeProgress(JSON.parse(json));
      } catch {
        legacy = null;
      }
      if (cancelled) return;

      const progress = legacy ?? initialState;
      lastSavedRef.current = JSON.stringify(progress);
      dispatch({ type: "LOAD_STATE", state: progress });
      setHydratedUid(uid);

      if (!legacy) return;

      try {
        await setDoc(
          userDoc,
          { progress, progressUpdatedAt: serverTimestamp() },
          { merge: true },
        );
        await AsyncStorage.removeItem(LEGACY_STORAGE_KEY);
      } catch (error) {
        // Keep the legacy copy so the migration can be retried on next launch.
        lastSavedRef.current = null;
        console.warn("Failed to migrate local progress to Firestore", error);
      }
    };

    const unsubscribe = onSnapshot(
      userDoc,
      (snap) => {
        if (cancelled) return;

        // Firestore replays local writes with hasPendingWrites set. Keep the
        // optimistic local state until the server acknowledges it.
        if (snap.metadata.hasPendingWrites) return;

        const cloudProgress = snap.data()?.progress;
        if (cloudProgress) {
          applyCloudProgress(normalizeProgress(cloudProgress));
          return;
        }

        // A cached "missing" document does not prove it is missing on the
        // server, so only migrate after a server snapshot confirms it.
        if (snap.metadata.fromCache || migrationStarted) return;
        migrationStarted = true;
        void migrateLegacyProgress();
      },
      (error) => {
        console.warn("Progress sync failed", error);
      },
    );

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [uid]);

  // Persist every state change to Firestore. Skipped until the user's cloud
  // document has been reconciled, and for states that came from Firestore.
  useEffect(() => {
    if (!uid || hydratedUid !== uid) return;

    const serialized = JSON.stringify(state);
    if (serialized === lastSavedRef.current) return;

    lastSavedRef.current = serialized;
    setDoc(
      doc(db, "users", uid),
      { progress: state, progressUpdatedAt: serverTimestamp() },
      { merge: true },
    ).catch((error) => {
      lastSavedRef.current = null;
      console.warn("Failed to save progress to Firestore", error);
    });
  }, [state, uid, hydratedUid]);

  const completeLesson = (lessonId: string, xpGained: number) =>
    dispatch({ type: "COMPLETE_LESSON", lessonId, xpGained });
  const completeSong = (songId: string, xpGained: number) =>
    dispatch({ type: "COMPLETE_SONG", songId, xpGained });
  const completeQuiz = (sectionId: string, score: number, xpGained: number) =>
    dispatch({ type: "COMPLETE_QUIZ", sectionId, score, xpGained });
  const loseHeart = () => dispatch({ type: "LOSE_HEART" });
  const refillHearts = () => dispatch({ type: "REFILL_HEARTS" });
  const checkStreak = (today: string) =>
    dispatch({ type: "CHECK_STREAK", today });

  return (
    <ProgressContext.Provider
      value={{
        state,
        completeLesson,
        completeSong,
        completeQuiz,
        loseHeart,
        refillHearts,
        checkStreak,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress must be used within ProgressProvider");
  return ctx;
}
