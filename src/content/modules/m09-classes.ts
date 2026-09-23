import type { Module } from '../types';

const PENGUIN_CLASS = `class Penguin:
    def __init__(self, species, island, mass_g):
        self.species = species
        self.island = island
        self.mass_g = mass_g
`;

export const m09: Module = {
  id: 'm09',
  number: 9,
  title: 'Classes and objects',
  blurb: 'Design your own types that bundle data with the functions that work on it.',
  lessons: [
    {
      id: 'm09-l1',
      title: 'Classes and objects',
      summary: 'Define a new type of thing, then make as many as you like.',
      steps: [
        {
          kind: 'read',
          md: `
## Your own types

Every value in Python is an **object** of some **type**: \`"Adelie"\` is a \`str\`, \`[1, 2]\` is a \`list\`. A **class** lets you define a new type.

~~~python
class Penguin:
    def __init__(self, species, island, mass_g):
        self.species = species
        self.island = island
        self.mass_g = mass_g

first = Penguin("Adelie", "Torgersen", 3750)
print(first.species, first.mass_g)
~~~

~~~text
Adelie 3750
~~~

- \`class Penguin:\` defines the type. Class names use **CapitalWords**
- \`__init__\` runs whenever you create a new object. It sets up its **attributes**
- \`self\` is the object being created. \`self.mass_g = mass_g\` stores a value *on* it
- \`Penguin("Adelie", "Torgersen", 3750)\` creates an object, also called an **instance**
`,
        },
        {
          kind: 'predict',
          id: 'm09-l1-instances',
          code: `${PENGUIN_CLASS}
a = Penguin("Adelie", "Dream", 3800)
b = Penguin("Gentoo", "Biscoe", 5000)
b.mass_g = b.mass_g + 100
print(a.mass_g, b.mass_g)
`,
          options: ['3800 5100', '3900 5100', '3800 5000', '5100 5100'],
          answer: 0,
          explain: 'Each object has its own attributes. Changing b.mass_g doesn\'t touch a.',
        },
        {
          kind: 'code',
          id: 'm09-l1-station',
          prompt: 'Define a class `Station` whose `__init__` takes `name`, `lat` and `lon` and stores them as attributes. Then create `oxford = Station("Oxford", 51.761, -1.262)`.',
          starter: '',
          solution: 'class Station:\n    def __init__(self, name, lat, lon):\n        self.name = name\n        self.lat = lat\n        self.lon = lon\n\noxford = Station("Oxford", 51.761, -1.262)\n',
          tests: `assert isinstance(oxford, Station), "oxford should be created with Station(...)."
assert (oxford.name, oxford.lat, oxford.lon) == ("Oxford", 51.761, -1.262), "Store name, lat and lon as attributes with self.name = name, and so on."
s = Station("Durham", 54.768, -1.585)
assert s.name == "Durham" and s.lon == -1.585, "Station should work for any values."`,
          hints: ['class Station:', 'def __init__(self, name, lat, lon): then self.name = name, self.lat = lat, self.lon = lon'],
          review: true,
        },
      ],
    },
    {
      id: 'm09-l2',
      title: 'Methods',
      summary: 'Functions that belong to an object.',
      steps: [
        {
          kind: 'read',
          md: `
## Behaviour lives with the data

A **method** is a function defined inside a class. Its first parameter is always \`self\`, so it can use the object's attributes:

~~~python
class Penguin:
    def __init__(self, species, mass_g):
        self.species = species
        self.mass_g = mass_g

    def mass_kg(self):
        return self.mass_g / 1000

    def gain(self, grams):
        self.mass_g += grams

p = Penguin("Gentoo", 5000)
p.gain(250)
print(p.mass_kg())
~~~

~~~text
5.25
~~~

You call a method with a dot, and Python passes the object in as \`self\` for you. You've been calling methods all along: \`"text".upper()\`, \`numbers.append(4)\`.
`,
        },
        {
          kind: 'code',
          id: 'm09-l2-account',
          prompt: `Define a class \`Tally\` for counting sightings:

- \`__init__\` takes \`name\` and starts \`self.count\` at 0
- \`add(n=1)\` adds \`n\` to the count
- \`report()\` **returns** a string like \`Gentoo: 3 sightings\``,
          starter: '',
          solution: 'class Tally:\n    def __init__(self, name):\n        self.name = name\n        self.count = 0\n\n    def add(self, n=1):\n        self.count += n\n\n    def report(self):\n        return f"{self.name}: {self.count} sightings"\n',
          tests: `t = Tally("Gentoo")
assert t.count == 0, "A new Tally should start at 0."
t.add()
t.add(2)
assert t.count == 3, f"After add() and add(2), count should be 3, got {t.count}."
assert t.report() == "Gentoo: 3 sightings", f"report() returned {t.report()!r}"
other = Tally("Adelie")
assert other.count == 0, "Each Tally keeps its own count."`,
          hints: ['Every method takes self first: def add(self, n=1):', 'Inside methods, use self.count and self.name.'],
          review: true,
        },
        {
          kind: 'choice',
          id: 'm09-l2-self',
          question: 'In `p.gain(250)`, what is `self` inside the `gain` method?',
          options: ['The number 250', 'The Penguin class', 'The object p', 'Nothing: self is optional'],
          answer: 2,
          explain: 'Python passes the object before the dot as the first argument, so self is p and grams is 250.',
        },
      ],
    },
    {
      id: 'm09-l3',
      title: 'Printing objects nicely',
      summary: 'Special "dunder" methods like __repr__ make objects easy to inspect.',
      steps: [
        {
          kind: 'read',
          md: `
## Dunder methods

Printing an object of your own class gives something unhelpful by default, like \`<__main__.Penguin object at 0x10a4>\`.

Methods whose names start and end with double underscores ("**dunder**" methods) plug your class into Python's built-in behaviour:

~~~python
class Penguin:
    def __init__(self, species, mass_g):
        self.species = species
        self.mass_g = mass_g

    def __repr__(self):
        return f"Penguin({self.species!r}, {self.mass_g})"

print(Penguin("Adelie", 3750))
print([Penguin("Adelie", 3750), Penguin("Gentoo", 5000)])
~~~

~~~text
Penguin('Adelie', 3750)
[Penguin('Adelie', 3750), Penguin('Gentoo', 5000)]
~~~

- \`__repr__\`: how the object looks when printed or inspected. Aim for something that looks like the code to create it
- \`__len__\`: makes \`len(obj)\` work
- \`__eq__\`: makes \`==\` compare values, not identity
`,
        },
        {
          kind: 'code',
          id: 'm09-l3-repr',
          prompt: 'Define a class `Colony` with `__init__(self, island)` that stores the island and starts an empty list `self.masses`, a method `add(mass_g)` that appends to it, `__len__` returning how many masses there are, and `__repr__` returning something like `Colony(\'Dream\', 2 penguins)`.',
          starter: '',
          solution: 'class Colony:\n    def __init__(self, island):\n        self.island = island\n        self.masses = []\n\n    def add(self, mass_g):\n        self.masses.append(mass_g)\n\n    def __len__(self):\n        return len(self.masses)\n\n    def __repr__(self):\n        return f"Colony({self.island!r}, {len(self)} penguins)"\n',
          tests: `c = Colony("Dream")
c.add(3800)
c.add(3500)
assert len(c) == 2, f"len(c) should be 2, got {len(c)}."
assert repr(c) == "Colony('Dream', 2 penguins)", f"repr(c) should be \\"Colony('Dream', 2 penguins)\\", got {repr(c)!r}"
d = Colony("Biscoe")
assert len(d) == 0 and d.masses == [], "Each colony needs its own empty list: create it inside __init__."`,
          hints: ['def __len__(self): return len(self.masses)', 'def __repr__(self): return f"Colony({self.island!r}, {len(self)} penguins)"', '!r puts quotes around the island name.'],
          review: true,
        },
      ],
    },
    {
      id: 'm09-l4',
      title: 'Dataclasses',
      summary: 'Classes for holding data, with much less typing.',
      steps: [
        {
          kind: 'read',
          md: `
## Less boilerplate

Many classes just hold data. The \`@dataclass\` **decorator** writes \`__init__\`, \`__repr__\` and \`__eq__\` for you, from type-annotated fields:

~~~python
from dataclasses import dataclass

@dataclass
class Penguin:
    species: str
    island: str
    mass_g: int = 0         # a default value

    def mass_kg(self) -> float:
        return self.mass_g / 1000

p = Penguin("Adelie", "Dream", 3800)
print(p)
print(p == Penguin("Adelie", "Dream", 3800))
~~~

~~~text
Penguin(species='Adelie', island='Dream', mass_g=3800)
True
~~~

Dataclasses are the modern default for structured records in Python code.
`,
        },
        {
          kind: 'predict',
          id: 'm09-l4-eq',
          code: 'from dataclasses import dataclass\n\n@dataclass\nclass Point:\n    x: int\n    y: int = 0\n\nprint(Point(3), Point(3) == Point(3, 0))\n',
          options: ['Point(x=3, y=0) True', 'Point(3) True', 'Point(x=3, y=0) False', 'An error'],
          answer: 0,
          explain: 'y defaults to 0, the generated __repr__ shows field names, and the generated __eq__ compares the values.',
        },
        {
          kind: 'code',
          id: 'm09-l4-reading',
          prompt: 'Define a dataclass `Reading` with fields `station: str`, `month: int` and `rain_mm: float = 0.0`, plus a method `is_wet()` that returns `True` when `rain_mm` is over 60.\n\nThen create `readings`: a list of `Reading` objects, one for each `(station, month, rain)` tuple in `raw`.',
          setup: 'raw = [("Oxford", 1, 62.8), ("Oxford", 2, 29.3), ("Oxford", 3, 25.9), ("Oxford", 4, 60.1)]\n',
          starter: 'from dataclasses import dataclass\n# raw is a list of (station, month, rain_mm) tuples\n',
          solution: 'from dataclasses import dataclass\n\n@dataclass\nclass Reading:\n    station: str\n    month: int\n    rain_mm: float = 0.0\n\n    def is_wet(self) -> bool:\n        return self.rain_mm > 60\n\nreadings = [Reading(s, m, r) for s, m, r in raw]\n',
          tests: `import dataclasses
assert dataclasses.is_dataclass(Reading), "Use the @dataclass decorator."
assert Reading("X", 5).rain_mm == 0.0, "rain_mm should default to 0.0."
assert len(readings) == 4 and readings[0] == Reading("Oxford", 1, 62.8), "Create one Reading per tuple in raw."
assert [r.is_wet() for r in readings] == [True, False, False, True], "is_wet() should be True when rain_mm is over 60."`,
          hints: ['Put @dataclass on the line above class Reading:', 'Fields look like: station: str', 'readings = [Reading(s, m, r) for s, m, r in raw]'],
          review: true,
        },
      ],
    },
    {
      id: 'm09-l5',
      title: 'Inheritance, and when to use classes',
      summary: 'Build a specialised class from a general one, and choose the right structure.',
      steps: [
        {
          kind: 'read',
          md: `
## Inheritance

A class can **inherit** from another, getting all its attributes and methods, then add or change some:

~~~python
class Sensor:
    def __init__(self, name):
        self.name = name
        self.values = []

    def record(self, value):
        self.values.append(value)

    def describe(self):
        return f"{self.name}: {len(self.values)} readings"

class RainGauge(Sensor):
    def total(self):
        return sum(self.values)

g = RainGauge("Oxford gauge")
g.record(62.8)
g.record(29.3)
print(g.describe(), g.total())
~~~

~~~text
Oxford gauge: 2 readings 92.1
~~~

\`RainGauge(Sensor)\` means "a RainGauge is a kind of Sensor". To extend \`__init__\`, call the parent's with \`super().__init__(...)\`.

## When should you write a class?

In data science you'll **use** classes constantly (DataFrames, models) but write fewer than a software engineer might. Rules of thumb:

- A **dictionary** or **dataclass** is enough for a simple record
- A **function** is enough for a calculation
- Write a **class** when data and the operations on it naturally belong together, and you need several independent copies
`,
        },
        {
          kind: 'code',
          id: 'm09-l5-inherit',
          prompt: 'The `Sensor` class above is provided. Define `Thermometer(Sensor)` with:\n\n- `__init__(self, name, unit="C")` that calls `super().__init__(name)` and stores `unit`\n- `average()` returning the mean of the values rounded to 1 decimal place (or `None` with no values)\n- a `describe()` that **overrides** the parent\'s, returning e.g. `Oxford: 3 readings, average 11.3 C`',
          setup: 'class Sensor:\n    def __init__(self, name):\n        self.name = name\n        self.values = []\n\n    def record(self, value):\n        self.values.append(value)\n\n    def describe(self):\n        return f"{self.name}: {len(self.values)} readings"\n',
          starter: '# Sensor is already defined (see the lesson)\n',
          solution: 'class Thermometer(Sensor):\n    def __init__(self, name, unit="C"):\n        super().__init__(name)\n        self.unit = unit\n\n    def average(self):\n        if not self.values:\n            return None\n        return round(sum(self.values) / len(self.values), 1)\n\n    def describe(self):\n        return f"{self.name}: {len(self.values)} readings, average {self.average()} {self.unit}"\n',
          tests: `t = Thermometer("Oxford")
assert isinstance(t, Sensor), "Thermometer should inherit from Sensor: class Thermometer(Sensor):"
assert t.values == [] and t.unit == "C", "Call super().__init__(name) so values is set up, and store unit."
assert t.average() is None, "average() should return None when there are no values."
for v in [10.5, 12.0, 11.4]:
    t.record(v)
assert t.average() == 11.3, f"average() should be 11.3, got {t.average()}."
assert t.describe() == "Oxford: 3 readings, average 11.3 C", f"describe() returned {t.describe()!r}"
assert Thermometer("Lab", unit="F").unit == "F", "unit should be settable."`,
          hints: ['class Thermometer(Sensor):', 'In __init__: super().__init__(name) then self.unit = unit.', 'Methods from Sensor (like record) come for free.'],
        },
        {
          kind: 'choice',
          id: 'm09-l5-which',
          question: 'You need to store the name, island and mass of 344 penguins and then analyse them. What\'s the most sensible structure?',
          options: [
            'A class with inheritance for each species',
            'A list of dictionaries or dataclasses (or, soon, a pandas DataFrame)',
            '344 separate variables',
            'One very long string',
          ],
          answer: 1,
          explain: 'Simple records are best held in simple structures. For tabular data like this, a DataFrame (next modules) is the standard tool.',
        },
      ],
    },
  ],
};
