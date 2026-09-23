import { describe, expect, it } from 'vitest';
import { PUZZLES } from '../src/content';
import { addDays, parseDay } from '../src/lib/dates';
import { gradeCard, isDue } from '../src/lib/srs';
import { dailyPuzzle, expectedScore, nextRatedPuzzle, puzzleScore, updateRating } from '../src/lib/puzzles';

describe('puzzle rating', () => {
  it('matches the standard Elo expectation', () => {
    expect(expectedScore(1000, 1000)).toBe(0.5);
    expect(expectedScore(1400, 1000)).toBeCloseTo(10 / 11, 10); // 400 points ahead = 10:1 odds
  });

  it('moves 16 points for an even solve or failure', () => {
    expect(updateRating(1000, 1000, 1)).toBe(1016);
    expect(updateRating(1000, 1000, 0)).toBe(984);
  });

  it('scores clean solves, assisted solves and reveals', () => {
    expect(puzzleScore(0, false, false)).toBe(1);
    expect(puzzleScore(2, false, false)).toBe(0.5);
    expect(puzzleScore(0, true, false)).toBe(0.5);
    expect(puzzleScore(0, false, true)).toBe(0);
  });

  it('picks the unattempted puzzle nearest the learner', () => {
    const p = nextRatedPuzzle(1000, PUZZLES, new Set(['pz-sort-none']))!;
    expect(Math.abs(p.rating - 1000)).toBeLessThanOrEqual(50);
    expect(p.id).not.toBe('pz-sort-none');
  });
});

describe('daily puzzle', () => {
  it('is easy on Mondays and expert on Sundays', () => {
    const monday = dailyPuzzle('2026-09-21', PUZZLES);
    expect(parseDay('2026-09-21').getDay()).toBe(1);
    expect(monday.tier).toBe('Easy');
    expect(monday.puzzle.rating).toBeLessThan(700);
    expect(monday.number).toBe(1);
    const sunday = dailyPuzzle('2026-09-27', PUZZLES);
    expect(sunday.tier).toBe('Expert');
    expect(sunday.puzzle.rating).toBeGreaterThanOrEqual(1500);
  });

  it('does not repeat an easy puzzle within a month', () => {
    const ids: string[] = [];
    for (let i = 0; i < 28; i++) {
      const day = addDays('2026-09-21', i);
      const d = dailyPuzzle(day, PUZZLES);
      if (d.tier === 'Easy') ids.push(d.puzzle.id);
    }
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('spaced repetition', () => {
  it('brings forgotten cards back sooner than remembered ones', () => {
    const now = new Date('2026-09-23T10:00:00');
    const again = gradeCard(undefined, 'again', now);
    const good = gradeCard(undefined, 'good', now);
    expect(new Date(again.due).getTime()).toBeLessThan(new Date(good.due).getTime());
    expect(isDue(again, now)).toBe(false);
    expect(isDue(again, new Date('2026-09-24T00:01:00'))).toBe(true);
  });

  it('spaces reviews further apart after each success', () => {
    const t0 = new Date('2026-09-23T10:00:00');
    const first = gradeCard(undefined, 'good', t0);
    const second = gradeCard(first, 'good', new Date(first.due));
    const gap1 = new Date(first.due).getTime() - t0.getTime();
    const gap2 = new Date(second.due).getTime() - new Date(first.due).getTime();
    expect(gap2).toBeGreaterThan(gap1);
  });
});
