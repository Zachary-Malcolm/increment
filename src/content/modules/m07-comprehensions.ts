import type { Module } from '../types';
import { PENGUINS_FILE, PENGUINS_SETUP } from '../datasets';

export const m07: Module = {
  id: 'm07',
  number: 7,
  title: 'Tuples, sets and comprehensions',
  blurb: 'Two more ways to hold data, and loops written in one clear line.',
  lessons: [
    {
      id: 'm07-l1',
      title: 'Tuples',
      summary: 'Fixed groups of values, and unpacking them into names.',
      steps: [
        {
          kind: 'read',
          md: `
## Lists that can't change

A **tuple** is like a list, but it can't be changed after it's made. Use round brackets:

~~~python
location = (51.761, -1.262)     # latitude, longitude of Oxford
print(location[0])
~~~

~~~text
51.761
~~~

Use tuples for values that belong together and shouldn't change: coordinates, a (name, score) pair, a row of data.

## Unpacking

You can split a tuple into separate names in one go:

~~~python
lat, lon = location
print(lon)
~~~

~~~text
-1.262
~~~

That's what happens in \`for species, n in counts.items():\`. Each item is a tuple being unpacked.
`,
        },
        {
          kind: 'predict',
          id: 'm07-l1-swap',
          code: 'a = 1\nb = 2\na, b = b, a\nprint(a, b)\n',
          options: ['2 1', '1 2', '2 2', 'An error'],
          answer: 0,
          explain: 'The right side makes the tuple (2, 1) first, then unpacks it into a and b. It\'s Python\'s neat way to swap two variables.',
        },
        {
          kind: 'code',
          id: 'm07-l1-min-max',
          prompt: 'Define `mass_range(masses)` that returns a **tuple** of the smallest and largest mass: `(smallest, largest)`.\n\nThen unpack the result for `[3750, 3800, 3250, 4675]` into `low` and `high` and print them.',
          starter: '',
          solution: 'def mass_range(masses):\n    return (min(masses), max(masses))\n\nlow, high = mass_range([3750, 3800, 3250, 4675])\nprint(low, high)\n',
          tests: `r = mass_range([5, 1, 9])
assert isinstance(r, tuple), f"mass_range should return a tuple, but returned a {type(r).__name__}."
assert r == (1, 9), f"mass_range([5, 1, 9]) should be (1, 9), got {r}."
assert low == 3250 and high == 4675, "Unpack the result into low and high: low, high = mass_range(...)"`,
          hints: ['return (min(masses), max(masses))', 'Unpack with: low, high = mass_range([...])'],
          review: true,
        },
        {
          kind: 'choice',
          id: 'm07-l1-mutable',
          question: 'What happens with `point = (1, 2)` then `point[0] = 5`?',
          options: ['point becomes (5, 2)', 'A TypeError: tuples can\'t be changed', 'point becomes [5, 2]', 'Nothing happens'],
          answer: 1,
          explain: 'Tuples are immutable. To "change" one, make a new tuple: point = (5, point[1]).',
        },
      ],
    },
    {
      id: 'm07-l2',
      title: 'Sets',
      summary: 'Unique values, and comparing groups.',
      steps: [
        {
          kind: 'read',
          md: `
## Only unique values

A **set** holds each value at most once, with no order. It's perfect for "which different values are there?":

~~~python
seen = ["Adelie", "Gentoo", "Adelie", "Chinstrap", "Adelie"]
species = set(seen)
print(len(species))
print("Gentoo" in species)
~~~

~~~text
3
True
~~~

Checking \`in\` on a set is also much faster than on a long list.

## Comparing sets

| Code | Gives | |
|---|---|---|
| \`a | b\` | in either | union |
| \`a & b\` | in both | intersection |
| \`a - b\` | in a but not b | difference |
`,
        },
        {
          kind: 'predict',
          id: 'm07-l2-ops',
          code: 'surveyed_2008 = {"Biscoe", "Dream", "Torgersen"}\nsurveyed_2009 = {"Biscoe", "Dream", "Anvers"}\nprint(sorted(surveyed_2008 - surveyed_2009))\n',
          options: ["['Torgersen']", "['Anvers']", "['Biscoe', 'Dream']", "['Anvers', 'Torgersen']"],
          answer: 0,
          explain: 'The difference keeps islands surveyed in 2008 but not in 2009. (Sets have no order, so sorted() makes the output predictable.)',
        },
        {
          kind: 'code',
          id: 'm07-l2-unique',
          prompt: 'Using the real `penguins` data, create `islands`: a **set** of every island name. Then print how many different islands there are.',
          setup: PENGUINS_SETUP,
          data: [PENGUINS_FILE],
          starter: '# penguins is already loaded (a list of dictionaries)\n',
          solution: 'islands = set()\nfor p in penguins:\n    islands.add(p["island"])\nprint(len(islands))\n',
          tests: `assert isinstance(islands, set), f"islands should be a set, but it is a {type(islands).__name__}."
assert islands == {"Biscoe", "Dream", "Torgersen"}, f"Got {islands}"
assert output.strip() == "3", "Print len(islands)."`,
          hints: ['Start with an empty set: islands = set() (not {}, which is an empty dictionary).', 'Use islands.add(p["island"]) in a loop.'],
          review: true,
        },
        {
          kind: 'code',
          id: 'm07-l2-compare',
          prompt: '`dream_species` and `biscoe_species` are sets of the species found on each island. Create:\n\n- `on_both`: species found on both islands\n- `only_dream`: species found on Dream but not Biscoe',
          setup: 'dream_species = {"Adelie", "Chinstrap"}\nbiscoe_species = {"Adelie", "Gentoo"}\n',
          starter: '# dream_species = {"Adelie", "Chinstrap"}\n# biscoe_species = {"Adelie", "Gentoo"}\n',
          solution: 'on_both = dream_species & biscoe_species\nonly_dream = dream_species - biscoe_species\n',
          tests: `assert on_both == {"Adelie"}, f"on_both should be {{'Adelie'}}, got {on_both}."
assert only_dream == {"Chinstrap"}, f"only_dream should be {{'Chinstrap'}}, got {only_dream}."
other = rerun(dream_species={1, 2, 3}, biscoe_species={2, 3, 4})
assert other["on_both"] == {2, 3} and other["only_dream"] == {1}, "Use the set operators so it works for any sets."`,
          hints: ['& gives the values in both sets.', '- gives the values in the first set but not the second.'],
        },
      ],
    },
    {
      id: 'm07-l3',
      title: 'List comprehensions',
      summary: 'Build a list from another list in one readable line.',
      steps: [
        {
          kind: 'read',
          md: `
## A loop in one line

You've written this pattern many times:

~~~python
kgs = []
for m in masses:
    kgs.append(m / 1000)
~~~

A **list comprehension** says the same thing in one line:

~~~python
kgs = [m / 1000 for m in masses]
~~~

Read it as: *"a list of \`m / 1000\` for each \`m\` in \`masses\`"*.

## Filtering

Add \`if\` at the end to keep only some items:

~~~python
heavy = [m for m in masses if m > 4500]
~~~

Comprehensions are everywhere in real Python code, and pandas code uses the same thinking.
`,
        },
        {
          kind: 'predict',
          id: 'm07-l3-predict',
          code: 'nums = [1, 2, 3, 4, 5, 6]\nprint([n * n for n in nums if n % 2 == 0])\n',
          options: ['[4, 16, 36]', '[1, 9, 25]', '[2, 4, 6]', '[1, 4, 9, 16, 25, 36]'],
          answer: 0,
          explain: 'Only even numbers (2, 4, 6) pass the if, and each is squared: 4, 16, 36.',
        },
        {
          kind: 'code',
          id: 'm07-l3-kg',
          prompt: 'Using a list comprehension, create `flippers_cm`: every flipper length in `flippers_mm` converted to centimetres (divide by 10).',
          setup: 'flippers_mm = [181, 186, 195, 193, 190]\n',
          starter: '# flippers_mm = [181, 186, 195, 193, 190]\n',
          solution: 'flippers_cm = [f / 10 for f in flippers_mm]\n',
          tests: `assert flippers_cm == [18.1, 18.6, 19.5, 19.3, 19.0], f"Got {flippers_cm}"
assert "for" in source and "[" in source and "append" not in source, "Use a list comprehension: [... for f in flippers_mm]"
assert rerun(flippers_mm=[100])["flippers_cm"] == [10.0], "Build it from flippers_mm."`,
          hints: ['[f / 10 for f in flippers_mm]'],
          review: true,
        },
        {
          kind: 'code',
          id: 'm07-l3-filter',
          prompt: 'Using one list comprehension on the real `penguins` data, create `gentoo_masses`: the `body_mass_g` of every **Gentoo** penguin whose mass is **not** `None`.',
          setup: PENGUINS_SETUP,
          data: [PENGUINS_FILE],
          starter: '# penguins is already loaded\n',
          solution: 'gentoo_masses = [p["body_mass_g"] for p in penguins if p["species"] == "Gentoo" and p["body_mass_g"] is not None]\n',
          tests: `want = []
for p in penguins:
    if p["species"] == "Gentoo" and p["body_mass_g"] is not None:
        want.append(p["body_mass_g"])
assert gentoo_masses == want, f"Expected {len(want)} Gentoo masses (in dataset order), got {len(gentoo_masses)}."`,
          hints: ['[p["body_mass_g"] for p in penguins if ...]', 'Combine both conditions with and.'],
          review: true,
        },
      ],
    },
    {
      id: 'm07-l4',
      title: 'Dict and set comprehensions',
      summary: 'Build dictionaries and sets in one line too.',
      steps: [
        {
          kind: 'read',
          md: `
## Same idea, curly brackets

A **dict comprehension** builds a dictionary: \`{key: value for ...}\`

~~~python
names = ["Adelie", "Gentoo", "Chinstrap"]
lengths = {name: len(name) for name in names}
print(lengths)
~~~

~~~text
{'Adelie': 6, 'Gentoo': 6, 'Chinstrap': 9}
~~~

A **set comprehension** uses curly brackets without a colon:

~~~python
species = {p["species"] for p in penguins}
~~~

A handy trick is transforming an existing dictionary:

~~~python
kg = {species: grams / 1000 for species, grams in averages.items()}
~~~
`,
        },
        {
          kind: 'predict',
          id: 'm07-l4-predict',
          code: 'prices = {"tea": 2.5, "cake": 3.0, "soup": 4.5}\ncheap = {item: p for item, p in prices.items() if p < 4}\nprint(cheap)\n',
          options: ["{'tea': 2.5, 'cake': 3.0}", "{'soup': 4.5}", "['tea', 'cake']", "{'tea': 2.5, 'cake': 3.0, 'soup': 4.5}"],
          answer: 0,
          explain: 'Only items priced under 4 pass the if. Dictionaries keep the order items were added.',
        },
        {
          kind: 'code',
          id: 'm07-l4-convert',
          prompt: '`average_g` maps each species to its average mass in grams. Using a dict comprehension, create `average_kg` with the same keys and the masses in kilograms, **rounded to 2 decimal places**.',
          setup: 'average_g = {"Adelie": 3700.66, "Chinstrap": 3733.09, "Gentoo": 5076.02}\n',
          starter: '# average_g = {"Adelie": 3700.66, "Chinstrap": 3733.09, "Gentoo": 5076.02}\n',
          solution: 'average_kg = {species: round(g / 1000, 2) for species, g in average_g.items()}\n',
          tests: `assert average_kg == {"Adelie": 3.7, "Chinstrap": 3.73, "Gentoo": 5.08}, f"Got {average_kg}"
assert rerun(average_g={"x": 1234.0})["average_kg"] == {"x": 1.23}, "Build it from average_g."`,
          hints: ['Loop over average_g.items() to get each species and mass.', '{species: round(g / 1000, 2) for species, g in average_g.items()}'],
          review: true,
        },
        {
          kind: 'code',
          id: 'm07-l4-index',
          prompt: 'Build `mass_by_id`: a dictionary mapping each penguin\'s **position** in `penguins` (0, 1, 2...) to its `body_mass_g`, but only for penguins on **Dream** island.\n\nTip: `range(len(penguins))` gives the positions.',
          setup: PENGUINS_SETUP,
          data: [PENGUINS_FILE],
          starter: '# penguins is already loaded\n',
          solution: 'mass_by_id = {i: penguins[i]["body_mass_g"] for i in range(len(penguins)) if penguins[i]["island"] == "Dream"}\n',
          tests: `want = {}
for i in range(len(penguins)):
    if penguins[i]["island"] == "Dream":
        want[i] = penguins[i]["body_mass_g"]
assert mass_by_id == want, f"Expected {len(want)} Dream penguins, got {len(mass_by_id)}."`,
          hints: ['{i: penguins[i]["body_mass_g"] for i in range(len(penguins)) if ...}'],
        },
      ],
    },
    {
      id: 'm07-l5',
      title: 'Looping tools: enumerate, zip and sorting',
      summary: 'The built-in helpers that make loops clean.',
      steps: [
        {
          kind: 'read',
          md: `
## enumerate: position and item together

~~~python
for i, name in enumerate(["Adelie", "Gentoo"], start=1):
    print(i, name)
~~~

~~~text
1 Adelie
2 Gentoo
~~~

## zip: walk through lists side by side

~~~python
species = ["Adelie", "Gentoo"]
masses = [3700, 5076]
for s, m in zip(species, masses):
    print(s, m)
~~~

## Sorting by anything with key=

\`sorted()\`, \`min()\` and \`max()\` accept \`key=\`: a function that says *what to compare*. A **lambda** is a tiny one-line function, written \`lambda x: ...\`:

~~~python
penguins_sorted = sorted(penguins, key=lambda p: p["flipper_length_mm"])
longest_name = max(["Adelie", "Chinstrap", "Gentoo"], key=len)
~~~

## any and all

\`any(...)\` is True if at least one item is True; \`all(...)\` if every item is:

~~~python
all(m > 2000 for m in masses)
~~~
`,
        },
        {
          kind: 'predict',
          id: 'm07-l5-zip',
          code: 'names = ["Ana", "Ben", "Cai"]\nscores = [72, 95, 88]\nbest = max(zip(scores, names))\nprint(best)\n',
          options: ["(95, 'Ben')", "(88, 'Cai')", "('Ben', 95)", '95'],
          answer: 0,
          explain: 'zip makes (score, name) tuples. Tuples compare by their first item, so max finds the highest score: (95, \'Ben\').',
        },
        {
          kind: 'code',
          id: 'm07-l5-rank',
          prompt: '`scores` maps student names to scores. Print a ranking, **highest score first**, numbered from 1, like:\n\n`1. Ben (95)`\n\nUse `sorted` with `key=` and `reverse=True`, and `enumerate`.',
          setup: 'scores = {"Ana": 72, "Ben": 95, "Cai": 88, "Dee": 64}\n',
          starter: '# scores = {"Ana": 72, "Ben": 95, "Cai": 88, "Dee": 64}\n',
          solution: 'ranked = sorted(scores.items(), key=lambda item: item[1], reverse=True)\nfor i, (name, score) in enumerate(ranked, start=1):\n    print(f"{i}. {name} ({score})")\n',
          tests: `assert lines == ["1. Ben (95)", "2. Cai (88)", "3. Ana (72)", "4. Dee (64)"], f"Got {lines}"
assert rerun(scores={"x": 1, "y": 2})["lines"] == ["1. y (2)", "2. x (1)"], "Build the ranking from scores."`,
          hints: [
            'sorted(scores.items(), key=lambda item: item[1], reverse=True) sorts (name, score) pairs by score.',
            'for i, (name, score) in enumerate(ranked, start=1):',
          ],
          review: true,
        },
        {
          kind: 'code',
          id: 'm07-l5-heaviest-row',
          prompt: 'In one line using `max()` with `key=`, find the penguin (the whole dictionary) with the **longest flippers** in `penguins`, skipping any with a missing flipper length. Store it in `longest`.',
          setup: PENGUINS_SETUP,
          data: [PENGUINS_FILE],
          starter: '# penguins is already loaded\n',
          solution: 'longest = max((p for p in penguins if p["flipper_length_mm"] is not None), key=lambda p: p["flipper_length_mm"])\n',
          tests: `top = max(p["flipper_length_mm"] for p in penguins if p["flipper_length_mm"] is not None)
assert isinstance(longest, dict), "longest should be a penguin's dictionary."
assert longest["flipper_length_mm"] == top, f"The longest flippers are {top} mm, but yours has {longest['flipper_length_mm']}."`,
          hints: [
            'Filter out missing values: [p for p in penguins if p["flipper_length_mm"] is not None]',
            'max(that_list, key=lambda p: p["flipper_length_mm"])',
          ],
        },
        {
          kind: 'code',
          id: 'm07-l5-all',
          prompt: 'Create `all_recorded`: `True` if **every** penguin in `sample` has a recorded mass (not `None`), else `False`. Use `all()`.',
          setup: 'sample = [{"body_mass_g": 3750}, {"body_mass_g": None}, {"body_mass_g": 4200}]\n',
          starter: '# sample is a short list of penguin dictionaries\n',
          solution: 'all_recorded = all(p["body_mass_g"] is not None for p in sample)\n',
          tests: `assert all_recorded is False, "One penguin has no mass, so all_recorded should be False."
assert rerun(sample=[{"body_mass_g": 1}])["all_recorded"] is True, "When every mass is recorded it should be True."
assert "all(" in source, "Use all()."`,
          hints: ['all(p["body_mass_g"] is not None for p in sample)'],
        },
      ],
    },
  ],
};
