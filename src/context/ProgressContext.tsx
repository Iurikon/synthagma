import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
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
import { useAuth } from "./AuthContext";

interface ProgressState {
  xp: number;
  streak: number;
  lastActiveDate: string | null;
  completedLessons: string[];
  completedSongs: string[];
  hearts: number;
  maxHearts: number;
}

type ProgressAction =
  | { type: "COMPLETE_LESSON"; lessonId: string; xpGained: number }
  | { type: "COMPLETE_SONG"; songId: string; xpGained: number }
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
  hearts: 5,
  maxHearts: 5,
};

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
  loseHeart: () => void;
  refillHearts: () => void;
  checkStreak: (today: string) => void;
}

const ProgressContext = createContext<ProgressContextType | null>(null);
const STORAGE_KEY = "@synthagma_progress";

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(progressReducer, initialState);
  const { user } = useAuth();
  const [loaded, setLoaded] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load progress: Firestore first, then AsyncStorage, then migrate local → cloud
  useEffect(() => {
    setLoaded(false);
    if (user) {
      const userDoc = doc(db, "users", user.uid);
      const unsub = onSnapshot(
        userDoc,
        (snap) => {
          if (snap.exists() && snap.data().progress) {
            dispatch({
              type: "LOAD_STATE",
              state: snap.data().progress as ProgressState,
            });
          } else {
            // No cloud data — migrate from AsyncStorage
            AsyncStorage.getItem(STORAGE_KEY).then((json) => {
              if (json) {
                const local = JSON.parse(json) as ProgressState;
                dispatch({ type: "LOAD_STATE", state: local });
              }
            });
          }
          setLoaded(true);
        },
        () => {
          // Firestore failed — fall back to AsyncStorage
          AsyncStorage.getItem(STORAGE_KEY).then((json) => {
            if (json) dispatch({ type: "LOAD_STATE", state: JSON.parse(json) });
          });
          setLoaded(true);
        },
      );
      return () => unsub();
    } else {
      // Not logged in — load from AsyncStorage
      AsyncStorage.getItem(STORAGE_KEY).then((json) => {
        if (json) dispatch({ type: "LOAD_STATE", state: JSON.parse(json) });
        setLoaded(true);
      });
    }
  }, [user]);

  // Save to Firestore + AsyncStorage — only after initial load, with debounce
  useEffect(() => {
    if (!loaded) return;

    // Always save to AsyncStorage immediately (local cache)
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});

    // Debounce Firestore writes (avoid rapid saves)
    if (!user?.uid) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      const userDoc = doc(db, "users", user.uid);
      setDoc(userDoc, { progress: state }, { merge: true }).catch(() => {});
    }, 1500);
  }, [state, user?.uid, loaded]);

  const completeLesson = (lessonId: string, xpGained: number) =>
    dispatch({ type: "COMPLETE_LESSON", lessonId, xpGained });
  const completeSong = (songId: string, xpGained: number) =>
    dispatch({ type: "COMPLETE_SONG", songId, xpGained });
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
