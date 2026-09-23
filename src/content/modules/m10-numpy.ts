import type { Module } from '../types';
import { PENGUINS_FILE, WEATHER_FILE } from '../datasets';

/** masses, flippers (ints) and species (strings) for the 342 penguins with measurements. */
const NP_PENGUINS_SETUP = `import numpy as np
import csv as _csv
with open("data/penguins.csv") as _f:
    _rows = [r for r in _csv.DictReader(_f) if r["body_mass_g"] != "NA"]
masses = np.array([int(r["body_mass_g"]) for r in _rows])
flippers = np.array([int(r["flipper_length_mm"]) for r in _rows])
species = np.array([r["species"] for r in _rows])
del _csv, _f, _rows
`;

/** rain: a 10 x 12 array of monthly rainfall (mm) in Oxford, rows 2016-2025, columns Jan-Dec. */
const RAIN_SETUP = `import numpy as np
import csv as _csv
with open("data/oxford_weather.csv") as _f:
    _rows = [r for r in _csv.DictReader(_f) if 2016 <= int(r["year"]) <= 2025]
rain = np.array([float(r["rain_mm"]) for r in _rows]).reshape(10, 12)
years = np.arange(2016, 2026)
del _csv, _f, _rows
`;

export const m10: Module = {
  id: 'm10',
  number: 10,
  title: 'NumPy',
  blurb: 'Fast maths on whole arrays of numbers: the engine under pandas and machine learning.',
  lessons: [
    {
      id: 'm10-l1',
      title: 'Arrays',
      summary: 'Do maths on a whole column of numbers at once.',
      steps: [
        {
          kind: 'read',
          md: `
## Why NumPy?

Python lists are flexible, but slow for maths, and awkward: \`[1, 2, 3] * 2\` gives \`[1, 2, 3, 1, 2, 3]\`!

**NumPy** gives you the **array**: a grid of numbers, all the same type, that does maths **element by element**:

~~~python
import numpy as np
masses = np.array([3750, 3800, 3250])
print(masses / 1000)
print(masses * 2)
print(masses.mean())
~~~

~~~text
[3.75 3.8  3.25]
[7500 7600 6500]
3600.0
~~~

No loops needed. This is called **vectorised** code, and it runs up to hundreds of times faster than a Python loop. pandas and scikit-learn are built on NumPy arrays.
`,
        },
        {
          kind: 'predict',
          id: 'm10-l1-vector',
          code: 'import numpy as np\na = np.array([1, 2, 3])\nb = np.array([10, 20, 30])\nprint(a + b)\n',
          options: ['[11 22 33]', '[1, 2, 3, 10, 20, 30]', '66', '[1 2 3 10 20 30]'],
          answer: 0,
          explain: 'Arrays add element by element: 1+10, 2+20, 3+30. (NumPy prints arrays without commas.)',
        },
        {
          kind: 'read',
          md: `
## Useful attributes

~~~python
print(masses.dtype)   # the type of every element, e.g. int64 or float64
print(masses.shape)   # the size of each dimension, e.g. (342,)
print(len(masses))
~~~

Other ways to make arrays:

| Code | Result |
|---|---|
| \`np.arange(0, 10, 2)\` | \`[0 2 4 6 8]\` |
| \`np.linspace(0, 1, 5)\` | \`[0.   0.25 0.5  0.75 1.  ]\` |
| \`np.zeros(3)\` | \`[0. 0. 0.]\` |
`,
        },
        {
          kind: 'code',
          id: 'm10-l1-convert',
          prompt: '`masses` is a NumPy array of 342 real penguin masses in grams, and `flippers` holds their flipper lengths in mm. Without any loops, create:\n\n- `masses_kg`: the masses in kilograms\n- `ratio`: each penguin\'s mass (g) divided by its flipper length (mm)',
          setup: NP_PENGUINS_SETUP,
          data: [PENGUINS_FILE],
          starter: 'import numpy as np\n# masses, flippers (and species) are NumPy arrays\n',
          solution: 'import numpy as np\nmasses_kg = masses / 1000\nratio = masses / flippers\n',
          tests: `import numpy as _np
assert isinstance(masses_kg, _np.ndarray), "masses_kg should be a NumPy array. Divide the whole array: masses / 1000."
assert _np.allclose(masses_kg, [m / 1000 for m in masses.tolist()]), "masses_kg should be every mass divided by 1000."
assert _np.allclose(ratio, masses / flippers) and ratio.shape == masses.shape, "ratio should be masses divided by flippers, element by element."
assert "for " not in source, "No loops needed: do the maths on the whole arrays."`,
          hints: ['masses_kg = masses / 1000', 'Arrays of the same length divide element by element: masses / flippers'],
          review: true,
        },
      ],
    },
    {
      id: 'm10-l2',
      title: 'Indexing and boolean masks',
      summary: 'Select values by position, and by condition.',
      steps: [
        {
          kind: 'read',
          md: `
## Positions and slices work as usual

~~~python
masses[0]      # first
masses[-3:]    # last three
~~~

## Boolean masks: selecting by condition

Comparing an array gives an array of \`True\`/\`False\`, one per element. Use that **mask** inside the brackets to keep only the matching values:

~~~python
heavy = masses > 5000
print(heavy[:5])
print(masses[heavy][:5])
print(masses[masses > 5000].size)
~~~

Combine conditions with \`&\` (and), \`|\` (or) and \`~\` (not). Each condition **must be in brackets**:

~~~python
masses[(species == "Gentoo") & (masses < 5000)]
~~~

\`np.where(condition, a, b)\` picks \`a\` where the condition is True and \`b\` elsewhere:

~~~python
labels = np.where(masses > 4500, "heavy", "light")
~~~
`,
        },
        {
          kind: 'predict',
          id: 'm10-l2-mask',
          code: 'import numpy as np\nx = np.array([4, 9, 1, 7, 3])\nprint(x[x > 3])\n',
          options: ['[4 9 7]', '[False  True False  True False]', '[9 7]', '[True True False True False]'],
          answer: 0,
          explain: 'x > 3 is [True, True, False, True, False]; using it as a mask keeps 4, 9 and 7.',
        },
        {
          kind: 'code',
          id: 'm10-l2-gentoo',
          prompt: 'Using boolean masks (no loops), create:\n\n- `gentoo`: the masses of all Gentoo penguins\n- `light_adelie_count`: how many **Adelie** penguins weigh **under 3500 g**',
          setup: NP_PENGUINS_SETUP,
          data: [PENGUINS_FILE],
          starter: 'import numpy as np\n# masses, flippers and species are NumPy arrays of the same length\n',
          solution: 'import numpy as np\ngentoo = masses[species == "Gentoo"]\nlight_adelie_count = int(((species == "Adelie") & (masses < 3500)).sum())\n',
          tests: `want_g = [m for m, s in zip(masses.tolist(), species.tolist()) if s == "Gentoo"]
assert list(gentoo) == want_g, f"gentoo should hold the {len(want_g)} Gentoo masses."
want_n = sum(1 for m, s in zip(masses.tolist(), species.tolist()) if s == "Adelie" and m < 3500)
assert light_adelie_count == want_n, f"light_adelie_count should be {want_n}, got {light_adelie_count}."`,
          hints: [
            'species == "Gentoo" is a mask; use it inside masses[...].',
            'Combine masks with &, each in brackets: (species == "Adelie") & (masses < 3500)',
            'A mask\'s .sum() counts its True values.',
          ],
          review: true,
        },
        {
          kind: 'code',
          id: 'm10-l2-where',
          prompt: 'Create `size`: an array with `"large"` where the flipper length is **at least 210 mm** and `"small"` elsewhere, using `np.where`. Then print how many are `"large"`.',
          setup: NP_PENGUINS_SETUP,
          data: [PENGUINS_FILE],
          starter: 'import numpy as np\n',
          solution: 'import numpy as np\nsize = np.where(flippers >= 210, "large", "small")\nprint((size == "large").sum())\n',
          tests: `want = ["large" if f >= 210 else "small" for f in flippers.tolist()]
assert list(size) == want, "size should be 'large' where flippers >= 210, else 'small'."
assert output.strip() == str(want.count("large")), "Print how many are 'large'."`,
          hints: ['np.where(flippers >= 210, "large", "small")', '(size == "large").sum() counts them.'],
        },
      ],
    },
    {
      id: 'm10-l3',
      title: 'Aggregations and statistics',
      summary: 'Summarise whole arrays in one call.',
      steps: [
        {
          kind: 'read',
          md: `
## Summaries

| Code | Gives |
|---|---|
| \`a.sum()\`, \`a.mean()\` | total, average |
| \`a.min()\`, \`a.max()\` | smallest, largest |
| \`a.std()\` | standard deviation (spread) |
| \`np.median(a)\` | middle value |
| \`np.percentile(a, 90)\` | the value 90% of data is below |
| \`a.argmax()\` | the **position** of the largest value |

\`argmax\` is powerful with parallel arrays. The heaviest penguin's species is \`species[masses.argmax()]\`.

**Note:** \`a.std()\` uses the *population* formula by default (dividing by n). For a sample, as with \`statistics.stdev\`, use \`a.std(ddof=1)\`.
`,
        },
        {
          kind: 'predict',
          id: 'm10-l3-argmax',
          code: 'import numpy as np\nnames = np.array(["Ana", "Ben", "Cai"])\nscores = np.array([72, 95, 88])\nprint(scores.argmax(), names[scores.argmax()])\n',
          options: ['1 Ben', '95 Ben', '2 Cai', '1 95'],
          answer: 0,
          explain: 'argmax gives the position of the largest value (95 is at position 1), which then indexes the names.',
        },
        {
          kind: 'code',
          id: 'm10-l3-summary',
          prompt: 'Create a dictionary `stats` with keys `"mean"`, `"median"`, `"std"` (sample standard deviation, `ddof=1`) and `"p90"` (90th percentile) of `masses`, each rounded to 1 decimal place. Also create `heaviest_species`: the species of the heaviest penguin.',
          setup: NP_PENGUINS_SETUP,
          data: [PENGUINS_FILE],
          starter: 'import numpy as np\n',
          solution: 'import numpy as np\nstats = {\n    "mean": round(float(masses.mean()), 1),\n    "median": round(float(np.median(masses)), 1),\n    "std": round(float(masses.std(ddof=1)), 1),\n    "p90": round(float(np.percentile(masses, 90)), 1),\n}\nheaviest_species = species[masses.argmax()]\n',
          tests: `import numpy as _np, statistics as _st
m = masses.tolist()
assert stats["mean"] == round(_st.mean(m), 1), f"mean should be {round(_st.mean(m), 1)}, got {stats['mean']}."
assert stats["median"] == round(_st.median(m), 1), f"median should be {round(_st.median(m), 1)}, got {stats['median']}."
assert stats["std"] == round(_st.stdev(m), 1), f"std should be the sample standard deviation, {round(_st.stdev(m), 1)} (use ddof=1), got {stats['std']}."
assert stats["p90"] == round(float(_np.percentile(masses, 90)), 1), "p90 should be np.percentile(masses, 90)."
assert heaviest_species == "Gentoo", f"The heaviest penguin is a Gentoo, got {heaviest_species!r}."`,
          hints: ['masses.mean(), np.median(masses), masses.std(ddof=1), np.percentile(masses, 90)', 'species[masses.argmax()] gives the species at the position of the largest mass.'],
          review: true,
        },
      ],
    },
    {
      id: 'm10-l4',
      title: '2D arrays and broadcasting',
      summary: 'Tables of numbers: rows, columns and the axis argument.',
      steps: [
        {
          kind: 'read',
          md: `
## Two dimensions

\`rain\` holds **real Oxford rainfall** (mm): 10 rows (years 2016 to 2025) and 12 columns (January to December).

~~~python
print(rain.shape)        # (10, 12)
print(rain[0, 0])        # row 0, column 0: January 2016
print(rain[-1])          # the last row: every month of 2025
print(rain[:, 6])        # every row, column 6: every July
~~~

## The axis argument

Aggregations can work along one dimension:

- \`rain.sum(axis=1)\`: add **across** each row. One total per year (10 values)
- \`rain.mean(axis=0)\`: average **down** each column. One average per month (12 values)

A way to remember it: the axis you name is the one that gets **collapsed**.

## Broadcasting

Doing maths between arrays of different shapes stretches the smaller one to fit:

~~~python
monthly_avg = rain.mean(axis=0)          # shape (12,)
anomaly = rain - monthly_avg             # (10, 12) minus (12,): subtracted from every row
~~~

\`reshape\` changes the shape without changing the data: \`np.arange(6).reshape(2, 3)\`.
`,
        },
        {
          kind: 'predict',
          id: 'm10-l4-axis',
          code: 'import numpy as np\ngrid = np.array([[1, 2, 3],\n                 [4, 5, 6]])\nprint(grid.sum(axis=0), grid.sum(axis=1))\n',
          options: ['[5 7 9] [ 6 15]', '[ 6 15] [5 7 9]', '21 21', '[1 2 3] [4 5 6]'],
          answer: 0,
          explain: 'axis=0 collapses the rows, adding down each column (1+4, 2+5, 3+6). axis=1 collapses the columns, adding across each row.',
        },
        {
          kind: 'code',
          id: 'm10-l4-rain',
          prompt: 'Using `rain` (10 years × 12 months) and `years`, create:\n\n- `yearly`: total rainfall for each year (10 values)\n- `wettest_year`: the year with the most rain (an int)\n- `month_avg`: the average rainfall for each month (12 values)',
          setup: RAIN_SETUP,
          data: [WEATHER_FILE],
          starter: 'import numpy as np\n# rain has shape (10, 12); years is [2016, ..., 2025]\n',
          solution: 'import numpy as np\nyearly = rain.sum(axis=1)\nwettest_year = int(years[yearly.argmax()])\nmonth_avg = rain.mean(axis=0)\n',
          tests: `import numpy as _np
assert _np.shape(yearly) == (10,) and _np.allclose(yearly, [sum(row) for row in rain.tolist()]), "yearly should be the total of each row: rain.sum(axis=1)."
want_year = 2016 + int(_np.argmax([sum(row) for row in rain.tolist()]))
assert wettest_year == want_year, f"The wettest year was {want_year}, got {wettest_year}."
assert _np.shape(month_avg) == (12,) and _np.allclose(month_avg, rain.mean(axis=0)), "month_avg should average each column: rain.mean(axis=0)."`,
          hints: ['Totals per year: add across each row, axis=1.', 'years[yearly.argmax()] finds the matching year.', 'Averages per month: down each column, axis=0.'],
          review: true,
        },
        {
          kind: 'code',
          id: 'm10-l4-anomaly',
          prompt: 'Create `anomaly`: how much each month\'s rainfall differs from **that month\'s** 10-year average (use broadcasting). Then create `driest_anomaly`: the most negative value in it, rounded to 1 decimal place.',
          setup: RAIN_SETUP,
          data: [WEATHER_FILE],
          starter: 'import numpy as np\n',
          solution: 'import numpy as np\nanomaly = rain - rain.mean(axis=0)\ndriest_anomaly = round(float(anomaly.min()), 1)\n',
          tests: `import numpy as _np
want = rain - rain.mean(axis=0)
assert _np.shape(anomaly) == (10, 12), "anomaly should have the same shape as rain."
assert _np.allclose(anomaly, want), "Subtract the monthly averages (rain.mean(axis=0)) from rain."
assert driest_anomaly == round(float(want.min()), 1), f"driest_anomaly should be {round(float(want.min()), 1)}."`,
          hints: ['rain - rain.mean(axis=0) subtracts each month\'s average from every year.', 'anomaly.min() finds the most negative value.'],
        },
      ],
    },
    {
      id: 'm10-l5',
      title: 'Random numbers and simulation',
      summary: 'Answer probability questions by simulating them thousands of times.',
      steps: [
        {
          kind: 'read',
          md: `
## A random generator

~~~python
import numpy as np
rng = np.random.default_rng(42)          # 42 is the seed: same results every run
print(rng.integers(1, 7, size=5))        # five dice rolls (1 to 6; the stop is excluded)
print(rng.normal(loc=0, scale=1, size=3))
print(rng.choice(["heads", "tails"], size=4))
~~~

## Simulation

Some questions are hard to answer with maths but easy to **simulate**. What's the chance two dice add up to 7?

~~~python
rng = np.random.default_rng(0)
a = rng.integers(1, 7, size=100_000)
b = rng.integers(1, 7, size=100_000)
print(((a + b) == 7).mean())    # the mean of a mask is the proportion that are True
~~~

With 100,000 simulated rolls the answer lands very close to the true 1/6 (0.1667). This idea, called **Monte Carlo** simulation, is used everywhere from finance to epidemiology.
`,
        },
        {
          kind: 'code',
          id: 'm10-l5-birthday',
          prompt: `**The birthday problem.** In a room of 23 people, how likely is it that at least two share a birthday?

Using \`rng = np.random.default_rng(1)\`, run **10,000** trials. In each, draw 23 birthdays with \`rng.integers(0, 365, size=23)\` and check whether any repeat (hint: compare the number of unique values with 23). Store the proportion of trials with a shared birthday in \`share\`.`,
          starter: 'import numpy as np\n',
          solution: 'import numpy as np\nrng = np.random.default_rng(1)\nhits = 0\nfor _ in range(10_000):\n    days = rng.integers(0, 365, size=23)\n    if len(np.unique(days)) < 23:\n        hits += 1\nshare = hits / 10_000\n',
          tests: `assert 0.47 < share < 0.54, f"The true answer is about 0.507. Your simulation gave {share}. Check you run 10,000 trials of 23 people."
import numpy as _np
_rng = _np.random.default_rng(1)
_hits = sum(len(_np.unique(_rng.integers(0, 365, size=23))) < 23 for _ in range(10_000))
assert share == _hits / 10_000, "Use rng = np.random.default_rng(1) and draw rng.integers(0, 365, size=23) once per trial, so the result is reproducible."`,
          hints: [
            'np.unique(days) gives the distinct values. If there are fewer than 23, someone shares a birthday.',
            'Count the trials with a repeat, then divide by 10,000.',
          ],
          review: true,
        },
        {
          kind: 'choice',
          id: 'm10-l5-seed',
          question: 'Why set a seed like `np.random.default_rng(42)` in an analysis?',
          options: [
            'It makes the numbers more random',
            'It makes results reproducible, so anyone re-running the code gets the same numbers',
            'It makes the code faster',
            'It\'s required, or NumPy raises an error',
          ],
          answer: 1,
          explain: 'Reproducibility is a core habit in data science: a reviewer should be able to re-run your code and see exactly your results.',
        },
      ],
    },
  ],
};
