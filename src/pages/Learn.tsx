import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LESSONS, MODULES, moduleOf, PLANNED } from '../content';
import { useStore } from '../state/store';

/** A lesson is open once the one before it is done (and always once completed). */
export function isUnlocked(lessonId: string, completed: Record<string, unknown>): boolean {
  const i = LESSONS.findIndex((l) => l.id === lessonId);
  return i === 0 || !!completed[lessonId] || !!completed[LESSONS[i - 1]?.id];
}

export function Learn() {
  const { progress } = useStore();
  const current = LESSONS.find((l) => !progress.lessons[l.id])?.id;
  const currentModule = current ? moduleOf(current)?.id : undefined;
  // Only the module you're working on starts open, so the course map stays short.
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(currentModule ? [currentModule] : []));
  const lessonsDone = LESSONS.filter((l) => progress.lessons[l.id]).length;

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div>
      <h1 className="page-title">Learn</h1>
      <p className="page-sub">
        Python for data science, one small step at a time. {lessonsDone} of {LESSONS.length} lessons complete.
      </p>
      {MODULES.map((m) => {
        const done = m.lessons.filter((l) => progress.lessons[l.id]).length;
        const complete = done === m.lessons.length;
        const isOpen = expanded.has(m.id);
        const started = done > 0 || m.id === currentModule;
        return (
          <section className="card module" key={m.id}>
            <button className="module-head module-toggle" onClick={() => toggle(m.id)} aria-expanded={isOpen}>
              <div className={`module-num ${complete ? 'done' : ''}`}>{complete ? '✓' : m.number}</div>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div className="spread">
                  <h2 style={{ fontSize: 20, margin: 0 }}>{m.title}</h2>
                  <span className="faint" style={{ fontSize: 14, whiteSpace: 'nowrap' }}>
                    {done}/{m.lessons.length} <span aria-hidden="true">{isOpen ? '▴' : '▾'}</span>
                  </span>
                </div>
                <div className="muted">{m.blurb}</div>
                {!isOpen && started && !complete && (
                  <div className="bar" style={{ marginTop: 10, height: 6 }}><span style={{ width: `${(done / m.lessons.length) * 100}%` }} /></div>
                )}
              </div>
            </button>
            {isOpen && (
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
            )}
          </section>
        );
      })}
      {PLANNED.length > 0 && (
        <>
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
        </>
      )}
    </div>
  );
}
