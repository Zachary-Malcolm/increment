// The three kinds of exercise. Each one runs its own check, then shows feedback, and calls onDone when the
// learner presses Continue. The same components are used in lessons and in spaced-repetition reviews.
import { useEffect, useState } from 'react';
import type { ChoiceStep, CodeStep, ExerciseStep, PredictStep } from '../content/types';
import { highlightPython } from '../lib/highlight';
import { sounds } from '../lib/sound';
import type { RunResult } from '../python/harness';
import { runPython } from '../python/runner';
import { CodeEditor } from './CodeEditor';
import { Console, PythonStatusNote } from './Console';
import { Feedback } from './Feedback';
import { InlineMarkdown, Markdown } from './Markdown';

export interface ExerciseResult {
  correct: boolean;
  /** Right on the first attempt without revealing the answer. */
  firstTry: boolean;
  /** The learner looked at the solution. */
  revealed?: boolean;
}

interface Props<S> {
  step: S;
  onDone: (result: ExerciseResult) => void;
}

export function Exercise({ step, onDone }: Props<ExerciseStep>) {
  if (step.kind === 'code') return <CodeExercise step={step} onDone={onDone} />;
  return <ChoiceExercise step={step} onDone={onDone} />;
}

function ChoiceExercise({ step, onDone }: Props<PredictStep | ChoiceStep>) {
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const correct = selected === step.answer;

  function check() {
    if (selected === null) return;
    setChecked(true);
    if (selected === step.answer) sounds.correct();
    else sounds.wrong();
  }

  // Number keys choose an option; Enter checks.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (checked || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) return;
      if (e.key === 'Enter' && selected !== null && !(e.target instanceof HTMLButtonElement)) {
        check();
        return;
      }
      const n = Number(e.key);
      if (n >= 1 && n <= step.options.length) {
        setSelected(n - 1);
        sounds.tick();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <div>
      {step.kind === 'predict' ? (
        <>
          <h2 style={{ fontSize: 22 }}>What does this code print?</h2>
          <div className="prose">
            <pre><code dangerouslySetInnerHTML={{ __html: highlightPython(step.code.trimEnd()) }} /></pre>
          </div>
        </>
      ) : (
        <Markdown md={step.question} />
      )}
      <div className="options" role="radiogroup">
        {step.options.map((option, i) => {
          let cls = 'option';
          if (checked && i === step.answer) cls += ' correct';
          else if (checked && i === selected) cls += ' wrong';
          else if (!checked && i === selected) cls += ' selected';
          return (
            <button
              key={i}
              className={cls}
              role="radio"
              aria-checked={i === selected}
              disabled={checked}
              onClick={() => { setSelected(i); sounds.tick(); }}
            >
              <span className="option-key">{i + 1}</span>
              {step.kind === 'predict' ? <pre>{option}</pre> : <InlineMarkdown md={option} />}
            </button>
          );
        })}
      </div>
      {!checked ? (
        <div className="actions">
          <button className="btn btn-primary btn-lg" disabled={selected === null} onClick={check}>Check</button>
        </div>
      ) : (
        <Feedback good={correct} explain={step.explain} onContinue={() => onDone({ correct, firstTry: correct })} />
      )}
    </div>
  );
}

function CodeExercise({ step, onDone }: Props<CodeStep>) {
  const [code, setCode] = useState(step.starter);
  const [result, setResult] = useState<RunResult | null>(null);
  const [running, setRunning] = useState(false);
  const [failedChecks, setFailedChecks] = useState(0);
  const [hintsShown, setHintsShown] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [passed, setPassed] = useState(false);

  async function execute(withTests: boolean) {
    if (running || passed) return;
    setRunning(true);
    const r = await runPython({ code, setup: step.setup, tests: withTests ? step.tests : '', data: step.data });
    setRunning(false);
    setResult(r);
    if (!withTests) return;
    if (r.ok) {
      setPassed(true);
      sounds.correct();
    } else {
      setFailedChecks((n) => n + 1);
      sounds.wrong();
    }
  }

  function reveal() {
    setRevealed(true);
    setCode(step.solution);
    setResult(null);
  }

  return (
    <div>
      <Markdown md={step.prompt} />
      <div className="editor-shell" style={{ marginTop: 16 }}>
        <div className="editor-head">
          <span className="dots"><i /><i /><i /></span>
          <span className="mono">main.py</span>
          <button className="btn btn-ghost btn-sm" onClick={() => { setCode(step.starter); setResult(null); }} disabled={passed}>
            Reset
          </button>
        </div>
        <CodeEditor
          value={code}
          onChange={setCode}
          onSubmit={() => execute(true)}
          onRun={() => execute(false)}
          errorLine={result?.error?.line ?? null}
        />
      </div>
      <div className="editor-actions">
        <button className="btn" onClick={() => execute(false)} disabled={running || passed}>
          ▶ Run <span className="kbd hide-mobile">Shift+Enter</span>
        </button>
        <button className="btn btn-primary" onClick={() => execute(true)} disabled={running || passed}>
          Check <span className="kbd hide-mobile">Ctrl+Enter</span>
        </button>
        {hintsShown < step.hints.length && !passed && (
          <button className="btn btn-ghost" onClick={() => setHintsShown((n) => n + 1)}>💡 Hint</button>
        )}
        {(failedChecks >= 2 || hintsShown >= step.hints.length) && !revealed && !passed && (
          <button className="btn btn-ghost" onClick={reveal}>Show solution</button>
        )}
        <PythonStatusNote />
      </div>
      {step.hints.slice(0, hintsShown).map((h, i) => (
        <div className="hint" key={i}><Markdown md={h} /></div>
      ))}
      {revealed && !passed && (
        <div className="alert alert-info">Here's a working solution. Read it through, then press <strong>Check</strong> to run it.</div>
      )}
      <Console result={result} running={running} />
      {passed && (
        <Feedback
          good
          explain={revealed ? 'Solutions are for learning from. This one will come back in your reviews.' : failedChecks === 0 ? 'First try!' : 'You got there. Persistence is the whole game.'}
          onContinue={() => onDone({ correct: true, firstTry: failedChecks === 0 && !revealed, revealed })}
        />
      )}
    </div>
  );
}
