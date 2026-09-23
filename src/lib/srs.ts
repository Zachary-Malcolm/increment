// Spaced repetition with FSRS (the algorithm modern Anki uses). Each reviewable exercise becomes a card;
// answering it well pushes the next review further away, getting it wrong brings it back tomorrow.
import { createEmptyCard, fsrs, generatorParameters, Rating, type Card, type Grade } from 'ts-fsrs';
import { dayKey } from './dates';
import type { Progress, StoredCard } from './progress';

// Whole-day intervals only (no same-day relearning steps): first reviews land 1-8 days later.
const scheduler = fsrs(generatorParameters({ enable_fuzz: true, enable_short_term: false, request_retention: 0.9 }));

export type ReviewGrade = 'again' | 'hard' | 'good' | 'easy';
const GRADES: Record<ReviewGrade, Grade> = { again: Rating.Again, hard: Rating.Hard, good: Rating.Good, easy: Rating.Easy };

function toCard(s: StoredCard): Card {
  return { ...s, due: new Date(s.due), last_review: s.last_review ? new Date(s.last_review) : undefined } as Card;
}

function toStored(c: Card): StoredCard {
  return {
    due: c.due.toISOString(), stability: c.stability, difficulty: c.difficulty, elapsed_days: c.elapsed_days,
    scheduled_days: c.scheduled_days, reps: c.reps, lapses: c.lapses, learning_steps: c.learning_steps,
    state: c.state, last_review: c.last_review ? c.last_review.toISOString() : undefined,
  };
}

/** Schedule a card after an answer. Pass undefined for a card being seen for the first time. */
export function gradeCard(card: StoredCard | undefined, grade: ReviewGrade, now: Date): StoredCard {
  const current = card ? toCard(card) : createEmptyCard(now);
  return toStored(scheduler.next(current, now, GRADES[grade]).card);
}

/** A card is due for the whole of its due day, from local midnight. */
export function isDue(card: StoredCard, now: Date): boolean {
  return dayKey(new Date(card.due)) <= dayKey(now);
}

/** Ids of cards due now, the most overdue first. */
export function dueCardIds(p: Progress, now: Date): string[] {
  return Object.entries(p.cards)
    .filter(([, c]) => isDue(c, now))
    .sort(([, a], [, b]) => a.due.localeCompare(b.due))
    .map(([id]) => id);
}
