import type { Module } from '../types';
import { PENGUINS_FILE } from '../datasets';

// Files the learner creates or reads (other than datasets) live in the working folder, not data/.
const NOTES_SETUP = `with open("field_notes.txt", "w") as _f:
    _f.write("2007-11-11 Torgersen: 2 nests checked\\n")
    _f.write("2007-11-12 Biscoe: storm, no visit\\n")
    _f.write("2007-11-13 Dream: 5 nests checked\\n")
    _f.write("2007-11-14 Torgersen: 3 nests checked\\n")
del _f
`;

const CONFIG_SETUP = `import json as _json
with open("survey.json", "w") as _f:
    _json.dump({"station": "Palmer", "year": 2008, "islands": ["Biscoe", "Dream", "Torgersen"], "counts": {"Adelie": 50, "Gentoo": 34}}, _f)
del _json, _f
`;

export const m08: Module = {
  id: 'm08',
  number: 8,
  title: 'Files and the standard library',
  blurb: "Read and write real files, and use Python's built-in toolbox.",
  lessons: [
    {
      id: 'm08-l1',
      title: 'Reading files',
      summary: 'Open a text file and work through it line by line.',
      steps: [
        {
          kind: 'read',
          md: `
## Opening a file

~~~python
with open("field_notes.txt") as f:
    text = f.read()
print(text)
~~~

- \`open(name)\` opens a file for reading
- \`with ... as f:\` makes sure the file is **closed** afterwards, even if something goes wrong. Always use it
- \`f.read()\` gives the whole file as one string

## Line by line

For big files, loop over the file itself. Each line keeps its newline character (\`\\n\`), so strip it:

~~~python
with open("field_notes.txt") as f:
    for line in f:
        print(line.strip())
~~~

A file called \`field_notes.txt\` has been created for you in these exercises.
`,
        },
        {
          kind: 'code',
          id: 'm08-l1-count',
          prompt: '`field_notes.txt` has one note per line. Read it and create `notes`: a **list** of the lines with the newline removed. Then print how many notes there are.',
          setup: NOTES_SETUP,
          starter: '',
          solution: 'notes = []\nwith open("field_notes.txt") as f:\n    for line in f:\n        notes.append(line.strip())\nprint(len(notes))\n',
          tests: `assert notes[0] == "2007-11-11 Torgersen: 2 nests checked", f"The first note should be the first line with no newline, got {notes[0]!r}."
assert len(notes) == 4, f"There are 4 notes, got {len(notes)}."
assert output.strip() == "4", "Print len(notes)."`,
          hints: ['with open("field_notes.txt") as f:', 'Loop over f, and append line.strip() to a list.'],
          review: true,
        },
        {
          kind: 'code',
          id: 'm08-l1-parse',
          prompt: 'Each note looks like `2007-11-13 Dream: 5 nests checked`. Read the file and add up the **number of nests checked** across all notes into `total_nests`. Skip notes that don\'t contain `nests checked`.',
          setup: NOTES_SETUP,
          starter: '',
          solution: 'total_nests = 0\nwith open("field_notes.txt") as f:\n    for line in f:\n        if "nests checked" in line:\n            after_colon = line.split(": ")[1]\n            total_nests += int(after_colon.split()[0])\n',
          tests: `assert total_nests == 10, f"2 + 5 + 3 = 10 nests, but total_nests is {total_nests}."`,
          hints: [
            'For each line containing "nests checked", split on ": " to get the part after the colon.',
            'That part starts with the number: int(part.split()[0]).',
          ],
        },
        {
          kind: 'choice',
          id: 'm08-l1-with',
          question: 'Why use `with open(...) as f:` instead of just `f = open(...)`?',
          options: [
            'It reads the file faster',
            'It closes the file automatically when the block ends, even if an error happens',
            'It\'s the only way to read a file',
            'It stops the file being changed',
          ],
          answer: 1,
          explain: 'Open files use system resources, and unwritten data can be lost if they aren\'t closed. with guarantees they are.',
        },
      ],
    },
    {
      id: 'm08-l2',
      title: 'Writing files',
      summary: 'Save your results to a file.',
      steps: [
        {
          kind: 'read',
          md: `
## Modes

\`open()\` takes a second argument, the **mode**:

| Mode | Meaning |
|---|---|
| \`"r"\` | read (the default) |
| \`"w"\` | write: creates the file, or **wipes** an existing one |
| \`"a"\` | append: adds to the end |

~~~python
with open("report.txt", "w") as f:
    f.write("Penguin report\\n")
    f.write(f"Total: {344}\\n")
~~~

\`write()\` doesn't add newlines for you, so end each line with \`\\n\`.
`,
        },
        {
          kind: 'code',
          id: 'm08-l2-write',
          prompt: '`counts` maps species to penguin counts. Write a file called `species_counts.txt` with one line per species in the form `Adelie: 152`.',
          setup: 'counts = {"Adelie": 152, "Gentoo": 124, "Chinstrap": 68}\n',
          starter: '# counts = {"Adelie": 152, "Gentoo": 124, "Chinstrap": 68}\n',
          solution: 'with open("species_counts.txt", "w") as f:\n    for species, n in counts.items():\n        f.write(f"{species}: {n}\\n")\n',
          tests: `import os
assert os.path.exists("species_counts.txt"), "Create a file called species_counts.txt."
with open("species_counts.txt") as f:
    written = f.read().splitlines()
os.remove("species_counts.txt")
assert written == ["Adelie: 152", "Gentoo: 124", "Chinstrap: 68"], f"The file should have 3 lines like 'Adelie: 152', but has {written}."`,
          hints: ['Open with mode "w".', 'In a loop: f.write(f"{species}: {n}\\n")'],
          review: true,
        },
        {
          kind: 'predict',
          id: 'm08-l2-modes',
          code: 'with open("log.txt", "w") as f:\n    f.write("one\\n")\nwith open("log.txt", "a") as f:\n    f.write("two\\n")\nwith open("log.txt", "w") as f:\n    f.write("three\\n")\nwith open("log.txt") as f:\n    print(f.read().strip())\n',
          options: ['three', 'one\ntwo\nthree', 'one\ntwo', 'two\nthree'],
          answer: 0,
          explain: 'The final "w" wipes the file before writing, so only "three" is left.',
        },
      ],
    },
    {
      id: 'm08-l3',
      title: 'CSV and JSON',
      summary: 'The two file formats you\'ll meet most in data work.',
      steps: [
        {
          kind: 'read',
          md: `
## CSV files

Splitting on commas breaks when a value itself contains a comma (like \`"Oxford, UK"\`). The \`csv\` module handles that properly. \`csv.DictReader\` gives each row as a dictionary, keyed by the header row:

~~~python
import csv
with open("data/penguins.csv") as f:
    for row in csv.DictReader(f):
        print(row["species"], row["body_mass_g"])
        break
~~~

~~~text
Adelie 3750
~~~

Every value is still a **string**, so convert numbers yourself. (This is how the \`penguins\` list you used earlier was made.)

## JSON

**JSON** is how websites and APIs send data. It looks almost exactly like Python dictionaries and lists:

~~~python
import json
text = '{"station": "Palmer", "year": 2008}'
data = json.loads(text)       # JSON text -> Python
print(data["year"] + 1)
print(json.dumps(data))       # Python -> JSON text
~~~

To read or write a JSON **file**, use \`json.load(f)\` and \`json.dump(data, f)\`.
`,
        },
        {
          kind: 'code',
          id: 'm08-l3-csv',
          prompt: 'Using `csv.DictReader` on `data/penguins.csv`, count how many penguins were recorded in each **year**. Store the result in `per_year`, a dictionary with **integer** years as keys.',
          data: [PENGUINS_FILE],
          starter: 'import csv\n',
          solution: 'import csv\nper_year = {}\nwith open("data/penguins.csv") as f:\n    for row in csv.DictReader(f):\n        year = int(row["year"])\n        per_year[year] = per_year.get(year, 0) + 1\n',
          tests: `assert per_year == {2007: 110, 2008: 114, 2009: 120}, f"Got {per_year}. Are the keys integers?"`,
          hints: ['Loop over csv.DictReader(f) inside with open("data/penguins.csv") as f:', 'year = int(row["year"]), then count with per_year.get(year, 0) + 1.'],
          review: true,
        },
        {
          kind: 'code',
          id: 'm08-l3-json',
          prompt: '`survey.json` holds a survey summary. Load it with `json.load`, then create `total`: the sum of all the values in its `"counts"` dictionary.',
          setup: CONFIG_SETUP,
          starter: 'import json\n',
          solution: 'import json\nwith open("survey.json") as f:\n    survey = json.load(f)\ntotal = sum(survey["counts"].values())\n',
          tests: `assert total == 84, f"The counts add up to 84, got {total}."`,
          hints: ['with open("survey.json") as f: survey = json.load(f)', 'survey["counts"] is a dictionary; sum its .values().'],
        },
        {
          kind: 'predict',
          id: 'm08-l3-dumps',
          code: 'import json\nprint(json.dumps({"ok": True, "value": None}))\n',
          options: ['{"ok": true, "value": null}', "{'ok': True, 'value': None}", '{"ok": True, "value": None}', 'An error'],
          answer: 0,
          explain: 'JSON uses lowercase true/false, null instead of None, and always double quotes.',
        },
      ],
    },
    {
      id: 'm08-l4',
      title: 'Modules and imports',
      summary: 'Use code other people wrote: math, statistics and random.',
      steps: [
        {
          kind: 'read',
          md: `
## import

Python comes with a huge **standard library** of modules. Import what you need at the top of a file:

~~~python
import math
print(math.sqrt(16), math.pi)

from statistics import mean, median
print(mean([1, 2, 3, 4]), median([1, 2, 3, 4]))

import statistics as st      # a shorter alias
print(st.stdev([2, 4, 4, 4, 5, 5, 7, 9]))
~~~

- \`import math\`: use as \`math.sqrt\`
- \`from statistics import mean\`: use as \`mean\`
- \`import numpy as np\`: an **alias**. You'll see \`np\` and \`pd\` everywhere

Other libraries (NumPy, pandas, scikit-learn) are imported in exactly the same way.
`,
        },
        {
          kind: 'code',
          id: 'm08-l4-stats',
          prompt: 'Using the `statistics` module, create `avg`, `mid` and `spread`: the mean, median and **standard deviation** (`stdev`) of `masses`, each rounded to 1 decimal place.',
          setup: 'masses = [3750, 3800, 3250, 3450, 3650, 3625, 4675, 3475]\n',
          starter: '# masses = [3750, 3800, 3250, 3450, 3650, 3625, 4675, 3475]\n',
          solution: 'import statistics\navg = round(statistics.mean(masses), 1)\nmid = round(statistics.median(masses), 1)\nspread = round(statistics.stdev(masses), 1)\n',
          tests: `import statistics as _s
assert avg == round(_s.mean(masses), 1), f"avg should be {round(_s.mean(masses), 1)}, got {avg}."
assert mid == round(_s.median(masses), 1), f"mid should be {round(_s.median(masses), 1)}, got {mid}."
assert spread == round(_s.stdev(masses), 1), f"spread should be {round(_s.stdev(masses), 1)}, got {spread}."
assert "statistics" in source, "Use the statistics module."`,
          hints: ['import statistics at the top.', 'statistics.mean(masses), statistics.median(masses) and statistics.stdev(masses).'],
          review: true,
        },
        {
          kind: 'read',
          md: `
## random, and why seeds matter

\`random\` makes random choices, which is useful for sampling and simulations:

~~~python
import random
random.seed(42)                  # makes the "random" results repeatable
print(random.randint(1, 6))      # a dice roll
print(random.choice(["A", "B"]))
print(random.sample(range(100), 3))
~~~

Computers generate **pseudo-random** numbers from a starting value, the **seed**. Setting a seed means you (and anyone checking your work) get the same results every time. Reproducibility is essential in data science.
`,
        },
        {
          kind: 'code',
          id: 'm08-l4-random',
          prompt: 'Simulate rolling a six-sided die **1000 times** with `random.randint(1, 6)`, after setting `random.seed(1)`. Store the rolls in `rolls` and the proportion of sixes in `six_share`.',
          starter: 'import random\n',
          solution: 'import random\nrandom.seed(1)\nrolls = [random.randint(1, 6) for _ in range(1000)]\nsix_share = rolls.count(6) / len(rolls)\n',
          tests: `import random as _r
_r.seed(1)
want = [_r.randint(1, 6) for _ in range(1000)]
assert len(rolls) == 1000, f"Roll 1000 times, got {len(rolls)} rolls."
assert rolls == want, "Set random.seed(1) before rolling, then use random.randint(1, 6) each time."
assert six_share == want.count(6) / 1000, "six_share is the number of sixes divided by the number of rolls."`,
          hints: ['Call random.seed(1) first.', 'rolls = [random.randint(1, 6) for _ in range(1000)]', 'rolls.count(6) / len(rolls)'],
        },
      ],
    },
    {
      id: 'm08-l5',
      title: 'Dates and collections',
      summary: 'Work with dates, and count things the easy way.',
      steps: [
        {
          kind: 'read',
          md: `
## datetime

~~~python
from datetime import date, datetime

d = date(2007, 11, 11)
print(d.year, d.strftime("%d %B %Y"))            # format a date as text
laid = datetime.strptime("2007-11-16", "%Y-%m-%d").date()   # text -> date
print((laid - d).days)                            # subtracting dates gives a timedelta
~~~

~~~text
2007 11 November 2007
5
~~~

Common format codes: \`%Y\` year, \`%m\` month number, \`%d\` day, \`%B\` month name, \`%A\` weekday name.

## Counter and defaultdict

The \`collections\` module has ready-made tools for patterns you've been writing by hand:

~~~python
from collections import Counter, defaultdict
c = Counter(["Adelie", "Gentoo", "Adelie"])
print(c.most_common(1))

by_island = defaultdict(list)          # missing keys start as an empty list
by_island["Dream"].append(3800)
~~~

~~~text
[('Adelie', 2)]
~~~
`,
        },
        {
          kind: 'predict',
          id: 'm08-l5-days',
          code: 'from datetime import date\nstart = date(2008, 11, 9)\nend = date(2008, 12, 1)\nprint((end - start).days)\n',
          options: ['22', '21', '23', '8'],
          answer: 0,
          explain: 'From 9 November to 1 December is 21 days to the end of November (30 − 9) plus 1: 22 days.',
        },
        {
          kind: 'code',
          id: 'm08-l5-weekday',
          prompt: 'Define `weekday_name(text)` that takes a date like `"2007-11-11"` and returns the name of the weekday, e.g. `"Sunday"`.',
          starter: 'from datetime import datetime\n',
          solution: 'from datetime import datetime\n\ndef weekday_name(text):\n    return datetime.strptime(text, "%Y-%m-%d").strftime("%A")\n',
          tests: `assert weekday_name("2007-11-11") == "Sunday", f"11 Nov 2007 was a Sunday, got {weekday_name('2007-11-11')!r}."
assert weekday_name("2026-09-23") == "Wednesday", "23 Sep 2026 is a Wednesday."`,
          hints: ['datetime.strptime(text, "%Y-%m-%d") turns the text into a datetime.', '.strftime("%A") gives the weekday name.'],
          review: true,
        },
        {
          kind: 'code',
          id: 'm08-l5-counter',
          prompt: 'Read `data/penguins.csv` with `csv.DictReader` and use a `Counter` to count the islands. Store the **most common island and its count** as a tuple in `top_island`, e.g. `("Biscoe", 168)`.',
          data: [PENGUINS_FILE],
          starter: 'import csv\nfrom collections import Counter\n',
          solution: 'import csv\nfrom collections import Counter\nwith open("data/penguins.csv") as f:\n    islands = Counter(row["island"] for row in csv.DictReader(f))\ntop_island = islands.most_common(1)[0]\n',
          tests: `assert top_island == ("Biscoe", 168), f"Expected ('Biscoe', 168), got {top_island!r}."
assert "Counter" in source, "Use Counter."`,
          hints: ['Counter(row["island"] for row in csv.DictReader(f)) counts in one go.', '.most_common(1) returns a list with one (island, count) tuple; take [0].'],
        },
        {
          kind: 'code',
          id: 'm08-l5-group',
          prompt: 'Using a `defaultdict(list)`, group the `readings` by station: create `by_station` mapping each station name to a list of its values, in order.',
          setup: 'readings = [("Oxford", 12.1), ("Durham", 9.4), ("Oxford", 13.0), ("Durham", 8.8), ("Oxford", 11.7)]\n',
          starter: 'from collections import defaultdict\n# readings is a list of (station, value) tuples\n',
          solution: 'from collections import defaultdict\nby_station = defaultdict(list)\nfor station, value in readings:\n    by_station[station].append(value)\n',
          tests: `assert dict(by_station) == {"Oxford": [12.1, 13.0, 11.7], "Durham": [9.4, 8.8]}, f"Got {dict(by_station)}"`,
          hints: ['by_station = defaultdict(list)', 'for station, value in readings: by_station[station].append(value)'],
        },
      ],
    },
  ],
};
