"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from "react";
import {
  progressReducer,
  selectWorld,
} from "@/lib/progress/engine";
import {
  readProgressClient,
  writeProgressClient,
} from "@/lib/progress/cookie";
import {
  DEFAULT_PROGRESS,
  type ProgressAction,
  type ProgressState,
  type WorldProgress,
} from "@/lib/progress/types";

const CHANNEL_NAME = "learnai-progress";

type ProgressApi = {
  state: ProgressState;
  /** Mark today as an active day. Optionally scoped to a world slug. */
  ping: (slug?: string) => void;
  /** Award XP (always pings activity). Optionally credit a specific world. */
  addXp: (amount: number, slug?: string) => void;
  /** Increment a world's lessonsCompleted counter (always pings activity). */
  lessonCompleted: (slug: string) => void;
  /** Unlock an achievement by id (idempotent). */
  unlockAchievement: (id: string) => void;
  /** Wipe everything back to defaults. */
  reset: () => void;
  /** Cheap selector that hides the missing-world default. */
  worldOf: (slug: string) => WorldProgress;
  /** True once the client has hydrated from the cookie. */
  hydrated: boolean;
};

const ProgressContext = createContext<ProgressApi | null>(null);

export default function ProgressProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(progressReducer, DEFAULT_PROGRESS);
  const hydratedRef = useRef(false);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const skipNextWriteRef = useRef(false);

  // Hydrate from cookie + open the cross-tab channel on first mount.
  useEffect(() => {
    const fromCookie = readProgressClient();
    dispatch({ type: "hydrate", state: fromCookie });
    hydratedRef.current = true;

    if (typeof BroadcastChannel !== "undefined") {
      try {
        const ch = new BroadcastChannel(CHANNEL_NAME);
        ch.onmessage = (e: MessageEvent<ProgressState>) => {
          if (!e.data || typeof e.data !== "object") return;
          // Skip the cookie write triggered by this remote update.
          skipNextWriteRef.current = true;
          dispatch({ type: "hydrate", state: e.data });
        };
        channelRef.current = ch;
      } catch {
        // Browsers without BroadcastChannel just lose cross-tab live-sync;
        // the cookie still keeps tabs eventually consistent on navigation.
      }
    }

    return () => {
      channelRef.current?.close();
      channelRef.current = null;
    };
  }, []);

  // Persist + broadcast on every change (skipping the initial hydrate).
  useEffect(() => {
    if (!hydratedRef.current) return;
    if (skipNextWriteRef.current) {
      skipNextWriteRef.current = false;
      return;
    }
    writeProgressClient(state);
    try {
      channelRef.current?.postMessage(state);
    } catch {
      /* channel closed — fine */
    }
  }, [state]);

  // Auto-ping once per session so just opening the app counts toward the
  // streak. Subsequent pings from quizzes / drills are no-ops for today.
  useEffect(() => {
    if (!hydratedRef.current) return;
    dispatch({ type: "ping" });
  }, []);

  /* ─── Stable action wrappers ─── */
  const ping = useCallback((slug?: string) => dispatch({ type: "ping", slug }), []);
  const addXp = useCallback(
    (amount: number, slug?: string) => dispatch({ type: "addXp", amount, slug }),
    [],
  );
  const lessonCompleted = useCallback(
    (slug: string) => dispatch({ type: "lessonCompleted", slug }),
    [],
  );
  const unlockAchievement = useCallback(
    (id: string) => dispatch({ type: "achievement", id }),
    [],
  );
  const reset = useCallback(() => dispatch({ type: "reset" }), []);
  const worldOf = useCallback(
    (slug: string) => selectWorld(state, slug),
    [state],
  );

  const value = useMemo<ProgressApi>(
    () => ({
      state,
      ping,
      addXp,
      lessonCompleted,
      unlockAchievement,
      reset,
      worldOf,
      hydrated: hydratedRef.current,
    }),
    [state, ping, addXp, lessonCompleted, unlockAchievement, reset, worldOf],
  );

  return (
    <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
  );
}

/**
 * Primary hook. Always works — when called outside a Provider it returns
 * the default state and no-op actions, so leaf components can be used in
 * Storybook or unit tests without wrapping.
 */
export function useProgress(): ProgressApi {
  const ctx = useContext(ProgressContext);
  if (ctx) return ctx;
  const noop = () => {};
  return {
    state: DEFAULT_PROGRESS,
    ping: noop,
    addXp: noop,
    lessonCompleted: noop,
    unlockAchievement: noop,
    reset: noop,
    worldOf: (_slug: string) => ({ xp: 0, lessonsCompleted: 0, lastSeen: null }),
    hydrated: false,
  };
}

/**
 * Sugar for scoped consumers like LearnerHomeShell — picks a world's
 * row out of the larger state without forcing the caller to re-derive.
 */
export function useWorldProgress(slug: string): WorldProgress {
  const { worldOf } = useProgress();
  return worldOf(slug);
}
