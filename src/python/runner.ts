// Main-thread side of the Python worker: starts it, sends runs, and enforces a time limit.
// If a run goes over the limit the worker is terminated and a fresh one started (Pyodide can't be
// interrupted without cross-origin isolation, which GitHub Pages can't provide).
// Libraries (pandas, numpy, matplotlib...) and datasets are loaded in a separate "prepare" step first,
// so a slow first download never counts against the learner's time limit.
import { useSyncExternalStore } from 'react';
import type { RunResult } from './harness';
import type { WorkerMessage, WorkerRequest } from './worker';

export type PythonStatus = 'idle' | 'loading' | 'libraries' | 'ready' | 'failed';

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
const pending = new Map<number, (msg: WorkerMessage) => void>();
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
        done?.(msg);
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
    done({ type: 'result', id, json: JSON.stringify(errorResult('Stopped', 'Stopped.', '')) });
  }
  start().catch(() => {});
}

function errorResult(type: string, message: string, friendly: string): RunResult {
  return { ok: false, output: '', failure: null, error: { type, message, line: null, friendly } };
}

function send(message: WorkerRequest): Promise<WorkerMessage> {
  return new Promise((resolve) => {
    pending.set(message.id, resolve);
    worker!.postMessage(message);
  });
}

/** Load the libraries and datasets some code needs (no time limit). */
async function prepare(code: string, data: string[]): Promise<string | undefined> {
  const needsLibraries = /^\s*(import|from)\s+(numpy|pandas|matplotlib|sklearn|scipy|sqlite3)\b/m.test(code);
  if (needsLibraries) setStatus('libraries');
  const msg = await send({ type: 'prepare', id: nextId++, code, data });
  if (needsLibraries) setStatus('ready');
  return msg.type === 'prepared' ? msg.error : undefined;
}

/** Start loading Python in the background, plus any libraries and datasets `req` will need. */
export function warmUpPython(req?: RunRequest) {
  start()
    .then(() => (req ? prepare([req.setup ?? '', req.code, req.tests ?? ''].join('\n'), req.data ?? []) : undefined))
    .catch(() => {});
}

export async function runPython(req: RunRequest): Promise<RunResult> {
  try {
    await start();
  } catch {
    return errorResult('LoadError', 'Python could not start.', 'Python could not load. Check your internet connection, then reload the page.');
  }
  const loadError = await prepare([req.setup ?? '', req.code, req.tests ?? ''].join('\n'), req.data ?? []);
  if (loadError) {
    return errorResult('LoadError', loadError, 'A library or dataset could not load. Check your internet connection and try again.');
  }
  const id = nextId++;
  const run = send({ type: 'run', id, code: req.code, setup: req.setup ?? '', tests: req.tests ?? '' });
  let timer: number | undefined;
  const timeout = new Promise<WorkerMessage>((resolve) => {
    timer = window.setTimeout(() => {
      pending.delete(id);
      resolve({
        type: 'result', id,
        json: JSON.stringify(errorResult('Timeout', `Stopped after ${TIME_LIMIT_MS / 1000} seconds.`,
          'Your code ran for too long, so it was stopped. Is there a loop that never ends?')),
      });
      restart();
    }, TIME_LIMIT_MS);
  });
  const msg = await Promise.race([run, timeout]);
  window.clearTimeout(timer);
  return msg.type === 'result' ? JSON.parse(msg.json) : errorResult('LoadError', 'Unexpected reply.', '');
}

export function usePythonStatus(): PythonStatus {
  return useSyncExternalStore(
    (l) => { listeners.add(l); return () => listeners.delete(l); },
    () => status,
  );
}
