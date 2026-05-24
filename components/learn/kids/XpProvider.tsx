"use client";

/**
 * XP + achievements context for the kids tree.
 *
 * Exposes:
 *   - state: current XP, level, streak, achievements
 *   - addCorrect(subject): record a correct tap (+5 XP, surprise bonus
 *     every 7th, streak roll, achievement check)
 *   - completeSession(subject): record a finished 6-exercise sequence
 *     (+25 XP, +1 sessionsCompleted, achievement check)
 *
 * Reward overlay state (level-up or new achievement) is consumed by
 * the RewardOverlay sibling rendered at the layout root. The provider
 * is intentionally pure data + a small reward queue.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ACHIEVEMENTS,
  BINGO_EVERY,
  XP_BINGO,
  XP_PER_CORRECT,
  XP_SESSION_COMPLETE,
  checkNewUnlocks,
  emptyState,
  levelFor,
  loadState,
  rollStreak,
  saveState,
  type Achievement,
  type PersistedState,
} from "@/lib/letterforge/xp";

export type RewardEvent =
  | { kind: "achievement"; achievement: Achievement }
  | { kind: "levelup"; levelName: string; tagline: string; emoji: string }
  | { kind: "bingo"; xp: number };

type Ctx = {
  state: PersistedState;
  level: ReturnType<typeof levelFor>;
  /** Fire-and-forget — caller doesn't need to await. */
  addCorrect(subject: string): void;
  completeSession(subject: string): void;
  /** Queue of unconsumed reward events. The overlay pops them. */
  pendingRewards: RewardEvent[];
  consumeReward(): void;
};

const XpCtx = createContext<Ctx | null>(null);

export function useXp(): Ctx {
  const c = useContext(XpCtx);
  if (!c) throw new Error("useXp must be used inside <XpProvider>");
  return c;
}

export default function XpProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PersistedState>(emptyState);
  const [pending, setPending] = useState<RewardEvent[]>([]);

  // Hydrate from localStorage on mount.
  const hydratedRef = useRef(false);
  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    setState(loadState());
  }, []);

  // Persist on every change.
  useEffect(() => {
    if (!hydratedRef.current) return;
    saveState(state);
  }, [state]);

  const queueRewards = useCallback((events: RewardEvent[]) => {
    if (events.length === 0) return;
    setPending((q) => [...q, ...events]);
  }, []);

  const addCorrect = useCallback(
    (subject: string) => {
      setState((prev) => {
        const beforeLevel = levelFor(prev.xp).index;
        const next = rollStreak({
          ...prev,
          correctTotal: prev.correctTotal + 1,
          xp: prev.xp + XP_PER_CORRECT,
          bySubject: {
            ...prev.bySubject,
            [subject]: (prev.bySubject[subject] ?? 0) + 1,
          },
        });
        // Variable-reinforcement bonus.
        const events: RewardEvent[] = [];
        if (next.correctTotal % BINGO_EVERY === 0) {
          next.xp += XP_BINGO;
          events.push({ kind: "bingo", xp: XP_BINGO });
        }
        // Level-up?
        const afterLevel = levelFor(next.xp).index;
        if (afterLevel > beforeLevel) {
          const lvl = levelFor(next.xp).level;
          events.push({
            kind: "levelup",
            levelName: lvl.name,
            tagline: lvl.tagline,
            emoji: lvl.emoji,
          });
        }
        // Newly unlocked achievements.
        const unlocks = checkNewUnlocks(next);
        if (unlocks.length > 0) {
          next.unlocked = [...next.unlocked, ...unlocks.map((a) => a.id)];
          for (const a of unlocks) events.push({ kind: "achievement", achievement: a });
        }
        // Defer queue update so we don't update sibling state inside
        // the setter.
        if (events.length > 0) queueMicrotask(() => queueRewards(events));
        return next;
      });
    },
    [queueRewards]
  );

  const completeSession = useCallback(
    (subject: string) => {
      setState((prev) => {
        const beforeLevel = levelFor(prev.xp).index;
        const next = rollStreak({
          ...prev,
          sessionsCompleted: prev.sessionsCompleted + 1,
          xp: prev.xp + XP_SESSION_COMPLETE,
          bySubject: {
            ...prev.bySubject,
            [subject]: (prev.bySubject[subject] ?? 0) + 1,
          },
        });
        const events: RewardEvent[] = [];
        const afterLevel = levelFor(next.xp).index;
        if (afterLevel > beforeLevel) {
          const lvl = levelFor(next.xp).level;
          events.push({
            kind: "levelup",
            levelName: lvl.name,
            tagline: lvl.tagline,
            emoji: lvl.emoji,
          });
        }
        const unlocks = checkNewUnlocks(next);
        if (unlocks.length > 0) {
          next.unlocked = [...next.unlocked, ...unlocks.map((a) => a.id)];
          for (const a of unlocks) events.push({ kind: "achievement", achievement: a });
        }
        if (events.length > 0) queueMicrotask(() => queueRewards(events));
        return next;
      });
    },
    [queueRewards]
  );

  const consumeReward = useCallback(() => {
    setPending((q) => q.slice(1));
  }, []);

  const value = useMemo<Ctx>(() => {
    return {
      state,
      level: levelFor(state.xp),
      addCorrect,
      completeSession,
      pendingRewards: pending,
      consumeReward,
    };
  }, [state, addCorrect, completeSession, pending, consumeReward]);

  return <XpCtx.Provider value={value}>{children}</XpCtx.Provider>;
}

/** Unused-import safety so tree-shakers keep the catalog visible. */
export const __XP_CATALOG = ACHIEVEMENTS;
