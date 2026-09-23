// Main-thread side of the Python worker: starts it, sends runs, and enforces a time limit.
// If a run goes over the limit the worker is terminated and a fresh one started (Pyodide can't be
// interrupted without cross-origin isolation, which GitHub Pages can't provide).
import { useSyncExternalStore } from 'react';
import type { RunResult } from './harness';
import type { WorkerMessage, WorkerRequest } from './worker';

export type PythonStatus = 'idle' | 'loading' | 'ready' | 'failed';

export interface RunRequest {
  code: string;
  setup?: string;
  tests?: string;
  data?: string[];
}

const TIME_LIMIT_MS = 8000;

let worker: Worker | null = null;
let status: PythonStatus = 'idle';
let readyPromise: Promise<void> | null = null;
let nextId = 1;
const pending = new Map<number, (r: RunResult) => void>();
const listeners = new Set<() => void>();

function setStatus(s: PythonStatus) {
  status = s;
  listeners.forEach((l) => l());
}

function start(): Promise<void> {
  if (readyPromise) return readyPromise;
  setStatus('loading');
  const w = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
  worker = w;
  readyPromise = new Promise((resolve, reject) => {
    w.onmessage = (e: MessageEvent<WorkerMessage>) => {
      const msg = e.data;
      if (msg.type === 'ready') { setStatus('ready'); resolve(); }
      else if (msg.type === 'failed') { setStatus('failed'); reject(new Error(msg.message)); }
      else {
        const done = pending.get(msg.id);
        pending.delete(msg.id);
        done?.(JSON.parse(msg.json));
      }
    };
    w.onerror = (e) => { setStatus('failed'); reject(new Error(e.message)); };
  });
  readyPromise.catch(() => { readyPromise = null; worker = null; });
  return readyPromise;
}

function restart() {
  worker?.terminate();
  worker = null;
  readyPromise = null;
  for (const [id, done] of pending) {
    pending.delete(id);
    done(errorResult('Stopped', 'Stopped.', ''));
  }
  start().catch(() => {});
}

function errorResult(type: string, message: string, friendly: string): RunResult {
  return { ok: false, output: '', failure: null, error: { type, message, line: null, friendly } };
}

/** Start loading Python in the background (call early so the first run is quick). */
export function warmUpPython() {
  start().catch(() => {});
}

export async function runPython(req: RunRequest): Promise<RunResult> {
  try {
    await start();
  } catch {
    return errorResult('LoadError', 'Python could not start.', 'Python could not load. Check your internet connection, then reload the page.');
  }
  const id = nextId++;
  const message: WorkerRequest = { id, code: req.code, setup: req.setup ?? '', tests: req.tests ?? '', data: req.data ?? [] };
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      if (!pending.has(id)) return;
      pending.delete(id);
      resolve(errorResult('Timeout', `Stopped after ${TIME_LIMIT_MS / 1000} seconds.`,
        'Your code ran for too long, so it was stopped. Is there a loop that never ends?'));
      restart();
    }, TIME_LIMIT_MS);
    pending.set(id, (r) => { clearTimeout(timer); resolve(r); });
    worker!.postMessage(message);
  });
}

export function usePythonStatus(): PythonStatus {
  return useSyncExternalStore(
    (l) => { listeners.add(l); return () => listeners.delete(l); },
    () => status,
  );
}
