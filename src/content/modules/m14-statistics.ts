import type { Module } from '../types';
import { GAPMINDER_DF_SETUP, GAPMINDER_FILE, PENGUINS_DF_SETUP, PENGUINS_FILE } from '../datasets';

const GDP_2007_SETUP = `${GAPMINDER_DF_SETUP}
gdp = gapminder[gapminder["year"] == 2007]["gdp_per_cap"]
`;

const ADELIE_DF_SETUP = `${PENGUINS_DF_SETUP}
import numpy as np
adelie = penguins[penguins["species"] == "Adelie"].dropna(subset=["body_mass_g"])
`;

export const m14: Module = {
  id: 'm14',
  number: 14,
  title: 'Statistics for data science',
  blurb: 'Describe data honestly, measure relationships, and reason about uncertainty.',
  lessons: [
    {
      id: 'm14-l1',
      title: 'Centre and spread',
      summary: 'Mean or median? And how spread out is the data?',
      steps: [
        {
          kind: 'read',
          md: `
## Two kinds of "average"

- The **mean** adds everything up and divides. It's pulled towards extreme values
- The **median** is the middle value. It ignores how extreme the extremes are

For **skewed** data, such as incomes, house prices or GDP, a few huge values drag the mean up, and the median describes a "typical" value better. If the mean is well above the median, the data is skewed to the right.

## Spread

| Measure | pandas | Meaning |
|---|---|---|
| range | \`s.max() - s.min()\` | smallest to largest |
| standard deviation | \`s.std()\` | the typical distance from the mean |
| quartiles | \`s.quantile([0.25, 0.5, 0.75])\` | the values 25%, 50% and 75% of the data are below |
| IQR | \`s.quantile(0.75) - s.quantile(0.25)\` | the spread of the middle half |

## Outliers: the 1.5 × IQR rule

A common rule flags values below \`Q1 − 1.5 × IQR\` or above \`Q3 + 1.5 × IQR\` as outliers. They're worth checking, not automatically deleting: they may be errors, or the most interesting points in the data.
`,
        },
        {
          kind: 'code',
          id: 'm14-l1-skew',
          prompt: '`gdp` is the GDP per person of every country in 2007 (a Series). Create `mean_gdp` and `median_gdp` (both rounded to 0 decimal places), and `skewed`: `True` if the mean is more than 20% above the median.',
          setup: GDP_2007_SETUP,
          data: [GAPMINDER_FILE],
          starter: 'import pandas as pd\n# gdp is a Series of 142 values\n',
          solution: 'import pandas as pd\nmean_gdp = round(gdp.mean())\nmedian_gdp = round(gdp.median())\nskewed = gdp.mean() > 1.2 * gdp.median()\n',
          tests: `assert mean_gdp == round(gdp.mean()), f"mean_gdp should be {round(gdp.mean())}."
assert median_gdp == round(gdp.median()), f"median_gdp should be {round(gdp.median())}."
assert bool(skewed) is True, "The mean is far above the median, so skewed should be True."`,
          hints: ['gdp.mean() and gdp.median(); round() with no second argument gives 0 places.', 'skewed = gdp.mean() > 1.2 * gdp.median()'],
          review: true,
        },
        {
          kind: 'code',
          id: 'm14-l1-outliers',
          prompt: 'Using the 1.5 × IQR rule on `gdp`, create `q1`, `q3`, `iqr`, `upper` (the upper fence: Q3 + 1.5 × IQR) and `n_high`: how many countries are **above** the upper fence.',
          setup: GDP_2007_SETUP,
          data: [GAPMINDER_FILE],
          starter: 'import pandas as pd\n',
          solution: 'import pandas as pd\nq1 = gdp.quantile(0.25)\nq3 = gdp.quantile(0.75)\niqr = q3 - q1\nupper = q3 + 1.5 * iqr\nn_high = (gdp > upper).sum()\n',
          tests: `wq1, wq3 = gdp.quantile(0.25), gdp.quantile(0.75)
assert abs(q1 - wq1) < 1e-6 and abs(q3 - wq3) < 1e-6, "Use gdp.quantile(0.25) and gdp.quantile(0.75)."
assert abs(iqr - (wq3 - wq1)) < 1e-6, "iqr is q3 - q1."
assert abs(upper - (wq3 + 1.5 * (wq3 - wq1))) < 1e-6, "upper is q3 + 1.5 * iqr."
assert n_high == (gdp > wq3 + 1.5 * (wq3 - wq1)).sum(), f"n_high should be {(gdp > wq3 + 1.5 * (wq3 - wq1)).sum()}."`,
          hints: ['q1 = gdp.quantile(0.25)', 'upper = q3 + 1.5 * iqr', '(gdp > upper).sum()'],
        },
        {
          kind: 'choice',
          id: 'm14-l1-which-average',
          question: 'A news story says "the average UK salary rose". Which average best describes a **typical** worker\'s pay?',
          options: ['The mean, because it uses every salary', 'The median, because a few very high salaries pull the mean up', 'The maximum', 'The mode is always best'],
          answer: 1,
          explain: 'Pay is right-skewed: a small number of very high earners raise the mean. The median is the pay of the person in the middle.',
        },
      ],
    },
    {
      id: 'm14-l2',
      title: 'Distributions and z-scores',
      summary: 'The normal distribution, and how unusual is "unusual"?',
      steps: [
        {
          kind: 'read',
          md: `
## Shapes of data

A histogram shows a variable's **distribution**. Many natural measurements (heights, body masses within a species, measurement errors) form a **normal distribution**: a symmetric bell curve.

For normal data, the **68-95-99.7 rule** says roughly:

- 68% of values are within **1** standard deviation of the mean
- 95% within **2**
- 99.7% within **3**

## z-scores

A **z-score** says how many standard deviations a value is from the mean:

~~~python
z = (x - x.mean()) / x.std()
~~~

A z-score of 2 means "two standard deviations above average", which is unusual. z-scores let you compare things on different scales, for example a penguin's mass and its flipper length.

\`s.skew()\` measures lopsidedness: about 0 is symmetric, positive means a long right tail.
`,
        },
        {
          kind: 'code',
          id: 'm14-l2-zscores',
          prompt: '`adelie` holds the Adelie penguins with a recorded mass. Add a column `z` with each penguin\'s mass **z-score**. Then create `within_1sd`: the proportion of penguins whose z-score is between -1 and 1, rounded to 2 decimal places.',
          setup: ADELIE_DF_SETUP,
          data: [PENGUINS_FILE],
          starter: 'import pandas as pd\n# adelie is a DataFrame of Adelie penguins with a mass\n',
          solution: 'import pandas as pd\nm = adelie["body_mass_g"]\nadelie["z"] = (m - m.mean()) / m.std()\nwithin_1sd = round(((adelie["z"] > -1) & (adelie["z"] < 1)).mean(), 2)\n',
          tests: `m = adelie["body_mass_g"]
want = (m - m.mean()) / m.std()
assert "z" in adelie.columns and (abs(adelie["z"] - want) < 1e-9).all(), "z should be (mass - mean) / std."
share = round(((want > -1) & (want < 1)).mean(), 2)
assert within_1sd == share, f"within_1sd should be {share}, got {within_1sd}."
assert 0.6 < within_1sd < 0.76, "Close to 68%, as the normal rule predicts."`,
          hints: ['z = (m - m.mean()) / m.std()', 'The mean of a True/False mask is the proportion that are True.'],
          review: true,
        },
        {
          kind: 'predict',
          id: 'm14-l2-z',
          code: 'mean = 3700\nstd = 450\nmass = 4600\nprint((mass - mean) / std)\n',
          options: ['2.0', '900', '0.5', '-2.0'],
          answer: 0,
          explain: '4600 is 900 g above the mean, and 900 / 450 = 2 standard deviations.',
        },
      ],
    },
    {
      id: 'm14-l3',
      title: 'Correlation',
      summary: 'Measure how two variables move together, and when not to trust it.',
      steps: [
        {
          kind: 'read',
          md: `
## The correlation coefficient

**Pearson's r** measures how closely two variables follow a straight line, from **-1** (perfect negative) through **0** (no linear relationship) to **+1** (perfect positive):

~~~python
penguins["flipper_length_mm"].corr(penguins["body_mass_g"])    # one pair
penguins[["bill_length_mm", "bill_depth_mm", "flipper_length_mm", "body_mass_g"]].corr()   # every pair
~~~

Rough guide: |r| above 0.7 is strong, 0.3 to 0.7 moderate, below 0.3 weak. Always **look at a scatter plot** too: r only measures *straight-line* relationships.

## Correlation isn't causation

Ice-cream sales and drownings are correlated, because both rise in hot weather. A hidden third variable (a **confounder**) can create a correlation between two things that don't affect each other.

## Simpson's paradox

A trend can **reverse** when you split data into groups. You're about to find a real example in the penguins.
`,
        },
        {
          kind: 'code',
          id: 'm14-l3-simpson',
          prompt: 'Calculate:\n\n- `overall`: the correlation between `bill_length_mm` and `bill_depth_mm` across **all** penguins\n- `by_species`: a dictionary mapping each species to that same correlation **within** the species\n\nRound everything to 2 decimal places. Look at the signs!',
          setup: PENGUINS_DF_SETUP,
          data: [PENGUINS_FILE],
          starter: 'import pandas as pd\n',
          solution: 'import pandas as pd\noverall = round(penguins["bill_length_mm"].corr(penguins["bill_depth_mm"]), 2)\nby_species = {}\nfor species, group in penguins.groupby("species"):\n    by_species[species] = round(group["bill_length_mm"].corr(group["bill_depth_mm"]), 2)\n',
          tests: `want = round(penguins["bill_length_mm"].corr(penguins["bill_depth_mm"]), 2)
assert overall == want, f"overall should be {want}, got {overall}."
assert overall < 0, "Across all penguins, the correlation is negative."
for s, g in penguins.groupby("species"):
    w = round(g["bill_length_mm"].corr(g["bill_depth_mm"]), 2)
    assert by_species.get(s) == w, f"The {s} correlation should be {w}, got {by_species.get(s)}."
    assert w > 0, "Within each species the correlation is positive: Simpson's paradox."`,
          hints: ['a.corr(b) gives the correlation between two Series.', 'Loop over penguins.groupby("species") and calculate it within each group.'],
          review: true,
        },
        {
          kind: 'choice',
          id: 'm14-l3-simpson-why',
          question: 'Overall, longer bills go with *shallower* bills, but within every species longer bills go with *deeper* bills. Why?',
          options: [
            'The data must be wrong',
            'Species is a confounder: Gentoos have long but shallow bills, which reverses the overall trend',
            'Correlation doesn\'t work on penguins',
            'Rounding errors',
          ],
          answer: 1,
          explain: 'Mixing groups with different baselines can hide or reverse the real relationship. Always check whether a hidden group variable is driving a correlation.',
        },
        {
          kind: 'choice',
          id: 'm14-l3-causation',
          question: 'Across countries, life expectancy and GDP per person are strongly correlated. What can you conclude?',
          options: [
            'Getting richer causes people to live longer',
            'Living longer causes countries to get richer',
            'They move together; working out cause and effect needs more evidence (experiments, or careful study of confounders)',
            'Nothing: the correlation is meaningless',
          ],
          answer: 2,
          explain: 'A correlation is a clue, not proof. Wealth, healthcare, education and many other factors are tangled together.',
        },
      ],
    },
    {
      id: 'm14-l4',
      title: 'Sampling and confidence',
      summary: 'How sure can you be about an average from a sample?',
      steps: [
        {
          kind: 'read',
          md: `
## Samples vary

We measured 151 Adelie penguins, not every Adelie penguin on Earth. A different sample would give a slightly different mean. How much could it vary?

## Standard error

The **standard error** of a mean estimates how much the sample mean would bounce around between samples:

~~~python
se = s.std() / len(s) ** 0.5
~~~

Bigger samples give smaller standard errors: to halve it, you need **four times** the data.

## The bootstrap

A powerful, assumption-light method: **resample your own data with replacement**, thousands of times, and see how the statistic varies:

~~~python
rng = np.random.default_rng(0)
means = [rng.choice(values, size=len(values), replace=True).mean() for _ in range(2000)]
low, high = np.percentile(means, [2.5, 97.5])
~~~

The middle 95% of those bootstrap means is a **95% confidence interval**: a range of plausible values for the true mean.
`,
        },
        {
          kind: 'code',
          id: 'm14-l4-se',
          prompt: 'For the Adelie masses (`adelie["body_mass_g"]`), create `mean_mass` and `se` (the standard error of the mean), both rounded to 1 decimal place.',
          setup: ADELIE_DF_SETUP,
          data: [PENGUINS_FILE],
          starter: 'import pandas as pd\n',
          solution: 'import pandas as pd\nm = adelie["body_mass_g"]\nmean_mass = round(m.mean(), 1)\nse = round(m.std() / len(m) ** 0.5, 1)\n',
          tests: `m = adelie["body_mass_g"]
assert mean_mass == round(m.mean(), 1), f"mean_mass should be {round(m.mean(), 1)}."
assert se == round(m.std() / len(m) ** 0.5, 1), f"se should be std / sqrt(n) = {round(m.std() / len(m) ** 0.5, 1)}."`,
          hints: ['se = std / square root of the count', 'len(m) ** 0.5 is the square root.'],
          review: true,
        },
        {
          kind: 'code',
          id: 'm14-l4-bootstrap',
          prompt: 'Build a **95% bootstrap confidence interval** for the mean Adelie mass. Use `rng = np.random.default_rng(0)` and **2000** resamples (each the same size as the data, `replace=True`). Store the interval ends as `low` and `high`.',
          setup: ADELIE_DF_SETUP,
          data: [PENGUINS_FILE],
          starter: 'import numpy as np\nvalues = adelie["body_mass_g"].to_numpy()\n',
          solution: 'import numpy as np\nvalues = adelie["body_mass_g"].to_numpy()\nrng = np.random.default_rng(0)\nmeans = [rng.choice(values, size=len(values), replace=True).mean() for _ in range(2000)]\nlow, high = np.percentile(means, [2.5, 97.5])\n',
          tests: `import numpy as _np
v = adelie["body_mass_g"].to_numpy()
mean = v.mean()
se = v.std(ddof=1) / len(v) ** 0.5
assert low < mean < high, "The interval should contain the sample mean."
assert abs((high - low) - 2 * 1.96 * se) < 25, f"A 95% interval should be about {round(2 * 1.96 * se)} g wide; yours is {round(high - low)} g."
assert abs((low + high) / 2 - mean) < 15, "The interval should be centred close to the sample mean."`,
          hints: [
            'means = [rng.choice(values, size=len(values), replace=True).mean() for _ in range(2000)]',
            'low, high = np.percentile(means, [2.5, 97.5])',
          ],
        },
        {
          kind: 'choice',
          id: 'm14-l4-interpret',
          question: 'A 95% confidence interval for the mean Adelie mass is 3628 g to 3774 g. Which interpretation is best?',
          options: [
            '95% of Adelie penguins weigh between 3628 g and 3774 g',
            'Our method produces intervals that capture the true mean about 95% of the time, so the true mean plausibly lies in this range',
            'The mean is exactly 3700 g',
            'There\'s a 5% chance the data is wrong',
          ],
          answer: 1,
          explain: 'A confidence interval is about the uncertainty in the mean, not the spread of individual penguins (which is much wider).',
        },
      ],
    },
    {
      id: 'm14-l5',
      title: 'Comparing groups',
      summary: 'Is a difference real, or just chance? Permutation tests and p-values.',
      steps: [
        {
          kind: 'read',
          md: `
## Could it be chance?

Adelie penguins on Dream and on Torgersen have slightly different average masses. Is that a real difference, or could random sampling produce it?

## A permutation test

If the island made **no** difference, the island labels would be interchangeable. So:

1. Measure the real difference in means
2. **Shuffle** the labels randomly and measure the difference again. Repeat thousands of times
3. The **p-value** is the proportion of shuffles with a difference at least as big as the real one

~~~python
observed = a.mean() - b.mean()
combined = np.concatenate([a, b])
diffs = []
for _ in range(2000):
    shuffled = rng.permutation(combined)
    diffs.append(shuffled[:len(a)].mean() - shuffled[len(a):].mean())
p = np.mean(np.abs(diffs) >= abs(observed))
~~~

## Reading p-values

- A **small** p-value (often below 0.05) means a difference this big would be rare if there were no real effect
- A **large** p-value means chance could easily explain it. It does **not** prove there's no difference
- **Statistically significant isn't the same as important**: with huge samples, tiny, useless differences become "significant"

\`scipy.stats.ttest_ind(a, b)\` gives a p-value from a classic t-test in one line.
`,
        },
        {
          kind: 'code',
          id: 'm14-l5-perm',
          prompt: 'Compare the mass of Adelie penguins on **Dream** (`a`) and **Torgersen** (`b`) with a permutation test: `rng = np.random.default_rng(1)`, **2000** shuffles. Create `observed` (the difference in means, a minus b) and `p_value` (two-sided, as in the lesson).',
          setup: `${ADELIE_DF_SETUP}a = adelie[adelie["island"] == "Dream"]["body_mass_g"].to_numpy()\nb = adelie[adelie["island"] == "Torgersen"]["body_mass_g"].to_numpy()\n`,
          data: [PENGUINS_FILE],
          starter: 'import numpy as np\n# a: Dream Adelie masses, b: Torgersen Adelie masses (NumPy arrays)\n',
          solution: 'import numpy as np\nrng = np.random.default_rng(1)\nobserved = a.mean() - b.mean()\ncombined = np.concatenate([a, b])\ndiffs = []\nfor _ in range(2000):\n    shuffled = rng.permutation(combined)\n    diffs.append(shuffled[:len(a)].mean() - shuffled[len(a):].mean())\np_value = np.mean(np.abs(diffs) >= abs(observed))\n',
          tests: `assert abs(observed - (a.mean() - b.mean())) < 1e-9, "observed should be a.mean() - b.mean()."
import numpy as _np
_rng = _np.random.default_rng(1)
_c = _np.concatenate([a, b])
_d = []
for _ in range(2000):
    _s = _rng.permutation(_c)
    _d.append(_s[:len(a)].mean() - _s[len(a):].mean())
_p = _np.mean(_np.abs(_d) >= abs(a.mean() - b.mean()))
assert abs(p_value - _p) < 0.05, f"p_value should be about {round(_p, 2)}; got {p_value}."
assert p_value > 0.05, "This difference is easily explained by chance."`,
          hints: [
            'combined = np.concatenate([a, b]); shuffle with rng.permutation(combined).',
            'The first len(a) shuffled values play the role of group a.',
            'p_value = np.mean(np.abs(diffs) >= abs(observed))',
          ],
          review: true,
        },
        {
          kind: 'code',
          id: 'm14-l5-ttest',
          prompt: 'Now compare **male** and **female** Adelie masses with `scipy.stats.ttest_ind`. Create `diff` (male mean minus female mean, rounded to 0 decimal places) and `p` (the p-value). Is this difference real?',
          setup: ADELIE_DF_SETUP,
          data: [PENGUINS_FILE],
          starter: 'from scipy import stats\n',
          solution: 'from scipy import stats\nmale = adelie[adelie["sex"] == "male"]["body_mass_g"]\nfemale = adelie[adelie["sex"] == "female"]["body_mass_g"]\ndiff = round(male.mean() - female.mean())\np = stats.ttest_ind(male, female).pvalue\n',
          tests: `from scipy import stats as _st
m = adelie[adelie["sex"] == "male"]["body_mass_g"]
f = adelie[adelie["sex"] == "female"]["body_mass_g"]
assert diff == round(m.mean() - f.mean()), f"diff should be {round(m.mean() - f.mean())}."
assert abs(p - _st.ttest_ind(m, f).pvalue) < 1e-12, "p should be stats.ttest_ind(male, female).pvalue."
assert p < 0.001, "Males are clearly heavier: the p-value is tiny."`,
          hints: ['Filter adelie by sex == "male" and sex == "female".', 'stats.ttest_ind(male, female).pvalue'],
        },
        {
          kind: 'choice',
          id: 'm14-l5-pvalue',
          question: 'A test comparing two groups gives p = 0.30. What does that mean?',
          options: [
            'There is definitely no difference between the groups',
            'There is a 30% chance the groups are different',
            'A difference this large would be common by chance alone, so this data doesn\'t give good evidence of a real difference',
            'The result is 30% important',
          ],
          answer: 2,
          explain: 'A large p-value means the data is consistent with no effect. It doesn\'t prove there is none: absence of evidence isn\'t evidence of absence.',
        },
      ],
    },
  ],
};
