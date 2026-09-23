// Puzzle rating (Elo, as in chess) and the daily puzzle schedule.
import type { Puzzle } from '../content/types';
import { daysBetween, parseDay } from './dates';

const K = 32;
const MIN_RATING = 100;

/** Chance the learner solves a puzzle, from the two ratings. */
export function expectedScore(learner: number, puzzle: number): number {
  return 1 / (1 + 10 ** ((puzzle - learner) / 400));
}

/** New learner rating after a puzzle. score: 1 = clean solve, 0.5 = needed help, 0 = revealed. */
export function updateRating(learner: number, puzzle: number, score: number): number {
  return Math.max(MIN_RATING, Math.round(learner + K * (score - expectedScore(learner, puzzle))));
}

/** 1 for a clean solve, 0.5 if it took extra clicks or a hint, 0 if the answer was revealed. */
export function puzzleScore(wrongClicks: number, usedHint: boolean, revealed: boolean): number {
  if (revealed) return 0;
  return wrongClicks === 0 && !usedHint ? 1 : 0.5;
}

/** The first daily puzzle. */
export const DAILY_EPOCH = '2026-09-21';

// Like newspaper crosswords, difficulty rises through the week: Monday easiest, Sunday hardest.
const TIERS = [
  { name: 'Easy', days: [1, 2], min: 0, max: 699 },
  { name: 'Medium', days: [3, 4], min: 700, max: 1099 },
  { name: 'Hard', days: [5, 6], min: 1100, max: 1499 },
  { name: 'Expert', days: [0], min: 1500, max: Infinity },
];

export function dailyNumber(day: string): number {
  return daysBetween(DAILY_EPOCH, day) + 1;
}

/** Everyone gets the same puzzle on the same day. */
export function dailyPuzzle(day: string, puzzles: Puzzle[]): { puzzle: Puzzle; tier: string; number: number } {
  const weekday = parseDay(day).getDay();
  const tier = TIERS.find((t) => t.days.includes(weekday))!;
  const pool = puzzles.filter((p) => p.rating >= tier.min && p.rating <= tier.max).sort((a, b) => a.id.localeCompare(b.id));
  const week = Math.floor(daysBetween(DAILY_EPOCH, day) / 7);
  const slot = week * tier.days.length + tier.days.indexOf(weekday);
  const list = pool.length ? pool : puzzles;
  return { puzzle: list[((slot % list.length) + list.length) % list.length], tier: tier.name, number: dailyNumber(day) };
}

/** The unsolved puzzle closest to the learner's rating, or undefined when all are done. */
export function nextRatedPuzzle(rating: number, puzzles: Puzzle[], attempted: Set<string>): Puzzle | undefined {
  return puzzles
    .filter((p) => !attempted.has(p.id))
    .sort((a, b) => Math.abs(a.rating - rating) - Math.abs(b.rating - rating) || a.id.localeCompare(b.id))[0];
}
