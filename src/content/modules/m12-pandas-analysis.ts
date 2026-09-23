import type { Module } from '../types';
import { GAPMINDER_DF_SETUP, GAPMINDER_FILE, PENGUINS_DF_SETUP, PENGUINS_FILE, WEATHER_DF_SETUP, WEATHER_FILE } from '../datasets';

const SPECIES_INFO = `species_info = pd.DataFrame({
    "species": ["Adelie", "Chinstrap", "Gentoo", "Emperor"],
    "scientific_name": ["Pygoscelis adeliae", "Pygoscelis antarcticus", "Pygoscelis papua", "Aptenodytes forsteri"],
})
`;

const WEATHER_DATES_SETUP = `${WEATHER_DF_SETUP}
weather["date"] = pd.to_datetime(weather[["year", "month"]].assign(day=1))
`;

export const m12: Module = {
  id: 'm12',
  number: 12,
  title: 'Analysing data with pandas',
  blurb: 'Clean missing values, group, combine and reshape tables, and work with dates.',
  lessons: [
    {
      id: 'm12-l1',
      title: 'Missing data',
      summary: 'Find the gaps, then decide: drop them or fill them.',
      steps: [
        {
          kind: 'read',
          md: `
## Every real dataset has gaps

pandas marks missing values as \`NaN\`. First, find them:

~~~python
penguins.isna().sum()          # missing values in each column
penguins["sex"].isna().mean()  # the proportion missing
~~~

Most pandas calculations **skip** \`NaN\` automatically: \`.mean()\` averages only the values that exist.

## Dropping or filling

~~~python
penguins.dropna()                           # drop rows with ANY missing value
penguins.dropna(subset=["body_mass_g"])     # drop rows missing a mass only
penguins["sex"].fillna("unknown")           # fill with a value
penguins["body_mass_g"].fillna(penguins["body_mass_g"].median())
~~~

There's no single right answer. Dropping loses information; filling invents it. Always **report** what you did and how many rows it affected, because silently changing data misleads people.
`,
        },
        {
          kind: 'code',
          id: 'm12-l1-count',
          prompt: 'Create:\n\n- `missing`: a Series with the number of missing values in each column of `penguins`\n- `complete`: a copy of `penguins` with rows dropped only where `body_mass_g` **or** `sex` is missing\n- `dropped`: how many rows that removed',
          setup: PENGUINS_DF_SETUP,
          data: [PENGUINS_FILE],
          starter: 'import pandas as pd\n# penguins is loaded\n',
          solution: 'import pandas as pd\nmissing = penguins.isna().sum()\ncomplete = penguins.dropna(subset=["body_mass_g", "sex"])\ndropped = len(penguins) - len(complete)\n',
          tests: `assert missing.to_dict() == penguins.isna().sum().to_dict(), "missing should be penguins.isna().sum()."
want = penguins.dropna(subset=["body_mass_g", "sex"])
assert complete.equals(want), f"complete should have {len(want)} rows (drop only where body_mass_g or sex is missing)."
assert dropped == 11, f"That removes 11 rows, but dropped is {dropped}."`,
          hints: ['penguins.isna().sum()', 'penguins.dropna(subset=["body_mass_g", "sex"])', 'Compare the lengths before and after.'],
          review: true,
        },
        {
          kind: 'predict',
          id: 'm12-l1-mean-skips',
          code: 'import pandas as pd\nimport numpy as np\ns = pd.Series([10, np.nan, 20])\nprint(s.mean(), s.count(), len(s))\n',
          options: ['15.0 2 3', 'nan 2 3', '10.0 3 3', '15.0 3 3'],
          answer: 0,
          explain: 'mean() skips the NaN, averaging 10 and 20. count() counts non-missing values (2), while len() counts every row (3).',
        },
        {
          kind: 'code',
          id: 'm12-l1-fill',
          prompt: 'Make `filled`: a copy of the `body_mass_g` column where missing values are replaced by the **median** mass. Then create `n_filled`: how many values were filled.',
          setup: PENGUINS_DF_SETUP,
          data: [PENGUINS_FILE],
          starter: 'import pandas as pd\n',
          solution: 'import pandas as pd\nmedian_mass = penguins["body_mass_g"].median()\nfilled = penguins["body_mass_g"].fillna(median_mass)\nn_filled = penguins["body_mass_g"].isna().sum()\n',
          tests: `m = penguins["body_mass_g"].median()
assert filled.isna().sum() == 0, "filled should have no missing values."
assert filled.equals(penguins["body_mass_g"].fillna(m)), f"Fill the gaps with the median ({m})."
assert n_filled == 2, f"2 values were missing, but n_filled is {n_filled}."`,
          hints: ['penguins["body_mass_g"].median()', '.fillna(that_median)', 'Count the gaps before filling with .isna().sum().'],
        },
      ],
    },
    {
      id: 'm12-l2',
      title: 'groupby: split, apply, combine',
      summary: 'Summaries for every group in one line.',
      steps: [
        {
          kind: 'read',
          md: `
## The most useful line in pandas

Remember the penguin census, where you kept running totals per species in dictionaries? This does it all:

~~~python
penguins.groupby("species")["body_mass_g"].mean()
~~~

~~~text
species
Adelie       3700.662252
Chinstrap    3733.088235
Gentoo       5076.016260
Name: body_mass_g, dtype: float64
~~~

**Split** the rows into groups, **apply** a calculation to each, **combine** the results.

## Several summaries at once

~~~python
penguins.groupby("species")["body_mass_g"].agg(["mean", "min", "max", "count"])

penguins.groupby(["island", "species"]).size()          # rows per combination

penguins.groupby("species").agg(
    avg_mass=("body_mass_g", "mean"),                    # named results
    avg_flipper=("flipper_length_mm", "mean"),
).reset_index()                                          # turn the group labels back into a column
~~~
`,
        },
        {
          kind: 'code',
          id: 'm12-l2-mean',
          prompt: 'Create `avg_flipper`: the average flipper length for each **island**, rounded to 1 decimal place. Then create `longest_island`: the island with the highest average.',
          setup: PENGUINS_DF_SETUP,
          data: [PENGUINS_FILE],
          starter: 'import pandas as pd\n# penguins is loaded\n',
          solution: 'import pandas as pd\navg_flipper = penguins.groupby("island")["flipper_length_mm"].mean().round(1)\nlongest_island = avg_flipper.idxmax()\n',
          tests: `want = penguins.groupby("island")["flipper_length_mm"].mean().round(1)
assert avg_flipper.to_dict() == want.to_dict(), f"Expected {want.to_dict()}, got {dict(avg_flipper)}."
assert longest_island == "Biscoe", f"Biscoe has the longest average flippers, got {longest_island!r}."`,
          hints: ['penguins.groupby("island")["flipper_length_mm"].mean()', '.round(1) rounds a Series; .idxmax() gives the label of the largest value.'],
          review: true,
        },
        {
          kind: 'code',
          id: 'm12-l2-agg',
          prompt: 'Using named aggregation, create `summary`: one row per **species** with columns `species`, `count` (number of masses recorded), `avg_mass` and `max_mass`. Round `avg_mass` to 0 decimal places. Use `.reset_index()` so `species` is a column.',
          setup: PENGUINS_DF_SETUP,
          data: [PENGUINS_FILE],
          starter: 'import pandas as pd\n',
          solution: 'import pandas as pd\nsummary = penguins.groupby("species").agg(\n    count=("body_mass_g", "count"),\n    avg_mass=("body_mass_g", "mean"),\n    max_mass=("body_mass_g", "max"),\n).reset_index()\nsummary["avg_mass"] = summary["avg_mass"].round(0)\n',
          tests: `assert list(summary.columns) == ["species", "count", "avg_mass", "max_mass"], f"Columns should be species, count, avg_mass, max_mass; got {list(summary.columns)}."
g = penguins.groupby("species")["body_mass_g"]
assert summary["count"].tolist() == g.count().tolist(), "count should be the number of recorded masses."
assert summary["avg_mass"].tolist() == g.mean().round(0).tolist(), "avg_mass should be the mean, rounded to 0 places."
assert summary["max_mass"].tolist() == g.max().tolist(), "max_mass should be the largest mass."`,
          hints: [
            '.agg(count=("body_mass_g", "count"), avg_mass=("body_mass_g", "mean"), max_mass=("body_mass_g", "max"))',
            'Add .reset_index() at the end, then round the avg_mass column.',
          ],
        },
        {
          kind: 'code',
          id: 'm12-l2-continent',
          prompt: 'Using `gapminder`, create `life_2007`: the **median** life expectancy per continent in **2007**, sorted from highest to lowest.',
          setup: GAPMINDER_DF_SETUP,
          data: [GAPMINDER_FILE],
          starter: 'import pandas as pd\n',
          solution: 'import pandas as pd\nlife_2007 = gapminder[gapminder["year"] == 2007].groupby("continent")["life_exp"].median().sort_values(ascending=False)\n',
          tests: `want = gapminder[gapminder["year"] == 2007].groupby("continent")["life_exp"].median().sort_values(ascending=False)
assert list(life_2007.index) == list(want.index), f"Expected the order {list(want.index)}, got {list(life_2007.index)}."
assert life_2007.round(3).tolist() == want.round(3).tolist(), "Use the median of life_exp for each continent in 2007."`,
          hints: ['Filter to 2007 first.', '.groupby("continent")["life_exp"].median()', '.sort_values(ascending=False)'],
        },
      ],
    },
    {
      id: 'm12-l3',
      title: 'Combining tables',
      summary: 'Join tables on a shared column with merge, and stack them with concat.',
      steps: [
        {
          kind: 'read',
          md: `
## merge: SQL-style joins

Data often lives in separate tables that share a **key** column. \`merge\` lines them up:

~~~python
species_info = pd.DataFrame({
    "species": ["Adelie", "Chinstrap", "Gentoo", "Emperor"],
    "scientific_name": ["Pygoscelis adeliae", "Pygoscelis antarcticus", "Pygoscelis papua", "Aptenodytes forsteri"],
})
merged = penguins.merge(species_info, on="species", how="left")
~~~

| how | Keeps |
|---|---|
| \`"inner"\` (default) | only keys found in **both** tables |
| \`"left"\` | every row of the left table; missing matches become NaN |
| \`"right"\` | every row of the right table |
| \`"outer"\` | everything from both |

**Always check row counts after a merge.** If the key isn't unique in the right-hand table, rows get duplicated.

## concat: stacking

~~~python
pd.concat([df_2008, df_2009])     # one table on top of another (same columns)
~~~
`,
        },
        {
          kind: 'predict',
          id: 'm12-l3-how',
          code: 'import pandas as pd\nleft = pd.DataFrame({"k": ["a", "b", "c"]})\nright = pd.DataFrame({"k": ["b", "c", "d"], "v": [2, 3, 4]})\nprint(len(left.merge(right, on="k")), len(left.merge(right, on="k", how="left")), len(left.merge(right, on="k", how="outer")))\n',
          options: ['2 3 4', '3 3 3', '2 2 4', '3 3 4'],
          answer: 0,
          explain: 'inner keeps b and c (2 rows); left keeps a, b, c (3); outer keeps a, b, c, d (4).',
        },
        {
          kind: 'code',
          id: 'm12-l3-merge',
          prompt: '`species_info` (shown in the lesson) is set up for you. Create `named`: `penguins` merged with `species_info` so that **every penguin is kept**. Then create `unused`: a list of the species in `species_info` that match **no** penguins.',
          setup: `${PENGUINS_DF_SETUP}${SPECIES_INFO}`,
          data: [PENGUINS_FILE],
          starter: 'import pandas as pd\n# penguins and species_info are loaded\n',
          solution: 'import pandas as pd\nnamed = penguins.merge(species_info, on="species", how="left")\nunused = [s for s in species_info["species"] if s not in set(penguins["species"])]\n',
          tests: `assert len(named) == len(penguins), f"Every penguin should be kept once: {len(penguins)} rows, got {len(named)}."
assert "scientific_name" in named.columns and named["scientific_name"].isna().sum() == 0, "Merge on species with how=\\"left\\"."
assert (named.loc[named["species"] == "Gentoo", "scientific_name"] == "Pygoscelis papua").all(), "Gentoo should be matched to Pygoscelis papua."
assert list(unused) == ["Emperor"], f"Only Emperor has no penguins in the data, got {unused}."`,
          hints: ['penguins.merge(species_info, on="species", how="left")', 'For unused, check which species_info["species"] values are not in penguins["species"].'],
          review: true,
        },
        {
          kind: 'code',
          id: 'm12-l3-concat',
          prompt: '`y2007` and `y2009` are the penguin rows for those two years. Stack them into one DataFrame `both` using `pd.concat`, with a fresh index (`ignore_index=True`).',
          setup: `${PENGUINS_DF_SETUP}y2007 = penguins[penguins["year"] == 2007]\ny2009 = penguins[penguins["year"] == 2009]\n`,
          data: [PENGUINS_FILE],
          starter: 'import pandas as pd\n# y2007 and y2009 are loaded\n',
          solution: 'import pandas as pd\nboth = pd.concat([y2007, y2009], ignore_index=True)\n',
          tests: `assert len(both) == len(y2007) + len(y2009), f"both should have {len(y2007) + len(y2009)} rows."
assert both.index.tolist() == list(range(len(both))), "Use ignore_index=True to number the rows 0, 1, 2, ..."
assert set(both["year"]) == {2007, 2009}, "both should contain only 2007 and 2009."`,
          hints: ['pd.concat([y2007, y2009], ignore_index=True)'],
        },
      ],
    },
    {
      id: 'm12-l4',
      title: 'Pivot tables and reshaping',
      summary: 'Turn long data into a readable grid, and back again.',
      steps: [
        {
          kind: 'read',
          md: `
## pivot_table

A **pivot table** summarises one value across two categories, just like in Excel:

~~~python
penguins.pivot_table(index="island", columns="species", values="body_mass_g", aggfunc="mean")
~~~

~~~text
species         Adelie    Chinstrap      Gentoo
island
Biscoe     3709.659091          NaN  5076.01626
Dream      3688.392857  3733.088235         NaN
Torgersen  3706.372549          NaN         NaN
~~~

The \`NaN\`s show combinations with no penguins: Gentoos only live on Biscoe here.

## crosstab: counting combinations

~~~python
pd.crosstab(penguins["island"], penguins["species"])
~~~

## Long and wide

Tidy data is usually **long** (one row per observation). \`pivot_table\` makes it **wide**; \`melt\` turns wide back into long:

~~~python
wide.melt(id_vars="island", var_name="species", value_name="mass")
~~~
`,
        },
        {
          kind: 'code',
          id: 'm12-l4-crosstab',
          prompt: 'Create `counts`: a crosstab of `island` (rows) by `species` (columns). Then create `dream_chinstrap`: the number of Chinstrap penguins on Dream, read from it.',
          setup: PENGUINS_DF_SETUP,
          data: [PENGUINS_FILE],
          starter: 'import pandas as pd\n',
          solution: 'import pandas as pd\ncounts = pd.crosstab(penguins["island"], penguins["species"])\ndream_chinstrap = counts.loc["Dream", "Chinstrap"]\n',
          tests: `want = pd.crosstab(penguins["island"], penguins["species"])
assert counts.equals(want), "counts should be pd.crosstab(penguins[\\"island\\"], penguins[\\"species\\"])."
assert dream_chinstrap == 68, f"There are 68 Chinstraps on Dream, got {dream_chinstrap}."`,
          hints: ['pd.crosstab(penguins["island"], penguins["species"])', 'Read one cell with counts.loc["Dream", "Chinstrap"].'],
          review: true,
        },
        {
          kind: 'code',
          id: 'm12-l4-pivot',
          prompt: 'From `gapminder`, create `life_wide`: a pivot table of **mean life expectancy** with `year` as rows and `continent` as columns. Then create `europe_gain`: how much Europe\'s average rose from 1952 to 2007, rounded to 1 decimal place.',
          setup: GAPMINDER_DF_SETUP,
          data: [GAPMINDER_FILE],
          starter: 'import pandas as pd\n',
          solution: 'import pandas as pd\nlife_wide = gapminder.pivot_table(index="year", columns="continent", values="life_exp", aggfunc="mean")\neurope_gain = round(life_wide.loc[2007, "Europe"] - life_wide.loc[1952, "Europe"], 1)\n',
          tests: `want = gapminder.pivot_table(index="year", columns="continent", values="life_exp", aggfunc="mean")
assert life_wide.shape == (12, 5), f"There should be 12 years x 5 continents, got {life_wide.shape}."
assert (life_wide.round(6) == want.round(6)).all().all(), "Use values=\\"life_exp\\" and aggfunc=\\"mean\\"."
assert europe_gain == round(want.loc[2007, "Europe"] - want.loc[1952, "Europe"], 1), "europe_gain is the 2007 value minus the 1952 value for Europe."`,
          hints: ['gapminder.pivot_table(index="year", columns="continent", values="life_exp", aggfunc="mean")', 'life_wide.loc[2007, "Europe"] - life_wide.loc[1952, "Europe"]'],
        },
      ],
    },
    {
      id: 'm12-l5',
      title: 'Dates and time series',
      summary: '173 years of Oxford weather: dates, resampling and rolling averages.',
      steps: [
        {
          kind: 'read',
          md: `
## Real dates

\`weather\` holds **monthly Oxford weather since 1853** from the Met Office: \`year\`, \`month\`, \`tmax_c\` (average daily high), \`tmin_c\`, \`frost_days\`, \`rain_mm\` and \`sun_hours\`.

Make a proper date column from the parts:

~~~python
weather["date"] = pd.to_datetime(weather[["year", "month"]].assign(day=1))
~~~

Date columns have a \`.dt\` accessor: \`weather["date"].dt.year\`, \`.dt.month_name()\`, \`.dt.dayofweek\`.

## Time series tools

With the date as the index, pandas understands time:

~~~python
ts = weather.set_index("date")["tmax_c"]
ts["2025"]                        # every month of 2025
ts.resample("YE").mean()          # yearly averages ("YE" = year end)
ts.rolling(12).mean()             # a 12-month moving average smooths out the seasons
~~~

\`pd.to_datetime("2007-11-11")\` parses text; subtracting dates gives a time difference, as with \`datetime\`.
`,
        },
        {
          kind: 'code',
          id: 'm12-l5-yearly',
          prompt: 'The `date` column is already added to `weather`. Create `yearly`: a Series of the **average `tmax_c` for each year**, using `set_index` and `resample("YE")`. Then create `warmest_year` (an int) and `warmest_value` (rounded to 2 decimal places).',
          setup: WEATHER_DATES_SETUP,
          data: [WEATHER_FILE],
          starter: 'import pandas as pd\n# weather is loaded, with a date column\n',
          solution: 'import pandas as pd\nyearly = weather.set_index("date")["tmax_c"].resample("YE").mean()\nwarmest_year = int(yearly.idxmax().year)\nwarmest_value = round(yearly.max(), 2)\n',
          tests: `want = weather.groupby("year")["tmax_c"].mean()
assert len(yearly) == len(want), f"There should be one value per year ({len(want)}), got {len(yearly)}."
assert (yearly.round(6).values == want.round(6).values).all(), "yearly should average tmax_c within each year."
assert warmest_year == int(want.idxmax()), f"The warmest year was {int(want.idxmax())}, got {warmest_year}."
assert warmest_value == round(want.max(), 2), f"warmest_value should be {round(want.max(), 2)}."`,
          hints: [
            'weather.set_index("date")["tmax_c"].resample("YE").mean()',
            'yearly.idxmax() gives the date of the largest value; .year gets its year.',
          ],
          review: true,
        },
        {
          kind: 'code',
          id: 'm12-l5-decades',
          prompt: 'Compare the climate: add a `decade` column (e.g. 1853 → 1850, 2025 → 2020) using `//`. Create `decade_avg`: the mean `tmax_c` per decade. Then create `change`: the 2010s average minus the 1860s average, rounded to 2 decimal places.',
          setup: WEATHER_DATES_SETUP,
          data: [WEATHER_FILE],
          starter: 'import pandas as pd\n',
          solution: 'import pandas as pd\nweather["decade"] = weather["year"] // 10 * 10\ndecade_avg = weather.groupby("decade")["tmax_c"].mean()\nchange = round(decade_avg[2010] - decade_avg[1860], 2)\n',
          tests: `d = weather["year"] // 10 * 10
want = weather.groupby(d)["tmax_c"].mean()
assert "decade" in weather.columns and (weather["decade"] == d).all(), "decade should be year // 10 * 10."
assert decade_avg.round(6).to_dict() == want.round(6).to_dict(), "decade_avg should be the mean tmax_c for each decade."
assert change == round(want[2010] - want[1860], 2), f"change should be {round(want[2010] - want[1860], 2)}."
assert change > 1, "Oxford's 2010s were over a degree warmer than the 1860s."`,
          hints: ['weather["year"] // 10 * 10 turns 1853 into 1850.', 'weather.groupby("decade")["tmax_c"].mean()', 'decade_avg[2010] - decade_avg[1860]'],
        },
        {
          kind: 'choice',
          id: 'm12-l5-rolling',
          question: 'Why take a 12-month rolling average of monthly temperatures before looking for a long-term trend?',
          options: [
            'It makes the data more accurate',
            'It removes the big up-and-down seasonal cycle, so slower changes are easier to see',
            'It fills in missing values',
            'It converts Celsius to Fahrenheit',
          ],
          answer: 1,
          explain: 'Each value averages a full year, so summer and winter cancel out. What remains is the year-to-year trend.',
        },
      ],
    },
    {
      id: 'm12-l6',
      title: 'Project: 55 years of global development',
      summary: 'Answer real questions about the world with the Gapminder data.',
      steps: [
        {
          kind: 'read',
          md: `
## The questions

Using \`gapminder\` (142 countries, 1952 to 2007), you'll find out:

1. Which countries' life expectancy **rose the most** between 1952 and 2007?
2. How did each **continent's** population change?
3. Which countries had **higher** life expectancy in 1952 than in 2007 (a fall)?

This uses filtering, merging, grouping and sorting together, the way real analysis does.
`,
        },
        {
          kind: 'code',
          id: 'm12-l6-gains',
          prompt: 'Build `change`: one row per country with columns `country`, `continent`, `life_1952`, `life_2007` and `gain` (2007 minus 1952), sorted by `gain` from **largest to smallest**, with a fresh index.\n\nTip: filter each year, rename the column, then merge the two tables on `country` and `continent`.',
          setup: GAPMINDER_DF_SETUP,
          data: [GAPMINDER_FILE],
          starter: 'import pandas as pd\n',
          solution: 'import pandas as pd\nearly = gapminder[gapminder["year"] == 1952][["country", "continent", "life_exp"]].rename(columns={"life_exp": "life_1952"})\nlate = gapminder[gapminder["year"] == 2007][["country", "continent", "life_exp"]].rename(columns={"life_exp": "life_2007"})\nchange = early.merge(late, on=["country", "continent"])\nchange["gain"] = change["life_2007"] - change["life_1952"]\nchange = change.sort_values("gain", ascending=False).reset_index(drop=True)\n',
          tests: `assert list(change.columns) == ["country", "continent", "life_1952", "life_2007", "gain"], f"Columns should be country, continent, life_1952, life_2007, gain; got {list(change.columns)}."
assert len(change) == 142, f"There should be one row per country (142), got {len(change)}."
assert change["gain"].is_monotonic_decreasing, "Sort by gain, largest first."
assert change.loc[0, "country"] == "Oman", f"The biggest gain was Oman's, got {change.loc[0, 'country']!r}."
assert change.index.tolist() == list(range(142)), "Reset the index with .reset_index(drop=True)."`,
          hints: [
            'early = gapminder[gapminder["year"] == 1952][["country", "continent", "life_exp"]].rename(columns={"life_exp": "life_1952"})',
            'Do the same for 2007, then early.merge(late, on=["country", "continent"]).',
            'Add gain, then sort_values("gain", ascending=False).reset_index(drop=True).',
          ],
          review: true,
        },
        {
          kind: 'code',
          id: 'm12-l6-pop',
          prompt: 'Create `pop_growth`: for each continent, total population in 2007 divided by total population in 1952, rounded to 2 decimal places, sorted largest first.',
          setup: GAPMINDER_DF_SETUP,
          data: [GAPMINDER_FILE],
          starter: 'import pandas as pd\n',
          solution: 'import pandas as pd\ntotals = gapminder.pivot_table(index="continent", columns="year", values="pop", aggfunc="sum")\npop_growth = (totals[2007] / totals[1952]).round(2).sort_values(ascending=False)\n',
          tests: `t = gapminder.groupby(["continent", "year"])["pop"].sum()
want = {c: round(t[(c, 2007)] / t[(c, 1952)], 2) for c in gapminder["continent"].unique()}
assert {k: float(v) for k, v in pop_growth.items()} == want, f"Expected {want}, got {dict(pop_growth)}."
assert list(pop_growth.index)[0] == "Africa", "Sort largest first: Africa grew fastest."`,
          hints: ['A pivot table with continent rows, year columns and aggfunc="sum" gives the totals.', 'Divide the 2007 column by the 1952 column, round, and sort.'],
        },
        {
          kind: 'code',
          id: 'm12-l6-falls',
          prompt: 'Using your approach from the first step (the code is up to you), create `fell`: a **sorted list** of the countries whose life expectancy was **lower in 2007 than in 1952**.',
          setup: GAPMINDER_DF_SETUP,
          data: [GAPMINDER_FILE],
          starter: 'import pandas as pd\n',
          solution: 'import pandas as pd\nwide = gapminder.pivot_table(index="country", columns="year", values="life_exp")\nfell = sorted(wide[wide[2007] < wide[1952]].index)\n',
          tests: `w = gapminder.pivot_table(index="country", columns="year", values="life_exp")
want = sorted(w[w[2007] < w[1952]].index)
assert list(fell) == want, f"Expected {want}, got {list(fell)}."`,
          hints: ['A pivot table with country rows and year columns makes this a one-line filter.', 'wide[wide[2007] < wide[1952]].index gives the country names.'],
        },
      ],
    },
  ],
};
