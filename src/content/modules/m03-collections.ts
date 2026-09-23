import type { Module } from '../types';
import { ADELIE_MASSES_SETUP, PENGUINS_FILE, PENGUINS_SETUP } from '../datasets';

const COUNT_SETUP = 'seen = ["Adelie", "Gentoo", "Adelie", "Chinstrap", "Adelie", "Gentoo"]\n';

export const m03: Module = {
  id: 'm03',
  number: 3,
  title: 'Lists and dictionaries',
  blurb: 'Hold many values at once, then analyse a real dataset of 344 penguins.',
  lessons: [
    {
      id: 'm03-l1',
      title: 'Lists',
      summary: 'Store many values in order and pick them out by position.',
      steps: [
        {
          kind: 'read',
          md: `
## Many values, one name

A **list** holds values in order, inside square brackets:

~~~python
islands = ["Torgersen", "Biscoe", "Dream"]
print(len(islands))
~~~

~~~text
3
~~~

Each item has a position called its **index**. Indexes start at **0**:

~~~python
print(islands[0])    # the first item
print(islands[2])    # the third item
print(islands[-1])   # negative counts from the end: the last item
~~~

~~~text
Torgersen
Dream
Dream
~~~
`,
        },
        {
          kind: 'predict',
          id: 'm03-l1-index',
          code: 'islands = ["Torgersen", "Biscoe", "Dream"]\nprint(islands[1])\n',
          options: ['Torgersen', 'Biscoe', 'Dream', 'An error'],
          answer: 1,
          explain: 'Indexes start at 0, so index 1 is the second item.',
        },
        {
          kind: 'choice',
          id: 'm03-l1-fourth',
          question: 'What is the index of the **4th** item in a list?',
          options: ['`4`', '`3`', '`-4`', '`5`'],
          answer: 1,
          explain: 'Counting from 0: the 1st item is at 0, the 2nd at 1, the 3rd at 2, and the 4th at 3.',
        },
        {
          kind: 'code',
          id: 'm03-l1-create',
          prompt: 'Create a list called `species` containing the three penguin species in our dataset, in this order: `"Adelie"`, `"Chinstrap"`, `"Gentoo"`. Then print how many items it has with `len()`.',
          starter: '',
          solution: 'species = ["Adelie", "Chinstrap", "Gentoo"]\nprint(len(species))\n',
          tests: `assert species == ["Adelie", "Chinstrap", "Gentoo"], f"species should be ['Adelie', 'Chinstrap', 'Gentoo'], but it is {species}."
assert output.strip() == "3", "Print len(species)."`,
          hints: ['Lists use square brackets, with items separated by commas.', 'species = ["Adelie", "Chinstrap", "Gentoo"]'],
        },
        {
          kind: 'code',
          id: 'm03-l1-first-last',
          prompt: '`masses` is set for you. Print its **first** item, then its **last** item, each on its own line. Use a negative index for the last one so it works for a list of any length.',
          setup: 'masses = [3750, 3800, 3250, 3450, 3650]\n',
          starter: '# masses is already set: [3750, 3800, 3250, 3450, 3650]\n',
          solution: 'print(masses[0])\nprint(masses[-1])\n',
          tests: `assert lines == ["3750", "3650"], f"Expected 3750 then 3650, but got {lines}."
assert rerun(masses=[1, 2, 3, 4, 5, 6, 7])["lines"] == ["1", "7"], "Use masses[0] and masses[-1] so it works for any list."`,
          hints: ['The first item is masses[0].', 'The last item is masses[-1].'],
          review: true,
        },
        {
          kind: 'read',
          md: `
## Lists can change

Replace an item by assigning to its index, and add to the end with \`.append()\`:

~~~python
readings = [181, 186, 195]
readings[0] = 180          # replace the first item
readings.append(193)       # add a new item to the end
print(readings)
~~~

~~~text
[180, 186, 195, 193]
~~~
`,
        },
        {
          kind: 'code',
          id: 'm03-l1-change',
          prompt: '`readings` is set to `[181, 186, 915]`. The last reading was a typo: set it to `195` using its index. Then add a new reading, `193`, to the end.',
          setup: 'readings = [181, 186, 915]\n',
          starter: '# readings is already set: [181, 186, 915]\n',
          solution: 'readings[2] = 195\nreadings.append(193)\n',
          tests: `assert readings == [181, 186, 195, 193], f"readings should be [181, 186, 195, 193], but it is {readings}."
assert ".append(" in source, "Use .append() to add to the end."`,
          hints: ['The typo is at index 2 (or -1).', 'readings.append(193) adds to the end.'],
          review: true,
        },
      ],
    },
    {
      id: 'm03-l2',
      title: 'Slicing and list tools',
      summary: 'Take parts of lists, sort them, and use the built-in shortcuts.',
      steps: [
        {
          kind: 'read',
          md: `
## Slices

A **slice** takes part of a list: \`list[start:stop]\`. Like \`range()\`, the stop position is not included.

~~~python
nums = [10, 20, 30, 40, 50]
print(nums[1:3])   # positions 1 and 2
print(nums[:2])    # from the start
print(nums[-2:])   # the last two
~~~

~~~text
[20, 30]
[10, 20]
[40, 50]
~~~
`,
        },
        {
          kind: 'predict',
          id: 'm03-l2-slice',
          code: 'nums = [10, 20, 30, 40, 50]\nprint(nums[2:])\n',
          options: ['[30, 40, 50]', '[20, 30, 40, 50]', '[10, 20]', '[30]'],
          answer: 0,
          explain: 'Leaving out the stop means "to the end", starting from index 2 (the third item).',
        },
        {
          kind: 'read',
          md: `
## Built-in tools

Now that you've written these patterns by hand, here are Python's shortcuts:

| Tool | What it gives | Example with \`[3, 1, 2]\` |
|---|---|---|
| \`sum(x)\` | total | \`6\` |
| \`min(x)\`, \`max(x)\` | smallest, largest | \`1\`, \`3\` |
| \`sorted(x)\` | a **new** sorted list | \`[1, 2, 3]\` |
| \`sorted(x, reverse=True)\` | sorted biggest first | \`[3, 2, 1]\` |
| \`x.sort()\` | sorts the list **in place** | x becomes \`[1, 2, 3]\` |
| \`value in x\` | is it in the list? | \`2 in x\` is \`True\` |
`,
        },
        {
          kind: 'predict',
          id: 'm03-l2-sorted',
          code: 'a = [3, 1, 2]\nb = sorted(a)\nprint(a, b)\n',
          options: ['[3, 1, 2] [1, 2, 3]', '[1, 2, 3] [1, 2, 3]', '[3, 1, 2] None', '[1, 2, 3] None'],
          answer: 0,
          explain: 'sorted() makes a new sorted list and leaves the original alone.',
        },
        {
          kind: 'code',
          id: 'm03-l2-top3',
          prompt: '`masses` holds every Adelie penguin\'s mass. Create `top3`: a list of the **three heaviest** masses, biggest first. Then print it.',
          setup: ADELIE_MASSES_SETUP,
          data: [PENGUINS_FILE],
          starter: '# masses is already loaded\n',
          solution: 'top3 = sorted(masses, reverse=True)[:3]\nprint(top3)\n',
          tests: `want = sorted(masses, reverse=True)[:3]
assert top3 == want, f"top3 should be {want}, but it is {top3}."
assert rerun(masses=[5, 1, 9, 7, 3])["top3"] == [9, 7, 5], "Sort biggest first, then slice the first three."`,
          hints: ['sorted(masses, reverse=True) puts the heaviest first.', 'Then take the first three with [:3].'],
          review: true,
        },
        {
          kind: 'code',
          id: 'm03-l2-spread',
          prompt: 'Create `spread`: the difference between the heaviest and lightest Adelie penguin. Use `max()` and `min()`, and print it.',
          setup: ADELIE_MASSES_SETUP,
          data: [PENGUINS_FILE],
          starter: '# masses is already loaded\n',
          solution: 'spread = max(masses) - min(masses)\nprint(spread)\n',
          tests: `assert spread == max(masses) - min(masses), "spread should be max(masses) - min(masses)."
assert rerun(masses=[10, 4, 7])["spread"] == 6, "Calculate it from masses so it works for any list."`,
          hints: ['spread = max(masses) - min(masses)'],
        },
        {
          kind: 'choice',
          id: 'm03-l2-sort-vs-sorted',
          question: 'What does `x = x.sort()` leave in `x`?',
          options: ['The sorted list', 'The original list', '`None`', 'An error'],
          answer: 2,
          explain: '.sort() sorts the list in place and returns None, so x ends up as None. Use x.sort() on its own, or x = sorted(x).',
        },
        {
          kind: 'code',
          id: 'm03-l2-in',
          prompt: '`seen` is a list of species spotted on a survey. Create `has_gentoo`: `True` if `"Gentoo"` is in the list, `False` otherwise. Use `in`.',
          setup: 'seen = ["Adelie", "Chinstrap", "Gentoo"]\n',
          starter: '# seen is already set\n',
          solution: 'has_gentoo = "Gentoo" in seen\n',
          tests: `assert has_gentoo is True, "Gentoo is in the list, so has_gentoo should be True."
assert rerun(seen=["Adelie"])["has_gentoo"] is False, "When Gentoo isn't in the list, has_gentoo should be False."`,
          hints: ['has_gentoo = "Gentoo" in seen'],
          review: true,
        },
      ],
    },
    {
      id: 'm03-l3',
      title: 'Dictionaries',
      summary: 'Look values up by name instead of position.',
      steps: [
        {
          kind: 'read',
          md: `
## Values with labels

A **dictionary** stores **key: value** pairs inside curly brackets. You look values up by key:

~~~python
penguin = {"species": "Gentoo", "island": "Biscoe", "mass_g": 5000}
print(penguin["mass_g"])
~~~

~~~text
5000
~~~

Add a new key or change an existing one with \`=\`:

~~~python
penguin["sex"] = "female"     # adds a new key
penguin["mass_g"] = 5050      # changes an existing value
~~~
`,
        },
        {
          kind: 'predict',
          id: 'm03-l3-lookup',
          code: 'p = {"species": "Gentoo", "mass_g": 5000}\np["mass_g"] = p["mass_g"] + 100\nprint(p["mass_g"])\n',
          options: ['5100', '5000', '100', 'An error'],
          answer: 0,
          explain: 'The right-hand side reads 5000, adds 100, and stores 5100 back under the same key.',
        },
        {
          kind: 'code',
          id: 'm03-l3-create',
          prompt: 'Create a dictionary `penguin` for the first penguin in the dataset, with keys `"species"` (`"Adelie"`), `"island"` (`"Torgersen"`) and `"mass_g"` (`3750`). Then print its island by looking it up.',
          starter: '',
          solution: 'penguin = {"species": "Adelie", "island": "Torgersen", "mass_g": 3750}\nprint(penguin["island"])\n',
          tests: `assert penguin == {"species": "Adelie", "island": "Torgersen", "mass_g": 3750}, f"Check the keys and values: {penguin}"
assert output.strip() == "Torgersen", "Print penguin[\\"island\\"]."`,
          hints: ['{"species": "Adelie", ...} with a colon between each key and value.', 'Look it up with penguin["island"].'],
        },
        {
          kind: 'read',
          md: `
## Missing keys and .get()

Looking up a key that isn't there raises a \`KeyError\`. \`.get(key, default)\` returns the default instead:

~~~python
counts = {"Adelie": 3}
print(counts.get("Adelie", 0))
print(counts.get("Gentoo", 0))
~~~

~~~text
3
0
~~~

This makes **counting** easy. For each item, get the current count (0 if new) and add 1:

~~~python
counts = {}
for s in ["Adelie", "Gentoo", "Adelie"]:
    counts[s] = counts.get(s, 0) + 1
print(counts)
~~~

~~~text
{'Adelie': 2, 'Gentoo': 1}
~~~
`,
        },
        {
          kind: 'predict',
          id: 'm03-l3-get',
          code: 'counts = {"Adelie": 3}\nprint(counts.get("Gentoo", 0))\n',
          options: ['0', '3', 'None', 'KeyError'],
          answer: 0,
          explain: '"Gentoo" isn\'t a key, so .get() returns the default you gave it: 0.',
        },
        {
          kind: 'code',
          id: 'm03-l3-count',
          prompt: '`seen` is a list of species sightings. Build a dictionary `counts` that maps each species to how many times it appears.',
          setup: COUNT_SETUP,
          starter: '# seen is already set:\n# ["Adelie", "Gentoo", "Adelie", "Chinstrap", "Adelie", "Gentoo"]\n',
          solution: 'counts = {}\nfor s in seen:\n    counts[s] = counts.get(s, 0) + 1\n',
          tests: `assert counts == {"Adelie": 3, "Gentoo": 2, "Chinstrap": 1}, f"Expected Adelie 3, Gentoo 2, Chinstrap 1, but got {counts}."
assert rerun(seen=["x", "x", "y"])["counts"] == {"x": 2, "y": 1}, "Your code should count any list."`,
          hints: ['Start with counts = {}.', 'In the loop: counts[s] = counts.get(s, 0) + 1'],
          review: true,
        },
        {
          kind: 'read',
          md: `
## Looping over a dictionary

\`.items()\` gives you each key and value together:

~~~python
counts = {"Adelie": 3, "Gentoo": 2}
for species, n in counts.items():
    print(f"{species}: {n}")
~~~

~~~text
Adelie: 3
Gentoo: 2
~~~
`,
        },
        {
          kind: 'code',
          id: 'm03-l3-items',
          prompt: '`counts` is set for you. Loop over it with `.items()` and print each entry as `Species: count`, one per line (for example `Adelie: 3`).',
          setup: 'counts = {"Adelie": 3, "Gentoo": 2, "Chinstrap": 1}\n',
          starter: '# counts is already set: {"Adelie": 3, "Gentoo": 2, "Chinstrap": 1}\n',
          solution: 'for species, n in counts.items():\n    print(f"{species}: {n}")\n',
          tests: `assert lines == ["Adelie: 3", "Gentoo: 2", "Chinstrap: 1"], f"Expected one 'Species: count' line per entry, but got {lines}."
assert rerun(counts={"a": 1})["lines"] == ["a: 1"], "Loop over counts so it works for any dictionary."`,
          hints: ['for species, n in counts.items():', 'print(f"{species}: {n}")'],
          review: true,
        },
      ],
    },
    {
      id: 'm03-l4',
      title: 'Records: real data',
      summary: 'Work with the full dataset as a list of dictionaries.',
      steps: [
        {
          kind: 'read',
          md: `
## How real data looks in Python

A table of data is naturally a **list of dictionaries**: one dictionary per row, with the column names as keys.

From now on, \`penguins\` holds the **whole Palmer Penguins dataset**: 344 real penguins observed at Palmer Station, Antarctica, between 2007 and 2009.

~~~python
print(penguins[0])
~~~

~~~text
{'species': 'Adelie', 'island': 'Torgersen', 'bill_length_mm': 39.1, 'bill_depth_mm': 18.7,
 'flipper_length_mm': 181, 'body_mass_g': 3750, 'sex': 'male', 'year': 2007}
~~~

Each row is a dictionary, so \`penguins[0]["species"]\` is \`"Adelie"\`.
`,
        },
        {
          kind: 'predict',
          id: 'm03-l4-len',
          code: 'print(len(penguins))\n',
          setup: PENGUINS_SETUP,
          data: [PENGUINS_FILE],
          options: ['344', '8', '152', '3'],
          answer: 0,
          explain: 'penguins is a list with one dictionary per penguin, and there are 344 penguins.',
        },
        {
          kind: 'read',
          md: `
## Missing values: None

Real data has gaps. Some penguins weren't weighed or sexed. Python's value for "nothing here" is \`None\`.

Check for it with \`is None\` or \`is not None\`:

~~~python
for p in penguins[:4]:
    if p["body_mass_g"] is None:
        print("No mass recorded")
    else:
        print(p["body_mass_g"])
~~~

~~~text
3750
3800
3250
No mass recorded
~~~

Doing maths with \`None\` raises a \`TypeError\`, so skip missing values before calculating.
`,
        },
        {
          kind: 'code',
          id: 'm03-l4-chinstrap',
          prompt: 'Loop over `penguins` and count how many are **Chinstrap** penguins. Store the count in `chinstrap_count` and print it.',
          setup: PENGUINS_SETUP,
          data: [PENGUINS_FILE],
          starter: '# penguins is already loaded (344 rows)\n',
          solution: 'chinstrap_count = 0\nfor p in penguins:\n    if p["species"] == "Chinstrap":\n        chinstrap_count += 1\nprint(chinstrap_count)\n',
          tests: `want = len([p for p in penguins if p["species"] == "Chinstrap"])
assert chinstrap_count == want, f"chinstrap_count should be {want}, but it is {chinstrap_count}."
assert rerun(penguins=[{"species": "Chinstrap"}, {"species": "Adelie"}])["chinstrap_count"] == 1, "Count from the penguins list, so it works for any data."`,
          hints: ['Loop with for p in penguins:', 'Check p["species"] == "Chinstrap" and add 1 when it is.'],
          review: true,
        },
        {
          kind: 'code',
          id: 'm03-l4-biscoe',
          prompt: 'Create `biscoe_masses`: a list of the `body_mass_g` of every penguin on **Biscoe** island, **skipping** any that are `None`. Then print how many there are.',
          setup: PENGUINS_SETUP,
          data: [PENGUINS_FILE],
          starter: '# penguins is already loaded\n',
          solution: 'biscoe_masses = []\nfor p in penguins:\n    if p["island"] == "Biscoe" and p["body_mass_g"] is not None:\n        biscoe_masses.append(p["body_mass_g"])\nprint(len(biscoe_masses))\n',
          tests: `want = [p["body_mass_g"] for p in penguins if p["island"] == "Biscoe" and p["body_mass_g"] is not None]
assert None not in biscoe_masses, "Skip penguins whose body_mass_g is None."
assert biscoe_masses == want, f"Expected {len(want)} masses from Biscoe, in dataset order, but got {len(biscoe_masses)}."`,
          hints: ['Start with an empty list: biscoe_masses = []', 'Check both conditions with and, then .append() the mass.'],
          review: true,
        },
        {
          kind: 'code',
          id: 'm03-l4-missing-sex',
          prompt: 'How many penguins have **no recorded sex** (`None`)? Store the count in `missing` and print it.',
          setup: PENGUINS_SETUP,
          data: [PENGUINS_FILE],
          starter: '# penguins is already loaded\n',
          solution: 'missing = 0\nfor p in penguins:\n    if p["sex"] is None:\n        missing += 1\nprint(missing)\n',
          tests: `want = len([p for p in penguins if p["sex"] is None])
assert missing == want, f"missing should be {want}, but it is {missing}."`,
          hints: ['Use is None to check for a missing value.'],
        },
      ],
    },
    {
      id: 'm03-l5',
      title: 'Project: penguin census',
      summary: 'Analyse the whole dataset and write a report, using everything so far.',
      steps: [
        {
          kind: 'read',
          md: `
## Your first real analysis

You're going to answer three questions about the Palmer penguins, then write a short report:

1. How many penguins of each species are there?
2. What's the average body mass of each species?
3. Which penguin is the heaviest?

Everything you need is in modules 1 to 3. Take your time: each step checks your answer against the real data.
`,
        },
        {
          kind: 'code',
          id: 'm03-l5-counts',
          prompt: 'Build `species_counts`: a dictionary mapping each species to the number of penguins of that species.',
          setup: PENGUINS_SETUP,
          data: [PENGUINS_FILE],
          starter: '# penguins is already loaded\n',
          solution: 'species_counts = {}\nfor p in penguins:\n    species_counts[p["species"]] = species_counts.get(p["species"], 0) + 1\nprint(species_counts)\n',
          tests: `want = {}
for p in penguins:
    want[p["species"]] = want.get(p["species"], 0) + 1
assert species_counts == want, f"Expected {want}, but got {species_counts}."`,
          hints: ['This is the counting pattern from the dictionaries lesson.', 'Use p["species"] as the key.'],
        },
        {
          kind: 'code',
          id: 'm03-l5-average',
          prompt: 'Build `average_mass`: a dictionary mapping each species to its **average body mass**, rounded to 1 decimal place. Skip penguins with no recorded mass.\n\nTip: keep a running total and a count per species (two dictionaries), then work out the averages at the end.',
          setup: PENGUINS_SETUP,
          data: [PENGUINS_FILE],
          starter: '# penguins is already loaded\n',
          solution: `totals = {}
counts = {}
for p in penguins:
    mass = p["body_mass_g"]
    if mass is None:
        continue
    totals[p["species"]] = totals.get(p["species"], 0) + mass
    counts[p["species"]] = counts.get(p["species"], 0) + 1
average_mass = {}
for species, total in totals.items():
    average_mass[species] = round(total / counts[species], 1)
print(average_mass)
`,
          tests: `groups = {}
for p in penguins:
    if p["body_mass_g"] is not None:
        groups.setdefault(p["species"], []).append(p["body_mass_g"])
want = {s: round(sum(m) / len(m), 1) for s, m in groups.items()}
assert set(average_mass) == set(want), f"average_mass should have one key per species: {sorted(want)}."
for s in want:
    assert average_mass[s] == want[s], f"The average for {s} should be {want[s]}, but it is {average_mass[s]}."`,
          hints: [
            'Skip missing masses with: if mass is None: continue (continue jumps to the next penguin).',
            'totals[s] = totals.get(s, 0) + mass, and counts[s] = counts.get(s, 0) + 1',
            'At the end, loop over totals.items() and divide by the matching count.',
          ],
          review: true,
        },
        {
          kind: 'code',
          id: 'm03-l5-heaviest',
          prompt: 'Find the **heaviest penguin**. Store the penguin\'s whole row (its dictionary) in `heaviest`, then print its species, island and mass.',
          setup: PENGUINS_SETUP,
          data: [PENGUINS_FILE],
          starter: '# penguins is already loaded\n',
          solution: `heaviest = None
for p in penguins:
    if p["body_mass_g"] is None:
        continue
    if heaviest is None or p["body_mass_g"] > heaviest["body_mass_g"]:
        heaviest = p
print(heaviest["species"], heaviest["island"], heaviest["body_mass_g"])
`,
          tests: `top = max(p["body_mass_g"] for p in penguins if p["body_mass_g"] is not None)
assert isinstance(heaviest, dict), "heaviest should be a penguin's dictionary, not just its mass."
assert heaviest["body_mass_g"] == top, f"The heaviest penguin weighs {top} g, but yours weighs {heaviest['body_mass_g']} g."`,
          hints: [
            'Use the "find the biggest" pattern, but remember the whole dictionary instead of just the number.',
            'Start with heaviest = None, and replace it if heaviest is None or this penguin is heavier.',
          ],
        },
        {
          kind: 'code',
          id: 'm03-l5-report',
          prompt: `Write the report. \`species_counts\` and \`average_mass\` are set for you (the answers from the previous steps). For each species in **alphabetical order**, print a line like:

~~~text
Adelie: 152 penguins, average 3700.7 g
~~~`,
          setup: `${PENGUINS_SETUP}
species_counts = {}
_totals = {}
_n = {}
for _p in penguins:
    species_counts[_p["species"]] = species_counts.get(_p["species"], 0) + 1
    if _p["body_mass_g"] is not None:
        _totals[_p["species"]] = _totals.get(_p["species"], 0) + _p["body_mass_g"]
        _n[_p["species"]] = _n.get(_p["species"], 0) + 1
average_mass = {s: round(_totals[s] / _n[s], 1) for s in _totals}
del _totals, _n, _p
`,
          data: [PENGUINS_FILE],
          starter: '# species_counts and average_mass are already set\n',
          solution: 'for species in sorted(species_counts):\n    print(f"{species}: {species_counts[species]} penguins, average {average_mass[species]} g")\n',
          tests: `want = [f"{s}: {species_counts[s]} penguins, average {average_mass[s]} g" for s in sorted(species_counts)]
assert lines == want, "Expected:\\n" + "\\n".join(want)
other = rerun(species_counts={"B": 2, "A": 1}, average_mass={"A": 10.0, "B": 20.5})["lines"]
assert other == ["A: 1 penguins, average 10.0 g", "B: 2 penguins, average 20.5 g"], "Build each line from the dictionaries, sorted alphabetically."`,
          hints: ['sorted(species_counts) gives the keys in alphabetical order.', 'Use an f-string with species_counts[species] and average_mass[species].'],
          review: true,
        },
        {
          kind: 'read',
          md: `
## You just did data science

You took a real dataset, cleaned out missing values, grouped it, summarised it and reported the results. That's the core loop of every data analysis, and you wrote every step yourself.

Later, **pandas** will do each of these in one line. Because you've built them by hand, you'll know exactly what those lines are doing.

**Next up: functions.** You'll package these patterns into reusable tools.
`,
        },
      ],
    },
  ],
};
