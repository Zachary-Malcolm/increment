import { Link, useNavigate } from 'react-router-dom';
import { PUZZLES } from '../content';
import { dayKey } from '../lib/dates';
import { dailyPuzzle, nextRatedPuzzle } from '../lib/puzzles';
import { useStore } from '../state/store';

export function PuzzlesPage() {
  const { progress } = useStore();
  const navigate = useNavigate();
  const today = dayKey();
  const daily = dailyPuzzle(today, PUZZLES);
  const attempted = new Set(Object.keys(progress.puzzles));
  const next = nextRatedPuzzle(progress.puzzleRating, PUZZLES, attempted);
  const solved = Object.values(progress.puzzles).filter((r) => r.score > 0).length;
  const sorted = [...PUZZLES].sort((a, b) => a.rating - b.rating);

  return (
    <div className="stack">
      <div>
        <h1 className="page-title">Puzzles</h1>
        <p className="page-sub">
          AI assistants write a lot of code now, and it's often <em>almost</em> right. Each puzzle is AI-style code with one bug.
          Find the line, then fix it.
        </p>
      </div>
      <div className="grid grid-3">
        <div className="card">
          <div className="card-title">Puzzle rating</div>
          <div className="big-number" style={{ color: 'var(--gold)' }}>{progress.puzzleRating}</div>
          <p className="faint" style={{ margin: '8px 0 0', fontSize: 14 }}>{solved} solved · rises when you solve puzzles above your level</p>
        </div>
        <div className="card span-2">
          <div className="card-title">Daily puzzle #{daily.number} · {daily.tier}</div>
          <div className="spread" style={{ flexWrap: 'wrap' }}>
            <div>
              <h2 style={{ fontSize: 20, margin: '0 0 4px' }}>{daily.puzzle.title}</h2>
              <div className="muted" style={{ fontSize: 14 }}>Same puzzle for everyone today. Easy on Mondays, expert on Sundays.</div>
            </div>
            <Link className={`btn ${progress.daily[today] ? '' : 'btn-primary'}`} to="/puzzles/daily">
              {progress.daily[today] ? 'Solved ✓ View' : 'Solve'}
            </Link>
          </div>
        </div>
      </div>
      <div className="card continue-card">
        <div>
          <div className="card-title">Rated puzzles</div>
          <h2>{next ? 'A puzzle picked for your level' : "You've tried every puzzle!"}</h2>
          <div className="muted">{next ? 'Your first attempt at each puzzle counts towards your rating.' : 'More are on the way. You can replay any of them below.'}</div>
        </div>
        {next && <button className="btn btn-primary btn-lg" onClick={() => navigate(`/puzzles/${next.id}`)}>Start rated puzzle</button>}
      </div>
      <div className="card">
        <div className="card-title">All puzzles</div>
        <div className="puzzle-list">
          {sorted.map((p) => {
            const r = progress.puzzles[p.id];
            return (
              <Link key={p.id} className="puzzle-item" to={`/puzzles/${p.id}`}>
                <span className="rating-num">{p.rating}</span>
                <span style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{p.title}</div>
                  <div className="faint" style={{ fontSize: 13 }}>{p.concepts.join(' · ')}</div>
                </span>
                {r ? <span className={`pill ${r.score === 1 ? 'green' : r.score > 0 ? 'gold' : 'red'}`}>{r.score === 1 ? 'Solved' : r.score > 0 ? 'Solved with help' : 'Revealed'}</span> : <span className="pill">New</span>}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
