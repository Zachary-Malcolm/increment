import { useMemo } from 'react';
import { Marked } from 'marked';
import { escapeHtml, highlightPython } from '../lib/highlight';

// Lesson text is our own content (not user input), so rendering its HTML is safe.
const marked = new Marked({
  gfm: true,
  renderer: {
    code({ text, lang }) {
      if (lang === 'text') return `<pre class="output"><code>${escapeHtml(text)}</code></pre>`;
      return `<pre><code>${highlightPython(text)}</code></pre>`;
    },
  },
});

export function Markdown({ md, className = 'prose' }: { md: string; className?: string }) {
  const html = useMemo(() => marked.parse(md.trim(), { async: false }) as string, [md]);
  return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

/** Inline Markdown (no wrapping paragraph), for option labels. */
export function InlineMarkdown({ md }: { md: string }) {
  const html = useMemo(() => marked.parseInline(md, { async: false }) as string, [md]);
  return <span className="prose" dangerouslySetInnerHTML={{ __html: html }} />;
}
