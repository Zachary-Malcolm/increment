# Increment: handoff notes for Claude

A web app that teaches Python for data science in small daily steps (think DataCamp + Duolingo + chess.com
puzzles). Vite + React + TypeScript, Python runs in the browser via Pyodide, optional accounts via Supabase.
Motto: **"Small enough to remember. Hard enough to grow."** The name comes from `i += 1`.

- Live: https://zachary-malcolm.github.io/increment/ (Pages via Actions, enabled 2026-09-23) · Repo: https://github.com/Zachary-Malcolm/increment
  Pushing to `main` deploys (the deploy runs the tests and content check first).
- **README.md is the full reference** (features, file map, Supabase setup). Read it first.
- Owner: Zach (GitHub `Zachary-Malcolm`). Aim: a real product that can later be monetised (subscription),
  and a portfolio piece. Target learner: people who find coding daunting, even after a related degree.
- Zach is learning: explain things in plain terms. Confirm before anything public-facing (repo settings,
  publishing, anything in Supabase). Commit and push completed work.

## Commands

```bash
npm run dev            # dev server
npm test               # Vitest: streaks, XP, levels, ratings, daily schedule, SRS
npm run check-content  # runs every answer through real Python; must pass before content ships
npm run typecheck
npm run build          # production base path is /increment/ (GitHub Pages)
```

The preview server is configured in `C:\CLAUDE PROJECTS\.claude\launch.json` as `increment` (port 5180).

## Content rules (the product's promise is "always has the answer")

- All content lives in `src/content/` as typed TS. Markdown uses `~~~` fences (so only inline code needs
  escaped backticks); `~~~text` renders as a program-output block.
- **Run `npm run check-content` after any content change.** It proves: solutions pass, starters fail,
  predict answers match real output (and only one option does), puzzle buggy fails / fixed passes /
  only `bugLines` differ, puzzles with `setup` have a `given`, ids are unique.
- Tests are Python asserts with learner-friendly messages. Prefer checking values over exact text, and use
  `rerun(var=...)` so hard-coded answers fail. For rerun to work, given variables must come from `setup`
  (show them as comments in `starter`), not be assigned in the starter.
- Pyodide runs **Python 3.14**: `sum()` of floats is compensated (exact), so float-error examples must use `+`.
- Only use openly licensed datasets (put files in `public/data`, credit them in `datasets.ts` and README).
- Every step `id` is permanent once shipped: review cards and progress are keyed by it.
- Lessons introduce concepts in order; exercises may only use what has been taught (hints may preview).

## Design rules

- Sleek dark developer look. Colour has meaning (see top of `src/styles.css`): green = progress/success
  and the activity grid, orange = streaks, purple = XP/levels, blue = info/reviews, red = errors,
  gold = puzzles/rating, ice = streak freezes. Don't add colours without a meaning.
- Rewards should feel good: sounds are synthesised in `src/lib/sound.ts` (soft sine/triangle, never harsh),
  confetti via `src/lib/celebrate.ts` (respects reduced motion). Everything mutable by the sound toggle.
- Phones: bottom tab bar under 760px; the answer feedback bar sits above it.

## Code notes

- `tsconfig` has `erasableSyntaxOnly`: no constructor parameter properties, no enums.
- Progress logic is pure functions in `src/lib/` with tests in `test/`; keep it that way. Days are local
  calendar keys (`dayKey()`), so streaks follow the learner's midnight.
- Storage: local-first (`localStorage`, wrapped in try/catch), synced to Supabase `progress` table
  (one JSON row per user, RLS) 1.5 s after changes. Guest progress merges into the account on sign-in.
- Hash routing (GitHub Pages); Supabase auth uses PKCE so `?code=` doesn't clash with the `#` route.
- Verify in the browser preview with text/DOM checks first (`get_page_text`, `javascript_tool`) and few
  screenshots. The CodeMirror editor can't be typed into by script; use the Run/Check buttons or real keys.

## Next steps (agreed priority)

1. **Supabase setup** (Zach does the account creation; see README): then test sign-up, sync, delete.
2. **More content**: module 4 (Functions) next, then 5-9 (core Python), then NumPy/pandas (10-12; load
   `pandas` via `pyodide.loadPackage` only for those lessons), visualisation (13), capstones on UK open data (14).
   Keep adding puzzles, especially 1500+ (Sunday "Expert" tier only has 3).
3. **Code-split** the bundle (885 kB): lazy-load lesson/review/puzzle pages (CodeMirror) and Supabase.
4. Onboarding polish: daily goal setting, reminder emails/notifications, share cards as images.
5. Monetisation (later): free core path + paid tier (all modules past 5, unlimited rated puzzles, stats).
   Use Stripe; keep the daily puzzle free (it's the growth loop).
