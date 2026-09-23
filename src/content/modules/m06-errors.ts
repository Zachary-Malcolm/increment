import type { Module } from '../types';

export const m06: Module = {
  id: 'm06',
  number: 6,
  title: 'Errors and debugging',
  blurb: 'Read error messages calmly, handle problems gracefully, and review code (including AI code).',
  lessons: [
    {
      id: 'm06-l1',
      title: 'Reading error messages',
      summary: 'A traceback is a map to the problem. Learn to read it.',
      steps: [
        {
          kind: 'read',
          md: `
## Errors are information

Every programmer sees errors all day. They aren't failures: they're Python telling you exactly what went wrong and where. A full error report is called a **traceback**:

~~~text
Traceback (most recent call last):
  File "analysis.py", line 7, in <module>
    average = total_mass(masses) / count
  File "analysis.py", line 3, in total_mass
    total += m
TypeError: unsupported operand type(s) for +=: 'int' and 'NoneType'
~~~

Read it **from the bottom up**:

1. **The last line** says what went wrong: a \`TypeError\`, adding an int and \`None\`
2. **The lines above** show where: line 3, inside \`total_mass\`, which was called from line 7
3. The most recent call is at the bottom, closest to the error

Here, one of the masses is \`None\` (a missing value), and adding it to a number fails.
`,
        },
        {
          kind: 'choice',
          id: 'm06-l1-which-line',
          question: 'In the traceback above, which line of code actually failed?',
          options: ['`average = total_mass(masses) / count` (line 7)', '`total += m` (line 3)', 'The first line of the file', 'It can\'t be known'],
          answer: 1,
          explain: 'The bottom-most code line is where the error happened. Line 7 is just where total_mass was called from.',
        },
        {
          kind: 'read',
          md: `
## Two kinds of error

- A **SyntaxError** means Python couldn't even read your code, so *nothing* ran. Look for missing brackets, quotes and colons, often on the line **before** the one reported.
- Other errors (**exceptions**) happen while the code runs, so the lines before them did run.

| Error | Usual cause |
|---|---|
| \`NameError\` | a typo in a name, or using a variable before creating it |
| \`TypeError\` | the wrong kind of value, e.g. \`"3" + 4\` or maths with \`None\` |
| \`ValueError\` | right type, bad value, e.g. \`int("three")\` |
| \`IndexError\` | a list position that doesn't exist |
| \`KeyError\` | a dictionary key that doesn't exist |
| \`AttributeError\` | a method the value doesn't have, e.g. \`[1, 2].upper()\` |
| \`ZeroDivisionError\` | dividing by zero, often an average of an empty list |
`,
        },
        {
          kind: 'choice',
          id: 'm06-l1-classify',
          question: '`int("3,750")` raises which error?',
          options: ['`TypeError`', '`ValueError`', '`SyntaxError`', '`NameError`'],
          answer: 1,
          explain: 'The type is right (a string can be converted to an int) but this particular value can\'t, because of the comma. That\'s a ValueError.',
        },
        {
          kind: 'code',
          id: 'm06-l1-fix',
          prompt: 'This code has **three** bugs that cause errors. Run it, read each error, fix it, and repeat until it prints the average mass.',
          starter: 'masses = [3750, 3800, 3250]\ntotal = 0\nfor m in masses\n    total += m\naverage = totl / len(masses)\nprint("Average: " + average)\n',
          solution: 'masses = [3750, 3800, 3250]\ntotal = 0\nfor m in masses:\n    total += m\naverage = total / len(masses)\nprint("Average: " + str(average))\n',
          tests: `assert output.strip() == "Average: 3600.0", f"It should print 'Average: 3600.0', but printed {output.strip()!r}."`,
          hints: [
            'First error: SyntaxError. A for line needs to end with a colon.',
            'Second: NameError. Check the spelling of total.',
            'Third: TypeError. You can\'t + a string and a number. Use str(average) or an f-string.',
          ],
          review: true,
        },
      ],
    },
    {
      id: 'm06-l2',
      title: 'try and except',
      summary: 'Handle problems you expect, instead of crashing.',
      steps: [
        {
          kind: 'read',
          md: `
## Catching errors

When a problem is **expected** (a user types a word instead of a number, a value is missing), you can handle it with \`try\` / \`except\`:

~~~python
text = "three"
try:
    number = int(text)
except ValueError:
    number = None
print(number)
~~~

~~~text
None
~~~

Python runs the \`try\` block. If a \`ValueError\` happens, it jumps to the \`except\` block instead of crashing.

**Always name the error you expect.** A bare \`except:\` catches *everything*, including typos in your own code, and hides real bugs.
`,
        },
        {
          kind: 'predict',
          id: 'm06-l2-flow',
          code: 'try:\n    print("A")\n    x = 1 / 0\n    print("B")\nexcept ZeroDivisionError:\n    print("C")\nprint("D")\n',
          options: ['A\nC\nD', 'A\nB\nC\nD', 'A\nD', 'C\nD'],
          answer: 0,
          explain: '"A" prints, then 1 / 0 fails, so Python skips the rest of the try block ("B") and runs the except block ("C"). Then it carries on ("D").',
        },
        {
          kind: 'code',
          id: 'm06-l2-safe-int',
          prompt: 'Define `safe_int(text)` that returns `int(text)`, or `None` if the text can\'t be converted. Catch **only** `ValueError`.',
          starter: '',
          solution: 'def safe_int(text):\n    try:\n        return int(text)\n    except ValueError:\n        return None\n',
          tests: `assert safe_int("3750") == 3750, "safe_int('3750') should return 3750."
assert safe_int("three") is None, "safe_int('three') should return None."
assert safe_int("") is None, "safe_int('') should return None."
assert "except ValueError" in source, "Catch the specific error: except ValueError:"`,
          hints: ['Put return int(text) inside try:', 'Then except ValueError: return None'],
          review: true,
        },
        {
          kind: 'read',
          md: `
## else and finally

~~~python
try:
    value = int(text)
except ValueError:
    print("Not a number")
else:
    print("Converted fine")    # only if no error happened
finally:
    print("Checked", text)      # always runs, error or not
~~~

- \`else\` runs only if the \`try\` block succeeded
- \`finally\` always runs, which is useful for tidying up (closing files, for example)
- you can have several \`except\` blocks for different errors
`,
        },
        {
          kind: 'code',
          id: 'm06-l2-average',
          prompt: '`readings` is a list of text values from a sensor. Some are broken. Calculate `average`: the mean of the readings that **can** be converted with `float()`, and count the broken ones in `bad_count`.',
          setup: 'readings = ["12.5", "13.1", "error", "12.9", "", "13.3", "n/a"]\n',
          starter: '# readings is already set:\n# ["12.5", "13.1", "error", "12.9", "", "13.3", "n/a"]\n',
          solution: 'good = []\nbad_count = 0\nfor r in readings:\n    try:\n        good.append(float(r))\n    except ValueError:\n        bad_count += 1\naverage = sum(good) / len(good)\n',
          tests: `assert bad_count == 3, f"There are 3 broken readings, but bad_count is {bad_count}."
assert abs(average - 12.95) < 1e-9, f"The average of the good readings is 12.95, but you got {average}."
other = rerun(readings=["1", "x", "3"])
assert other["bad_count"] == 1 and other["average"] == 2, "Your code should work for any list of readings."`,
          hints: ['Loop over readings, and try to float() each one.', 'In except ValueError:, add 1 to bad_count. Otherwise append the float to a list of good values.'],
        },
      ],
    },
    {
      id: 'm06-l3',
      title: 'Raising errors',
      summary: 'Stop bad data early with clear error messages of your own.',
      steps: [
        {
          kind: 'read',
          md: `
## Fail loudly, fail early

Sometimes the right response to bad input is to **stop** with a clear message, rather than carry on and produce a wrong answer. Use \`raise\`:

~~~python
def to_kg(mass_g):
    if mass_g < 0:
        raise ValueError(f"mass can't be negative, got {mass_g}")
    return mass_g / 1000
~~~

A wrong number that looks right is the most dangerous bug in data science. An error message is much better than a quietly wrong result.

\`assert\` is a quick check for things that should never happen:

~~~python
assert len(masses) > 0, "masses is empty"
~~~

Use \`raise\` to reject bad input from users or data; use \`assert\` for your own sanity checks while developing.
`,
        },
        {
          kind: 'code',
          id: 'm06-l3-validate',
          prompt: 'Define `validate_mass(mass_g)` that returns the mass if it is between 2000 and 7000 (inclusive), and otherwise **raises** a `ValueError` with a message that includes the bad value.',
          starter: '',
          solution: 'def validate_mass(mass_g):\n    if mass_g < 2000 or mass_g > 7000:\n        raise ValueError(f"implausible penguin mass: {mass_g}")\n    return mass_g\n',
          tests: `assert validate_mass(3750) == 3750, "A normal mass should be returned unchanged."
assert validate_mass(2000) == 2000 and validate_mass(7000) == 7000, "2000 and 7000 are allowed."
for bad in [37500, -5, 1999]:
    try:
        validate_mass(bad)
    except ValueError as e:
        assert str(bad) in str(e), f"Include the bad value in the message, e.g. f'implausible mass: {{mass_g}}'."
    else:
        raise AssertionError(f"validate_mass({bad}) should raise a ValueError.")`,
          hints: ['Check if mass_g < 2000 or mass_g > 7000:', 'raise ValueError(f"implausible penguin mass: {mass_g}")'],
          review: true,
        },
        {
          kind: 'predict',
          id: 'm06-l3-catch-own',
          code: 'def check(x):\n    if x < 0:\n        raise ValueError("negative")\n    return x\n\nfor value in [5, -1, 7]:\n    try:\n        print(check(value))\n    except ValueError as e:\n        print("skipped:", e)\n',
          options: ['5\nskipped: negative\n7', '5\n-1\n7', '5\nskipped: negative', 'skipped: negative'],
          answer: 0,
          explain: 'check(-1) raises, the except block prints the message, and the loop carries on with 7.',
        },
        {
          kind: 'choice',
          id: 'm06-l3-why',
          question: 'A function gets a penguin mass of `37500` (someone added an extra zero). What\'s the best behaviour?',
          options: [
            'Quietly use it: the analysis must go on',
            'Quietly replace it with 0',
            'Raise a clear error (or flag it), so a person can check the data',
            'Delete the whole dataset',
          ],
          answer: 2,
          explain: 'Silently using or changing bad values produces results that look right but aren\'t. Surfacing the problem lets someone decide what the true value is.',
        },
      ],
    },
    {
      id: 'm06-l4',
      title: 'A debugging method',
      summary: 'When the code runs but the answer is wrong.',
      steps: [
        {
          kind: 'read',
          md: `
## The hardest bugs don't crash

Code that crashes tells you where to look. Code that runs and gives a **wrong answer** doesn't. Use a method:

1. **Reproduce it** with the smallest input that goes wrong, e.g. \`[1, 2, 3]\` instead of 344 penguins
2. **Predict** what should happen at each step (work it out by hand)
3. **Print** what actually happens: \`print("i =", i, "total =", total)\`
4. **Find the first place** reality and your prediction differ. The bug is just before it
5. **Fix it, then test** with a few inputs, including edge cases: empty lists, one item, negatives, \`None\`

Explaining your code line by line out loud (to a colleague, or a rubber duck) finds a surprising number of bugs.
`,
        },
        {
          kind: 'code',
          id: 'm06-l4-debug-median',
          prompt: 'This `median` function runs without errors, but gives wrong answers. Test it with small lists, find the bug(s), and fix it.\n\nIt should return the middle value of the sorted list, or the average of the two middle values for an even count.',
          starter: 'def median(values):\n    ordered = sorted(values)\n    middle = len(ordered) // 2\n    if len(ordered) % 2 == 1:\n        return ordered[middle]\n    return (ordered[middle] + ordered[middle + 1]) / 2\n\nprint(median([1, 2, 3, 4]))  # should print 2.5\n',
          solution: 'def median(values):\n    ordered = sorted(values)\n    middle = len(ordered) // 2\n    if len(ordered) % 2 == 1:\n        return ordered[middle]\n    return (ordered[middle - 1] + ordered[middle]) / 2\n\nprint(median([1, 2, 3, 4]))  # should print 2.5\n',
          tests: `assert median([1, 2, 3, 4]) == 2.5, f"median([1, 2, 3, 4]) should be 2.5, got {median([1, 2, 3, 4])}."
assert median([10, 20]) == 15, "median([10, 20]) should be 15."
assert median([3, 1, 2]) == 2, "median([3, 1, 2]) should be 2."`,
          hints: [
            'For [1, 2, 3, 4], middle is 4 // 2 = 2. Which positions hold the two middle values, 2 and 3?',
            'The two middle values are at middle - 1 and middle.',
          ],
          review: true,
        },
        {
          kind: 'choice',
          id: 'm06-l4-edge',
          question: 'You wrote `average(values)`. Which test input is **most** likely to reveal a bug you haven\'t thought about?',
          options: ['`[1, 2, 3]`', '`[10, 20, 30]`', '`[]` (an empty list)', '`[5, 5, 5]`'],
          answer: 2,
          explain: 'Edge cases like an empty list (which would divide by zero) are where bugs hide. Ordinary inputs usually work.',
        },
      ],
    },
    {
      id: 'm06-l5',
      title: 'Reviewing AI code',
      summary: 'AI assistants write plausible code. Learn to check it like a professional.',
      steps: [
        {
          kind: 'read',
          md: `
## Plausible isn't the same as correct

AI coding assistants are brilliant at producing code that **looks** right. It usually is mostly right, which is exactly why its mistakes slip through. Your value is being the person who checks.

A review checklist:

1. **Does it do what was asked?** Read the task again, then the code
2. **Edge cases:** empty inputs, a single item, missing values (\`None\`/\`NaN\`), zeros, negatives
3. **Off-by-one:** \`range\` stops, slices, \`<\` versus \`<=\`
4. **Types:** text that should be numbers, integer division, float comparisons
5. **Side effects:** does it change a list it was given? Does it print instead of return?
6. **Test it:** run it on a tiny input where you know the right answer

This is what the daily **Puzzles** train. Here's a longer example.
`,
        },
        {
          kind: 'code',
          id: 'm06-l5-review',
          prompt: `You asked an AI: *"Write a function \`heavy_share(masses, threshold)\` that returns the percentage of masses above the threshold, rounded to 1 decimal place. Ignore missing values (None). Return 0.0 for an empty list."*

It wrote the code in the editor. It has **three** bugs. Review it against the checklist, then fix it.`,
          starter: 'def heavy_share(masses, threshold):\n    count = 0\n    for m in masses:\n        if m >= threshold:\n            count += 1\n    return round(count / len(masses) * 100, 1)\n',
          solution: 'def heavy_share(masses, threshold):\n    known = [m for m in masses if m is not None]\n    if len(known) == 0:\n        return 0.0\n    count = 0\n    for m in known:\n        if m > threshold:\n            count += 1\n    return round(count / len(known) * 100, 1)\n',
          tests: `assert heavy_share([3000, 5000, 6000, 4000], 4500) == 50.0, "Two of four masses are above 4500, so the answer is 50.0."
assert heavy_share([4500, 5000], 4500) == 50.0, "'Above the threshold' means strictly greater: 4500 isn't above 4500."
assert heavy_share([5000, None, 3000, None], 4000) == 50.0, "Ignore None values: they shouldn't crash the function or count in the total."
assert heavy_share([], 4000) == 0.0, "An empty list should return 0.0 instead of dividing by zero."
assert heavy_share([None, None], 4000) == 0.0, "A list with only missing values should return 0.0 too."`,
          hints: [
            'Bug 1: "above" means >, not >=.',
            'Bug 2: None values crash the comparison. Filter them out first: known = [m for m in masses if m is not None] (or build the list with a loop).',
            'Bug 3: an empty list (or only Nones) divides by zero. Return 0.0 early. And divide by the number of known values, not len(masses).',
          ],
          review: true,
        },
        {
          kind: 'choice',
          id: 'm06-l5-trust',
          question: 'An AI gives you a function and says "This is correct and handles all edge cases." What should you do?',
          options: [
            'Trust it: it said so',
            'Test it yourself on small inputs where you know the answer, including edge cases',
            'Ask it again, and trust the second answer',
            'Rewrite it from scratch every time',
          ],
          answer: 1,
          explain: 'An AI\'s confidence isn\'t evidence. A few quick tests with known answers are.',
        },
      ],
    },
  ],
};
