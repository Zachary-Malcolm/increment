import type { Module } from '../types';
import { GAPMINDER_DF_SETUP, GAPMINDER_FILE, PENGUINS_DF_SETUP, PENGUINS_FILE } from '../datasets';

export const m11: Module = {
  id: 'm11',
  number: 11,
  title: 'pandas fundamentals',
  blurb: "The data scientist's spreadsheet, in code: load, inspect, select, filter and sort real data.",
  lessons: [
    {
      id: 'm11-l1',
      title: 'Series and DataFrames',
      summary: 'The two building blocks of pandas.',
      steps: [
        {
          kind: 'read',
          md: `
## Meet pandas

**pandas** is the most-used data analysis library in the world. It's imported as \`pd\`:

~~~python
import pandas as pd
~~~

A **DataFrame** is a table: rows and named columns, like a spreadsheet. A **Series** is a single column.

~~~python
df = pd.DataFrame({
    "species": ["Adelie", "Gentoo", "Chinstrap"],
    "mass_g": [3700, 5076, 3733],
})
print(df)
~~~

~~~text
     species  mass_g
0     Adelie    3700
1     Gentoo    5076
2  Chinstrap    3733
~~~

The numbers down the left (0, 1, 2) are the **index**: a label for each row.

~~~python
print(df["mass_g"].mean())   # a column is a Series, with the NumPy-style methods you know
print(df.shape)              # (rows, columns)
~~~

~~~text
4169.666666666667
(3, 2)
~~~

Remember building a list of dictionaries for the penguin census? A DataFrame is that idea, made fast and powerful.
`,
        },
        {
          kind: 'predict',
          id: 'm11-l1-shape',
          code: 'import pandas as pd\ndf = pd.DataFrame({"a": [1, 2, 3, 4], "b": [5, 6, 7, 8], "c": [9, 10, 11, 12]})\nprint(df.shape)\n',
          options: ['(4, 3)', '(3, 4)', '12', '(4,)'],
          answer: 0,
          explain: 'shape is (rows, columns): 4 rows and 3 columns.',
        },
        {
          kind: 'code',
          id: 'm11-l1-create',
          prompt: 'Create a DataFrame `islands` with two columns: `"island"` holding `"Biscoe"`, `"Dream"`, `"Torgersen"`, and `"penguins"` holding `168`, `124`, `52`. Then create `total`: the sum of the `penguins` column.',
          starter: 'import pandas as pd\n',
          solution: 'import pandas as pd\nislands = pd.DataFrame({"island": ["Biscoe", "Dream", "Torgersen"], "penguins": [168, 124, 52]})\ntotal = islands["penguins"].sum()\n',
          tests: `import pandas as _pd
assert isinstance(islands, _pd.DataFrame), "islands should be a DataFrame: pd.DataFrame({...})."
assert list(islands.columns) == ["island", "penguins"], f"The columns should be ['island', 'penguins'], got {list(islands.columns)}."
assert islands["island"].tolist() == ["Biscoe", "Dream", "Torgersen"] and islands["penguins"].tolist() == [168, 124, 52], "Check the values in each column."
assert total == 344, f"total should be 344, got {total}."`,
          hints: ['pd.DataFrame({"island": [...], "penguins": [...]})', 'islands["penguins"].sum()'],
          review: true,
        },
        {
          kind: 'code',
          id: 'm11-l1-series',
          prompt: 'Create a **Series** `rain` holding `62.8, 29.3, 25.9` with the index labels `"Jan"`, `"Feb"`, `"Mar"` (use `pd.Series(values, index=labels)`). Then create `feb`: February\'s value, looked up by its label.',
          starter: 'import pandas as pd\n',
          solution: 'import pandas as pd\nrain = pd.Series([62.8, 29.3, 25.9], index=["Jan", "Feb", "Mar"])\nfeb = rain["Feb"]\n',
          tests: `import pandas as _pd
assert isinstance(rain, _pd.Series), "rain should be a Series."
assert rain.index.tolist() == ["Jan", "Feb", "Mar"], "Use index=[\\"Jan\\", \\"Feb\\", \\"Mar\\"]."
assert feb == 29.3, f"feb should be 29.3, got {feb}."`,
          hints: ['pd.Series([62.8, 29.3, 25.9], index=["Jan", "Feb", "Mar"])', 'Look up by label: rain["Feb"]'],
        },
      ],
    },
    {
      id: 'm11-l2',
      title: 'Reading and inspecting data',
      summary: 'Load a CSV in one line and get to know it.',
      steps: [
        {
          kind: 'read',
          md: `
## One line to load

Remember opening the penguins file with \`csv.DictReader\`, converting every number by hand, and turning "NA" into \`None\`? pandas does all of it:

~~~python
penguins = pd.read_csv("data/penguins.csv")
~~~

Numbers become numbers, and missing values become \`NaN\` ("not a number"), pandas' marker for missing data.

## First look

Always inspect a new dataset before analysing it:

| Code | Tells you |
|---|---|
| \`df.head()\` | the first 5 rows (\`df.tail()\` for the last) |
| \`df.shape\` | (rows, columns) |
| \`df.columns\` | the column names |
| \`df.dtypes\` | the type of each column |
| \`df.info()\` | types plus how many non-missing values each column has |
| \`df.describe()\` | count, mean, std, min, quartiles and max of every numeric column |
| \`df["col"].unique()\` / \`.nunique()\` | the distinct values / how many |
`,
        },
        {
          kind: 'code',
          id: 'm11-l2-read',
          prompt: 'Load `data/penguins.csv` into a DataFrame called `penguins`. Then create:\n\n- `n_rows`: the number of rows\n- `n_species`: how many different species there are\n- `max_flipper`: the longest flipper length',
          data: [PENGUINS_FILE],
          starter: 'import pandas as pd\n',
          solution: 'import pandas as pd\npenguins = pd.read_csv("data/penguins.csv")\nn_rows = penguins.shape[0]\nn_species = penguins["species"].nunique()\nmax_flipper = penguins["flipper_length_mm"].max()\n',
          tests: `assert penguins.shape == (344, 8), "Load the whole file with pd.read_csv(\\"data/penguins.csv\\")."
assert n_rows == 344, f"n_rows should be 344, got {n_rows}."
assert n_species == 3, f"n_species should be 3, got {n_species}."
assert max_flipper == 231, f"max_flipper should be 231, got {max_flipper}."`,
          hints: ['pd.read_csv("data/penguins.csv")', 'penguins.shape[0] is the number of rows; .nunique() counts distinct values; .max() gives the largest.'],
          review: true,
        },
        {
          kind: 'predict',
          id: 'm11-l2-describe',
          code: 'import pandas as pd\npenguins = pd.read_csv("data/penguins.csv")\nprint(penguins["body_mass_g"].count())\n',
          data: [PENGUINS_FILE],
          options: ['342', '344', '0', '8'],
          answer: 0,
          explain: '.count() counts non-missing values. Two penguins have no recorded mass, so it\'s 342, not 344. describe() and info() report the same count.',
        },
        {
          kind: 'code',
          id: 'm11-l2-gapminder',
          prompt: '`gapminder` is loaded: life expectancy, population and GDP per person for 142 countries, every 5 years from 1952 to 2007.\n\nCreate `first_year` and `last_year` (the earliest and latest years), `n_countries` (how many different countries), and `continents`: a **sorted list** of the unique continent names.',
          setup: GAPMINDER_DF_SETUP,
          data: [GAPMINDER_FILE],
          starter: 'import pandas as pd\n# gapminder is loaded. Columns: country, continent, year, life_exp, pop, gdp_per_cap\n',
          solution: 'import pandas as pd\nfirst_year = gapminder["year"].min()\nlast_year = gapminder["year"].max()\nn_countries = gapminder["country"].nunique()\ncontinents = sorted(gapminder["continent"].unique())\n',
          tests: `assert (first_year, last_year) == (1952, 2007), f"Got {first_year} to {last_year}."
assert n_countries == 142, f"n_countries should be 142, got {n_countries}."
assert list(continents) == ["Africa", "Americas", "Asia", "Europe", "Oceania"], f"Got {list(continents)}."`,
          hints: ['.min() and .max() on the year column.', '.nunique() on country.', 'sorted(gapminder["continent"].unique())'],
        },
      ],
    },
    {
      id: 'm11-l3',
      title: 'Selecting data',
      summary: 'Pick out columns, rows and single values with [ ], loc and iloc.',
      steps: [
        {
          kind: 'read',
          md: `
## Columns

~~~python
penguins["species"]                       # one column: a Series
penguins[["species", "body_mass_g"]]      # several columns (note the double brackets): a DataFrame
~~~

## Rows and cells: loc and iloc

- \`.loc[...]\` selects by **label** (the index and column names)
- \`.iloc[...]\` selects by **position** (0, 1, 2, like a list)

~~~python
penguins.loc[0, "species"]               # row labelled 0, column "species"
penguins.loc[0:4, ["species", "island"]]  # rows 0 to 4 INCLUSIVE, two columns
penguins.iloc[0:4, 0:2]                  # rows 0 to 3, columns 0 to 1 (stop excluded, like lists)
penguins.iloc[-1]                        # the last row
~~~

Watch out: a **\`loc\` slice includes the end label**, but an \`iloc\` slice excludes it, like normal Python.
`,
        },
        {
          kind: 'predict',
          id: 'm11-l3-loc-iloc',
          code: 'import pandas as pd\ndf = pd.DataFrame({"x": [10, 20, 30, 40, 50]})\nprint(len(df.loc[1:3]), len(df.iloc[1:3]))\n',
          options: ['3 2', '2 2', '3 3', '2 3'],
          answer: 0,
          explain: 'loc[1:3] includes label 3, giving rows 1, 2 and 3. iloc[1:3] stops before position 3, giving positions 1 and 2.',
        },
        {
          kind: 'code',
          id: 'm11-l3-select',
          prompt: 'From `penguins`, create:\n\n- `measures`: a DataFrame with just the `bill_length_mm` and `bill_depth_mm` columns\n- `tenth`: the species of the row at **position** 9, using `iloc`\n- `mass_0`: the `body_mass_g` of the row labelled 0, using `loc`',
          setup: PENGUINS_DF_SETUP,
          data: [PENGUINS_FILE],
          starter: 'import pandas as pd\n# penguins is loaded\n',
          solution: 'import pandas as pd\nmeasures = penguins[["bill_length_mm", "bill_depth_mm"]]\ntenth = penguins.iloc[9]["species"]\nmass_0 = penguins.loc[0, "body_mass_g"]\n',
          tests: `import pandas as _pd
assert isinstance(measures, _pd.DataFrame) and list(measures.columns) == ["bill_length_mm", "bill_depth_mm"], "measures should be a DataFrame with the two bill columns (use double brackets)."
assert len(measures) == 344, "Keep every row."
assert tenth == penguins["species"].iloc[9], "tenth should be the species at position 9."
assert mass_0 == 3750, f"mass_0 should be 3750, got {mass_0}."`,
          hints: ['Several columns: penguins[["bill_length_mm", "bill_depth_mm"]]', 'penguins.iloc[9]["species"]', 'penguins.loc[0, "body_mass_g"]'],
          review: true,
        },
      ],
    },
    {
      id: 'm11-l4',
      title: 'Filtering rows',
      summary: 'Keep only the rows that match a condition.',
      steps: [
        {
          kind: 'read',
          md: `
## Boolean masks, again

Filtering works exactly like NumPy masks:

~~~python
heavy = penguins[penguins["body_mass_g"] > 5000]
gentoo_heavy = penguins[(penguins["species"] == "Gentoo") & (penguins["body_mass_g"] > 5000)]
~~~

Remember: \`&\` for and, \`|\` for or, \`~\` for not, and **brackets around each condition**.

## Handy shortcuts

~~~python
penguins[penguins["island"].isin(["Dream", "Biscoe"])]          # in a list of values
penguins[penguins["body_mass_g"].between(4000, 5000)]           # inclusive range
penguins[penguins["species"].str.startswith("Chin")]            # text methods via .str
~~~

To count matching rows, take \`len()\` of the result, or \`.sum()\` of the mask.
`,
        },
        {
          kind: 'code',
          id: 'm11-l4-filter',
          prompt: 'From `penguins`, create:\n\n- `dream_adelie`: all rows for **Adelie** penguins on **Dream** island\n- `big_birds`: rows where the flipper length is **at least 220** or the mass is **over 6000**\n- `n_mid`: how many penguins weigh **between 4000 and 5000 g** (inclusive)',
          setup: PENGUINS_DF_SETUP,
          data: [PENGUINS_FILE],
          starter: 'import pandas as pd\n# penguins is loaded\n',
          solution: 'import pandas as pd\ndream_adelie = penguins[(penguins["species"] == "Adelie") & (penguins["island"] == "Dream")]\nbig_birds = penguins[(penguins["flipper_length_mm"] >= 220) | (penguins["body_mass_g"] > 6000)]\nn_mid = penguins["body_mass_g"].between(4000, 5000).sum()\n',
          tests: `want1 = penguins[(penguins["species"] == "Adelie") & (penguins["island"] == "Dream")]
assert dream_adelie.equals(want1), f"dream_adelie should have {len(want1)} rows, got {len(dream_adelie)}."
want2 = penguins[(penguins["flipper_length_mm"] >= 220) | (penguins["body_mass_g"] > 6000)]
assert big_birds.equals(want2), f"big_birds should have {len(want2)} rows, got {len(big_birds)}."
assert n_mid == penguins["body_mass_g"].between(4000, 5000).sum(), f"n_mid should be {penguins['body_mass_g'].between(4000, 5000).sum()}, got {n_mid}."`,
          hints: ['Combine conditions with & or |, each in brackets.', 'penguins["body_mass_g"].between(4000, 5000) is a mask; .sum() counts it.'],
          review: true,
        },
        {
          kind: 'code',
          id: 'm11-l4-gap',
          prompt: 'From `gapminder`, create `europe_2007`: the rows for **Europe** in **2007**, keeping only the `country` and `life_exp` columns. Then create `below_75`: how many of those countries had a life expectancy under 75.',
          setup: GAPMINDER_DF_SETUP,
          data: [GAPMINDER_FILE],
          starter: 'import pandas as pd\n# gapminder is loaded\n',
          solution: 'import pandas as pd\neurope_2007 = gapminder[(gapminder["continent"] == "Europe") & (gapminder["year"] == 2007)][["country", "life_exp"]]\nbelow_75 = (europe_2007["life_exp"] < 75).sum()\n',
          tests: `want = gapminder[(gapminder["continent"] == "Europe") & (gapminder["year"] == 2007)][["country", "life_exp"]]
assert list(europe_2007.columns) == ["country", "life_exp"], "Keep only the country and life_exp columns."
assert europe_2007.equals(want), f"There are {len(want)} European countries in 2007, got {len(europe_2007)} rows."
assert below_75 == (want["life_exp"] < 75).sum(), f"below_75 should be {(want['life_exp'] < 75).sum()}."`,
          hints: ['Filter the rows first, then pick the columns with [["country", "life_exp"]].', '(europe_2007["life_exp"] < 75).sum()'],
        },
      ],
    },
    {
      id: 'm11-l5',
      title: 'Sorting and new columns',
      summary: 'Order rows, add calculated columns, and count categories.',
      steps: [
        {
          kind: 'read',
          md: `
## Sorting

~~~python
penguins.sort_values("body_mass_g")                          # smallest first
penguins.sort_values("body_mass_g", ascending=False)         # largest first
penguins.sort_values(["species", "body_mass_g"])             # by species, then mass
penguins.nlargest(5, "body_mass_g")                          # shortcut for the top 5
~~~

## New columns

Assign to a new column name. The maths runs on every row at once:

~~~python
penguins["mass_kg"] = penguins["body_mass_g"] / 1000
penguins["bill_ratio"] = penguins["bill_length_mm"] / penguins["bill_depth_mm"]
~~~

For categories, \`np.where\` or \`.map\` work well:

~~~python
penguins["size"] = np.where(penguins["body_mass_g"] > 4500, "large", "small")
penguins["code"] = penguins["species"].map({"Adelie": "ADE", "Gentoo": "GEN", "Chinstrap": "CHI"})
~~~

## Counting categories

~~~python
penguins["island"].value_counts()
~~~

gives each island and its count, largest first. Add \`normalize=True\` for proportions.
`,
        },
        {
          kind: 'code',
          id: 'm11-l5-top',
          prompt: 'Create `top5`: the 5 **heaviest** penguins, with only the `species`, `island` and `body_mass_g` columns, heaviest first. Then create `most_common_island`: the island with the most penguins, using `value_counts()`.',
          setup: PENGUINS_DF_SETUP,
          data: [PENGUINS_FILE],
          starter: 'import pandas as pd\n# penguins is loaded\n',
          solution: 'import pandas as pd\ntop5 = penguins.sort_values("body_mass_g", ascending=False)[["species", "island", "body_mass_g"]].head(5)\nmost_common_island = penguins["island"].value_counts().index[0]\n',
          tests: `assert list(top5.columns) == ["species", "island", "body_mass_g"], "Keep only species, island and body_mass_g."
assert len(top5) == 5, "top5 should have 5 rows."
assert top5["body_mass_g"].tolist() == penguins["body_mass_g"].nlargest(5).tolist(), "These should be the 5 heaviest, heaviest first."
assert most_common_island == "Biscoe", f"The most common island is Biscoe, got {most_common_island!r}."`,
          hints: ['sort_values("body_mass_g", ascending=False), then pick columns, then .head(5).', 'value_counts() sorts largest first, so .index[0] is the most common.'],
          review: true,
        },
        {
          kind: 'code',
          id: 'm11-l5-columns',
          prompt: 'Add two new columns to `gapminder`:\n\n- `gdp_bn`: total GDP in **billions** (`pop * gdp_per_cap / 1e9`)\n- `era`: `"modern"` for years 1980 and later, otherwise `"early"`\n\nThen create `richest_2007`: the name of the country with the largest total GDP in 2007.',
          setup: GAPMINDER_DF_SETUP,
          data: [GAPMINDER_FILE],
          starter: 'import pandas as pd\nimport numpy as np\n# gapminder is loaded\n',
          solution: 'import pandas as pd\nimport numpy as np\ngapminder["gdp_bn"] = gapminder["pop"] * gapminder["gdp_per_cap"] / 1e9\ngapminder["era"] = np.where(gapminder["year"] >= 1980, "modern", "early")\nrichest_2007 = gapminder[gapminder["year"] == 2007].sort_values("gdp_bn", ascending=False)["country"].iloc[0]\n',
          tests: `import numpy as _np
assert "gdp_bn" in gapminder.columns and _np.allclose(gapminder["gdp_bn"], gapminder["pop"] * gapminder["gdp_per_cap"] / 1e9), "gdp_bn should be pop * gdp_per_cap / 1e9."
assert "era" in gapminder.columns and (gapminder.loc[gapminder["year"] >= 1980, "era"] == "modern").all() and (gapminder.loc[gapminder["year"] < 1980, "era"] == "early").all(), "era should be 'modern' from 1980 on, otherwise 'early'."
assert richest_2007 == "United States", f"The largest economy in 2007 is the United States, got {richest_2007!r}."`,
          hints: ['gapminder["gdp_bn"] = gapminder["pop"] * gapminder["gdp_per_cap"] / 1e9', 'np.where(gapminder["year"] >= 1980, "modern", "early")', 'Filter to 2007, sort by gdp_bn descending, and take the first country.'],
        },
        {
          kind: 'choice',
          id: 'm11-l5-vectorised',
          question: 'You want a new column that is `body_mass_g / 1000`. Which is the pandas way?',
          options: [
            'Loop over every row with a for loop and build a list',
            '`penguins["mass_kg"] = penguins["body_mass_g"] / 1000`',
            'Copy the column into Excel and back',
            '`penguins.mass_kg = 1000`',
          ],
          answer: 1,
          explain: 'Column arithmetic is vectorised: one line, applied to every row, far faster than a loop.',
        },
      ],
    },
  ],
};
