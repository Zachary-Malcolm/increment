import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Exercise, type ExerciseResult } from '../components/exercises';
import { findExercise } from '../content';
import { celebrate } from '../lib/celebrate';
import { dayKey, parseDay } from '../lib/dates';
import { addXp } from '../lib/progress';
import { sounds } from '../lib/sound';
import { dueCardIds, gradeCard, type ReviewGrade } from '../lib/srs';
import { warmUpPython } from '../python/runner';
import { useStore } from '../state/store';

const SESSION_SIZE = 15;
const XP_PER_CARD = 3;

function gradeFor(r: ExerciseResult): ReviewGrade {
  if (!r.correct || r.revealed) return 'again';
  return r.firstTry ? 'good' : 'hard';
}

export function ReviewPage() {
  const { progress, update } = useStore();
  // Fix the session's cards when it starts, so answering one doesn't reshuffle the rest.
  const [session] = useState(() => dueCardIds(progress, new Date()).filter((id) => findExercise(id)).slice(0, SESSION_SIZE));
  const [pos, setPos] = useState(0);
  const [remembered, setRemembered] = useState(0);
  const cards = useMemo(() => session.map((id) => findExercise(id)!), [session]);

  useEffect(() => {
    if (cards.some((c) => c.step.kind === 'code')) warmUpPython();
  }, [cards]);

  if (session.length === 0) {
    const next = Object.values(progress.cards).map((c) => c.due).sort()[0];
    return (
      <div className="card center narrow" style={{ marginTop: 20 }}>
        <div style={{ fontSize: 44 }}>✓</div>
        <h2>All caught up</h2>
        <p className="muted">
          {next
            ? `Your next review is on ${parseDay(dayKey(new Date(next))).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}. Reviews are spaced out so each one lands just before you'd forget.`
            : 'Finish a lesson and its key questions will come back here for review.'}
        </p>
        <div className="hero-actions">
          <Link className="btn btn-primary" to="/learn">Keep learning</Link>
          <Link className="btn" to="/puzzles">Try a puzzle</Link>
        </div>
      </div>
    );
  }

  if (pos >= cards.length) {
    return (
      <div className="complete player">
        <div className="hero-mark pop" style={{ fontSize: 52 }}>↻</div>
        <h1 className="pop">Review done!</h1>
        <div className="complete-stats">
          <div className="complete-stat acc"><div className="label">Remembered</div><div className="value">{remembered}/{cards.length}</div></div>
          <div className="complete-stat xp"><div className="label">XP earned</div><div className="value">+{cards.length * XP_PER_CARD}</div></div>
        </div>
        <p className="muted">Anything you missed will come back tomorrow. The rest are spaced further out.</p>
        <div className="hero-actions">
          <Link className="btn btn-primary btn-lg" to="/">Home</Link>
          <Link className="btn btn-lg" to="/learn">Keep learning</Link>
        </div>
      </div>
    );
  }

  const { step, lesson } = cards[pos];

  function done(result: ExerciseResult) {
    const grade = gradeFor(result);
    const now = new Date();
    update((p) => {
      const next = addXp(p, XP_PER_CARD, dayKey(now));
      return { ...next, cards: { ...next.cards, [step.id]: gradeCard(next.cards[step.id], grade, now) } };
    });
    if (grade !== 'again') setRemembered((n) => n + 1);
    if (pos + 1 >= cards.length) {
      sounds.complete();
      celebrate();
    }
    setPos(pos + 1);
  }

  return (
    <div className="player">
      <div className="player-top">
        <Link to="/" className="icon-btn" aria-label="Leave review">✕</Link>
        <div className="bar" role="progressbar" aria-valuenow={pos} aria-valuemax={cards.length} aria-label="Review progress">
          <span style={{ width: `${(pos / cards.length) * 100}%`, background: 'var(--blue)' }} />
        </div>
        <span className="faint mono" style={{ fontSize: 13 }}>{pos + 1}/{cards.length}</span>
      </div>
      <div className="faint" style={{ fontSize: 13, marginBottom: 8 }}>Review · from “{lesson.title}”</div>
      <div className="step-enter" key={pos}>
        <Exercise step={step} onDone={done} />
      </div>
    </div>
  );
}
