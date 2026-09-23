import type { Module } from '../types';

// Note: Python regex backslashes are doubled here (\\d) because this is a JavaScript string.

export const m05: Module = {
  id: 'm05',
  number: 5,
  title: 'Text in depth',
  blurb: 'Slice, split, format and clean text, and find patterns with regular expressions.',
  lessons: [
    {
      id: 'm05-l1',
      title: 'Slicing and searching strings',
      summary: 'Strings are sequences: index them, slice them, search them.',
      steps: [
        {
          kind: 'read',
          md: `
## Strings work like lists of characters

Everything you learned about indexing and slicing lists works on strings:

~~~python
code = "PAL0708"
print(code[0])      # first character
print(code[-1])     # last character
print(code[:3])     # first three
print(code[3:])     # from position 3 onwards
~~~

~~~text
P
8
PAL
0708
~~~

Unlike lists, strings **can't be changed** in place. Methods like \`.upper()\` always give you a new string.
`,
        },
        {
          kind: 'predict',
          id: 'm05-l1-slice',
          code: 'sample = "N1A1-2007-11-11"\nprint(sample[5:9])\n',
          options: ['2007', '-2007', '2007-', 'N1A1'],
          answer: 0,
          explain: 'Positions 5, 6, 7 and 8 are "2007". The stop position (9) is not included.',
        },
        {
          kind: 'read',
          md: `
## Searching text

| Tool | Question it answers | Example | Result |
|---|---|---|---|
| \`"x" in s\` | is it in there? | \`"ice" in "Iceberg"\` | \`False\` (case matters) |
| \`s.find("x")\` | where is it? (-1 if missing) | \`"penguin".find("g")\` | \`3\` |
| \`s.count("x")\` | how many times? | \`"banana".count("a")\` | \`3\` |
| \`s.startswith("x")\` | does it start with...? | \`"PAL0708".startswith("PAL")\` | \`True\` |
| \`s.endswith("x")\` | does it end with...? | \`"data.csv".endswith(".csv")\` | \`True\` |
`,
        },
        {
          kind: 'code',
          id: 'm05-l1-csv-files',
          prompt: '`files` is a list of file names. Create `csv_files`: a list of only the names that end with `.csv`.',
          setup: 'files = ["penguins.csv", "notes.txt", "weather.csv", "photo.png", "summary.CSV.bak"]\n',
          starter: '# files is already set:\n# ["penguins.csv", "notes.txt", "weather.csv", "photo.png", "summary.CSV.bak"]\n',
          solution: 'csv_files = []\nfor name in files:\n    if name.endswith(".csv"):\n        csv_files.append(name)\n',
          tests: `assert csv_files == ["penguins.csv", "weather.csv"], f"Expected ['penguins.csv', 'weather.csv'], got {csv_files}."
assert rerun(files=["a.csv", "b.txt"])["csv_files"] == ["a.csv"], "Your code should work for any list of names."`,
          hints: ['Loop over files and check name.endswith(".csv").', 'Append matching names to a new list.'],
          review: true,
        },
        {
          kind: 'code',
          id: 'm05-l1-year',
          prompt: 'Each sample ID looks like `"N1A1-2007-11-11"`: an ID, then a date. Define `sample_year(sample_id)` that returns the **year as an integer**, using slicing.',
          starter: '',
          solution: 'def sample_year(sample_id):\n    return int(sample_id[5:9])\n',
          tests: `assert sample_year("N1A1-2007-11-11") == 2007, f"Expected 2007, got {sample_year('N1A1-2007-11-11')!r}."
assert sample_year("N9Z2-2009-12-01") == 2009, "It should work for any ID in this format."
assert isinstance(sample_year("N1A1-2007-11-11"), int), "Return an int, not a string. Use int()."`,
          hints: ['The year is at positions 5 to 8, so slice [5:9].', 'Convert with int().'],
        },
      ],
    },
    {
      id: 'm05-l2',
      title: 'Split and join',
      summary: 'Break text into pieces and glue pieces back together.',
      steps: [
        {
          kind: 'read',
          md: `
## split: text to list

\`.split()\` cuts a string into a list. With no argument it splits on any whitespace; give it a separator to split on that instead:

~~~python
print("Adelie Gentoo  Chinstrap".split())
print("Adelie,Torgersen,3750".split(","))
~~~

~~~text
['Adelie', 'Gentoo', 'Chinstrap']
['Adelie', 'Torgersen', '3750']
~~~

This is exactly how CSV files work: each line is values separated by commas. Notice the pieces are all **strings**, even \`'3750'\`.

## join: list to text

\`separator.join(list)\` does the opposite:

~~~python
print(" | ".join(["Adelie", "Gentoo", "Chinstrap"]))
~~~

~~~text
Adelie | Gentoo | Chinstrap
~~~
`,
        },
        {
          kind: 'predict',
          id: 'm05-l2-split',
          code: 'row = "Gentoo,Biscoe,5000"\nparts = row.split(",")\nprint(parts[2] + parts[2])\n',
          options: ['50005000', '10000', '5000', 'An error'],
          answer: 0,
          explain: 'split gives strings, so parts[2] is "5000" and + joins the text: "50005000". Convert with int() to do maths.',
        },
        {
          kind: 'code',
          id: 'm05-l2-parse',
          prompt: '`row` is one line of a CSV file: `"Gentoo,Biscoe,46.1,5000"`. Split it and create a dictionary `penguin` with keys `"species"`, `"island"`, `"bill_mm"` (a float) and `"mass_g"` (an int).',
          setup: 'row = "Gentoo,Biscoe,46.1,5000"\n',
          starter: '# row is already set: "Gentoo,Biscoe,46.1,5000"\n',
          solution: 'species, island, bill, mass = row.split(",")\npenguin = {"species": species, "island": island, "bill_mm": float(bill), "mass_g": int(mass)}\n',
          tests: `assert penguin == {"species": "Gentoo", "island": "Biscoe", "bill_mm": 46.1, "mass_g": 5000}, f"Got {penguin}"
assert isinstance(penguin["mass_g"], int) and isinstance(penguin["bill_mm"], float), "Convert bill_mm with float() and mass_g with int()."
assert rerun(row="Adelie,Dream,39.5,3800")["penguin"]["island"] == "Dream", "Build it from row, so it works for any line."`,
          hints: ['parts = row.split(",") gives four strings.', 'You can unpack them straight into names: species, island, bill, mass = row.split(",")'],
          review: true,
        },
        {
          kind: 'code',
          id: 'm05-l2-join',
          prompt: '`islands` is a list of island names. Print them as one line, separated by `", "`, with ` and ` before the last one, like:\n\n`Torgersen, Biscoe and Dream`',
          setup: 'islands = ["Torgersen", "Biscoe", "Dream"]\n',
          starter: '# islands is already set: ["Torgersen", "Biscoe", "Dream"]\n',
          solution: 'print(", ".join(islands[:-1]) + " and " + islands[-1])\n',
          tests: `assert output.strip() == "Torgersen, Biscoe and Dream", f"Expected 'Torgersen, Biscoe and Dream', got {output.strip()!r}."
assert rerun(islands=["A", "B", "C", "D"])["output"].strip() == "A, B, C and D", "It should work for any number of islands (2 or more)."`,
          hints: ['islands[:-1] is every island except the last.', 'Join those with ", ", then add " and " and islands[-1].'],
        },
      ],
    },
    {
      id: 'm05-l3',
      title: 'Formatting numbers',
      summary: 'Decimal places, thousands separators, percentages and aligned columns.',
      steps: [
        {
          kind: 'read',
          md: `
## Format specifiers

Inside an f-string, add a colon and a **format specifier** after the value:

| Code | Meaning | Result |
|---|---|---|
| \`f"{3.14159:.2f}"\` | 2 decimal places | \`3.14\` |
| \`f"{1234567:,}"\` | thousands separators | \`1,234,567\` |
| \`f"{0.256:.1%}"\` | percentage, 1 decimal place | \`25.6%\` |
| \`f"{'Adelie':<10}|"\` | left-align in 10 spaces | \`Adelie    |\` |
| \`f"{42:>6}"\` | right-align in 6 spaces | \`    42\` |

Unlike \`round()\`, \`.2f\` always shows exactly two decimals: \`f"{2.5:.2f}"\` gives \`2.50\`.
`,
        },
        {
          kind: 'predict',
          id: 'm05-l3-format',
          code: 'share = 68 / 344\nprint(f"{share:.1%}")\n',
          options: ['19.8%', '0.2%', '19.767%', '20%'],
          answer: 0,
          explain: '68 / 344 is about 0.1977. The % format multiplies by 100 and adds a % sign: 19.8%.',
        },
        {
          kind: 'code',
          id: 'm05-l3-population',
          prompt: '`country`, `pop` and `life_exp` are set for you (real 2007 values for the United Kingdom). Print exactly:\n\n`United Kingdom: population 60,776,238, life expectancy 79.4 years`\n\nUse format specifiers for the comma separators and the 1 decimal place.',
          setup: 'country = "United Kingdom"\npop = 60776238\nlife_exp = 79.425\n',
          starter: '# country, pop and life_exp are already set\n',
          solution: 'print(f"{country}: population {pop:,}, life expectancy {life_exp:.1f} years")\n',
          tests: `assert output.strip() == "United Kingdom: population 60,776,238, life expectancy 79.4 years", f"Got {output.strip()!r}"
other = rerun(country="Japan", pop=127467972, life_exp=82.603)["output"].strip()
assert other == "Japan: population 127,467,972, life expectancy 82.6 years", "Build the line from the variables with format specifiers."`,
          hints: ['{pop:,} adds the commas.', '{life_exp:.1f} gives one decimal place.'],
          review: true,
        },
        {
          kind: 'code',
          id: 'm05-l3-table',
          prompt: `\`counts\` maps species to penguin counts. Print a neat table: the species **left-aligned in 10 characters**, then the count **right-aligned in 4**:

~~~text
Adelie     152
Gentoo     124
Chinstrap   68
~~~`,
          setup: 'counts = {"Adelie": 152, "Gentoo": 124, "Chinstrap": 68}\n',
          starter: '# counts is already set\n',
          solution: 'for species, n in counts.items():\n    print(f"{species:<10}{n:>4}")\n',
          tests: `want = ["Adelie     152", "Gentoo     124", "Chinstrap   68"]
got = output.splitlines()
assert got == want, "Expected:\\n" + "\\n".join(want) + "\\nbut got:\\n" + "\\n".join(got)`,
          hints: ['{species:<10} pads the name to 10 characters.', '{n:>4} right-aligns the number in 4 characters.'],
        },
      ],
    },
    {
      id: 'm05-l4',
      title: 'Cleaning messy text',
      summary: 'Real data is inconsistent. Write a function that tidies it.',
      steps: [
        {
          kind: 'read',
          md: `
## Messy data is normal

When people type data into forms and spreadsheets, the same thing gets written many ways: \`"Male"\`, \`" male"\`, \`"M"\`, \`"MALE "\`. Before you can count or group, you need to **normalise** it.

A good cleaning recipe:

1. \`.strip()\` the spaces from both ends
2. \`.lower()\` so capitals don't matter
3. map the variants to one standard value
4. decide what to do with values you don't recognise (often \`None\`)

Useful checks: \`s.isdigit()\` (only digits?), \`s.isalpha()\` (only letters?), \`s == ""\` (empty?).
`,
        },
        {
          kind: 'predict',
          id: 'm05-l4-isdigit',
          code: 'print("3750".isdigit(), "3750 g".isdigit(), "37.5".isdigit())\n',
          options: ['True False False', 'True True True', 'True False True', 'False False False'],
          answer: 0,
          explain: 'isdigit() is True only if every character is a digit. The space, the "g" and the "." all fail.',
        },
        {
          kind: 'code',
          id: 'm05-l4-clean-sex',
          prompt: 'Define `clean_sex(value)` that returns `"male"` for any of `"Male"`, `" male"`, `"M"`, `"m "` (and similar), `"female"` for `"F"`, `"Female"`, `"FEMALE "` and similar, and `None` for anything else, such as `"NA"`, `""` or `"."`.',
          starter: '',
          solution: 'def clean_sex(value):\n    v = value.strip().lower()\n    if v in ("m", "male"):\n        return "male"\n    if v in ("f", "female"):\n        return "female"\n    return None\n',
          tests: `for raw, want in [("Male", "male"), (" male", "male"), ("M", "male"), ("m ", "male"), ("F", "female"), ("Female", "female"), ("FEMALE ", "female"), ("NA", None), ("", None), (".", None), ("maybe", None)]:
    got = clean_sex(raw)
    assert got == want, f"clean_sex({raw!r}) should return {want!r}, but returned {got!r}."`,
          hints: ['Start with v = value.strip().lower().', 'Then check if v in ("m", "male"): and so on. Return None at the end.'],
          review: true,
        },
        {
          kind: 'code',
          id: 'm05-l4-parse-mass',
          prompt: 'Masses were typed in different ways: `"3750"`, `"3,750"`, `" 3750 g"`, `"3750g"`. Define `parse_mass(text)` that returns the mass as an **int**, or `None` if there are no digits at all (like `"unknown"` or `""`).',
          starter: '',
          solution: 'def parse_mass(text):\n    cleaned = text.strip().lower().replace(",", "").replace("g", "").strip()\n    if not cleaned.isdigit():\n        return None\n    return int(cleaned)\n',
          tests: `for raw, want in [("3750", 3750), ("3,750", 3750), (" 3750 g", 3750), ("3750g", 3750), ("unknown", None), ("", None)]:
    got = parse_mass(raw)
    assert got == want, f"parse_mass({raw!r}) should return {want!r}, but returned {got!r}."`,
          hints: ['Remove the commas and the "g" with .replace(), and strip the spaces.', 'If what\'s left .isdigit(), convert with int(); otherwise return None.'],
        },
      ],
    },
    {
      id: 'm05-l5',
      title: 'Regular expressions',
      summary: 'Find patterns in text, like every number or every date.',
      steps: [
        {
          kind: 'read',
          md: `
## Patterns, not exact text

A **regular expression** (regex) describes a *pattern* of text. Python's \`re\` module uses them:

~~~python
import re
text = "Bill 39.1 mm, flipper 181 mm, mass 3750 g"
print(re.findall(r"\\d+", text))
~~~

~~~text
['39', '1', '181', '3750']
~~~

The \`r\` before the quotes makes a **raw string**, so backslashes are passed to \`re\` untouched. Always use it for patterns.

| Pattern | Matches |
|---|---|
| \`\\d\` | one digit |
| \`\\d+\` | one or more digits |
| \`\\s\` | a space (or tab or newline) |
| \`[A-Z]\` | one capital letter |
| \`.\` | any character. Use \`\\.\` for a real dot |
| \`?\` | the thing before is optional |
| \`( )\` | a group you want to pull out |
`,
        },
        {
          kind: 'predict',
          id: 'm05-l5-decimal',
          code: 'import re\ntext = "Bill 39.1 mm, flipper 181 mm"\nprint(re.findall(r"\\d+\\.?\\d*", text))\n',
          options: ["['39.1', '181']", "['39', '1', '181']", "['39.1']", "['181']"],
          answer: 0,
          explain: '\\d+ takes digits, \\.? an optional dot, then \\d* any more digits. So 39.1 is one match and 181 another.',
        },
        {
          kind: 'read',
          md: `
## The three functions you'll use most

~~~python
import re
note = "Sampled 2007-11-11, egg date 2007-11-16"

print(re.search(r"\\d{4}-\\d{2}-\\d{2}", note).group())   # the first match
print(re.findall(r"\\d{4}-\\d{2}-\\d{2}", note))          # every match
print(re.sub(r"\\d", "#", "PAL0708"))                     # replace matches
~~~

~~~text
2007-11-11
['2007-11-11', '2007-11-16']
PAL####
~~~

\`\\d{4}\` means "exactly four digits". \`re.search\` returns \`None\` if nothing matches, so check before calling \`.group()\`.
`,
        },
        {
          kind: 'code',
          id: 'm05-l5-dates',
          prompt: '`notes` is a list of field notes. Create `dates`: a list of **every** date in the format `YYYY-MM-DD` found in any of the notes, in order.',
          setup: 'notes = [\n    "Nest checked 2007-11-11, 2 eggs",\n    "No visit",\n    "Eggs 2008-11-06 and 2008-11-09; chick seen",\n]\n',
          starter: 'import re\n# notes is already set (a list of 3 strings)\n',
          solution: 'import re\ndates = []\nfor note in notes:\n    dates += re.findall(r"\\d{4}-\\d{2}-\\d{2}", note)\n',
          tests: `assert dates == ["2007-11-11", "2008-11-06", "2008-11-09"], f"Expected three dates, got {dates}."
assert rerun(notes=["x 2020-01-02 y"])["dates"] == ["2020-01-02"], "Your code should work for any notes."`,
          hints: ['The pattern for a date is r"\\d{4}-\\d{2}-\\d{2}".', 'Use re.findall on each note and add the results to your list.'],
          review: true,
        },
        {
          kind: 'code',
          id: 'm05-l5-extract',
          prompt: 'Define `extract_mass(text)` that finds a mass written like `mass 3750 g` or `Mass: 4200g` and returns the number as an **int**, or `None` if there isn\'t one.\n\nTip: use a group `( )` around the digits and `re.IGNORECASE` for the capital M.',
          starter: 'import re\n',
          solution: 'import re\n\ndef extract_mass(text):\n    match = re.search(r"mass:?\\s*(\\d+)\\s*g", text, re.IGNORECASE)\n    if match is None:\n        return None\n    return int(match.group(1))\n',
          tests: `for raw, want in [("Bill 39.1 mm, mass 3750 g", 3750), ("Mass: 4200g", 4200), ("MASS 5000 g (estimated)", 5000), ("no weight taken", None), ("flipper 181 mm", None)]:
    got = extract_mass(raw)
    assert got == want, f"extract_mass({raw!r}) should return {want!r}, but returned {got!r}."`,
          hints: [
            'A pattern that works: r"mass:?\\s*(\\d+)\\s*g"',
            'Pass re.IGNORECASE as the third argument to re.search.',
            'match.group(1) is the text inside the first ( ). Convert it with int().',
          ],
        },
        {
          kind: 'choice',
          id: 'm05-l5-when',
          question: 'When should you reach for a regular expression instead of string methods like `.split()` and `.startswith()`?',
          options: [
            'Always: regex is faster',
            'When you need to match a pattern (like "any date" or "any number"), not fixed text',
            'Only for numbers',
            'Never: regex is outdated',
          ],
          answer: 1,
          explain: 'String methods are simpler and clearer for fixed text. Regex earns its place when the text varies but follows a pattern.',
        },
      ],
    },
  ],
};
