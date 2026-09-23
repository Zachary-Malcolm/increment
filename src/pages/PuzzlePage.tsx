import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CodeEditor } from '../components/CodeEditor';
import { Console, PythonStatusNote } from '../components/Console';
import { InlineMarkdown, Markdown } from '../components/Markdown';
import { PUZZLES } from '../content';
import type { Puzzle } from '../content/types';
import { celebrate } from '../lib/celebrate';
import { dayKey } from '../lib/dates';
import { highlightLines } from '../lib/highlight';
import { addXp, streakInfo, type DailyResult } from '../lib/progress';
import { dailyPuzzle, puzzleScore, updateRating } from '../lib/puzzles';
import { sounds } from '../lib/sound';
import type { RunResult } from '../python/harness';
import { runPython, warmUpPython } from '../python/runner';
import { useStore } from '../state/store';

export function DailyPuzzlePage() {
  const today = dayKey();
  const daily = dailyPuzzle(today, PUZZLES);
  return <PuzzlePlayer key={`daily-${today}`} puzzle={daily.puzzle} daily={{ day: today, number: daily.number, tier: daily.tier }} />;
}

export function PuzzlePage() {
  const { id = '' } = useParams();
  const puzzle = PUZZLES.find((p) => p.id === id);
  if (!puzzle) {
    return (
      <div className="card center narrow">
        <h2>Puzzle not found</h2>
        <Link className="btn" to="/puzzles">All puzzles</Link>
      </div>
    );
  }
  return <PuzzlePlayer key={puzzle.id} puzzle={puzzle} />;
}

interface DailyInfo {
  day: string;
  number: number;
  tier: string;
}

interface Outcome {
  score: number;
  wrongClicks: number;
  runs: number;
  seconds: number;
  xp: number;
  ratingBefore: number;
  ratingAfter: number | null;
}

function PuzzlePlayer({ puzzle, daily }: { puzzle: Puzzle; daily?: DailyInfo }) {
  const { progress, update } = useStore();
  const previousDaily = daily ? progress.daily[daily.day] : undefined;
  const [stage, setStage] = useState<'find' | 'fix' | 'done'>(previousDaily ? 'done' : 'find');
  const [misses, setMisses] = useState<number[]>([]);
  const [lastMiss, setLastMiss] = useState<number | null>(null);
  const [usedHint, setUsedHint] = useState(false);
  const [code, setCode] = useState(puzzle.buggy);
  const [result, setResult] = useState<RunResult | null>(null);
  const [running, setRunning] = useState(false);
  const [runs, setRuns] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const started = useRef(Date.now());

  useEffect(() => warmUpPython(), []);

  const lines = highlightLines(puzzle.buggy.replace(/\n$/, ''));

  function clickLine(n: number) {
    if (stage !== 'find') return;
    if (puzzle.bugLines.includes(n)) {
      sounds.correct();
      setStage('fix');
    } else if (!misses.includes(n)) {
      sounds.wrong();
      setMisses([...misses, n]);
      setLastMiss(n);
    }
  }

  function showLine() {
    setUsedHint(true);
    setStage('fix');
  }

  async function check() {
    if (running) return;
    setRunning(true);
    const r = await runPython({ code, setup: puzzle.setup, tests: puzzle.tests, data: puzzle.data });
    setRunning(false);
    setResult(r);
    setRuns((n) => n + 1);
    if (r.ok) finish();
    else sounds.wrong();
  }

  async function run() {
    if (running) return;
    setRunning(true);
    setResult(await runPython({ code, setup: puzzle.setup, data: puzzle.data }));
    setRunning(false);
  }

  function finish() {
    const score = puzzleScore(misses.length, usedHint, revealed);
    const seconds = Math.round((Date.now() - started.current) / 1000);
    const rated = !progress.puzzles[puzzle.id];
    const ratingAfter = rated ? updateRating(progress.puzzleRating, puzzle.rating, score) : null;
    const firstDaily = daily && !progress.daily[daily.day];
    const xp = 10 + score * 10 + (firstDaily ? 10 : 0);
    const today = dayKey();
    update((p) => {
      let next = addXp(p, xp, today);
      if (rated) next = { ...next, puzzleRating: ratingAfter!, puzzles: { ...next.puzzles, [puzzle.id]: { at: new Date().toISOString(), score } } };
      if (firstDaily) {
        const record: DailyResult = { puzzleId: puzzle.id, score, wrongClicks: misses.length, runs: runs + 1, seconds };
        next = { ...next, daily: { ...next.daily, [daily.day]: record } };
      }
      return next;
    });
    setOutcome({ score, wrongClicks: misses.length, runs: runs + 1, seconds, xp, ratingBefore: progress.puzzleRating, ratingAfter });
    setStage('done');
    sounds.complete();
    if (score > 0) celebrate(score === 1);
  }

  if (stage === 'done') {
    const o: Outcome | null = outcome ?? (previousDaily ? { ...previousDaily, xp: 0, ratingBefore: progress.puzzleRating, ratingAfter: null } : null);
    return <PuzzleResult puzzle={puzzle} outcome={o} daily={daily} />;
  }

  return (
    <div className="player">
      <div className="spread" style={{ marginBottom: 16 }}>
        <Link to="/puzzles" className="icon-btn">← Puzzles</Link>
        <span className="pill gold">{daily ? `Daily #${daily.number} · ${daily.tier}` : `Rating ${puzzle.rating}`}</span>
      </div>
      <h1 style={{ fontSize: 26 }}>{puzzle.title}</h1>
      <div className="card ai-task">
        <div className="ai-avatar">AI</div>
        <div>
          <div className="faint" style={{ fontSize: 13 }}>You asked an AI assistant:</div>
          <div style={{ fontWeight: 600 }}>“{puzzle.task}”</div>
          <div className="muted" style={{ fontSize: 14, marginTop: 4 }}>It wrote the code below. It looks fine, but there's one bug.</div>
          {puzzle.given && <div style={{ fontSize: 14, marginTop: 6 }}><InlineMarkdown md={puzzle.given} /></div>}
        </div>
      </div>
      <div className="stage-tabs">
        <span className={`stage-tab ${stage === 'find' ? 'active' : 'done'}`}>1 · Find the bug</span>
        <span className={`stage-tab ${stage === 'fix' ? 'active' : ''}`}>2 · Fix it</span>
      </div>

      {stage === 'find' ? (
        <>
          <p className="muted" style={{ marginTop: 0 }}>Click the line with the bug.</p>
          <div className="code-lines" role="list">
            {lines.map((html, i) => {
              const n = i + 1;
              const missed = misses.includes(n);
              return (
                <button
                  key={`${n}-${missed && lastMiss === n ? misses.length : 0}`}
                  className={`code-line ${missed ? 'miss' : ''}`}
                  onClick={() => clickLine(n)}
                  disabled={missed}
                  aria-label={`Line ${n}${missed ? ', not the bug' : ''}`}
                >
                  <span className="ln">{n}</span>
                  <code dangerouslySetInnerHTML={{ __html: html || ' ' }} />
                </button>
              );
            })}
          </div>
          <div className="editor-actions">
            {!usedHint && <button className="btn btn-ghost" onClick={() => setUsedHint(true)}>💡 Hint</button>}
            {(misses.length >= 2 || usedHint) && <button className="btn btn-ghost" onClick={showLine}>Show me the line</button>}
            {misses.length > 0 && <span className="faint" style={{ fontSize: 14 }}>{misses.length} wrong guess{misses.length === 1 ? '' : 'es'}</span>}
          </div>
          {usedHint && <div className="hint">Think about: <strong>{puzzle.concepts.join(', ')}</strong>. Try running the code in your head with the example values.</div>}
        </>
      ) : (
        <>
          <p className="muted" style={{ marginTop: 0 }}>
            Found it: line {puzzle.bugLines.join(' and ')}. Now fix the code so it does what was asked, then press <strong>Check</strong>.
          </p>
          <div className="editor-shell">
            <div className="editor-head">
              <span className="dots"><i /><i /><i /></span>
              <span className="mono">ai_suggestion.py</span>
              <button className="btn btn-ghost btn-sm" onClick={() => { setCode(puzzle.buggy); setResult(null); }}>Reset</button>
            </div>
            <CodeEditor value={code} onChange={setCode} onSubmit={check} onRun={run} bugLines={puzzle.bugLines} errorLine={result?.error?.line ?? null} />
          </div>
          <div className="editor-actions">
            <button className="btn" onClick={run} disabled={running}>▶ Run</button>
            <button className="btn btn-primary" onClick={check} disabled={running}>Check</button>
            {!revealed && runs >= 1 && (
              <button className="btn btn-ghost" onClick={() => { setRevealed(true); setCode(puzzle.fixed); setResult(null); }}>Reveal the fix</button>
            )}
            <PythonStatusNote />
          </div>
          {revealed && <div className="alert alert-info">Here's the fix. Compare it with the original, then press <strong>Check</strong>.</div>}
          <Console result={result} running={running} hideErrorDetails />
        </>
      )}
    </div>
  );
}

function formatTime(s: number) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function PuzzleResult({ puzzle, outcome, daily }: { puzzle: Puzzle; outcome: Outcome | null; daily?: DailyInfo }) {
  const { progress } = useStore();
  const [copied, setCopied] = useState(false);
  const streak = streakInfo(progress, dayKey()).current;
  const fixedLines = highlightLines(puzzle.fixed.replace(/\n$/, ''));

  function share() {
    if (!outcome || !daily) return;
    const found = outcome.score === 0 ? '🙈 Needed the answer' : outcome.wrongClicks === 0 ? '🔍 Found the bug first try' : `🔍 Found the bug in ${outcome.wrongClicks + 1} tries`;
    const text = [
      `Increment daily #${daily.number} 🧩 ${daily.tier}`,
      found,
      `🔧 Fixed in ${outcome.runs} check${outcome.runs === 1 ? '' : 's'}`,
      `⏱ ${formatTime(outcome.seconds)}`,
      streak > 0 ? `🔥 ${streak}-day streak` : '',
      `${location.origin}${import.meta.env.BASE_URL}`,
    ].filter(Boolean).join('\n');
    navigator.clipboard?.writeText(text).then(() => setCopied(true), () => setCopied(false));
  }

  const title = !outcome ? 'Solved' : outcome.score === 1 ? 'Bug squashed!' : outcome.score > 0 ? 'Fixed, with a little help' : 'Now you know this one';
  return (
    <div className="player">
      <div className="complete">
        <div className="hero-mark pop" style={{ fontSize: 52 }}>{outcome && outcome.score === 0 ? '🙈' : '🐛✓'}</div>
        <h1 className="pop">{title}</h1>
        <p className="muted">{daily ? `Daily puzzle #${daily.number} · ${puzzle.title}` : puzzle.title}</p>
        {outcome && (
          <div className="complete-stats">
            <div className="complete-stat acc"><div className="label">Time</div><div className="value">{formatTime(outcome.seconds)}</div></div>
            {outcome.ratingAfter !== null && (
              <div className="complete-stat rating">
                <div className="label">Rating</div>
                <div className="value">{outcome.ratingAfter} <span style={{ fontSize: 16 }}>({outcome.ratingAfter >= outcome.ratingBefore ? '+' : ''}{outcome.ratingAfter - outcome.ratingBefore})</span></div>
              </div>
            )}
            {outcome.xp > 0 && <div className="complete-stat xp"><div className="label">XP earned</div><div className="value">+{outcome.xp}</div></div>}
          </div>
        )}
      </div>
      <div className="card">
        <div className="card-title">What was wrong</div>
        <Markdown md={puzzle.explain} />
        <div className="code-lines" style={{ marginTop: 8 }}>
          {fixedLines.map((html, i) => (
            <div key={i} className={`code-line ${puzzle.bugLines.includes(i + 1) ? 'hit' : ''}`} style={{ cursor: 'default' }}>
              <span className="ln">{i + 1}</span>
              <code dangerouslySetInnerHTML={{ __html: html || ' ' }} />
            </div>
          ))}
        </div>
      </div>
      <div className="hero-actions" style={{ marginTop: 24 }}>
        {daily && outcome && <button className="btn btn-primary btn-lg" onClick={share}>{copied ? 'Copied! ✓' : 'Share result'}</button>}
        <Link className={`btn btn-lg ${daily ? '' : 'btn-primary'}`} to="/puzzles">More puzzles</Link>
        <Link className="btn btn-lg" to="/">Home</Link>
      </div>
    </div>
  );
}
