import type { Module } from '../types';
import { GAPMINDER_FILE, PENGUINS_FILE } from '../datasets';

/** An in-memory SQLite database `con` with a `penguins` table, plus a helper `sql(query)` returning a DataFrame. */
const DB_SETUP = `import sqlite3
import pandas as pd
con = sqlite3.connect(":memory:")
pd.read_csv("data/penguins.csv").to_sql("penguins", con, index=False)
def sql(query):
    return pd.read_sql_query(query, con)
`;

const DB_JOIN_SETUP = `${DB_SETUP}
pd.DataFrame({
    "island": ["Biscoe", "Dream", "Torgersen", "Anvers"],
    "area_km2": [1.9, 0.4, 0.1, 2432.0],
}).to_sql("islands", con, index=False)
`;

const GAP_DB_SETUP = `import sqlite3
import pandas as pd
con = sqlite3.connect(":memory:")
pd.read_csv("data/gapminder.csv").to_sql("gapminder", con, index=False)
def sql(query):
    return pd.read_sql_query(query, con)
`;

// Tests compare the learner's query result with the right answer computed in pandas.
export const m15: Module = {
  id: 'm15',
  number: 15,
  title: 'SQL for data analysis',
  blurb: 'Query databases with SQL, the language every data team speaks.',
  lessons: [
    {
      id: 'm15-l1',
      title: 'SELECT: asking a database',
      summary: 'Pull columns and rows out of a table with SQL.',
      steps: [
        {
          kind: 'read',
          md: `
## Why SQL?

Most company data lives in **databases**, not CSV files. **SQL** (Structured Query Language) is how you ask them questions. Nearly every data job asks for it.

In these lessons, the penguins data is in a table called \`penguins\`, and a helper \`sql(query)\` runs a query and returns a **pandas DataFrame**:

~~~python
sql("SELECT species, island, body_mass_g FROM penguins LIMIT 3")
~~~

~~~text
  species     island  body_mass_g
0  Adelie  Torgersen       3750.0
1  Adelie  Torgersen       3800.0
2  Adelie  Torgersen       3250.0
~~~

- \`SELECT\` lists the columns you want (\`*\` means all of them)
- \`FROM\` names the table
- \`LIMIT\` caps the number of rows

SQL keywords are traditionally written in CAPITALS, but they aren't case-sensitive. The helper is just \`pd.read_sql_query(query, con)\`, where \`con\` is the database connection.
`,
        },
        {
          kind: 'code',
          id: 'm15-l1-select',
          prompt: 'Write a query that selects the `species`, `sex` and `flipper_length_mm` columns for the first **10** rows of `penguins`. Store the result of `sql(...)` in `result`.',
          setup: DB_SETUP,
          data: [PENGUINS_FILE],
          starter: '# con (a database connection) and sql(query) are ready\nresult = sql("")\n',
          solution: 'result = sql("SELECT species, sex, flipper_length_mm FROM penguins LIMIT 10")\n',
          tests: `import pandas as _pd
assert isinstance(result, _pd.DataFrame), "result should be the DataFrame returned by sql(...)."
assert list(result.columns) == ["species", "sex", "flipper_length_mm"], f"Select species, sex and flipper_length_mm, in that order; got {list(result.columns)}."
assert len(result) == 10, f"Use LIMIT 10; got {len(result)} rows."`,
          hints: ['SELECT species, sex, flipper_length_mm FROM penguins LIMIT 10'],
          review: true,
        },
        {
          kind: 'code',
          id: 'm15-l1-distinct',
          prompt: '`SELECT DISTINCT` returns each different value once. Write a query for the distinct **islands**, sorted alphabetically with `ORDER BY island`. Store it in `result`.',
          setup: DB_SETUP,
          data: [PENGUINS_FILE],
          starter: 'result = sql("")\n',
          solution: 'result = sql("SELECT DISTINCT island FROM penguins ORDER BY island")\n',
          tests: `assert list(result.columns) == ["island"], "Select only the island column."
assert result["island"].tolist() == ["Biscoe", "Dream", "Torgersen"], f"Expected the 3 islands in alphabetical order, got {result['island'].tolist()}."`,
          hints: ['SELECT DISTINCT island FROM penguins ORDER BY island'],
        },
      ],
    },
    {
      id: 'm15-l2',
      title: 'WHERE and ORDER BY',
      summary: 'Filter rows and sort results.',
      steps: [
        {
          kind: 'read',
          md: `
## Filtering with WHERE

~~~sql
SELECT species, body_mass_g
FROM penguins
WHERE island = 'Dream' AND body_mass_g > 4000
ORDER BY body_mass_g DESC
~~~

- Text values use **single quotes**: \`'Dream'\`
- Comparisons: \`=\` (one equals sign in SQL!), \`<>\` or \`!=\`, \`<\`, \`>\`, \`<=\`, \`>=\`
- Combine with \`AND\`, \`OR\`, \`NOT\`
- \`IN ('Dream', 'Biscoe')\`, \`BETWEEN 4000 AND 5000\`
- Missing values: \`IS NULL\` / \`IS NOT NULL\` (never \`= NULL\`)
- \`ORDER BY col\` sorts ascending; add \`DESC\` for descending

Multi-line queries are easier to read. In Python, use triple quotes for them.
`,
        },
        {
          kind: 'code',
          id: 'm15-l2-where',
          prompt: 'Query the `species`, `island` and `body_mass_g` of penguins that are **Gentoo** and weigh **at least 5500 g**, heaviest first. Store it in `result`.',
          setup: DB_SETUP,
          data: [PENGUINS_FILE],
          starter: 'result = sql("""\n\n""")\n',
          solution: 'result = sql("""\nSELECT species, island, body_mass_g\nFROM penguins\nWHERE species = \'Gentoo\' AND body_mass_g >= 5500\nORDER BY body_mass_g DESC\n""")\n',
          tests: `df = _pd = __import__("pandas").read_csv("data/penguins.csv")
want = df[(df["species"] == "Gentoo") & (df["body_mass_g"] >= 5500)].sort_values("body_mass_g", ascending=False)
assert list(result.columns) == ["species", "island", "body_mass_g"], f"Select species, island, body_mass_g; got {list(result.columns)}."
assert len(result) == len(want), f"There are {len(want)} Gentoos of at least 5500 g; got {len(result)} rows."
assert result["body_mass_g"].tolist() == want["body_mass_g"].tolist(), "Sort heaviest first: ORDER BY body_mass_g DESC."`,
          hints: ["WHERE species = 'Gentoo' AND body_mass_g >= 5500", 'ORDER BY body_mass_g DESC'],
          review: true,
        },
        {
          kind: 'code',
          id: 'm15-l2-null',
          prompt: 'Query every column (`*`) for the penguins whose `sex` is **missing**. Store it in `result`.',
          setup: DB_SETUP,
          data: [PENGUINS_FILE],
          starter: 'result = sql("")\n',
          solution: 'result = sql("SELECT * FROM penguins WHERE sex IS NULL")\n',
          tests: `assert len(result) == 11 and result["sex"].isna().all(), f"There are 11 penguins with no recorded sex; got {len(result)} rows. Use IS NULL."
assert len(result.columns) == 8, "Select every column with *."`,
          hints: ['SELECT * FROM penguins WHERE sex IS NULL'],
        },
      ],
    },
    {
      id: 'm15-l3',
      title: 'GROUP BY and aggregates',
      summary: 'Counts, averages and totals for each group, in SQL.',
      steps: [
        {
          kind: 'read',
          md: `
## Aggregates

\`COUNT(*)\`, \`COUNT(col)\` (non-missing values), \`SUM(col)\`, \`AVG(col)\`, \`MIN(col)\`, \`MAX(col)\`

~~~sql
SELECT species,
       COUNT(*) AS n,
       ROUND(AVG(body_mass_g), 1) AS avg_mass
FROM penguins
GROUP BY species
ORDER BY avg_mass DESC
~~~

- \`GROUP BY\` works like pandas \`groupby\`: one result row per group
- \`AS\` names a result column
- To filter **groups** (after aggregating), use \`HAVING\`, not \`WHERE\`:

~~~sql
SELECT island, COUNT(*) AS n
FROM penguins
GROUP BY island
HAVING COUNT(*) > 100
~~~

\`WHERE\` filters rows **before** grouping; \`HAVING\` filters groups **after**.
`,
        },
        {
          kind: 'code',
          id: 'm15-l3-group',
          prompt: 'Query each **island** with the number of penguins (`n`) and the maximum flipper length (`max_flipper`), sorted by `n` descending. Store it in `result`.',
          setup: DB_SETUP,
          data: [PENGUINS_FILE],
          starter: 'result = sql("""\n\n""")\n',
          solution: 'result = sql("""\nSELECT island, COUNT(*) AS n, MAX(flipper_length_mm) AS max_flipper\nFROM penguins\nGROUP BY island\nORDER BY n DESC\n""")\n',
          tests: `assert list(result.columns) == ["island", "n", "max_flipper"], f"Columns should be island, n, max_flipper; got {list(result.columns)}."
assert result["island"].tolist() == ["Biscoe", "Dream", "Torgersen"] and result["n"].tolist() == [168, 124, 52], f"Got {result.values.tolist()}"
df = __import__("pandas").read_csv("data/penguins.csv")
assert result["max_flipper"].tolist() == [df[df["island"] == i]["flipper_length_mm"].max() for i in ["Biscoe", "Dream", "Torgersen"]], "max_flipper should be MAX(flipper_length_mm)."`,
          hints: ['SELECT island, COUNT(*) AS n, MAX(flipper_length_mm) AS max_flipper', 'GROUP BY island ORDER BY n DESC'],
          review: true,
        },
        {
          kind: 'code',
          id: 'm15-l3-having',
          prompt: 'Using the `gapminder` table (every country, every 5 years), query each **continent** in **2007** with its average life expectancy as `avg_life` (rounded to 1 decimal place), keeping only continents whose average is **above 70**. Sort by `avg_life` descending.',
          setup: GAP_DB_SETUP,
          data: [GAPMINDER_FILE],
          starter: '# the gapminder table has: country, continent, year, life_exp, pop, gdp_per_cap\nresult = sql("""\n\n""")\n',
          solution: 'result = sql("""\nSELECT continent, ROUND(AVG(life_exp), 1) AS avg_life\nFROM gapminder\nWHERE year = 2007\nGROUP BY continent\nHAVING AVG(life_exp) > 70\nORDER BY avg_life DESC\n""")\n',
          tests: `g = __import__("pandas").read_csv("data/gapminder.csv")
want = g[g["year"] == 2007].groupby("continent")["life_exp"].mean()
want = want[want > 70].sort_values(ascending=False)
assert list(result.columns) == ["continent", "avg_life"], f"Columns should be continent and avg_life; got {list(result.columns)}."
assert result["continent"].tolist() == list(want.index), f"Expected {list(want.index)}, got {result['continent'].tolist()}."
assert [round(v, 1) for v in result["avg_life"]] == [round(v, 1) for v in want], "avg_life should be ROUND(AVG(life_exp), 1)."`,
          hints: ['WHERE year = 2007 filters rows before grouping.', 'HAVING AVG(life_exp) > 70 filters the groups after.'],
        },
      ],
    },
    {
      id: 'm15-l4',
      title: 'JOIN: combining tables',
      summary: 'Link tables on a shared column, the heart of relational databases.',
      steps: [
        {
          kind: 'read',
          md: `
## Relational data

Databases split information into tables that link on **key** columns. Here there's a second table, \`islands\`, with an area for each island. **These areas are illustrative, made up for practice** (not survey measurements). Anvers is a large nearby island with no penguins in our data:

| island | area_km2 |
|---|---|
| Biscoe | 1.9 |
| Dream | 0.4 |
| Torgersen | 0.1 |
| Anvers | 2432.0 |

~~~sql
SELECT p.species, p.island, i.area_km2
FROM penguins AS p
JOIN islands AS i ON p.island = i.island
~~~

- \`p\` and \`i\` are **aliases**, short names for the tables
- \`JOIN\` (an **inner** join) keeps only rows with a match in both tables
- \`LEFT JOIN\` keeps every row of the first table, with NULLs where there's no match

This is the same as pandas \`merge\` with \`how="inner"\` or \`how="left"\`.
`,
        },
        {
          kind: 'code',
          id: 'm15-l4-join',
          prompt: 'Join `penguins` to `islands` and, for each island, return `island`, `area_km2` and `n` (the number of penguins), plus `per_km2`: penguins per square kilometre, rounded to 0 decimal places. Sort by `per_km2` descending.',
          setup: DB_JOIN_SETUP,
          data: [PENGUINS_FILE],
          starter: 'result = sql("""\n\n""")\n',
          solution: 'result = sql("""\nSELECT i.island, i.area_km2, COUNT(*) AS n, ROUND(COUNT(*) / i.area_km2, 0) AS per_km2\nFROM penguins AS p\nJOIN islands AS i ON p.island = i.island\nGROUP BY i.island, i.area_km2\nORDER BY per_km2 DESC\n""")\n',
          tests: `assert list(result.columns) == ["island", "area_km2", "n", "per_km2"], f"Columns should be island, area_km2, n, per_km2; got {list(result.columns)}."
assert result["island"].tolist() == ["Torgersen", "Dream", "Biscoe"], f"Expected Torgersen, Dream, Biscoe (densest first); got {result['island'].tolist()}."
assert result["per_km2"].tolist() == [520.0, 310.0, 88.0], f"Expected densities 520, 310 and 88; got {result['per_km2'].tolist()}."`,
          hints: [
            'FROM penguins AS p JOIN islands AS i ON p.island = i.island',
            'GROUP BY i.island, i.area_km2 and use COUNT(*) for n.',
            'ROUND(COUNT(*) / i.area_km2, 0) AS per_km2',
          ],
          review: true,
        },
        {
          kind: 'code',
          id: 'm15-l4-left',
          prompt: 'Use a **LEFT JOIN** from `islands` to `penguins` to list **every** island with its penguin count as `n`, including islands with none. Count `p.species` (not `*`), so islands without penguins get 0. Sort by `n` descending.',
          setup: DB_JOIN_SETUP,
          data: [PENGUINS_FILE],
          starter: 'result = sql("""\n\n""")\n',
          solution: 'result = sql("""\nSELECT i.island, COUNT(p.species) AS n\nFROM islands AS i\nLEFT JOIN penguins AS p ON p.island = i.island\nGROUP BY i.island\nORDER BY n DESC\n""")\n',
          tests: `assert list(result.columns) == ["island", "n"], f"Columns should be island and n; got {list(result.columns)}."
assert dict(zip(result["island"], result["n"])) == {"Biscoe": 168, "Dream": 124, "Torgersen": 52, "Anvers": 0}, f"Got {dict(zip(result['island'], result['n']))}. Is Anvers included with 0?"
assert result["n"].tolist() == [168, 124, 52, 0], "Sort by n descending."`,
          hints: ['FROM islands AS i LEFT JOIN penguins AS p ON p.island = i.island', 'COUNT(p.species) counts only matched rows, so Anvers gets 0.'],
        },
        {
          kind: 'choice',
          id: 'm15-l4-inner-left',
          question: 'With an **inner** JOIN from `islands` to `penguins`, what happens to Anvers (which has no penguins)?',
          options: ['It appears with NULLs', 'It is left out', 'It appears with a count of 0', 'The query fails'],
          answer: 1,
          explain: 'An inner join keeps only rows that match in both tables. A LEFT JOIN keeps every island.',
        },
      ],
    },
    {
      id: 'm15-l5',
      title: 'SQL or pandas?',
      summary: 'Use each for what it does best, and write queries safely.',
      steps: [
        {
          kind: 'read',
          md: `
## A typical workflow

1. Use **SQL** to filter, join and aggregate data **where it lives**. Databases are fast, and you avoid downloading millions of rows
2. Pull the (smaller) result into **pandas** for detailed analysis, charts and modelling

~~~python
df = pd.read_sql_query("SELECT ... FROM ... WHERE ...", con)
~~~

## Never paste user input into SQL

Building a query with an f-string from user input is a classic security hole (**SQL injection**). Use **parameters** instead: \`?\` placeholders, with the values passed separately:

~~~python
species = "Gentoo"
pd.read_sql_query("SELECT * FROM penguins WHERE species = ?", con, params=(species,))
~~~

The database treats parameters strictly as values, never as SQL code.

## Subqueries

A query can use another query's result:

~~~sql
SELECT species, body_mass_g FROM penguins
WHERE body_mass_g > (SELECT AVG(body_mass_g) FROM penguins)
~~~
`,
        },
        {
          kind: 'code',
          id: 'm15-l5-params',
          prompt: 'Define `species_summary(species)` that returns the result of a **parameterised** query (use `?` and `params=`) giving the `island` and `COUNT(*) AS n` for that species, grouped by island and sorted by island.',
          setup: DB_SETUP,
          data: [PENGUINS_FILE],
          starter: 'import pandas as pd\n# con is the database connection\n',
          solution: 'import pandas as pd\n\ndef species_summary(species):\n    query = "SELECT island, COUNT(*) AS n FROM penguins WHERE species = ? GROUP BY island ORDER BY island"\n    return pd.read_sql_query(query, con, params=(species,))\n',
          tests: `r = species_summary("Adelie")
assert list(r.columns) == ["island", "n"], f"Columns should be island and n; got {list(r.columns)}."
assert r.values.tolist() == [["Biscoe", 44], ["Dream", 56], ["Torgersen", 52]], f"Adelie counts by island should be Biscoe 44, Dream 56, Torgersen 52; got {r.values.tolist()}."
assert species_summary("Gentoo").values.tolist() == [["Biscoe", 124]], "It should work for any species."
assert "?" in source and "params" in source, "Use a ? placeholder and pass params=(species,)."
assert "{species}" not in source, "Don't put the species into the query with an f-string."`,
          hints: ['WHERE species = ?', 'pd.read_sql_query(query, con, params=(species,))'],
          review: true,
        },
        {
          kind: 'code',
          id: 'm15-l5-subquery',
          prompt: 'Write a query (with a subquery) that returns the `species`, `island` and `body_mass_g` of every penguin heavier than the **average Gentoo**. Store it in `result`.',
          setup: DB_SETUP,
          data: [PENGUINS_FILE],
          starter: 'result = sql("""\n\n""")\n',
          solution: 'result = sql("""\nSELECT species, island, body_mass_g\nFROM penguins\nWHERE body_mass_g > (SELECT AVG(body_mass_g) FROM penguins WHERE species = \'Gentoo\')\n""")\n',
          tests: `df = __import__("pandas").read_csv("data/penguins.csv")
avg = df[df["species"] == "Gentoo"]["body_mass_g"].mean()
want = df[df["body_mass_g"] > avg]
assert list(result.columns) == ["species", "island", "body_mass_g"], f"Columns should be species, island, body_mass_g; got {list(result.columns)}."
assert len(result) == len(want), f"{len(want)} penguins are heavier than the average Gentoo; got {len(result)}."`,
          hints: ["The subquery is (SELECT AVG(body_mass_g) FROM penguins WHERE species = 'Gentoo')", 'WHERE body_mass_g > (that subquery)'],
        },
      ],
    },
  ],
};
