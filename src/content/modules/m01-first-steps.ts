import type { Module } from '../types';

// Markdown note: code fences use ~~~ so backticks are only needed (escaped) for inline code.

export const m01: Module = {
  id: 'm01',
  number: 1,
  title: 'First steps',
  blurb: 'Printing, numbers, variables and text. The building blocks of every program.',
  lessons: [
    {
      id: 'm01-l1',
      title: 'Hello, Python',
      summary: 'Run your first line of code and make Python talk.',
      steps: [
        {
          kind: 'read',
          md: `
## Your first instruction

A program is a list of instructions. Python reads them **from top to bottom**, one line at a time.

The most useful instruction to start with is \`print()\`. Whatever you put inside the brackets is shown on the screen:

~~~python
print("Hello, world!")
~~~

~~~text
Hello, world!
~~~

Text inside quotes is called a **string**. The quotes tell Python "this is text, not an instruction".
`,
        },
        {
          kind: 'code',
          id: 'm01-l1-hello',
          prompt: 'Print exactly this: `Hello, world!`\n\nPress **Run** to try your code, then **Check** when you are happy with it.',
          starter: '# Write your code below this line\n',
          solution: 'print("Hello, world!")\n',
          tests: `assert output.strip() == "Hello, world!", "Print exactly: Hello, world! (capital H, a comma, and an exclamation mark)"`,
          hints: [
            'Use print() with the text inside quotes.',
            'It should look like: print("...") with the words inside the quotes.',
          ],
        },
        {
          kind: 'read',
          md: `
## One line at a time

Each \`print()\` shows its value on a new line:

~~~python
print("Small enough to remember.")
print("Hard enough to grow.")
~~~

~~~text
Small enough to remember.
Hard enough to grow.
~~~

A line starting with \`#\` is a **comment**. Python ignores it completely. Comments are notes for humans:

~~~python
# This line does nothing
print("This line runs")
~~~
`,
        },
        {
          kind: 'predict',
          id: 'm01-l1-comment',
          code: 'print("one")\n# print("two")\nprint("three")\n',
          options: ['one\nthree', 'one\ntwo\nthree', 'three', 'one'],
          answer: 0,
          explain: 'The middle line starts with #, so it is a comment and Python skips it.',
        },
        {
          kind: 'code',
          id: 'm01-l1-two-lines',
          prompt: `Print these two lines, in this order:

~~~text
I'm learning Python
One step at a time
~~~

The first line contains an apostrophe, so wrap that string in **double quotes**: \`"I'm ..."\`.`,
          starter: '',
          solution: 'print("I\'m learning Python")\nprint("One step at a time")\n',
          tests: `assert len(lines) == 2, f"Expected 2 lines of output, but got {len(lines)}."
assert lines[0] == "I'm learning Python", "Check the first line, including the apostrophe in I'm."
assert lines[1] == "One step at a time", "Check the second line: One step at a time"`,
          hints: [
            'You need two print() lines.',
            'print("I\'m learning Python") works because the apostrophe is inside double quotes.',
          ],
        },
        {
          kind: 'choice',
          id: 'm01-l1-which-print',
          question: 'Which line prints the word **Python**?',
          options: ['`print(Python)`', '`print("Python")`', '`Print("Python")`', '`print "Python"`'],
          answer: 1,
          explain: 'Text needs quotes, print is all lowercase (Python is case-sensitive), and the value goes inside brackets.',
        },
        {
          kind: 'read',
          md: `
## Numbers and commas

\`print()\` can show numbers too. Numbers don't need quotes:

~~~python
print(42)
~~~

You can print several values at once by separating them with commas. Python puts a space between them:

~~~python
print("Penguins counted:", 344)
~~~

~~~text
Penguins counted: 344
~~~
`,
        },
        {
          kind: 'code',
          id: 'm01-l1-comma',
          prompt: 'Using **one** `print()` with a comma, print: `Days in a week: 7`\n\nWrite the 7 as a number, not inside the quotes.',
          starter: '',
          solution: 'print("Days in a week:", 7)\n',
          tests: `assert output.strip() == "Days in a week: 7", "The output should be exactly: Days in a week: 7"
assert source.count("print") == 1, "Use a single print()."
assert "," in source, "Separate the text and the number with a comma inside print()."`,
          hints: ['print("Days in a week:", 7)... the comma adds the space for you.'],
          review: true,
        },
      ],
    },
    {
      id: 'm01-l2',
      title: 'Numbers and maths',
      summary: 'Use Python as a very powerful calculator.',
      steps: [
        {
          kind: 'read',
          md: `
## Python can calculate

| Symbol | Meaning | Example | Result |
|---|---|---|---|
| \`+\` | add | \`3 + 2\` | \`5\` |
| \`-\` | subtract | \`3 - 2\` | \`1\` |
| \`*\` | multiply | \`3 * 2\` | \`6\` |
| \`/\` | divide | \`3 / 2\` | \`1.5\` |
| \`**\` | power | \`3 ** 2\` | \`9\` |

Put a calculation inside \`print()\` and Python shows the answer:

~~~python
print(365 * 24)
~~~

~~~text
8760
~~~

Whole numbers like \`8760\` are called **integers**. Numbers with a decimal point like \`1.5\` are called **floats**. Dividing with \`/\` always gives a float, even when it divides exactly.
`,
        },
        {
          kind: 'predict',
          id: 'm01-l2-divide',
          code: 'print(8 / 2)\n',
          options: ['4', '4.0', '4.00', '8/2'],
          answer: 1,
          explain: 'Division with / always produces a float, so the answer is 4.0 rather than 4.',
        },
        {
          kind: 'read',
          md: `
## Whole-number division and remainders

Two more operators are very useful with real data:

- \`//\` divides and **rounds down** to a whole number
- \`%\` gives the **remainder** after dividing

~~~python
print(130 // 60)  # how many whole hours in 130 minutes?
print(130 % 60)   # how many minutes left over?
~~~

~~~text
2
10
~~~
`,
        },
        {
          kind: 'predict',
          id: 'm01-l2-remainder',
          code: 'print(17 % 5)\n',
          options: ['3', '2', '3.4', '12'],
          answer: 1,
          explain: '5 goes into 17 three times (15), leaving a remainder of 2.',
        },
        {
          kind: 'code',
          id: 'm01-l2-hours',
          prompt: `A research trip lasted **125 minutes**. Using \`//\` and \`%\`, print:

1. the number of whole hours, then
2. the minutes left over

Each on its own line. Let Python do the maths: don't type the answers yourself.`,
          starter: '',
          solution: 'print(125 // 60)\nprint(125 % 60)\n',
          tests: `assert lines == ["2", "5"], "Expected 2 on the first line and 5 on the second."
assert "//" in source and "%" in source, "Use // for the hours and % for the minutes."`,
          hints: ['125 // 60 gives the hours.', '125 % 60 gives the minutes left over.'],
          review: true,
        },
        {
          kind: 'read',
          md: `
## Order matters

Python follows the same order as maths at school: brackets first, then powers, then \`*\` and \`/\`, then \`+\` and \`-\`.

~~~python
print(2 + 3 * 4)    # 3 * 4 happens first
print((2 + 3) * 4)  # brackets happen first
~~~

~~~text
14
20
~~~

When in doubt, add brackets. They make your intent clear to anyone reading.
`,
        },
        {
          kind: 'predict',
          id: 'm01-l2-order',
          code: 'print(10 - 2 * 3)\n',
          options: ['24', '4', '6', '-4'],
          answer: 1,
          explain: '2 * 3 is worked out first (6), then 10 - 6 = 4.',
        },
        {
          kind: 'code',
          id: 'm01-l2-average',
          prompt: `The first three penguins in our real dataset weigh **3750 g**, **3800 g** and **3250 g**.

Print their **average** weight: add them up, then divide by 3. You'll need brackets.`,
          starter: '',
          solution: 'print((3750 + 3800 + 3250) / 3)\n',
          tests: `assert output.strip() == "3600.0", "The average should come out as 3600.0. Did you put the addition in brackets?"
assert "(" in source.replace("print(", "", 1), "Use brackets so the adding happens before the dividing."`,
          hints: [
            'Without brackets, only the last number gets divided by 3.',
            'print((3750 + 3800 + 3250) / 3)',
          ],
          review: true,
        },
      ],
    },
    {
      id: 'm01-l3',
      title: 'Variables',
      summary: 'Give values names so you can reuse them.',
      steps: [
        {
          kind: 'read',
          md: `
## Naming values

A **variable** is a name that points to a value. You create one with \`=\`:

~~~python
species = "Adelie"
mass_g = 3750
print(species, mass_g)
~~~

~~~text
Adelie 3750
~~~

Read \`=\` as **"store"**, not "equals": *store 3750 under the name* \`mass_g\`.

Variable names can use letters, numbers and underscores, but can't start with a number or contain spaces. Python programmers write names in lowercase with underscores, like \`body_mass_g\`. This is called **snake_case**.
`,
        },
        {
          kind: 'code',
          id: 'm01-l3-create',
          prompt: 'Create a variable `species` holding the text `Adelie`, and a variable `mass_g` holding the number `3750`. Then print both of them with one `print()`.',
          starter: '',
          solution: 'species = "Adelie"\nmass_g = 3750\nprint(species, mass_g)\n',
          tests: `assert species == "Adelie", "species should be the text Adelie (with a capital A)."
assert mass_g == 3750, "mass_g should be the number 3750, without quotes."
assert output.strip() == "Adelie 3750", "Print both variables: print(species, mass_g)"`,
          hints: ['species = "Adelie" creates the first one.', 'Then print(species, mass_g).'],
        },
        {
          kind: 'choice',
          id: 'm01-l3-names',
          question: 'Which of these is a valid variable name?',
          options: ['`2nd_penguin`', '`penguin-count`', '`penguin_count`', '`penguin count`'],
          answer: 2,
          explain: "Names can't start with a number, and can't contain hyphens (Python would read it as a minus sign) or spaces.",
        },
        {
          kind: 'read',
          md: `
## Variables can change

You can store a new value in a variable at any time. The right-hand side is worked out **first**, then stored:

~~~python
count = 10
count = count + 1
print(count)
~~~

~~~text
11
~~~

Adding to a variable is so common that Python has a shortcut, \`+=\`:

~~~python
count += 1   # same as: count = count + 1
~~~

This app is named after it. In programming, adding one is called **incrementing**: one small step, repeated, adds up to something big.
`,
        },
        {
          kind: 'predict',
          id: 'm01-l3-update',
          code: 'x = 5\nx = x + 2\nx = x * 10\nprint(x)\n',
          options: ['70', '25', '52', '7'],
          answer: 0,
          explain: 'x starts at 5, becomes 5 + 2 = 7, then 7 * 10 = 70.',
        },
        {
          kind: 'code',
          id: 'm01-l3-increment',
          prompt: 'Create `steps = 0`. Then use `+=` **three times** to add 1 each time. Finally print `steps`.',
          starter: 'steps = 0\n',
          solution: 'steps = 0\nsteps += 1\nsteps += 1\nsteps += 1\nprint(steps)\n',
          tests: `assert steps == 3, f"steps should end up as 3, but it is {steps}."
assert source.count("+=") == 3, "Use += three times."
assert output.strip() == "3", "Print steps at the end."`,
          hints: ['Each line should be: steps += 1'],
          review: true,
        },
        {
          kind: 'code',
          id: 'm01-l3-kg',
          prompt: 'The variable `mass_g` is already set to a penguin\'s mass in grams. Create `mass_kg` holding the same mass in **kilograms** (divide by 1000), then print `mass_kg`.\n\nUse the variable, not the number, so your code works for any penguin.',
          setup: 'mass_g = 3750\n',
          starter: '# mass_g is already set for you (it is 3750)\n',
          solution: 'mass_kg = mass_g / 1000\nprint(mass_kg)\n',
          tests: `assert mass_kg == 3.75, "mass_kg should be 3.75 for a 3750 g penguin."
assert output.strip() == "3.75", "Print mass_kg."
assert rerun(mass_g=5000)["mass_kg"] == 5.0, "Calculate it from the variable (mass_g / 1000), so it works for any penguin."`,
          hints: ['mass_kg = mass_g / 1000'],
          review: true,
        },
      ],
    },
    {
      id: 'm01-l4',
      title: 'Working with text',
      summary: 'Join, measure and tidy up strings, and meet f-strings.',
      steps: [
        {
          kind: 'read',
          md: `
## Strings are text

You can join strings with \`+\` and count their characters with \`len()\`:

~~~python
first = "Palmer"
second = "Station"
print(first + " " + second)
print(len(first))
~~~

~~~text
Palmer Station
6
~~~

\`+\` doesn't add spaces for you, so we added \`" "\` in the middle.
`,
        },
        {
          kind: 'predict',
          id: 'm01-l4-join',
          code: 'print("pen" + "guin")\n',
          options: ['pen guin', 'penguin', 'pen+guin', 'An error'],
          answer: 1,
          explain: '+ joins strings exactly as they are, with nothing in between.',
        },
        {
          kind: 'read',
          md: `
## f-strings: the easy way to build text

Put an \`f\` before the opening quote and you can drop variables straight into the text with curly brackets:

~~~python
species = "Gentoo"
mass_g = 5000
print(f"A {species} penguin weighing {mass_g} g")
~~~

~~~text
A Gentoo penguin weighing 5000 g
~~~

You'll use f-strings constantly. They work with numbers too, with no conversion needed.
`,
        },
        {
          kind: 'code',
          id: 'm01-l4-fstring',
          prompt: 'The variables `species` and `island` are set for you. Use an **f-string** to print:\n\n`Adelie penguins live on Torgersen`\n\n(using the variables, not typing the words).',
          starter: 'species = "Adelie"\nisland = "Torgersen"\n',
          solution: 'species = "Adelie"\nisland = "Torgersen"\nprint(f"{species} penguins live on {island}")\n',
          tests: `assert output.strip() == "Adelie penguins live on Torgersen", "Expected: Adelie penguins live on Torgersen"
assert 'f"' in source or "f'" in source, "Use an f-string: f\\"...\\""
assert "{species}" in source and "{island}" in source, "Put {species} and {island} inside the f-string."`,
          hints: ['print(f"{species} penguins live on {island}")'],
          review: true,
        },
        {
          kind: 'read',
          md: `
## String methods

Strings come with built-in tools called **methods**. You use them with a dot:

| Method | What it does | Example | Result |
|---|---|---|---|
| \`.upper()\` | all capitals | \`"dream".upper()\` | \`"DREAM"\` |
| \`.lower()\` | all lowercase | \`"DREAM".lower()\` | \`"dream"\` |
| \`.title()\` | Capitalise Each Word | \`"dream island".title()\` | \`"Dream Island"\` |
| \`.strip()\` | remove spaces at both ends | \`"  dream ".strip()\` | \`"dream"\` |
| \`.replace(a, b)\` | swap text | \`"dream".replace("d", "cr")\` | \`"cream"\` |

Real data is often messy: extra spaces, inconsistent capitals. These methods tidy it up. You can chain them: \`text.strip().title()\`.
`,
        },
        {
          kind: 'predict',
          id: 'm01-l4-methods',
          code: 'print("  torgersen ".strip().upper())\n',
          options: ['TORGERSEN', '  TORGERSEN ', 'Torgersen', 'torgersen'],
          answer: 0,
          explain: '.strip() removes the spaces first, then .upper() capitalises everything.',
        },
        {
          kind: 'code',
          id: 'm01-l4-clean',
          prompt: 'A messy value came in from a spreadsheet: `raw = "  gENTOO "`.\n\nCreate `species` holding the tidy version, `Gentoo`, using string methods on `raw`. Then print it.',
          setup: 'raw = "  gENTOO "\n',
          starter: '# raw is already set for you: "  gENTOO "\n',
          solution: 'species = raw.strip().title()\nprint(species)\n',
          tests: `assert species == "Gentoo", f"species should be 'Gentoo', but it is {species!r}."
assert "raw." in source, "Use methods on raw, like raw.strip()"
assert rerun(raw=" adelie")["species"] == "Adelie", "Your code should tidy any messy species name, not just this one."`,
          hints: ['.strip() removes the spaces.', 'Chain it: raw.strip().title()'],
          review: true,
        },
      ],
    },
    {
      id: 'm01-l5',
      title: 'Types and conversion',
      summary: 'Why "3" + "4" is "34", and how to fix it.',
      steps: [
        {
          kind: 'read',
          md: `
## Every value has a type

| Type | Name | Examples |
|---|---|---|
| \`int\` | integer (whole number) | \`3750\`, \`-4\` |
| \`float\` | decimal number | \`39.1\`, \`3.0\` |
| \`str\` | string (text) | \`"Adelie"\`, \`"3750"\` |
| \`bool\` | True or False | \`True\`, \`False\` |

\`type()\` tells you what something is:

~~~python
print(type(3750))
print(type("3750"))
~~~

~~~text
<class 'int'>
<class 'str'>
~~~

\`3750\` and \`"3750"\` look similar but behave completely differently. One is a number; the other is text that happens to contain digits.
`,
        },
        {
          kind: 'predict',
          id: 'm01-l5-concat',
          code: 'print("3" + "4")\n',
          options: ['7', '34', '3 4', 'An error'],
          answer: 1,
          explain: '"3" and "4" are strings, so + joins them into "34" instead of adding.',
        },
        {
          kind: 'predict',
          id: 'm01-l5-type',
          code: 'print(type(10 / 2))\n',
          options: ["<class 'int'>", "<class 'float'>", "<class 'str'>", '5'],
          answer: 1,
          explain: 'Division with / always produces a float (5.0), even when it divides exactly.',
        },
        {
          kind: 'read',
          md: `
## Converting between types

Data read from files and websites usually arrives as **text**. Convert it before doing maths:

| Function | Converts to | Example | Result |
|---|---|---|---|
| \`int()\` | integer | \`int("3750")\` | \`3750\` |
| \`float()\` | float | \`float("39.1")\` | \`39.1\` |
| \`str()\` | string | \`str(3750)\` | \`"3750"\` |
| \`round(x, n)\` | round to n decimal places | \`round(3.14159, 2)\` | \`3.14\` |
`,
        },
        {
          kind: 'code',
          id: 'm01-l5-convert',
          prompt: 'A mass arrived from a file as text: `text_mass = "3750"`.\n\nCreate `mass` holding it as an **integer**, then print `mass + 100`.',
          starter: 'text_mass = "3750"\n',
          solution: 'text_mass = "3750"\nmass = int(text_mass)\nprint(mass + 100)\n',
          tests: `assert type(mass) is int, f"mass should be an int, but it is a {type(mass).__name__}. Use int()."
assert mass == 3750, "mass should be 3750."
assert output.strip() == "3850", "Print mass + 100, which should show 3850."`,
          hints: ['mass = int(text_mass)'],
          review: true,
        },
        {
          kind: 'code',
          id: 'm01-l5-round',
          prompt: 'Three flipper lengths: **181**, **186** and **195** mm. Print their average **rounded to 1 decimal place**.',
          starter: '',
          solution: 'print(round((181 + 186 + 195) / 3, 1))\n',
          tests: `assert output.strip() == "187.3", "The rounded average should be 187.3."
assert "round(" in source, "Use round(value, 1)."`,
          hints: ['Work out the average first, the same way as before.', 'round(average, 1) rounds to 1 decimal place.'],
        },
        {
          kind: 'code',
          id: 'm01-l5-profile',
          prompt: `**Mini project: penguin profile card.** These are the real measurements of the first penguin in the dataset.

Print exactly these four lines, calculating the centimetres and kilograms from the variables:

~~~text
Species: Adelie
Island: Torgersen
Bill length: 3.91 cm
Mass: 3.75 kg
~~~`,
          setup: 'species = "Adelie"\nisland = "Torgersen"\nbill_length_mm = 39.1\nmass_g = 3750\n',
          starter: '# Already set for you:\n# species = "Adelie"\n# island = "Torgersen"\n# bill_length_mm = 39.1\n# mass_g = 3750\n',
          solution: `print(f"Species: {species}")
print(f"Island: {island}")
print(f"Bill length: {round(bill_length_mm / 10, 2)} cm")
print(f"Mass: {mass_g / 1000} kg")
`,
          tests: `expected = ["Species: Adelie", "Island: Torgersen", "Bill length: 3.91 cm", "Mass: 3.75 kg"]
assert len(lines) == 4, f"Expected 4 lines, but got {len(lines)}."
for i, (got, want) in enumerate(zip(lines, expected), start=1):
    assert got == want, f"Line {i} should be {want!r} but was {got!r}."
other = rerun(species="Gentoo", island="Biscoe", bill_length_mm=46.1, mass_g=4500)["lines"]
assert other == ["Species: Gentoo", "Island: Biscoe", "Bill length: 4.61 cm", "Mass: 4.5 kg"], "Build every line from the variables, so the card works for any penguin."`,
          hints: [
            'Use an f-string for each line.',
            'Centimetres: bill_length_mm / 10. Round it to 2 places in case of tiny float errors: round(bill_length_mm / 10, 2)',
          ],
          review: true,
        },
      ],
    },
  ],
};
