import type { Module } from '../types';
import { ADELIE_MASSES_SETUP, PENGUINS_FILE } from '../datasets';

export const m04: Module = {
  id: 'm04',
  number: 4,
  title: 'Functions',
  blurb: 'Package code into reusable tools, and build your own statistics toolkit.',
  lessons: [
    {
      id: 'm04-l1',
      title: 'Your first function',
      summary: 'Name a block of code so you can run it whenever you like.',
      steps: [
        {
          kind: 'read',
          md: `
## Why functions?

You've already used lots of functions: \`print()\`, \`len()\`, \`round()\`, \`sorted()\`. A **function** is a named block of code you can run (or **call**) whenever you need it.

You can write your own with \`def\`:

~~~python
def say_hello():
    print("Hello from a function!")

say_hello()
say_hello()
~~~

~~~text
Hello from a function!
Hello from a function!
~~~

- \`def\` starts the definition, followed by the name, brackets and a colon
- the indented lines are the function's **body**
- defining a function does **not** run it. Calling it, with brackets, does
`,
        },
        {
          kind: 'predict',
          id: 'm04-l1-not-called',
          code: 'def greet():\n    print("Hi!")\n\nprint("Start")\n',
          options: ['Start', 'Hi!\nStart', 'Start\nHi!', 'Nothing'],
          answer: 0,
          explain: 'greet is defined but never called, so its body never runs.',
        },
        {
          kind: 'code',
          id: 'm04-l1-define',
          prompt: 'Define a function called `welcome` that prints `Welcome to Increment!`. Then call it **twice**.',
          starter: '',
          solution: 'def welcome():\n    print("Welcome to Increment!")\n\nwelcome()\nwelcome()\n',
          tests: `assert callable(welcome), "welcome should be a function (use def)."
assert lines == ["Welcome to Increment!", "Welcome to Increment!"], f"Calling it twice should print the message twice, but got {lines}."`,
          hints: ['Start with: def welcome():', 'Indent the print, then call it with welcome() on two separate lines.'],
        },
        {
          kind: 'read',
          md: `
## Giving functions inputs

Put names inside the brackets to accept **parameters**: values the caller passes in.

~~~python
def describe(species, mass_g):
    print(f"A {species} weighing {mass_g} g")

describe("Adelie", 3750)
describe("Gentoo", 5000)
~~~

~~~text
A Adelie weighing 3750 g
A Gentoo weighing 5000 g
~~~

The values you pass in (\`"Adelie"\`, \`3750\`) are called **arguments**. They're matched to parameters in order.
`,
        },
        {
          kind: 'code',
          id: 'm04-l1-params',
          prompt: 'Define `shout(word)` that prints the word in capitals followed by `!`. For example `shout("penguin")` prints `PENGUIN!`.',
          starter: '',
          solution: 'def shout(word):\n    print(word.upper() + "!")\n',
          tests: `assert printed(shout, "penguin") == ["PENGUIN!"], f"shout('penguin') should print PENGUIN! but printed {printed(shout, 'penguin')}"
assert printed(shout, "dream") == ["DREAM!"], "shout('dream') should print DREAM!"`,
          hints: ['word.upper() gives the capitals.', 'print(word.upper() + "!")'],
          review: true,
        },
      ],
    },
    {
      id: 'm04-l2',
      title: 'Returning values',
      summary: 'Send an answer back from a function with return.',
      steps: [
        {
          kind: 'read',
          md: `
## print shows, return gives back

Most useful functions **calculate** something and hand the answer back with \`return\`:

~~~python
def to_kg(mass_g):
    return mass_g / 1000

heavy = to_kg(5000)
print(heavy + 1)
~~~

~~~text
6.0
~~~

The caller can store, print or keep calculating with a returned value. A \`print\` inside a function only shows text on screen: the caller gets nothing back.

\`return\` also **ends the function** immediately.
`,
        },
        {
          kind: 'predict',
          id: 'm04-l2-none',
          code: 'def double(x):\n    print(x * 2)\n\nresult = double(4)\nprint(result)\n',
          options: ['8\nNone', '8\n8', '8', 'None'],
          answer: 0,
          explain: 'double prints 8, but has no return, so it gives back None. result is None.',
        },
        {
          kind: 'code',
          id: 'm04-l2-to-kg',
          prompt: 'Define `to_kg(mass_g)` that **returns** the mass converted to kilograms. Don\'t print inside the function.',
          starter: 'def to_kg(mass_g):\n    pass  # replace this line\n',
          solution: 'def to_kg(mass_g):\n    return mass_g / 1000\n',
          tests: `assert to_kg(3750) == 3.75, f"to_kg(3750) should return 3.75, but returned {to_kg(3750)!r}."
assert to_kg(0) == 0, "to_kg(0) should return 0."
assert output == "", "Return the value instead of printing it."`,
          hints: ['Use return, not print.', 'return mass_g / 1000'],
          review: true,
        },
        {
          kind: 'code',
          id: 'm04-l2-is-heavy',
          prompt: 'Define `is_heavy(mass_g)` that returns `True` if the mass is **over 4500 g** and `False` otherwise.',
          starter: '',
          solution: 'def is_heavy(mass_g):\n    return mass_g > 4500\n',
          tests: `assert is_heavy(5000) is True, "is_heavy(5000) should be True."
assert is_heavy(4500) is False, "is_heavy(4500) should be False (not over 4500)."
assert is_heavy(3000) is False, "is_heavy(3000) should be False."`,
          hints: ['A comparison is already True or False, so you can return it directly.', 'return mass_g > 4500'],
          review: true,
        },
        {
          kind: 'read',
          md: `
## Returning early

A function can have several \`return\` statements. The first one reached ends the function:

~~~python
def size(mass_g):
    if mass_g < 3500:
        return "small"
    if mass_g < 4500:
        return "medium"
    return "large"
~~~

Once \`"small"\` is returned, the lines below never run, so no \`elif\` is needed.
`,
        },
        {
          kind: 'code',
          id: 'm04-l2-grade',
          prompt: 'Define `grade(score)` that returns `"A"` for 70 or more, `"B"` for 60 or more, `"C"` for 50 or more, and `"Fail"` otherwise.',
          starter: '',
          solution: 'def grade(score):\n    if score >= 70:\n        return "A"\n    if score >= 60:\n        return "B"\n    if score >= 50:\n        return "C"\n    return "Fail"\n',
          tests: `for score, want in [(85, "A"), (70, "A"), (69, "B"), (60, "B"), (55, "C"), (50, "C"), (49, "Fail"), (0, "Fail")]:
    got = grade(score)
    assert got == want, f"grade({score}) should return {want!r}, but returned {got!r}."`,
          hints: ['Check the highest band first.', 'Each band can be: if score >= 70: return "A"'],
        },
      ],
    },
    {
      id: 'm04-l3',
      title: 'Defaults and keywords',
      summary: 'Make parameters optional and calls easier to read.',
      steps: [
        {
          kind: 'read',
          md: `
## Default values

Give a parameter a **default** with \`=\`. Callers can leave it out:

~~~python
def convert(mass_g, unit="kg"):
    if unit == "kg":
        return mass_g / 1000
    return mass_g / 453.6   # pounds

print(convert(3750))
print(convert(3750, "lb"))
~~~

~~~text
3.75
8.267195767195767
~~~

Parameters with defaults must come **after** those without.

## Keyword arguments

You can name arguments when calling. Then the order doesn't matter, and the call explains itself:

~~~python
convert(unit="lb", mass_g=3750)
round(3.14159, ndigits=2)
~~~
`,
        },
        {
          kind: 'predict',
          id: 'm04-l3-defaults',
          code: 'def label(name, prefix="Dr"):\n    return f"{prefix} {name}"\n\nprint(label("Gorman"))\nprint(label("Fraser", prefix="Prof"))\n',
          options: ['Dr Gorman\nProf Fraser', 'Dr Gorman\nDr Fraser', 'Gorman\nFraser', 'An error'],
          answer: 0,
          explain: 'The first call uses the default "Dr"; the second overrides it with the keyword argument prefix="Prof".',
        },
        {
          kind: 'code',
          id: 'm04-l3-round-to',
          prompt: 'Define `percent(part, whole, decimals=1)` that returns `part / whole * 100` rounded to `decimals` places.\n\n`percent(1, 3)` should return `33.3` and `percent(1, 3, decimals=3)` should return `33.333`.',
          starter: '',
          solution: 'def percent(part, whole, decimals=1):\n    return round(part / whole * 100, decimals)\n',
          tests: `assert percent(1, 3) == 33.3, f"percent(1, 3) should be 33.3, but got {percent(1, 3)!r}."
assert percent(1, 3, decimals=3) == 33.333, "percent(1, 3, decimals=3) should be 33.333."
assert percent(68, 344, 0) == 20.0, "percent(68, 344, 0) should be 20.0."`,
          hints: ['Put decimals=1 in the brackets of the def line.', 'return round(part / whole * 100, decimals)'],
          review: true,
        },
        {
          kind: 'choice',
          id: 'm04-l3-order',
          question: 'Which function definition is **not** allowed?',
          options: ['`def f(a, b=2):`', '`def f(a=1, b=2):`', '`def f(a=1, b):`', '`def f(a, b):`'],
          answer: 2,
          explain: 'A parameter without a default (b) can\'t come after one with a default (a=1), because Python couldn\'t tell which argument goes where.',
        },
        {
          kind: 'code',
          id: 'm04-l3-describe',
          prompt: 'Define `describe(species, mass_g, island="unknown")` that returns a string like `Adelie, 3750 g, from Torgersen`.\n\nWhen no island is given it should say `from unknown`.',
          starter: '',
          solution: 'def describe(species, mass_g, island="unknown"):\n    return f"{species}, {mass_g} g, from {island}"\n',
          tests: `assert describe("Adelie", 3750, "Torgersen") == "Adelie, 3750 g, from Torgersen", f"Got {describe('Adelie', 3750, 'Torgersen')!r}"
assert describe("Gentoo", 5000) == "Gentoo, 5000 g, from unknown", "Without an island it should say 'from unknown'."
assert describe(island="Dream", species="Chinstrap", mass_g=3500) == "Chinstrap, 3500 g, from Dream", "It should work with keyword arguments too."`,
          hints: ['island="unknown" goes last in the def line.', 'Return an f-string: f"{species}, {mass_g} g, from {island}"'],
        },
      ],
    },
    {
      id: 'm04-l4',
      title: 'Scope, docstrings and type hints',
      summary: 'Where variables live, and how to document your functions.',
      steps: [
        {
          kind: 'read',
          md: `
## Scope: what a function can see

Variables created **inside** a function are **local**: they exist only while it runs.

~~~python
def total_mass(masses):
    total = 0
    for m in masses:
        total += m
    return total

print(total_mass([1, 2, 3]))
print(total)   # NameError: total only existed inside the function
~~~

This is a good thing: functions can't accidentally mess up each other's variables. Pass values in as arguments and get results out with \`return\`, rather than relying on variables from outside.
`,
        },
        {
          kind: 'predict',
          id: 'm04-l4-scope',
          code: 'x = 10\n\ndef change():\n    x = 99\n    return x\n\nprint(change())\nprint(x)\n',
          options: ['99\n10', '99\n99', '10\n10', 'An error'],
          answer: 0,
          explain: 'The x inside change() is a new local variable. The x outside is untouched, so it is still 10.',
        },
        {
          kind: 'read',
          md: `
## Docstrings and type hints

Good functions explain themselves. A **docstring** is a string on the first line of the body. **Type hints** say what types you expect:

~~~python
def to_kg(mass_g: float) -> float:
    """Convert a mass in grams to kilograms."""
    return mass_g / 1000
~~~

- \`mass_g: float\` means "mass_g should be a number"
- \`-> float\` means "this returns a number"
- Python doesn't enforce hints, but editors, AI tools and teammates use them

\`help(to_kg)\` shows the docstring. Professional data code almost always has both.
`,
        },
        {
          kind: 'code',
          id: 'm04-l4-docstring',
          prompt: 'Define `bill_ratio(length_mm: float, depth_mm: float) -> float` that returns length divided by depth, rounded to 2 decimal places.\n\nGive it a docstring, and use the type hints shown.',
          starter: '',
          solution: 'def bill_ratio(length_mm: float, depth_mm: float) -> float:\n    """Return bill length divided by bill depth, to 2 decimal places."""\n    return round(length_mm / depth_mm, 2)\n',
          tests: `assert bill_ratio(39.1, 18.7) == 2.09, f"bill_ratio(39.1, 18.7) should be 2.09, but got {bill_ratio(39.1, 18.7)!r}."
assert bill_ratio.__doc__ and bill_ratio.__doc__.strip(), "Add a docstring: a string on the first line of the function body."
hints = bill_ratio.__annotations__
assert hints.get("length_mm") is float and hints.get("depth_mm") is float and hints.get("return") is float, "Add the type hints: length_mm: float, depth_mm: float, and -> float."`,
          hints: ['The first line is: def bill_ratio(length_mm: float, depth_mm: float) -> float:', 'The docstring goes straight after, in triple quotes: """..."""'],
        },
        {
          kind: 'choice',
          id: 'm04-l4-why-return',
          question: 'Why is it better for a function to use its parameters and `return`, rather than reading and changing variables from outside it?',
          options: [
            'It makes the code run faster',
            'The function becomes self-contained: easy to test, reuse and trust',
            'Python doesn\'t allow reading outside variables',
            'It uses less memory',
          ],
          answer: 1,
          explain: 'A function that only depends on its inputs always gives the same output for the same inputs. You can test it on its own and reuse it anywhere.',
        },
      ],
    },
    {
      id: 'm04-l5',
      title: 'Project: your statistics toolkit',
      summary: 'Write mean, median and a summary function, then use them on real data.',
      steps: [
        {
          kind: 'read',
          md: `
## Build tools you'll use forever

You're going to write three functions that every data scientist needs, then run them on the masses of every Adelie penguin.

- **mean**: the total divided by the count
- **median**: the middle value once sorted. With an even number of values, it's the average of the middle two
- **summary**: a dictionary of the key statistics

Later, libraries like pandas will do this for you. Writing them yourself means you'll understand exactly what those libraries calculate.
`,
        },
        {
          kind: 'code',
          id: 'm04-l5-mean',
          prompt: 'Define `mean(values)` that returns the average of a list of numbers. If the list is empty, return `None`.',
          starter: 'def mean(values):\n    pass\n',
          solution: 'def mean(values):\n    if len(values) == 0:\n        return None\n    return sum(values) / len(values)\n',
          tests: `assert mean([1, 2, 3, 4]) == 2.5, f"mean([1, 2, 3, 4]) should be 2.5, got {mean([1, 2, 3, 4])!r}."
assert mean([5]) == 5, "mean([5]) should be 5."
assert mean([]) is None, "mean([]) should return None instead of crashing."`,
          hints: ['Check for an empty list first: if len(values) == 0: return None', 'return sum(values) / len(values)'],
          review: true,
        },
        {
          kind: 'code',
          id: 'm04-l5-median',
          prompt: 'Define `median(values)` that returns the middle value of a list of numbers (it may not be sorted).\n\n- odd count: the middle value once sorted\n- even count: the average of the two middle values',
          starter: 'def median(values):\n    pass\n',
          solution: 'def median(values):\n    ordered = sorted(values)\n    n = len(ordered)\n    middle = n // 2\n    if n % 2 == 1:\n        return ordered[middle]\n    return (ordered[middle - 1] + ordered[middle]) / 2\n',
          tests: `assert median([3, 1, 2]) == 2, f"median([3, 1, 2]) should be 2, got {median([3, 1, 2])!r}."
assert median([4, 1, 3, 2]) == 2.5, f"median([4, 1, 3, 2]) should be 2.5, got {median([4, 1, 3, 2])!r}."
assert median([7]) == 7, "median([7]) should be 7."
data = [5, 3, 9]
median(data)
assert data == [5, 3, 9], "Don't change the list you were given. Use sorted(), which makes a new list."`,
          hints: [
            'Sort a copy first: ordered = sorted(values)',
            'The middle index is len(ordered) // 2. Use % 2 to check for an odd count.',
            'For an even count, average ordered[middle - 1] and ordered[middle].',
          ],
          review: true,
        },
        {
          kind: 'code',
          id: 'm04-l5-summary',
          prompt: `Your \`mean\` and \`median\` functions are provided. Define \`summary(values)\` that returns a dictionary with keys \`"count"\`, \`"mean"\`, \`"median"\`, \`"min"\` and \`"max"\`, with the mean rounded to 1 decimal place.

Then print \`summary(masses)\`, where \`masses\` holds the mass of every Adelie penguin.`,
          setup: `${ADELIE_MASSES_SETUP}
def mean(values):
    if len(values) == 0:
        return None
    return sum(values) / len(values)

def median(values):
    ordered = sorted(values)
    n = len(ordered)
    middle = n // 2
    if n % 2 == 1:
        return ordered[middle]
    return (ordered[middle - 1] + ordered[middle]) / 2
`,
          data: [PENGUINS_FILE],
          starter: '# mean(), median() and masses are ready to use\n',
          solution: 'def summary(values):\n    return {\n        "count": len(values),\n        "mean": round(mean(values), 1),\n        "median": median(values),\n        "min": min(values),\n        "max": max(values),\n    }\n\nprint(summary(masses))\n',
          tests: `s = summary([1, 2, 3, 10])
assert s == {"count": 4, "mean": 4.0, "median": 2.5, "min": 1, "max": 10}, f"summary([1, 2, 3, 10]) gave {s}"
real = summary(masses)
assert real["count"] == len(masses) and real["max"] == max(masses), "Check your summary of the real data."
assert str(real["count"]) in output, "Print summary(masses)."`,
          hints: ['Return a dictionary literal: {"count": len(values), ...}', 'Use your mean() and median() functions inside summary().'],
        },
      ],
    },
  ],
};
