import type { RunResult } from '../python/harness';
import { usePythonStatus } from '../python/runner';

/** What the learner's code printed, plus any error explained in plain English. */
export function Console({ result, running }: { result: RunResult | null; running: boolean }) {
  return (
    <>
      <div className="console" aria-live="polite">
        <div className="console-head">OUTPUT</div>
        <pre>
          {running ? <span className="empty">Running…</span>
            : result?.output ? result.output
            : <span className="empty">{result ? 'Nothing was printed.' : 'Run your code to see what it prints.'}</span>}
        </pre>
      </div>
      {!running && result?.error && (
        <div className="alert alert-error" role="alert">
          <div>
            <span className="etype">{result.error.type}</span>
            {result.error.line ? <span className="muted"> on line {result.error.line}</span> : null}
            {result.error.message ? <span>: {result.error.message}</span> : null}
          </div>
          {result.error.friendly && <div style={{ marginTop: 6 }}>{result.error.friendly}</div>}
        </div>
      )}
      {!running && !result?.error && result?.failure && (
        <div className="alert alert-warn" role="alert">
          <strong>Not quite.</strong> {result.failure}
        </div>
      )}
    </>
  );
}

export function PythonStatusNote() {
  const status = usePythonStatus();
  if (status === 'loading') return <span className="py-status"><span className="spinner" /> Starting Python (first time takes a few seconds)…</span>;
  if (status === 'failed') return <span className="py-status" style={{ color: 'var(--red)' }}>Python couldn't load. Check your connection and reload.</span>;
  return null;
}
