import type { Module } from '../types';
import { ADELIE_MASSES_SETUP, PENGUINS_FILE } from '../datasets';

export const m02: Module = {
  id: 'm02',
  number: 2,
  title: 'Decisions and loops',
  blurb: 'Make your code choose between options and repeat work for you.',
  lessons: [
    {
      id: 'm02-l1',
      title: 'True or false',
      summary: 'Compare values and combine conditions.',
      steps: [
        {
          kind: 'read',
          md: `
## Asking questions

A **comparison** asks Python a yes/no question. The answer is a **boolean**: \`True\` or \`False\`.

| Operator | Question | Example | Result |
|---|---|---|---|
| \`==\` | equal? | \`3 == 3\` | \`True\` |
| \`!=\` | not equal? | \`3 != 3\` | \`False\` |
| \`>\` \`<\` | greater / less? | \`5 > 2\` | \`True\` |
| \`>=\` \`<=\` | greater or equal / less or equal? | \`2 >= 2\` | \`True\` |

Careful: \`=\` **stores** a value, \`==\` **compares** two values. Mixing them up is one of the most common beginner bugs.
`,
        },
        {
          kind: 'predict',
          id: 'm02-l1-compare',
          code: 'mass_g = 3750\nprint(mass_g > 3800)\n',
          options: ['True', 'False', '3750', 'An error'],
          answer: 1,
          explain: '3750 is not greater than 3800, so the comparison is False.',
        },
        {
          kind: 'predict',
          id: 'm02-l1-case',
          code: 'print("Adelie" == "adelie")\n',
          options: ['True', 'False'],
          answer: 1,
          explain: 'String comparisons are case-sensitive: "A" and "a" are different characters.',
        },
        {
          kind: 'read',
          md: `
## Combining conditions

- \`and\`: True only if **both** sides are True
- \`or\`: True if **at least one** side is True
- \`not\`: flips True and False

~~~python
mass_g = 4200
flipper_mm = 210
print(mass_g > 4000 and flipper_mm > 200)   # both True
print(mass_g > 5000 or flipper_mm > 200)    # one True is enough
print(not mass_g > 4000)
~~~

~~~text
True
True
False
~~~
`,
        },
        {
          kind: 'code',
          id: 'm02-l1-large',
          prompt: 'The variables `mass_g` and `flipper_mm` are set for you. Create `is_large`, which should be `True` when the penguin weighs **more than 4000 g** *and* has flippers **longer than 195 mm**, and `False` otherwise.\n\nDon\'t type True or False yourself: write the comparison.',
          setup: 'mass_g = 4200\nflipper_mm = 197\n',
          starter: '# mass_g and flipper_mm are already set\n',
          solution: 'is_large = mass_g > 4000 and flipper_mm > 195\n',
          tests: `assert is_large is True, "For a 4200 g penguin with 197 mm flippers, is_large should be True."
assert rerun(mass_g=3900, flipper_mm=200)["is_large"] is False, "A 3900 g penguin isn't over 4000 g, so is_large should be False."
assert rerun(mass_g=4500, flipper_mm=195)["is_large"] is False, "195 mm is not longer than 195 mm, so is_large should be False."
assert rerun(mass_g=4001, flipper_mm=196)["is_large"] is True, "4001 g and 196 mm should count as large."`,
          hints: ['Use > for "more than" and "longer than".', 'is_large = mass_g > 4000 and flipper_mm > 195'],
          review: true,
        },
        {
          kind: 'choice',
          id: 'm02-l1-or',
          question: 'What is `False or True`?',
          options: ['`True`', '`False`', 'An error', '`None`'],
          answer: 0,
          explain: '`or` only needs one side to be True.',
        },
      ],
    },
    {
      id: 'm02-l2',
      title: 'if, elif and else',
      summary: 'Run different code depending on the data.',
      steps: [
        {
          kind: 'read',
          md: `
## Making decisions

\`if\` runs a block of code only when a condition is True. \`else\` runs when it isn't:

~~~python
mass_g = 5200
if mass_g > 5000:
    print("A heavy penguin")
else:
    print("Not so heavy")
~~~

~~~text
A heavy penguin
~~~

Two details matter:

1. The line ends with a **colon** \`:\`
2. The code inside is **indented** (4 spaces is the standard). Indentation is how Python knows which lines belong to the \`if\`.
`,
        },
        {
          kind: 'predict',
          id: 'm02-l2-ifelse',
          code: 'mass_g = 3250\nif mass_g > 4000:\n    print("heavy")\nelse:\n    print("light")\nprint("done")\n',
          options: ['light\ndone', 'heavy\ndone', 'light', 'done'],
          answer: 0,
          explain: '3250 is not over 4000, so the else block runs. The last print is not indented, so it always runs.',
        },
        {
          kind: 'read',
          md: `
## More than two options: elif

\`elif\` ("else if") checks another condition. Python checks each one **from the top** and runs only the **first** block whose condition is True:

~~~python
if mass_g < 3500:
    size = "small"
elif mass_g < 4500:
    size = "medium"
else:
    size = "large"
~~~

A 3000 g penguin is "small". Python never checks the \`elif\`, even though 3000 is also less than 4500.
`,
        },
        {
          kind: 'code',
          id: 'm02-l2-size',
          prompt: `\`mass_g\` is set for you. Create \`size\`:

- \`"small"\` if the mass is **under 3500**
- \`"medium"\` if it is **under 4500**
- \`"large"\` otherwise`,
          setup: 'mass_g = 4200\n',
          starter: '# mass_g is already set\n',
          solution: 'if mass_g < 3500:\n    size = "small"\nelif mass_g < 4500:\n    size = "medium"\nelse:\n    size = "large"\n',
          tests: `for mass, want in [(3000, "small"), (3499, "small"), (3500, "medium"), (4200, "medium"), (4500, "large"), (6300, "large")]:
    got = rerun(mass_g=mass)["size"]
    assert got == want, f"A {mass} g penguin should be {want!r}, but your code gave {got!r}."`,
          hints: ['Start with: if mass_g < 3500:', 'Use elif mass_g < 4500: for the middle case, and else: for the rest.'],
          review: true,
        },
        {
          kind: 'choice',
          id: 'm02-l2-indent',
          question: 'What happens if you forget to indent the line after `if mass_g > 4000:`?',
          options: [
            'Python runs it anyway',
            'Python raises an IndentationError',
            'Python skips the line',
            'Python indents it for you',
          ],
          answer: 1,
          explain: 'Python needs at least one indented line after a colon. Without it you get an IndentationError before anything runs.',
        },
        {
          kind: 'code',
          id: 'm02-l2-sex',
          prompt: `In the real dataset, the \`sex\` column is \`"male"\`, \`"female"\`, or \`"NA"\` when it wasn't recorded.

\`sex\` is set for you. Create \`symbol\`: \`"M"\` for male, \`"F"\` for female, and \`"?"\` for anything else.`,
          setup: 'sex = "female"\n',
          starter: '# sex is already set\n',
          solution: 'if sex == "male":\n    symbol = "M"\nelif sex == "female":\n    symbol = "F"\nelse:\n    symbol = "?"\n',
          tests: `for value, want in [("male", "M"), ("female", "F"), ("NA", "?"), ("", "?")]:
    got = rerun(sex=value)["symbol"]
    assert got == want, f"When sex is {value!r}, symbol should be {want!r}, but got {got!r}."`,
          hints: ['Compare with == (two equals signs).', 'Handle "male", then "female" with elif, then everything else with else.'],
          review: true,
        },
      ],
    },
    {
      id: 'm02-l3',
      title: 'for loops',
      summary: 'Repeat code for every item, without copying and pasting.',
      steps: [
        {
          kind: 'read',
          md: `
## Doing something for each item

A \`for\` loop runs the same block once for **each item** in a collection. Here's a list of three numbers (you'll learn lists properly in module 3):

~~~python
for mass in [3750, 3800, 3250]:
    print(mass / 1000)
~~~

~~~text
3.75
3.8
3.25
~~~

Each time round, \`mass\` holds the next item. Like \`if\`, the line ends with a colon and the body is indented.
`,
        },
        {
          kind: 'read',
          md: `
## Counting with range()

\`range()\` produces a sequence of numbers to loop over:

| Code | Numbers |
|---|---|
| \`range(4)\` | 0, 1, 2, 3 |
| \`range(1, 4)\` | 1, 2, 3 |
| \`range(0, 10, 3)\` | 0, 3, 6, 9 |
| \`range(3, 0, -1)\` | 3, 2, 1 |

The stop number is **never included**. \`range(4)\` gives four numbers, starting from 0.
`,
        },
        {
          kind: 'predict',
          id: 'm02-l3-range',
          code: 'for i in range(3):\n    print(i)\n',
          options: ['0\n1\n2', '1\n2\n3', '0\n1\n2\n3', '3'],
          answer: 0,
          explain: 'range(3) starts at 0 and stops before 3.',
        },
        {
          kind: 'code',
          id: 'm02-l3-one-to-five',
          prompt: 'Use a `for` loop and `range()` to print the numbers **1 to 5**, each on its own line.',
          starter: '',
          solution: 'for n in range(1, 6):\n    print(n)\n',
          tests: `assert lines == ["1", "2", "3", "4", "5"], f"Expected 1 to 5 on separate lines, but got {lines}."
assert "for" in source and "range(" in source, "Use a for loop with range()."`,
          hints: ['range(1, 6) gives 1, 2, 3, 4, 5 (the stop number is left out).'],
        },
        {
          kind: 'predict',
          id: 'm02-l3-total',
          code: 'total = 0\nfor n in [2, 4, 6]:\n    total += n\nprint(total)\n',
          options: ['12', '6', '246', '0'],
          answer: 0,
          explain: 'total goes 0 → 2 → 6 → 12. The print is outside the loop, so it runs once at the end.',
        },
        {
          kind: 'code',
          id: 'm02-l3-kg',
          prompt: '`masses` holds the body masses (in grams) of the first five Adelie penguins with a recorded mass. Loop over it and print each mass in **kilograms**, one per line.',
          setup: 'masses = [3750, 3800, 3250, 3450, 3650]\n',
          starter: '# masses is already set: [3750, 3800, 3250, 3450, 3650]\n',
          solution: 'for mass in masses:\n    print(mass / 1000)\n',
          tests: `assert lines == ["3.75", "3.8", "3.25", "3.45", "3.65"], f"Expected one kg value per line, but got {lines}."
assert rerun(masses=[5000, 4100])["lines"] == ["5.0", "4.1"], "Loop over masses so it works for any list."`,
          hints: ['for mass in masses:', 'Inside the loop: print(mass / 1000)'],
          review: true,
        },
        {
          kind: 'code',
          id: 'm02-l3-countdown',
          prompt: 'Print a countdown **3, 2, 1**, each on its own line, using `range()` with a step of `-1`. Then print `Dive!` after the loop.',
          starter: '',
          solution: 'for n in range(3, 0, -1):\n    print(n)\nprint("Dive!")\n',
          tests: `assert lines == ["3", "2", "1", "Dive!"], f"Expected 3, 2, 1, Dive! on separate lines, but got {lines}."
assert "range(" in source and "-1" in source, "Use range() with a step of -1."`,
          hints: ['range(3, 0, -1) counts 3, 2, 1.', 'Put print("Dive!") after the loop, not indented.'],
          review: true,
        },
      ],
    },
    {
      id: 'm02-l4',
      title: 'while loops',
      summary: 'Keep going until a condition changes.',
      steps: [
        {
          kind: 'read',
          md: `
## Repeat while something is true

A \`while\` loop keeps running **as long as** its condition is True. Use it when you don't know in advance how many times to repeat:

~~~python
colony = 50
years = 0
while colony < 1000:
    colony = colony * 2
    years += 1
print(years, colony)
~~~

~~~text
5 1600
~~~

Something inside the loop **must** change the condition, or it runs forever. (If that happens here, Increment stops your code after a few seconds.)
`,
        },
        {
          kind: 'predict',
          id: 'm02-l4-double',
          code: 'n = 1\nwhile n < 20:\n    n = n * 2\nprint(n)\n',
          options: ['32', '16', '20', '64'],
          answer: 0,
          explain: 'n goes 1 → 2 → 4 → 8 → 16 → 32. At 16 the condition is still True, so it doubles once more.',
        },
        {
          kind: 'code',
          id: 'm02-l4-years',
          prompt: 'A colony starts with `start` birds and **doubles every year**. Using a `while` loop, work out how many years it takes to reach **at least** `target` birds. Store the answer in `years`.\n\n`start` and `target` are set for you.',
          setup: 'start = 50\ntarget = 1000\n',
          starter: '# start and target are already set\n',
          solution: 'colony = start\nyears = 0\nwhile colony < target:\n    colony = colony * 2\n    years += 1\n',
          tests: `assert years == 5, f"50 birds doubling reaches 1000 after 5 years, but you got {years}."
assert rerun(start=10, target=10)["years"] == 0, "If the colony already meets the target, years should be 0."
assert rerun(start=3, target=100)["years"] == 6, "3 birds need 6 years to reach 100 (3, 6, 12, 24, 48, 96, 192)."
assert "while" in source, "Use a while loop."`,
          hints: ['Use a separate variable (e.g. colony) that starts at start.', 'while colony < target: double it and add 1 to years.'],
          review: true,
        },
        {
          kind: 'read',
          md: `
## Stopping early with break

\`break\` jumps out of a loop immediately. A common pattern is \`while True:\` (loop forever) with a \`break\` once you've found what you need:

~~~python
n = 1
while True:
    if n * n > 50:
        break
    n += 1
print(n)
~~~

~~~text
8
~~~
`,
        },
        {
          kind: 'code',
          id: 'm02-l4-break',
          prompt: 'Find the **first whole number** (counting up from 1) whose square is **greater than 500**. Store it in `first`, and use `break` to stop the loop.',
          starter: '',
          solution: 'first = 1\nwhile True:\n    if first * first > 500:\n        break\n    first += 1\n',
          tests: `assert first == 23, f"22 squared is 484 and 23 squared is 529, so first should be 23, not {first}."
assert "break" in source, "Use break to leave the loop."`,
          hints: ['Start at 1 and increase by 1 each time round.', 'Inside the loop: if first * first > 500: break'],
        },
        {
          kind: 'choice',
          id: 'm02-l4-forever',
          question: 'What happens when this runs?\n\n~~~python\ncount = 0\nwhile count < 5:\n    print(count)\n~~~',
          options: ['Prints 0 to 4', 'Prints 0 to 5', 'Prints 0 forever', 'Prints nothing'],
          answer: 2,
          explain: 'count never changes inside the loop, so count < 5 stays True forever. It needs count += 1.',
        },
      ],
    },
    {
      id: 'm02-l5',
      title: 'Loop patterns with real data',
      summary: 'Total, count and find the biggest across 151 real penguins.',
      steps: [
        {
          kind: 'read',
          md: `
## Three patterns you'll use forever

Almost every analysis is built from a few loop patterns. Here's the list \`masses\`: the body mass of **every Adelie penguin** in the Palmer dataset with a recorded mass.

**Accumulate**: start at 0, add as you go.

~~~python
total = 0
for m in masses:
    total += m
~~~

**Count**: start at 0, add 1 when a condition is True.

~~~python
count = 0
for m in masses:
    if m > 4000:
        count += 1
~~~

**Find the biggest**: remember the best so far, replace it when you find a bigger one.

~~~python
biggest = masses[0]      # the first item
for m in masses:
    if m > biggest:
        biggest = m
~~~

Python has built-in shortcuts (\`sum()\`, \`max()\`), which you'll use later. Writing them yourself first means you understand exactly what they do.
`,
        },
        {
          kind: 'code',
          id: 'm02-l5-total',
          prompt: 'Using a loop (not `sum()`), calculate the **total** mass of all the Adelie penguins in `masses`. Store it in `total` and print it.',
          setup: ADELIE_MASSES_SETUP,
          data: [PENGUINS_FILE],
          starter: '# masses is already loaded from the real dataset\n',
          solution: 'total = 0\nfor m in masses:\n    total += m\nprint(total)\n',
          tests: `assert total == sum(masses), "total should be all the masses added together."
assert "sum(" not in source, "Write the loop yourself this time, without sum()."
assert rerun(masses=[1, 2, 3])["total"] == 6, "Your loop should work for any list."`,
          hints: ['Start with total = 0.', 'In the loop: total += m'],
        },
        {
          kind: 'code',
          id: 'm02-l5-count',
          prompt: 'How many Adelie penguins weigh **more than 4000 g**? Count them with a loop, store the answer in `heavy_count`, and print it.',
          setup: ADELIE_MASSES_SETUP,
          data: [PENGUINS_FILE],
          starter: '# masses is already loaded\n',
          solution: 'heavy_count = 0\nfor m in masses:\n    if m > 4000:\n        heavy_count += 1\nprint(heavy_count)\n',
          tests: `expected = len([m for m in masses if m > 4000])
assert heavy_count == expected, f"heavy_count should be {expected}, but it is {heavy_count}."
assert rerun(masses=[4000, 4001, 3000, 5000])["heavy_count"] == 2, "Only count masses strictly greater than 4000."`,
          hints: ['Start with heavy_count = 0.', 'Inside the loop: if m > 4000: heavy_count += 1'],
          review: true,
        },
        {
          kind: 'code',
          id: 'm02-l5-max',
          prompt: 'Find the **heaviest** Adelie penguin\'s mass using the "find the biggest" pattern (not `max()`). Store it in `heaviest` and print it.',
          setup: ADELIE_MASSES_SETUP,
          data: [PENGUINS_FILE],
          starter: '# masses is already loaded\n',
          solution: 'heaviest = masses[0]\nfor m in masses:\n    if m > heaviest:\n        heaviest = m\nprint(heaviest)\n',
          tests: `assert heaviest == max(masses), "heaviest should be the largest mass in the list."
assert "max(" not in source, "Write the pattern yourself this time, without max()."
assert rerun(masses=[-5, -2, -9])["heaviest"] == -2, "Start from the first item (masses[0]), not 0, so it works even for negative numbers."`,
          hints: ['Start with heaviest = masses[0].', 'In the loop: if m > heaviest: heaviest = m'],
          review: true,
        },
        {
          kind: 'code',
          id: 'm02-l5-average',
          prompt: 'Calculate the **average** Adelie mass: add them up with a loop, and count them as you go. Store it in `average`, rounded to 1 decimal place, and print:\n\n`Average Adelie mass: ____ g`',
          setup: ADELIE_MASSES_SETUP,
          data: [PENGUINS_FILE],
          starter: '# masses is already loaded\n',
          solution: 'total = 0\ncount = 0\nfor m in masses:\n    total += m\n    count += 1\naverage = round(total / count, 1)\nprint(f"Average Adelie mass: {average} g")\n',
          tests: `want = round(sum(masses) / len(masses), 1)
assert average == want, f"average should be {want}, but it is {average}."
assert output.strip() == f"Average Adelie mass: {want} g", f"Print exactly: Average Adelie mass: {want} g"`,
          hints: ['Keep two variables, total and count, both starting at 0.', 'After the loop: average = round(total / count, 1)'],
          review: true,
        },
      ],
    },
  ],
};
