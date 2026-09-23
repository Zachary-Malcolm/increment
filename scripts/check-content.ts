// Proves every answer in the course is right, using the same Python harness the app runs.
// Run with `npm run check-content` (CI runs it on every push).
import { readdirSync, readFileSync } from 'node:fs';
import { loadPyodide } from 'pyodide';
import { HARNESS_PY, type RunResult } from '../src/python/harness';
import { MODULES, PUZZLES } from '../src/content';

const py = await loadPyodide();
py.runPython(HARNESS_PY);
const runSubmission = py.globals.get('run_submission');
py.FS.mkdirTree('/home/pyodide/data');
for (const name of readdirSync('public/data')) {
  py.FS.writeFile(`/home/pyodide/data/${name}`, readFileSync(`public/data/${name}`));
}

function run(code: string, setup = '', tests = ''): RunResult {
  return JSON.parse(runSubmission(code, setup, tests));
}

function describe(r: RunResult): string {
  if (r.error) return `${r.error.type} on line ${r.error.line}: ${r.error.message}`;
  if (r.failure) return `test failed: ${r.failure}`;
  return 'passed';
}

const problems: string[] = [];
const ids = new Set<string>();
let checked = 0;

function claimId(id: string, where: string) {
  if (ids.has(id)) problems.push(`${where}: duplicate id ${id}`);
  ids.add(id);
}

for (const mod of MODULES) {
  for (const lesson of mod.lessons) {
    claimId(lesson.id, lesson.id);
    for (const step of lesson.steps) {
      if (step.kind === 'read') continue;
      const where = `${lesson.id} / ${step.id}`;
      claimId(step.id, where);
      checked++;
      if (step.kind === 'code') {
        const good = run(step.solution, step.setup, step.tests);
        if (!good.ok) problems.push(`${where}: solution does not pass (${describe(good)})`);
        const starter = run(step.starter, step.setup, step.tests);
        if (starter.ok) problems.push(`${where}: the starter code already passes the tests`);
        if (step.hints.length === 0) problems.push(`${where}: no hints`);
      } else if (step.kind === 'predict') {
        const r = run(step.code, step.setup);
        const printed = r.output.replace(/\n$/, '');
        if (r.error) problems.push(`${where}: code raises ${describe(r)}`);
        else if (printed !== step.options[step.answer]) {
          problems.push(`${where}: code prints ${JSON.stringify(printed)} but the answer is ${JSON.stringify(step.options[step.answer])}`);
        }
        const matches = step.options.filter((o) => o === printed).length;
        if (matches > 1) problems.push(`${where}: more than one option matches the output`);
      }
      if (step.kind === 'predict' || step.kind === 'choice') {
        if (step.answer < 0 || step.answer >= step.options.length) problems.push(`${where}: answer index out of range`);
        if (new Set(step.options).size !== step.options.length) problems.push(`${where}: duplicate options`);
      }
    }
  }
}

for (const p of PUZZLES) {
  const where = `puzzle ${p.id}`;
  claimId(p.id, where);
  checked++;
  if (p.setup && !p.given) problems.push(`${where}: has setup but no \`given\` telling the learner what it provides`);
  const buggy = run(p.buggy, p.setup, p.tests);
  if (buggy.ok) problems.push(`${where}: the buggy code passes the tests`);
  const fixed = run(p.fixed, p.setup, p.tests);
  if (!fixed.ok) problems.push(`${where}: the fixed code fails (${describe(fixed)})`);
  const a = p.buggy.split('\n');
  const b = p.fixed.split('\n');
  if (a.length !== b.length) {
    problems.push(`${where}: buggy and fixed code must have the same number of lines`);
  } else {
    const changed = a.flatMap((line, i) => (line !== b[i] ? [i + 1] : []));
    const expected = [...p.bugLines].sort((x, y) => x - y);
    if (changed.join() !== expected.join()) {
      problems.push(`${where}: changed lines are [${changed}] but bugLines is [${expected}]`);
    }
  }
}

if (problems.length) {
  console.error(`✗ ${problems.length} problem(s) in ${checked} exercises:\n  ${problems.join('\n  ')}`);
  process.exit(1);
}
console.log(`✓ All ${checked} exercises and puzzles check out.`);
