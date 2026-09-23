import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Exercise, type ExerciseResult } from '../components/exercises';
import { Markdown } from '../components/Markdown';
import { findLesson, moduleOf, nextLesson, reviewableSteps } from '../content';
import type { Lesson } from '../content/types';
import { celebrate } from '../lib/celebrate';
import { dayKey } from '../lib/dates';
import { addXp, lessonXp, levelInfo, streakInfo, type Progress } from '../lib/progress';
import { sounds } from '../lib/sound';
import { gradeCard } from '../lib/srs';
import { warmUpPython } from '../python/runner';
import { useStore } from '../state/store';
import { isUnlocked } from './Learn';

export function LessonPage() {
  const { id = '' } = useParams();
  const { progress } = useStore();
  const lesson = findLesson(id);
  if (!lesson) return <NotFoundLesson />;
  if (!isUnlocked(lesson.id, progress.lessons)) {
    return (
      <div className="card center narrow">
        <h2>🔒 Not unlocked yet</h2>
        <p className="muted">Finish the lesson before this one first. Each lesson builds on the last.</p>
        <Link className="btn btn-primary" to="/learn">Back to lessons</Link>
      </div>
    );
  }
  return <LessonPlayer key={lesson.id} lesson={lesson} />;
}

function NotFoundLesson() {
  return (
    <div className="card center narrow">
      <h2>Lesson not found</h2>
      <Link className="btn" to="/learn">Back to lessons</Link>
    </div>
  );
}

interface Summary {
  xp: number;
  accuracy: number;
  streakBefore: number;
  streakAfter: number;
  levelBefore: number;
  levelAfter: number;
  newCards: number;
}

function LessonPlayer({ lesson }: { lesson: Lesson }) {
  const { progress, update } = useStore();
  const [queue, setQueue] = useState(() => lesson.steps.map((_, i) => i));
  const [pos, setPos] = useState(0);
  const [firstTries, setFirstTries] = useState<Record<string, boolean>>({});
  const [summary, setSummary] = useState<Summary | null>(null);
  const top = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (lesson.steps.some((s) => s.kind === 'code' || (s.kind === 'predict' && s.data))) warmUpPython();
  }, [lesson]);

  useEffect(() => {
    top.current?.scrollIntoView({ block: 'start' });
  }, [pos]);

  const stepIndex = queue[pos];
  const step = lesson.steps[stepIndex];
  const isRetry = pos >= lesson.steps.length;

  function finish(results: Record<string, boolean>) {
    const exercises = lesson.steps.filter((s) => s.kind !== 'read');
    const firstTry = exercises.filter((s) => results[s.id]).length;
    const replay = !!progress.lessons[lesson.id];
    const xp = replay ? Math.ceil(lessonXp(firstTry, exercises.length) / 2) : lessonXp(firstTry, exercises.length);
    const accuracy = exercises.length ? firstTry / exercises.length : 1;
    const today = dayKey();
    const now = new Date();

    const apply = (p: Progress): Progress => {
      let next = addXp(p, xp, today);
      const cards = { ...next.cards };
      for (const s of reviewableSteps(lesson)) {
        if (!cards[s.id]) cards[s.id] = gradeCard(undefined, results[s.id] ? 'good' : 'again', now);
      }
      const prev = next.lessons[lesson.id];
      next = {
        ...next,
        cards,
        lessons: { ...next.lessons, [lesson.id]: { completedAt: prev?.completedAt ?? now.toISOString(), accuracy: Math.max(prev?.accuracy ?? 0, accuracy) } },
      };
      return next;
    };

    const after = apply(progress);
    const s: Summary = {
      xp,
      accuracy,
      streakBefore: streakInfo(progress, today).activeToday ? -1 : streakInfo(progress, today).current,
      streakAfter: streakInfo(after, today).current,
      levelBefore: levelInfo(progress.xp).level,
      levelAfter: levelInfo(after.xp).level,
      newCards: reviewableSteps(lesson).filter((st) => !progress.cards[st.id]).length,
    };
    update(apply);
    setSummary(s);
    sounds.complete();
    celebrate(true);
    if (s.streakBefore >= 0) setTimeout(() => sounds.streak(), 900);
    if (s.levelAfter > s.levelBefore) setTimeout(() => sounds.levelUp(), 1500);
  }

  function advance(result?: ExerciseResult) {
    let nextQueue = queue;
    let results = firstTries;
    if (result && step.kind !== 'read') {
      if (!(step.id in results)) results = { ...results, [step.id]: result.firstTry };
      // Wrong multiple-choice answers come back at the end of the lesson, like flashcards.
      if (!result.correct) nextQueue = [...queue, stepIndex];
    }
    setFirstTries(results);
    setQueue(nextQueue);
    if (pos + 1 >= nextQueue.length) finish(results);
    else setPos(pos + 1);
  }

  if (summary) return <LessonComplete lesson={lesson} summary={summary} />;

  const mod = moduleOf(lesson.id)!;
  return (
    <div className="player" ref={top} style={{ scrollMarginTop: 80 }}>
      <div className="player-top">
        <Link to="/learn" className="icon-btn" aria-label="Leave lesson" title="Leave lesson">✕</Link>
        <div className="bar" role="progressbar" aria-valuenow={pos} aria-valuemax={queue.length} aria-label="Lesson progress">
          <span style={{ width: `${(pos / queue.length) * 100}%` }} />
        </div>
        <span className="faint mono" style={{ fontSize: 13 }}>{Math.min(pos + 1, queue.length)}/{queue.length}</span>
      </div>
      <div className="faint" style={{ fontSize: 13, marginBottom: 8 }}>Module {mod.number} · {lesson.title}</div>
      <div className="step-enter" key={pos}>
        {isRetry && <div className="retry-note">↻ Let's try that one again</div>}
        {step.kind === 'read' ? (
          <>
            <Markdown md={step.md} />
            <div className="actions">
              <button className="btn btn-primary btn-lg" onClick={() => advance()} autoFocus>Continue</button>
            </div>
          </>
        ) : (
          <Exercise step={step} onDone={advance} />
        )}
      </div>
    </div>
  );
}

function LessonComplete({ lesson, summary }: { lesson: Lesson; summary: Summary }) {
  const navigate = useNavigate();
  const next = nextLesson(lesson.id);
  const [shownXp, setShownXp] = useState(0);

  // Count the XP up for a satisfying finish.
  useEffect(() => {
    let frame = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const k = Math.min(1, (t - start) / 900);
      setShownXp(Math.round(summary.xp * (1 - (1 - k) ** 3)));
      if (k < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [summary.xp]);

  return (
    <div className="complete player">
      <div className="hero-mark pop" style={{ fontSize: 56 }}>+= 1</div>
      <h1 className="pop">Lesson complete!</h1>
      <p className="muted">{lesson.title}</p>
      <div className="complete-stats">
        <div className="complete-stat xp pop" style={{ animationDelay: '0.1s' }}>
          <div className="label">XP earned</div>
          <div className="value">+{shownXp}</div>
        </div>
        <div className="complete-stat acc pop" style={{ animationDelay: '0.25s' }}>
          <div className="label">First-try accuracy</div>
          <div className="value">{Math.round(summary.accuracy * 100)}%</div>
        </div>
        <div className="complete-stat streak pop" style={{ animationDelay: '0.4s' }}>
          <div className="label">Streak</div>
          <div className="value">🔥 {summary.streakAfter}</div>
        </div>
      </div>
      {summary.streakBefore >= 0 && <p className="pop" style={{ color: 'var(--orange)', fontWeight: 700, animationDelay: '0.9s' }}>🔥 {summary.streakAfter}-day streak! Come back tomorrow to keep it going.</p>}
      {summary.levelAfter > summary.levelBefore && <div className="level-up" style={{ animationDelay: '1.5s' }}>⬆ Level {summary.levelAfter} reached!</div>}
      {summary.newCards > 0 && <p className="muted">{summary.newCards} new review card{summary.newCards === 1 ? '' : 's'} added. They'll come back just before you'd forget them.</p>}
      <div className="hero-actions" style={{ marginTop: 28 }}>
        {next ? (
          <button className="btn btn-primary btn-lg" autoFocus onClick={() => navigate(`/lesson/${next.id}`)}>Next lesson: {next.title}</button>
        ) : (
          <button className="btn btn-primary btn-lg" autoFocus onClick={() => navigate('/learn')}>Back to lessons</button>
        )}
        <button className="btn btn-lg" onClick={() => navigate('/')}>Home</button>
      </div>
    </div>
  );
}
