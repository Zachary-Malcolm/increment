import { Link } from 'react-router-dom';
import { Heatmap } from '../components/Heatmap';
import { LESSONS, MODULES, moduleOf, PUZZLES } from '../content';
import { dayKey, parseDay } from '../lib/dates';
import { levelInfo, streakInfo } from '../lib/progress';
import { dailyPuzzle } from '../lib/puzzles';
import { dueCardIds } from '../lib/srs';
import { supabase } from '../lib/supabase';
import { useStore } from '../state/store';

export function Home() {
  const { progress, user } = useStore();
  const isNew = progress.xp === 0 && Object.keys(progress.lessons).length === 0;
  return isNew ? <Welcome signedIn={!!user} /> : <Dashboard />;
}

function Welcome({ signedIn }: { signedIn: boolean }) {
  const lessonCount = LESSONS.length;
  return (
    <>
      <section className="hero">
        <div className="hero-mark">+= 1</div>
        <h1>Small enough to remember.<br /><span className="dim">Hard enough to grow.</span></h1>
        <p>
          Always meant to learn to code, but it feels daunting? Learn Python for data science in five-minute steps,
          with real datasets, right here in your browser. Nothing to install.
        </p>
        <div className="hero-actions">
          <Link className="btn btn-primary btn-lg" to={`/lesson/${LESSONS[0].id}`}>Start your first lesson</Link>
          {supabase && !signedIn && <Link className="btn btn-lg" to="/account">I have an account</Link>}
        </div>
        <p className="faint" style={{ fontSize: 14, marginTop: 16 }}>No sign-up needed to start. {MODULES.length} modules, {lessonCount} lessons, from your first line of code to machine learning.</p>
      </section>
      <section className="grid grid-3">
        <div className="card feature">
          <div className="feature-icon">🐧</div>
          <h3>Real data from lesson one</h3>
          <p>Every exercise runs real Python. You'll analyse 344 real penguins before you know it.</p>
        </div>
        <div className="card feature">
          <div className="feature-icon">🧩</div>
          <h3>Spot the AI's mistake</h3>
          <p>Daily bug-hunt puzzles train the skill that matters now: reviewing code, including code written by AI.</p>
        </div>
        <div className="card feature">
          <div className="feature-icon">↻</div>
          <h3>Built to stick</h3>
          <p>Spaced reviews bring back what you learned just before you'd forget it, so it stays learned.</p>
        </div>
      </section>
    </>
  );
}

function Dashboard() {
  const { progress } = useStore();
  const today = dayKey();
  const streak = streakInfo(progress, today);
  const lvl = levelInfo(progress.xp);
  const due = dueCardIds(progress, new Date()).length;
  const next = LESSONS.find((l) => !progress.lessons[l.id]);
  const daily = dailyPuzzle(today, PUZZLES);
  const dailyDone = progress.daily[today];
  const nextReview = Object.values(progress.cards).map((c) => c.due).sort()[0];

  return (
    <div className="stack">
      <div className="grid grid-3">
        <div className="card">
          <div className="card-title">Streak</div>
          <div className="row">
            <span className="streak-flame" style={{ filter: streak.activeToday ? 'none' : 'grayscale(1) opacity(0.5)' }}>🔥</span>
            <span className="big-number" style={{ color: streak.activeToday ? 'var(--orange)' : undefined }}>{streak.current}</span>
            <span className="muted">day{streak.current === 1 ? '' : 's'}</span>
          </div>
          <p className="muted" style={{ margin: '10px 0 0', fontSize: 14 }}>
            {streak.activeToday ? 'Done for today. See you tomorrow!' : streak.current > 0 ? 'Do anything today to keep it going.' : 'Complete anything today to start a streak.'}
          </p>
          <p style={{ margin: '6px 0 0', fontSize: 14 }}>
            <span className="freeze">❄ {progress.freezes} streak freeze{progress.freezes === 1 ? '' : 's'}</span>
            <span className="faint"> · longest {streak.longest}</span>
          </p>
        </div>
        <div className="card">
          <div className="card-title">Level</div>
          <div className="row" style={{ marginBottom: 12 }}>
            <span className="big-number" style={{ color: 'var(--purple)' }}>{lvl.level}</span>
            <span className="muted">{progress.xp} XP total</span>
          </div>
          <div className="bar purple"><span style={{ width: `${(lvl.into / lvl.span) * 100}%` }} /></div>
          <p className="faint" style={{ margin: '8px 0 0', fontSize: 14 }}>{lvl.span - lvl.into} XP to level {lvl.level + 1}</p>
        </div>
        <div className="card">
          <div className="card-title">Reviews</div>
          {due > 0 ? (
            <>
              <div className="row"><span className="big-number" style={{ color: 'var(--blue)' }}>{due}</span><span className="muted">due now</span></div>
              <Link className="btn btn-block" style={{ marginTop: 14 }} to="/review">Review now</Link>
            </>
          ) : (
            <>
              <div className="row"><span className="big-number" style={{ color: 'var(--green-bright)' }}>✓</span><span className="muted">All caught up</span></div>
              <p className="faint" style={{ margin: '10px 0 0', fontSize: 14 }}>
                {nextReview ? `Next review ${parseDay(dayKey(new Date(nextReview))).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })}.` : 'Finish a lesson to unlock reviews.'}
              </p>
            </>
          )}
        </div>
      </div>

      {next ? (
        <div className="card continue-card">
          <div>
            <div className="card-title">Continue learning</div>
            <span className="pill">Module {moduleOf(next.id)!.number}: {moduleOf(next.id)!.title}</span>
            <h2>{next.title}</h2>
            <div className="muted">{next.summary}</div>
          </div>
          <Link className="btn btn-primary btn-lg" to={`/lesson/${next.id}`}>Start lesson</Link>
        </div>
      ) : (
        <div className="card continue-card">
          <div>
            <div className="card-title">Course progress</div>
            <h2>You've completed the whole course 🎉</h2>
            <div className="muted">Keep it fresh with your reviews and the daily puzzle, then start a project of your own.</div>
          </div>
          <Link className="btn btn-lg" to="/learn">Revisit a module</Link>
        </div>
      )}

      <div className="card continue-card">
        <div>
          <div className="card-title">Daily puzzle #{daily.number}</div>
          <span className="pill gold">{daily.tier}</span>
          <h2>{daily.puzzle.title}</h2>
          <div className="muted">An AI wrote some code with a bug in it. Can you find it?</div>
        </div>
        {dailyDone ? (
          <Link className="btn btn-lg" to="/puzzles/daily">Solved ✓ View</Link>
        ) : (
          <Link className="btn btn-primary btn-lg" to="/puzzles/daily">Solve today's puzzle</Link>
        )}
      </div>

      <div className="card">
        <div className="card-title">Your year</div>
        <Heatmap progress={progress} today={today} />
      </div>
    </div>
  );
}
