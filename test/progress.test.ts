import { describe, expect, it } from 'vitest';
import { addDays, daysBetween } from '../src/lib/dates';
import { addXp, applyFreezes, emptyProgress, levelInfo, mergeProgress, streakInfo, type Progress } from '../src/lib/progress';

function withActivity(days: string[], extra: Partial<Progress> = {}): Progress {
  return { ...emptyProgress(), activity: Object.fromEntries(days.map((d) => [d, 10])), ...extra };
}

describe('dates', () => {
  it('adds days across month and year ends', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
    expect(daysBetween('2026-10-24', '2026-10-27')).toBe(3); // spans the UK clocks change
  });
});

describe('streaks', () => {
  it('counts consecutive days ending today', () => {
    const p = withActivity(['2026-09-20', '2026-09-21', '2026-09-22', '2026-09-23']);
    expect(streakInfo(p, '2026-09-23')).toEqual({ current: 4, longest: 4, activeToday: true });
  });

  it('keeps the streak alive until today is over', () => {
    const p = withActivity(['2026-09-21', '2026-09-22']);
    expect(streakInfo(p, '2026-09-23').current).toBe(2);
  });

  it('resets after a missed day', () => {
    const p = withActivity(['2026-09-19', '2026-09-20', '2026-09-22']);
    const s = streakInfo(p, '2026-09-22');
    expect(s.current).toBe(1);
    expect(s.longest).toBe(2);
  });

  it('is zero when the last activity was two days ago', () => {
    expect(streakInfo(withActivity(['2026-09-21']), '2026-09-23').current).toBe(0);
  });
});

describe('freezes', () => {
  it('covers missed days when there are enough freezes', () => {
    const p = applyFreezes(withActivity(['2026-09-19', '2026-09-20'], { freezes: 2 }), '2026-09-23');
    expect(p.freezes).toBe(0);
    expect(p.frozenDays).toEqual(['2026-09-21', '2026-09-22']);
    expect(streakInfo(p, '2026-09-23').current).toBe(4);
  });

  it('does nothing when the gap is longer than the freezes', () => {
    const p = withActivity(['2026-09-19'], { freezes: 1 });
    expect(applyFreezes(p, '2026-09-23')).toBe(p);
  });

  it('awards one freeze for every 7 days of streak, up to 2', () => {
    let p = emptyProgress();
    for (let i = 0; i < 21; i++) p = addXp(p, 5, addDays('2026-09-01', i));
    expect(p.freezes).toBe(2);
    expect(p.lastFreezeAward).toBe(21);
  });
});

describe('xp and levels', () => {
  it('adds xp to the total and to today', () => {
    const p = addXp(addXp(emptyProgress(), 30, '2026-09-23'), 15, '2026-09-23');
    expect(p.xp).toBe(45);
    expect(p.activity['2026-09-23']).toBe(45);
  });

  it('computes levels from the 25·n·(n−1) thresholds', () => {
    expect(levelInfo(0)).toEqual({ level: 1, into: 0, span: 50 });
    expect(levelInfo(49).level).toBe(1);
    expect(levelInfo(50)).toEqual({ level: 2, into: 0, span: 100 });
    expect(levelInfo(160)).toEqual({ level: 3, into: 10, span: 150 });
  });
});

describe('merging devices', () => {
  it('keeps everything learned on either side', () => {
    const a = { ...withActivity(['2026-09-20']), xp: 10, lessons: { l1: { completedAt: '2026-09-20T10:00:00Z', accuracy: 0.5 } } };
    const b = { ...withActivity(['2026-09-21']), xp: 10, lessons: { l1: { completedAt: '2026-09-21T10:00:00Z', accuracy: 1 }, l2: { completedAt: '2026-09-21T11:00:00Z', accuracy: 1 } } };
    const m = mergeProgress(a, b);
    expect(Object.keys(m.activity).sort()).toEqual(['2026-09-20', '2026-09-21']);
    expect(m.xp).toBe(20);
    expect(m.lessons.l1).toEqual({ completedAt: '2026-09-20T10:00:00Z', accuracy: 1 });
    expect(m.lessons.l2).toBeDefined();
  });
});
