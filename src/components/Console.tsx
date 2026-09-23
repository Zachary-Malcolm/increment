import type { RunResult } from '../python/harness';
import { usePythonStatus } from '../python/runner';

// Problems with running at all (not with the learner's code), which are always shown in full.
const SYSTEM_ERRORS = new Set(['Timeout', 'LoadError', 'Stopped']);

/**
 * What the learner's code printed, plus any error explained in plain English.
 * `hideErrorDetails` (used by puzzles) replaces Python's error message with a generic one, because messages
 * like "Maybe you meant '==' instead of '='?" would give the answer away.
 */
export function Console({ result, running, hideErrorDetails = false }: { result: RunResult | null; running: boolean; hideErrorDetails?: boolean }) {
  if (hideErrorDetails && !running && result?.error && !SYSTEM_ERRORS.has(result.error.type)) {
    return (
      <>
        <div className="console" aria-live="polite">
          <div className="console-head">OUTPUT</div>
          <pre>{result.output || <span className="empty">Nothing was printed.</span>}</pre>
        </div>
        <div className="alert alert-error" role="alert">
          <span className="etype">Error</span>: the code still has a bug. Fix it and try again.
        </div>
      </>
    );
  }
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
