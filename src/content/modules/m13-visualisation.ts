import type { Module } from '../types';
import { GAPMINDER_DF_SETUP, GAPMINDER_FILE, PENGUINS_DF_SETUP, PENGUINS_FILE, WEATHER_DF_SETUP, WEATHER_FILE } from '../datasets';

const YEARLY_SETUP = `${WEATHER_DF_SETUP}
yearly = weather.groupby("year")["tmax_c"].mean()
`;

// Shared check: a chart was drawn, and give the tests its first axes.
const HAS_CHART = `import matplotlib.pyplot as plt
assert plt.get_fignums(), "Draw a chart with matplotlib (nothing was drawn)."
ax = plt.gcf().axes[0]
`;

export const m13: Module = {
  id: 'm13',
  number: 13,
  title: 'Visualisation',
  blurb: 'Turn numbers into charts people understand, and keep them honest.',
  lessons: [
    {
      id: 'm13-l1',
      title: 'Your first chart',
      summary: 'Draw a line chart with matplotlib, with a title and labels.',
      steps: [
        {
          kind: 'read',
          md: `
## matplotlib

**matplotlib** is Python's standard charting library. Its \`pyplot\` module is imported as \`plt\`:

~~~python
import matplotlib.pyplot as plt

years = [2021, 2022, 2023, 2024, 2025]
rain = [640, 590, 780, 910, 700]

plt.plot(years, rain)
plt.title("Annual rainfall, Oxford")
plt.xlabel("Year")
plt.ylabel("Rainfall (mm)")
~~~

- \`plt.plot(x, y)\` draws a **line** through the points
- every chart needs a **title** and **axis labels with units**. A chart without them is a puzzle, not a message

In Increment, charts appear under your code's output when you press Run.
`,
        },
        {
          kind: 'code',
          id: 'm13-l1-line',
          prompt: '`yearly` is a Series of Oxford\'s average daily high temperature for every year from 1853 to 2025 (the index is the year).\n\nDraw it as a **line chart** with `plt.plot(yearly.index, yearly.values)`, give it a title, label the x-axis `Year` and the y-axis `Average high (°C)`.',
          setup: YEARLY_SETUP,
          data: [WEATHER_FILE],
          starter: 'import matplotlib.pyplot as plt\n# yearly is loaded: index = year, values = average high temperature\n',
          solution: 'import matplotlib.pyplot as plt\nplt.plot(yearly.index, yearly.values)\nplt.title("Oxford is getting warmer")\nplt.xlabel("Year")\nplt.ylabel("Average high (°C)")\n',
          tests: `${HAS_CHART}assert len(ax.get_lines()) == 1, "Draw one line with plt.plot."
assert len(ax.get_lines()[0].get_ydata()) == len(yearly), "Plot every year of data."
assert ax.get_title().strip(), "Give the chart a title with plt.title(...)."
assert ax.get_xlabel() == "Year", "Label the x-axis 'Year'."
assert "°C" in ax.get_ylabel(), "Label the y-axis with its unit: 'Average high (°C)'."`,
          hints: ['plt.plot(yearly.index, yearly.values)', 'Then plt.title(...), plt.xlabel("Year") and plt.ylabel("Average high (°C)").'],
          review: true,
        },
        {
          kind: 'choice',
          id: 'm13-l1-labels',
          question: 'A chart shows a rising line with no axis labels. What\'s the main problem?',
          options: [
            'It isn\'t colourful enough',
            'Readers can\'t tell what is rising, over what, or in what units',
            'Line charts should always be bar charts',
            'There\'s no problem',
          ],
          answer: 1,
          explain: 'Without labels and units, a chart can\'t be interpreted, or it gets interpreted wrongly.',
        },
      ],
    },
    {
      id: 'm13-l2',
      title: 'Bar charts, histograms and scatter plots',
      summary: 'The chart types that cover most of data science.',
      steps: [
        {
          kind: 'read',
          md: `
## Pick the chart for the question

| Question | Chart | matplotlib |
|---|---|---|
| How does something change over time? | line | \`plt.plot(x, y)\` |
| How do categories compare? | bar | \`plt.bar(categories, values)\` |
| How are values distributed? | histogram | \`plt.hist(values, bins=20)\` |
| How are two numbers related? | scatter | \`plt.scatter(x, y)\` |

~~~python
counts = penguins["species"].value_counts()
plt.bar(counts.index, counts.values)

plt.hist(penguins["body_mass_g"].dropna(), bins=20)

plt.scatter(penguins["flipper_length_mm"], penguins["body_mass_g"], alpha=0.6)
~~~

\`alpha\` makes points see-through, so overlapping points show up as darker areas.
`,
        },
        {
          kind: 'code',
          id: 'm13-l2-bar',
          prompt: 'Draw a **bar chart** of how many penguins live on each island, using `value_counts()` and `plt.bar`. Add a title and a y-axis label.',
          setup: PENGUINS_DF_SETUP,
          data: [PENGUINS_FILE],
          starter: 'import matplotlib.pyplot as plt\n# penguins is loaded\n',
          solution: 'import matplotlib.pyplot as plt\ncounts = penguins["island"].value_counts()\nplt.bar(counts.index, counts.values)\nplt.title("Penguins per island")\nplt.ylabel("Number of penguins")\n',
          tests: `${HAS_CHART}heights = sorted(round(p.get_height()) for p in ax.patches)
assert heights == [52, 124, 168], f"There should be 3 bars (52, 124 and 168 penguins); got {heights}."
assert ax.get_title().strip() and ax.get_ylabel().strip(), "Add a title and a y-axis label."`,
          hints: ['counts = penguins["island"].value_counts()', 'plt.bar(counts.index, counts.values)'],
          review: true,
        },
        {
          kind: 'code',
          id: 'm13-l2-hist',
          prompt: 'Draw a **histogram** of penguin body masses with **25 bins** (drop missing values first). Label the x-axis `Body mass (g)` and the y-axis `Number of penguins`.',
          setup: PENGUINS_DF_SETUP,
          data: [PENGUINS_FILE],
          starter: 'import matplotlib.pyplot as plt\n',
          solution: 'import matplotlib.pyplot as plt\nplt.hist(penguins["body_mass_g"].dropna(), bins=25)\nplt.title("Distribution of penguin body mass")\nplt.xlabel("Body mass (g)")\nplt.ylabel("Number of penguins")\n',
          tests: `${HAS_CHART}assert len(ax.patches) == 25, f"Use bins=25; the chart has {len(ax.patches)} bars."
assert round(sum(p.get_height() for p in ax.patches)) == 342, "Include every recorded mass (342 penguins)."
assert ax.get_xlabel() == "Body mass (g)" and ax.get_ylabel() == "Number of penguins", "Label both axes as asked."`,
          hints: ['plt.hist(penguins["body_mass_g"].dropna(), bins=25)'],
        },
        {
          kind: 'code',
          id: 'm13-l2-scatter',
          prompt: 'Draw a **scatter plot** of flipper length (x) against body mass (y) for every penguin, with `alpha=0.6`. Label both axes with units.',
          setup: PENGUINS_DF_SETUP,
          data: [PENGUINS_FILE],
          starter: 'import matplotlib.pyplot as plt\n',
          solution: 'import matplotlib.pyplot as plt\nplt.scatter(penguins["flipper_length_mm"], penguins["body_mass_g"], alpha=0.6)\nplt.title("Longer flippers, heavier penguins")\nplt.xlabel("Flipper length (mm)")\nplt.ylabel("Body mass (g)")\n',
          tests: `${HAS_CHART}assert ax.collections, "Use plt.scatter to draw points."
assert len(ax.collections[0].get_offsets()) == 344, "Plot all 344 penguins."
assert ax.collections[0].get_alpha() == 0.6, "Set alpha=0.6."
assert "mm" in ax.get_xlabel() and "g" in ax.get_ylabel(), "Include units in the axis labels: mm and g."`,
          hints: ['plt.scatter(x_column, y_column, alpha=0.6)', 'x is penguins["flipper_length_mm"], y is penguins["body_mass_g"].'],
          review: true,
        },
      ],
    },
    {
      id: 'm13-l3',
      title: 'Plotting from pandas',
      summary: 'Charts straight from DataFrames and groupby results.',
      steps: [
        {
          kind: 'read',
          md: `
## .plot() on Series and DataFrames

pandas has matplotlib built in, and uses the index for the x-axis:

~~~python
yearly.plot(title="Average high by year")                       # a line chart
penguins["species"].value_counts().plot.bar()                   # a bar chart
penguins["body_mass_g"].plot.hist(bins=20)
penguins.plot.scatter(x="flipper_length_mm", y="body_mass_g")
penguins.groupby("species")["body_mass_g"].mean().plot.barh()  # horizontal bars
~~~

It returns the matplotlib **axes**, so you can keep customising it:

~~~python
ax = yearly.plot()
ax.set_ylabel("°C")
~~~
`,
        },
        {
          kind: 'code',
          id: 'm13-l3-groupby',
          prompt: 'Draw a **bar chart** of the **average life expectancy per continent in 2007** from `gapminder`, sorted from lowest to highest, using pandas `.plot.bar()`. Set a title and y-axis label.',
          setup: GAPMINDER_DF_SETUP,
          data: [GAPMINDER_FILE],
          starter: 'import pandas as pd\nimport matplotlib.pyplot as plt\n',
          solution: 'import pandas as pd\nimport matplotlib.pyplot as plt\navg = gapminder[gapminder["year"] == 2007].groupby("continent")["life_exp"].mean().sort_values()\nax = avg.plot.bar(title="Life expectancy by continent, 2007")\nax.set_ylabel("Years")\n',
          tests: `${HAS_CHART}want = gapminder[gapminder["year"] == 2007].groupby("continent")["life_exp"].mean().sort_values()
heights = [float(p.get_height()) for p in ax.patches]
assert len(heights) == len(want) and all(abs(h - v) < 1e-6 for h, v in zip(heights, want.tolist())), f"Expected bars of height {[round(v, 1) for v in want.tolist()]} (lowest to highest)."
assert ax.get_title().strip() and ax.get_ylabel().strip(), "Add a title and a y-axis label."`,
          hints: [
            'Filter 2007, then .groupby("continent")["life_exp"].mean().sort_values()',
            'ax = avg.plot.bar(title="...") then ax.set_ylabel("Years")',
          ],
          review: true,
        },
        {
          kind: 'code',
          id: 'm13-l3-rolling',
          prompt: 'The `weather` data has monthly readings. Build a date index, then plot **two lines** on the same axes: the monthly `tmax_c` for 1990 onwards in a light colour, and its **12-month rolling average** on top. Add a legend (`label=` on each plot, then `ax.legend()`).',
          setup: WEATHER_DF_SETUP,
          data: [WEATHER_FILE],
          starter: 'import pandas as pd\nimport matplotlib.pyplot as plt\n',
          solution: 'import pandas as pd\nimport matplotlib.pyplot as plt\nweather["date"] = pd.to_datetime(weather[["year", "month"]].assign(day=1))\nts = weather.set_index("date")["tmax_c"]["1990":]\nax = ts.plot(color="lightgray", label="Monthly")\nts.rolling(12).mean().plot(ax=ax, label="12-month average")\nax.set_title("Oxford daily highs since 1990")\nax.set_ylabel("°C")\nax.legend()\n',
          tests: `${HAS_CHART}lines = ax.get_lines()
assert len(lines) == 2, f"Draw two lines on the same axes (pass ax=ax to the second plot); found {len(lines)}."
n = int((weather["year"] >= 1990).sum())
assert all(len(l.get_ydata()) == n for l in lines), f"Both lines should cover every month from 1990 ({n} months)."
assert ax.get_legend() is not None, "Add a legend with ax.legend()."`,
          hints: [
            'Make the date column, then ts = weather.set_index("date")["tmax_c"]["1990":]',
            'ax = ts.plot(color="lightgray", label="Monthly")',
            'ts.rolling(12).mean().plot(ax=ax, label="12-month average"), then ax.legend()',
          ],
        },
      ],
    },
    {
      id: 'm13-l4',
      title: 'Figures, axes and subplots',
      summary: 'Several charts side by side with the object-oriented interface.',
      steps: [
        {
          kind: 'read',
          md: `
## Figures and axes

A **figure** is the whole image; an **axes** is one chart inside it. \`plt.subplots\` makes both:

~~~python
fig, axes = plt.subplots(1, 2, figsize=(10, 4))    # 1 row, 2 columns

axes[0].hist(penguins["bill_length_mm"].dropna(), bins=20)
axes[0].set_title("Bill length")
axes[0].set_xlabel("mm")

axes[1].scatter(penguins["bill_length_mm"], penguins["bill_depth_mm"])
axes[1].set_title("Length vs depth")

fig.suptitle("Penguin bills")
fig.tight_layout()                                  # stop labels overlapping
~~~

On an axes, the methods are \`set_title\`, \`set_xlabel\`, \`set_ylabel\`, \`set_xlim\`, \`set_ylim\` (with \`plt\` they were \`title\`, \`xlabel\`...). Professional code mostly uses this style.

## Colour by group

Plot each group separately with a label, then add a legend:

~~~python
for species, group in penguins.groupby("species"):
    ax.scatter(group["flipper_length_mm"], group["body_mass_g"], label=species)
ax.legend()
~~~
`,
        },
        {
          kind: 'code',
          id: 'm13-l4-grouped',
          prompt: 'Using `fig, ax = plt.subplots()`, draw a scatter of **bill length (x) against bill depth (y)** with **one colour per species** (loop over `penguins.groupby("species")`), label the axes, and add a legend.',
          setup: PENGUINS_DF_SETUP,
          data: [PENGUINS_FILE],
          starter: 'import matplotlib.pyplot as plt\n',
          solution: 'import matplotlib.pyplot as plt\nfig, ax = plt.subplots()\nfor species, group in penguins.groupby("species"):\n    ax.scatter(group["bill_length_mm"], group["bill_depth_mm"], label=species, alpha=0.7)\nax.set_xlabel("Bill length (mm)")\nax.set_ylabel("Bill depth (mm)")\nax.set_title("Each species has its own bill shape")\nax.legend()\n',
          tests: `${HAS_CHART}assert len(ax.collections) == 3, f"Draw one scatter per species (3); found {len(ax.collections)}."
sizes = sorted(len(c.get_offsets()) for c in ax.collections)
assert sizes == [68, 124, 152], f"Each species' scatter should include all its penguins; got {sizes}."
legend = ax.get_legend()
assert legend is not None and sorted(t.get_text() for t in legend.get_texts()) == ["Adelie", "Chinstrap", "Gentoo"], "Label each scatter with its species and call ax.legend()."
assert "mm" in ax.get_xlabel() and "mm" in ax.get_ylabel(), "Label both axes with units."`,
          hints: [
            'fig, ax = plt.subplots()',
            'for species, group in penguins.groupby("species"): ax.scatter(group["bill_length_mm"], group["bill_depth_mm"], label=species)',
            'Then ax.set_xlabel(...), ax.set_ylabel(...) and ax.legend().',
          ],
          review: true,
        },
        {
          kind: 'code',
          id: 'm13-l4-subplots',
          prompt: 'Make a figure with **1 row and 2 columns** of charts:\n\n- left: a histogram of `flipper_length_mm` (20 bins), titled `Flipper length`\n- right: a bar chart of the number of penguins per **species**, titled `Species`',
          setup: PENGUINS_DF_SETUP,
          data: [PENGUINS_FILE],
          starter: 'import matplotlib.pyplot as plt\n',
          solution: 'import matplotlib.pyplot as plt\nfig, axes = plt.subplots(1, 2, figsize=(10, 4))\naxes[0].hist(penguins["flipper_length_mm"].dropna(), bins=20)\naxes[0].set_title("Flipper length")\ncounts = penguins["species"].value_counts()\naxes[1].bar(counts.index, counts.values)\naxes[1].set_title("Species")\nfig.tight_layout()\n',
          tests: `import matplotlib.pyplot as plt
assert plt.get_fignums(), "Draw the figure with plt.subplots(1, 2)."
axs = plt.gcf().axes
assert len(axs) == 2, f"The figure should have 2 charts; it has {len(axs)}."
assert axs[0].get_title() == "Flipper length" and len(axs[0].patches) == 20, "Left: a 20-bin histogram titled 'Flipper length'."
assert axs[1].get_title() == "Species" and sorted(round(p.get_height()) for p in axs[1].patches) == [68, 124, 152], "Right: bars of penguins per species, titled 'Species'."`,
          hints: ['fig, axes = plt.subplots(1, 2, figsize=(10, 4))', 'Draw on axes[0] and axes[1], using set_title for each.'],
        },
      ],
    },
    {
      id: 'm13-l5',
      title: 'Honest, effective charts',
      summary: 'Charts persuade. Make sure they tell the truth.',
      steps: [
        {
          kind: 'read',
          md: `
## Common ways charts mislead

1. **Bar charts that don't start at zero.** A bar's length *is* its value. Cutting the axis at 3,600 makes 3,700 look twice as big as 3,650
2. **Cherry-picked time ranges** that hide the bigger picture
3. **Missing units or sources**, so nobody can check the numbers
4. **Too much at once**: ten colours and three y-axes

## Making charts clear

- One message per chart. Say it in the title: *"Gentoos are the heaviest"* beats *"Mass by species"*
- Sort bars by value, unless the categories have a natural order
- Label axes with units, and cite your data source (\`fig.text\` or a caption)
- Use colour to highlight, not decorate

Line charts don't have to start at zero (they show change), but bars do.
`,
        },
        {
          kind: 'choice',
          id: 'm13-l5-which',
          question: 'You want to show how the **distribution** of Gentoo body masses looks. Which chart?',
          options: ['A pie chart', 'A histogram', 'A line chart over time', 'A single bar'],
          answer: 1,
          explain: 'Histograms show how values are spread out: where they cluster, how wide the spread is, and whether it\'s skewed.',
        },
        {
          kind: 'code',
          id: 'm13-l5-fix',
          prompt: 'This code draws a **misleading** chart of average mass per species. Fix it:\n\n- make the y-axis **start at zero**\n- **sort** the bars from lightest to heaviest\n- give it a title that states the message, and a y-axis label with units',
          setup: PENGUINS_DF_SETUP,
          data: [PENGUINS_FILE],
          starter: 'import matplotlib.pyplot as plt\navg = penguins.groupby("species")["body_mass_g"].mean()\nfig, ax = plt.subplots()\nax.bar(avg.index, avg.values)\nax.set_ylim(3600, 5200)\n',
          solution: 'import matplotlib.pyplot as plt\navg = penguins.groupby("species")["body_mass_g"].mean().sort_values()\nfig, ax = plt.subplots()\nax.bar(avg.index, avg.values)\nax.set_ylim(0, 5500)\nax.set_title("Gentoo penguins are the heaviest")\nax.set_ylabel("Average body mass (g)")\n',
          tests: `${HAS_CHART}assert ax.get_ylim()[0] == 0, "The y-axis of a bar chart should start at 0."
heights = [p.get_height() for p in ax.patches]
assert heights == sorted(heights) and len(heights) == 3, "Sort the bars from lightest to heaviest (.sort_values())."
assert ax.get_title().strip(), "Add a title that states the message."
assert "g" in ax.get_ylabel(), "Label the y-axis with its unit (g)."`,
          hints: ['Remove the set_ylim(3600, 5200) line, or set it to start at 0.', 'Sort with .sort_values() before plotting.'],
          review: true,
        },
      ],
    },
  ],
};
