import { useEffect, useRef } from 'react';
import { closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { python } from '@codemirror/lang-python';
import { bracketMatching, indentOnInput, indentUnit, syntaxHighlighting } from '@codemirror/language';
import { EditorState, RangeSetBuilder, StateEffect, StateField } from '@codemirror/state';
import {
  Decoration, drawSelection, EditorView, highlightActiveLine, highlightActiveLineGutter, keymap, lineNumbers,
  type DecorationSet,
} from '@codemirror/view';
import { classHighlighter } from '@lezer/highlight';

interface LineMarks {
  error: number | null;
  bug: number[];
}

const setMarks = StateEffect.define<LineMarks>();

const marksField = StateField.define<DecorationSet>({
  create: () => Decoration.none,
  update(deco, tr) {
    deco = deco.map(tr.changes);
    for (const e of tr.effects) {
      if (!e.is(setMarks)) continue;
      const builder = new RangeSetBuilder<Decoration>();
      const lines = new Map<number, string>();
      for (const n of e.value.bug) lines.set(n, 'cm-bug-line');
      if (e.value.error) lines.set(e.value.error, 'cm-error-line');
      for (const n of [...lines.keys()].sort((a, b) => a - b)) {
        if (n < 1 || n > tr.state.doc.lines) continue;
        builder.add(tr.state.doc.line(n).from, tr.state.doc.line(n).from, Decoration.line({ class: lines.get(n)! }));
      }
      deco = builder.finish();
    }
    return deco;
  },
  provide: (f) => EditorView.decorations.from(f),
});

const theme = EditorView.theme(
  {
    '&': { backgroundColor: 'var(--surface)', color: '#e6edf3' },
    '.cm-content': { padding: '12px 0', caretColor: 'var(--green-bright)' },
    '.cm-gutters': { backgroundColor: 'var(--surface)', color: 'var(--faint)', border: 'none', paddingLeft: '6px' },
    '.cm-activeLine': { backgroundColor: 'rgba(255,255,255,0.035)' },
    '.cm-activeLineGutter': { backgroundColor: 'transparent', color: 'var(--muted)' },
    '.cm-cursor, .cm-dropCursor': { borderLeftColor: 'var(--green-bright)', borderLeftWidth: '2px' },
    '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection': { backgroundColor: 'rgba(88,166,255,0.28) !important' },
    '.cm-matchingBracket': { backgroundColor: 'rgba(63,185,80,0.25)', outline: 'none' },
  },
  { dark: true },
);

interface Props {
  value: string;
  onChange: (code: string) => void;
  /** Ctrl/Cmd+Enter */
  onSubmit?: () => void;
  /** Shift+Enter */
  onRun?: () => void;
  errorLine?: number | null;
  bugLines?: number[];
  label?: string;
}

export function CodeEditor({ value, onChange, onSubmit, onRun, errorLine = null, bugLines = [], label = 'Python code editor' }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const view = useRef<EditorView | null>(null);
  const handlers = useRef({ onChange, onSubmit, onRun });
  handlers.current = { onChange, onSubmit, onRun };

  useEffect(() => {
    const state = EditorState.create({
      doc: value,
      extensions: [
        lineNumbers(),
        highlightActiveLineGutter(),
        highlightActiveLine(),
        history(),
        drawSelection(),
        indentOnInput(),
        bracketMatching(),
        closeBrackets(),
        indentUnit.of('    '),
        python(),
        syntaxHighlighting(classHighlighter),
        marksField,
        theme,
        keymap.of([
          { key: 'Mod-Enter', run: () => { handlers.current.onSubmit?.(); return true; } },
          { key: 'Shift-Enter', run: () => { handlers.current.onRun?.(); return true; } },
          ...closeBracketsKeymap,
          ...defaultKeymap,
          ...historyKeymap,
          indentWithTab,
        ]),
        EditorView.updateListener.of((u) => {
          if (u.docChanged) handlers.current.onChange(u.state.doc.toString());
        }),
        EditorView.contentAttributes.of({ 'aria-label': label, spellcheck: 'false', autocapitalize: 'off', autocorrect: 'off' }),
      ],
    });
    view.current = new EditorView({ state, parent: host.current! });
    return () => view.current?.destroy();
    // The editor is created once; later value changes are pushed in by the effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Replace the text when it changes from outside (e.g. "Show solution" or "Reset").
  useEffect(() => {
    const v = view.current;
    if (v && v.state.doc.toString() !== value) {
      v.dispatch({ changes: { from: 0, to: v.state.doc.length, insert: value } });
    }
  }, [value]);

  const bugKey = bugLines.join(',');
  useEffect(() => {
    view.current?.dispatch({ effects: setMarks.of({ error: errorLine, bug: bugKey ? bugKey.split(',').map(Number) : [] }) });
  }, [errorLine, bugKey]);

  return <div ref={host} />;
}
