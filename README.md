# Increment

**Small enough to remember. Hard enough to grow.**

**Try it: https://zachary-malcolm.github.io/increment/**

Increment teaches Python for data science one small step a day. It's built for people who have always meant to learn to code (often after a degree in a related subject) but find it daunting.

- **Bite-sized lessons** with explanations, "what does this print?" questions and real coding exercises
- **Real data throughout**: Palmer Penguins, Gapminder (142 countries, 1952-2007) and 173 years of Met Office weather records for Oxford
- **Real Python in the browser**, powered by [Pyodide](https://pyodide.org): nothing to install, nothing runs on a server
- **Bug-hunt puzzles**, chess.com style: AI-written code with one bug. Find the line, then fix it. A daily puzzle, with difficulty rising from Monday to Sunday, plus rated puzzles with an Elo rating
- **Streaks** with earnable streak freezes, **XP and levels**, and a **GitHub-style activity grid**
- **Spaced repetition** (the FSRS algorithm, as used by Anki) brings questions back just before you'd forget them
- **Accounts** (optional) via Supabase, so progress follows you between devices. Guest progress is kept when you sign up

## Every answer is proven

`npm run check-content` loads every exercise into real Python (Pyodide under Node) through the **same harness the app uses**, and fails if:

- a solution doesn't pass its tests, or the starter code already passes them
- a "what does this print?" answer doesn't match what the code actually prints, or more than one option matches
- a puzzle's buggy code passes, its fixed code fails, or lines other than the marked bug lines differ

CI runs it on every push, and the deploy won't publish if it fails.

Tests are plain Python `assert`s. Beyond checking the result, they can re-run the learner's code with different inputs (`rerun(mass_g=5000)`), so hard-coding the expected answer doesn't pass.

## The course

17 modules, 87 lessons, 286 checked exercises and puzzles:

| # | Module | Covers |
|---|---|---|
| 1 | First steps | print, numbers, variables, strings, types |
| 2 | Decisions and loops | booleans, if/elif/else, for and while loops, loop patterns on real data |
| 3 | Lists and dictionaries | lists, slicing, dictionaries, records, a penguin census project |
| 4 | Functions | def/return, defaults and keywords, scope, docstrings and type hints, a statistics toolkit |
| 5 | Text in depth | slicing and searching, split/join, number formatting, cleaning text, regular expressions |
| 6 | Errors and debugging | tracebacks, try/except, raising errors, a debugging method, reviewing AI code |
| 7 | Tuples, sets and comprehensions | tuples, sets, list/dict/set comprehensions, enumerate, zip, sorting with key, lambda |
| 8 | Files and the standard library | reading/writing files, csv, json, imports, statistics, random, datetime, collections |
| 9 | Classes and objects | classes, methods, dunder methods, dataclasses, inheritance |
| 10 | NumPy | arrays, masks, aggregations, 2D arrays and broadcasting, simulation |
| 11 | pandas fundamentals | Series/DataFrames, read_csv, inspecting, loc/iloc, filtering, sorting, new columns |
| 12 | Analysing data with pandas | missing data, groupby, merge/concat, pivot tables, dates and time series, a Gapminder project |
| 13 | Visualisation | matplotlib, bar/hist/scatter/line, plotting from pandas, subplots, honest charts |
| 14 | Statistics | centre and spread, outliers, z-scores, correlation (and Simpson's paradox), bootstrap confidence intervals, permutation tests and t-tests |
| 15 | SQL | SELECT, WHERE, ORDER BY, GROUP BY/HAVING, joins, parameterised queries, subqueries (SQLite) |
| 16 | Machine learning | features and targets, train/test split, regression metrics, classification, overfitting, cross-validation, pipelines, k-means |
| 17 | Capstone projects | the workflow and data ethics, Oxford climate, wealth and health, an end-to-end classifier, communicating findings |

Plus 28 bug-hunt puzzles rated 400 to 1800. More puzzles, especially expert ones, are next.

Libraries (pandas, NumPy, matplotlib, scikit-learn, SciPy, sqlite3) load automatically the first time a lesson imports them, in a separate step from the learner's time limit. Charts drawn with matplotlib appear as images, and tests check them by inspecting the figure (titles, labels, bar heights, point counts).

## Running it

```bash
npm install
npm run dev            # http://localhost:5173
npm test               # unit tests (streaks, XP, levels, ratings, daily puzzle, spaced repetition)
npm run check-content  # proves every course answer with real Python
npm run typecheck
npm run build
```

### Turning on accounts (optional)

Without these steps the app works fully, saving progress in the browser.

1. Create a free project at [supabase.com](https://supabase.com).
2. In the SQL editor, run [`supabase/schema.sql`](supabase/schema.sql). It creates the `progress` table with Row Level Security (each person can only read and write their own row) and a function that lets people delete their own account.
3. Copy `.env.example` to `.env.local` and fill in the project URL and anon key (Project Settings > API).
4. In Authentication > URL Configuration, add your site URL (e.g. `http://localhost:5173` and the GitHub Pages URL) to the redirect URLs.
5. For the live site, add the same values as repository **variables** (Settings > Secrets and variables > Actions > Variables): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and optionally `VITE_ENABLE_GOOGLE=true` once Google sign-in is configured in Supabase.

## How it fits together

| Path | What it does |
|---|---|
| `src/content/` | All course content: modules, lessons, puzzles, datasets. `types.ts` documents the format |
| `src/python/harness.ts` | The Python that runs learner code, captures output, explains errors in plain English and runs the hidden tests |
| `src/python/worker.ts`, `runner.ts` | Runs Pyodide in a web worker; a run that takes over 15 seconds (e.g. an endless loop) is stopped by restarting the worker |
| `src/lib/progress.ts` | Progress data plus pure functions for XP, levels, streaks, freezes and merging devices |
| `src/lib/srs.ts` | Spaced repetition (FSRS via `ts-fsrs`) |
| `src/lib/puzzles.ts` | Elo rating and the daily puzzle schedule |
| `src/state/store.tsx` | Local-first saving, with cloud sync when signed in |
| `scripts/check-content.ts` | The answer checker |

## Data

- **Palmer Penguins**: Gorman KB, Williams TD, Fraser WR (2014), via the [palmerpenguins](https://allisonhorst.github.io/palmerpenguins/) package by Horst, Hill & Gorman. Public domain (CC0).
- **Gapminder**: from the [gapminder](https://github.com/jennybc/gapminder) package by Jennifer Bryan (CC0); data from [Gapminder.org](https://www.gapminder.org/data/) (CC BY 4.0).
- **Oxford weather**: [Met Office historic station data](https://www.metoffice.gov.uk/research/climate/maps-and-data/historic-station-data), Radcliffe Observatory, Oxford, 1853-2025. Contains public sector information licensed under the Open Government Licence v3.0.
