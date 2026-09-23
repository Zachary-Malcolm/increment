// Static syntax highlighting for Python shown outside the editor (lesson text, puzzle lines).
// Uses the same parser as the editor, so colours match.
import { classHighlighter, highlightCode } from '@lezer/highlight';
import { parser } from '@lezer/python';

const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Highlighted HTML for each line of the code. */
export function highlightLines(code: string): string[] {
  const lines: string[] = [''];
  highlightCode(
    code,
    parser.parse(code),
    classHighlighter,
    (text, classes) => {
      lines[lines.length - 1] += classes ? `<span class="${classes}">${escape(text)}</span>` : escape(text);
    },
    () => lines.push(''),
  );
  return lines;
}

export function highlightPython(code: string): string {
  return highlightLines(code).join('\n');
}

export { escape as escapeHtml };
