/// <reference lib="webworker" />
// Runs Python off the main thread, so a slow or endless loop never freezes the page. The main thread
// (runner.ts) terminates and replaces this worker if a run takes too long.
import type { PyodideAPI } from 'pyodide';
import { HARNESS_PY } from './harness';

export const PYODIDE_VERSION = '314.0.7';
const PYODIDE_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;
const DATA_DIR = '/home/pyodide/data';

export type WorkerRequest =
  /** Load the libraries the code imports (pandas, numpy...) and its datasets. Not time-limited. */
  | { type: 'prepare'; id: number; code: string; data: string[] }
  | { type: 'run'; id: number; code: string; setup: string; tests: string };

export type WorkerMessage =
  | { type: 'ready' }
  | { type: 'failed'; message: string }
  | { type: 'prepared'; id: number; error?: string }
  | { type: 'result'; id: number; json: string };

let py: PyodideAPI;
let runSubmission: (code: string, setup: string, tests: string) => string;
const loadedData = new Set<string>();

async function init() {
  const mod = await import(/* @vite-ignore */ `${PYODIDE_URL}pyodide.mjs`);
  py = await mod.loadPyodide({ indexURL: PYODIDE_URL });
  py.runPython(HARNESS_PY);
  runSubmission = py.globals.get('run_submission');
  py.FS.mkdirTree(DATA_DIR);
}

// Datasets live in public/data and are copied into Python's file system the first time a step needs them.
async function ensureData(names: string[]) {
  for (const name of names) {
    if (loadedData.has(name)) continue;
    const res = await fetch(`${import.meta.env.BASE_URL}data/${name}`);
    if (!res.ok) throw new Error(`Couldn't load dataset ${name} (${res.status})`);
    py.FS.writeFile(`${DATA_DIR}/${name}`, new Uint8Array(await res.arrayBuffer()));
    loadedData.add(name);
  }
}

const ready = init();
ready.then(
  () => postMessage({ type: 'ready' } satisfies WorkerMessage),
  (err) => postMessage({ type: 'failed', message: String(err) } satisfies WorkerMessage),
);

// Handle one request at a time, in order.
let queue = Promise.resolve();
self.onmessage = (e: MessageEvent<WorkerRequest>) => {
  const req = e.data;
  queue = queue.then(async () => {
    await ready;
    if (req.type === 'prepare') {
      try {
        await py.loadPackagesFromImports(req.code, { messageCallback: () => {} });
        await ensureData(req.data);
        postMessage({ type: 'prepared', id: req.id } satisfies WorkerMessage);
      } catch (err) {
        postMessage({ type: 'prepared', id: req.id, error: String(err) } satisfies WorkerMessage);
      }
      return;
    }
    const json = runSubmission(req.code, req.setup, req.tests);
    postMessage({ type: 'result', id: req.id, json } satisfies WorkerMessage);
  }).catch((err) => {
    const json = JSON.stringify({
      ok: false, output: '', failure: null,
      error: { type: 'LoadError', message: String(err), line: null, friendly: 'Python could not start. Check your internet connection and reload the page.' },
    });
    postMessage({ type: 'result', id: req.id, json } satisfies WorkerMessage);
  });
};
