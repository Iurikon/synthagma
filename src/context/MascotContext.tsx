import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import type {
  MascotMessage,
  MessageTrigger,
} from "../constants/mascotMessages";
import { getRandomMessage } from "../constants/mascotMessages";

interface MascotState {
  visible: boolean;
  message: MascotMessage | null;
  running: boolean;
  jumping: boolean;
  onRunComplete?: () => void;
  showOnHome: boolean;
}

interface MascotContextValue {
  state: MascotState;
  showMessage: (trigger: MessageTrigger, vars?: Record<string, string>) => void;
  hideMascot: () => void;
  showMascot: () => void;
  showRunJump: (onComplete: () => void) => void;
  setShowOnHome: (show: boolean) => void;
}

const MascotContext = createContext<MascotContextValue>({
  state: {
    visible: false,
    message: null,
    running: false,
    jumping: false,
    showOnHome: false,
  },
  showMessage: () => {},
  hideMascot: () => {},
  showMascot: () => {},
  showRunJump: (onComplete) => onComplete(),
  setShowOnHome: () => {},
});

export function MascotProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<MascotState>({
    visible: false,
    message: null,
    running: false,
    jumping: false,
    showOnHome: false,
  });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const runCompleteRef = useRef<(() => void) | null>(null);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const showMessage = useCallback(
    (trigger: MessageTrigger, vars?: Record<string, string>) => {
      clearTimer();
      const msg = getRandomMessage(trigger, vars);
      setState((s) => ({
        ...s,
        visible: true,
        message: msg,
        running: false,
        jumping: false,
      }));

      const duration = msg.duration ?? 5000;
      timerRef.current = setTimeout(() => {
        setState((s) => ({
          ...s,
          message: null,
          ...(s.running || s.jumping ? {} : { visible: false }),
        }));
      }, duration);
    },
    [],
  );

  const hideMascot = useCallback(() => {
    clearTimer();
    setState((s) => ({
      ...s,
      visible: false,
      message: null,
      running: false,
      jumping: false,
    }));
  }, []);

  const showMascot = useCallback(() => {
    setState((s) => ({ ...s, visible: true }));
  }, []);

  const showRunJump = useCallback((onComplete: () => void) => {
    clearTimer();
    runCompleteRef.current = onComplete;
    setState((s) => ({
      ...s,
      visible: true,
      message: null,
      running: true,
      jumping: false,
    }));

    // After running for ~1.5s, trigger the parabolic jump, then navigate
    setTimeout(() => {
      setState((s) => ({ ...s, running: false, jumping: true }));
      // Jump animation is ~800ms; navigate just before she fully disappears
      setTimeout(() => {
        runCompleteRef.current?.();
        runCompleteRef.current = null;
        setState((s) => ({
          ...s,
          visible: false,
          running: false,
          jumping: false,
        }));
      }, 700);
    }, 1500);
  }, []);

  const setShowOnHome = useCallback((show: boolean) => {
    setState((s) => ({ ...s, showOnHome: show }));
  }, []);

  return (
    <MascotContext.Provider
      value={{
        state,
        showMessage,
        hideMascot,
        showMascot,
        showRunJump,
        setShowOnHome,
      }}
    >
      {children}
    </MascotContext.Provider>
  );
}

export function useMascot() {
  return useContext(MascotContext);
}
