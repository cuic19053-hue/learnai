"use client";

import { useSession } from "next-auth/react";
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
import { progressReducer, selectWorld } from "@/lib/progress/engine";
import { readProgressClient, writeProgressClient } from "@/lib/progress/cookie";
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
  const { data: session, status } = useSession();
  const userId = session?.user?.id ?? null;

  const [state, dispatch] = useReducer(progressReducer, DEFAULT_PROGRESS);
  const hydratedRef = useRef(false);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const skipNextWriteRef = useRef(false);
  // Debounce timer for the PUT /api/me/progress sync — we don't want
  // to fire a network call on every reducer tick (addXp + ping happen
  // dozens of times in a single lesson).
  const syncTimerRef = useRef<number | null>(null);
  // True once we've pulled the server-side blob; until then we suppress
  // sync writes so the initial cookie state doesn't clobber a richer
  // server state with a thinner local one.
  const serverHydratedRef = useRef(false);

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

    // Debounced server sync — only after the server-side blob has been
    // merged in, so we don't overwrite a fresh-device server state with
    // an empty cookie-only state on the very first render.
    if (userId && serverHydratedRef.current) {
      if (syncTimerRef.current !== null) {
        window.clearTimeout(syncTimerRef.current);
      }
      syncTimerRef.current = window.setTimeout(() => {
        void fetch("/api/me/progress", {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(state),
          keepalive: true, // survive a tab close mid-flight
        }).catch(() => {
          // Network blip — cookie copy is the source of truth until next change.
        });
      }, 1500);
    }
  }, [state, userId]);

  // Pull the server blob once when the session arrives. Merges with the
  // local cookie state so existing local XP / streak isn't lost when a
  // user signs in for the first time.
  useEffect(() => {
    if (status !== "authenticated" || !userId) {
      serverHydratedRef.current = false;
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const r = await fetch("/api/me/progress", { cache: "no-store" });
        if (!r.ok) return;
        const body = (await r.json()) as { progress?: ProgressState };
        if (cancelled || !body.progress) return;
        const server = body.progress;
        const local = readProgressClient();
        const merged: ProgressState = {
          v: server.v,
          xp: Math.max(server.xp, local.xp),
          streak: {
            current: Math.max(server.streak.current, local.streak.current),
            longest: Math.max(server.streak.longest, local.streak.longest),
            lastActive: !server.streak.lastActive
              ? local.streak.lastActive
              : !local.streak.lastActive
                ? server.streak.lastActive
                : server.streak.lastActive > local.streak.lastActive
                  ? server.streak.lastActive
                  : local.streak.lastActive,
          },
          worlds: { ...local.worlds, ...server.worlds },
          achievements: Array.from(new Set([...server.achievements, ...local.achievements])),
          updatedAt: new Date().toISOString(),
        };
        skipNextWriteRef.current = true;
        dispatch({ type: "hydrate", state: merged });
        serverHydratedRef.current = true;
      } catch {
        // Network blip — leave the local-cookie state alone. We'll
        // retry on the next sign-in.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [status, userId]);

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
    []
  );
  const lessonCompleted = useCallback(
    (slug: string) => dispatch({ type: "lessonCompleted", slug }),
    []
  );
  const unlockAchievement = useCallback((id: string) => dispatch({ type: "achievement", id }), []);
  const reset = useCallback(() => dispatch({ type: "reset" }), []);
  const worldOf = useCallback((slug: string) => selectWorld(state, slug), [state]);

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
    [state, ping, addXp, lessonCompleted, unlockAchievement, reset, worldOf]
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
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
