import { Link } from 'react-router-dom';
import { LESSONS, MODULES, PLANNED } from '../content';
import { useStore } from '../state/store';

/** A lesson is open once the one before it is done (and always once completed). */
export function isUnlocked(lessonId: string, completed: Record<string, unknown>): boolean {
  const i = LESSONS.findIndex((l) => l.id === lessonId);
  return i === 0 || !!completed[lessonId] || !!completed[LESSONS[i - 1]?.id];
}

export function Learn() {
  const { progress } = useStore();
  const current = LESSONS.find((l) => !progress.lessons[l.id])?.id;
  return (
    <div>
      <h1 className="page-title">Learn</h1>
      <p className="page-sub">Python for data science, one small step at a time.</p>
      {MODULES.map((m) => {
        const done = m.lessons.filter((l) => progress.lessons[l.id]).length;
        const complete = done === m.lessons.length;
        return (
          <section className="card module" key={m.id}>
            <div className="module-head">
              <div className={`module-num ${complete ? 'done' : ''}`}>{complete ? '✓' : m.number}</div>
              <div style={{ flex: 1 }}>
                <div className="spread">
                  <h2 style={{ fontSize: 20, margin: 0 }}>{m.title}</h2>
                  <span className="faint" style={{ fontSize: 14 }}>{done}/{m.lessons.length}</span>
                </div>
                <div className="muted">{m.blurb}</div>
              </div>
            </div>
            <ol className="lessons">
              {m.lessons.map((l, i) => {
                const isDone = !!progress.lessons[l.id];
                const open = isUnlocked(l.id, progress.lessons);
                const isCurrent = l.id === current;
                const inner = (
                  <>
                    <span className={`node ${isDone ? 'done' : isCurrent ? 'current' : ''}`}>{isDone ? '✓' : open ? i + 1 : '🔒'}</span>
                    <span style={{ flex: 1 }}>
                      <div className="title">{l.title}</div>
                      <div className="summary">{l.summary}</div>
                    </span>
                    {isDone && <span className="pill green hide-mobile">{Math.round(progress.lessons[l.id].accuracy * 100)}%</span>}
                    {isCurrent && <span className="btn btn-primary btn-sm">Start</span>}
                  </>
                );
                return (
                  <li key={l.id}>
                    {open ? (
                      <Link className={`lesson-row ${isCurrent ? 'current' : ''}`} to={`/lesson/${l.id}`}>{inner}</Link>
                    ) : (
                      <div className="lesson-row locked" aria-disabled="true" title="Finish the previous lesson to unlock this one">{inner}</div>
                    )}
                  </li>
                );
              })}
            </ol>
          </section>
        );
      })}
      <h2 style={{ fontSize: 20, margin: '32px 0 12px' }}>Coming soon</h2>
      <div className="grid grid-2">
        {PLANNED.map((m) => (
          <div className="card planned" key={m.number}>
            <div className="row">
              <div className="module-num" style={{ width: 36, height: 36 }}>{m.number}</div>
              <div>
                <div style={{ fontWeight: 700 }}>{m.title}</div>
                <div className="muted" style={{ fontSize: 14 }}>{m.blurb}</div>
              </div>
            </div>
            <div className="topics">{m.topics.map((t) => <span className="pill" key={t}>{t}</span>)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
