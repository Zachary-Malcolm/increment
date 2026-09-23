// Everything the app remembers about a learner, plus the pure functions that change it. Keeping these
// pure (no storage, no React) makes streaks and XP easy to test and to merge between devices.
import { addDays, daysBetween } from './dates';

/** A spaced-repetition card as stored (dates as ISO strings). See srs.ts. */
export interface StoredCard {
  due: string;
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  reps: number;
  lapses: number;
  learning_steps: number;
  state: number;
  last_review?: string;
}

export interface DailyResult {
  puzzleId: string;
  /** 1 = found and fixed cleanly, 0.5 = needed extra tries or a hint, 0 = revealed. */
  score: number;
  wrongClicks: number;
  runs: number;
  seconds: number;
}

export interface Progress {
  version: 1;
  xp: number;
  lessons: Record<string, { completedAt: string; accuracy: number }>;
  /** XP earned on each day, keyed by local day ("2026-09-23"). Drives streaks and the activity grid. */
  activity: Record<string, number>;
  /** Missed days covered by a streak freeze. */
  frozenDays: string[];
  freezes: number;
  /** Streak length when a freeze was last awarded (one is earned every 7 days of streak). */
  lastFreezeAward: number;
  cards: Record<string, StoredCard>;
  puzzleRating: number;
  /** First rated attempt at each puzzle. */
  puzzles: Record<string, { at: string; score: number }>;
  daily: Record<string, DailyResult>;
  sound: boolean;
  updatedAt: string;
}

export const MAX_FREEZES = 2;
export const START_RATING = 600;

export function emptyProgress(): Progress {
  return {
    version: 1, xp: 0, lessons: {}, activity: {}, frozenDays: [], freezes: 0, lastFreezeAward: 0,
    cards: {}, puzzleRating: START_RATING, puzzles: {}, daily: {}, sound: true, updatedAt: new Date(0).toISOString(),
  };
}

/** Fill in any fields missing from older saved data. */
export function normalise(p: Partial<Progress> | null | undefined): Progress {
  return { ...emptyProgress(), ...(p ?? {}), version: 1 };
}

function activeDays(p: Progress): Set<string> {
  const days = new Set(p.frozenDays);
  for (const [day, xp] of Object.entries(p.activity)) if (xp > 0) days.add(day);
  return days;
}

export interface StreakInfo {
  current: number;
  longest: number;
  activeToday: boolean;
}

export function streakInfo(p: Progress, today: string): StreakInfo {
  const days = activeDays(p);
  const activeToday = (p.activity[today] ?? 0) > 0;
  // Today still counts as "in progress": the streak is alive if yesterday was active.
  let day = activeToday || days.has(today) ? today : addDays(today, -1);
  let current = 0;
  while (days.has(day)) {
    current++;
    day = addDays(day, -1);
  }
  let longest = 0;
  let run = 0;
  let prev: string | null = null;
  for (const d of [...days].sort()) {
    run = prev && daysBetween(prev, d) === 1 ? run + 1 : 1;
    longest = Math.max(longest, run);
    prev = d;
  }
  return { current, longest: Math.max(longest, current), activeToday };
}

/**
 * If the learner missed some days and has enough freezes to cover all of them, use freezes to keep the
 * streak alive. Called when the app opens and before any XP is added.
 */
export function applyFreezes(p: Progress, today: string): Progress {
  const days = [...activeDays(p)].filter((d) => d < today).sort();
  const last = days[days.length - 1];
  if (!last) return p;
  const missed = daysBetween(last, today) - 1;
  if (missed < 1 || missed > p.freezes) return p;
  const covered = Array.from({ length: missed }, (_, i) => addDays(last, i + 1));
  return { ...p, freezes: p.freezes - missed, frozenDays: [...p.frozenDays, ...covered] };
}

/** Add XP for today, keep the streak, and award a freeze for every 7 days of streak. */
export function addXp(p: Progress, amount: number, today: string): Progress {
  let next = applyFreezes(p, today);
  next = {
    ...next,
    xp: next.xp + amount,
    activity: { ...next.activity, [today]: (next.activity[today] ?? 0) + amount },
  };
  const { current } = streakInfo(next, today);
  let lastAward = current < next.lastFreezeAward ? 0 : next.lastFreezeAward;
  let freezes = next.freezes;
  if (current - lastAward >= 7) {
    freezes = Math.min(MAX_FREEZES, freezes + 1);
    lastAward = current;
  }
  return { ...next, freezes, lastFreezeAward: lastAward };
}

// Levels: level n starts at 25·n·(n−1) XP (level 2 at 50, 3 at 150, 4 at 300, 5 at 500...).
export function levelStart(level: number): number {
  return 25 * level * (level - 1);
}

export function levelInfo(xp: number): { level: number; into: number; span: number } {
  let level = 1;
  while (levelStart(level + 1) <= xp) level++;
  return { level, into: xp - levelStart(level), span: levelStart(level + 1) - levelStart(level) };
}

/** XP for a finished lesson: 10 per exercise right first time, 5 otherwise, plus a 20 XP completion bonus. */
export function lessonXp(firstTry: number, total: number): number {
  return 20 + firstTry * 10 + (total - firstTry) * 5;
}

/**
 * Combine progress from two devices (e.g. what was done as a guest and what is saved in the account).
 * Nothing learned is ever lost: completions, activity and puzzle results are unioned.
 */
export function mergeProgress(a: Progress, b: Progress): Progress {
  const newer = a.updatedAt >= b.updatedAt ? a : b;
  const activity = { ...a.activity };
  for (const [day, xp] of Object.entries(b.activity)) activity[day] = Math.max(activity[day] ?? 0, xp);
  const lessons = { ...b.lessons, ...a.lessons };
  for (const [id, rec] of Object.entries(b.lessons)) {
    const other = a.lessons[id];
    if (other) lessons[id] = { completedAt: other.completedAt < rec.completedAt ? other.completedAt : rec.completedAt, accuracy: Math.max(other.accuracy, rec.accuracy) };
  }
  const cards = { ...a.cards };
  for (const [id, card] of Object.entries(b.cards)) {
    const other = cards[id];
    if (!other || (card.last_review ?? '') > (other.last_review ?? '')) cards[id] = card;
  }
  return {
    ...newer,
    xp: Math.max(a.xp, b.xp, Object.values(activity).reduce((s, x) => s + x, 0)),
    lessons,
    activity,
    frozenDays: [...new Set([...a.frozenDays, ...b.frozenDays])].sort(),
    cards,
    puzzles: { ...b.puzzles, ...a.puzzles },
    daily: { ...b.daily, ...a.daily },
  };
}
