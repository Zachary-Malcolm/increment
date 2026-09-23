import type { Module } from '../types';
import { GAPMINDER_DF_SETUP, GAPMINDER_FILE, PENGUINS_DF_SETUP, PENGUINS_FILE, WEATHER_DF_SETUP, WEATHER_FILE } from '../datasets';

const ANNUAL_SETUP = `${WEATHER_DF_SETUP}
import numpy as np
annual = weather.groupby("year")["tmax_c"].mean()
`;

const GAP_2007_SETUP = `${GAPMINDER_DF_SETUP}
import numpy as np
g07 = gapminder[gapminder["year"] == 2007].copy()
`;

const PENGUIN_MODEL_SETUP = `${PENGUINS_DF_SETUP}
import numpy as np
from sklearn.model_selection import train_test_split
features = ["bill_length_mm", "bill_depth_mm", "flipper_length_mm", "body_mass_g"]
clean = penguins.dropna(subset=features)
X = clean[features]
y = clean["species"]
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=1, stratify=y)
`;

export const m17: Module = {
  id: 'm17',
  number: 17,
  title: 'Capstone projects',
  blurb: 'Full analyses of real data, from question to insight, done responsibly.',
  lessons: [
    {
      id: 'm17-l1',
      title: 'The data science workflow',
      summary: 'How real projects run, and the responsibilities that come with data.',
      steps: [
        {
          kind: 'read',
          md: `
## From question to insight

Every project follows roughly the same loop:

1. **Ask** a clear, answerable question. "Is Oxford warming?" beats "look at the weather data"
2. **Get** the data, and understand where it came from and what its columns mean
3. **Clean** it: missing values, errors, inconsistent labels. Record every decision
4. **Explore**: summaries and charts. Look before you model
5. **Analyse or model**: statistics or machine learning, **compared with a simple baseline**
6. **Communicate**: the answer, how sure you are, and the caveats, to people who don't read code

You'll go round this loop more than once: exploring often changes the question.

## Responsible data science

- **Privacy:** personal data is protected by law (UK GDPR). Collect only what you need, store it securely, and anonymise where you can
- **Bias:** a model trained on biased history repeats that bias. Check how it performs for different groups
- **Honesty:** report uncertainty, and results that didn't work. Don't torture the data until it confesses
- **Reproducibility:** code, seeds and data sources, so anyone can check your work
`,
        },
        {
          kind: 'choice',
          id: 'm17-l1-order',
          question: 'You\'ve been given a new dataset and asked "what drives customer churn?". What should you do **first**?',
          options: [
            'Train the most powerful model you can',
            'Understand the data: what each column means, where it came from, and what\'s missing',
            'Make a presentation',
            'Delete the rows with missing values',
          ],
          answer: 1,
          explain: 'Modelling data you don\'t understand produces confident nonsense. Exploring and understanding it always comes first.',
        },
        {
          kind: 'choice',
          id: 'm17-l1-bias',
          question: 'A hiring model is trained on 10 years of past hiring decisions, when most hires were men. What\'s the risk?',
          options: [
            'None: the model is objective because it\'s maths',
            'It may learn to favour men, repeating the historical bias at scale',
            'It will be too slow',
            'It will hire nobody',
          ],
          answer: 1,
          explain: 'Models learn whatever patterns are in the data, including unfair ones. Check outcomes across groups before deploying anything that affects people.',
        },
        {
          kind: 'choice',
          id: 'm17-l1-privacy',
          question: 'You\'re sharing an analysis of customer data with another team. What\'s the most responsible approach?',
          options: [
            'Send the full raw data, including names and addresses, in case it\'s useful',
            'Share only the aggregated results or the minimum data they need, with personal details removed',
            'Post it publicly so everyone can use it',
            'Share nothing, ever',
          ],
          answer: 1,
          explain: 'Data minimisation is a core principle of UK GDPR: share only what\'s needed, and remove what identifies people.',
        },
      ],
    },
    {
      id: 'm17-l2',
      title: 'Capstone: is Oxford getting warmer?',
      summary: '173 years of Met Office records: measure the trend and show it honestly.',
      steps: [
        {
          kind: 'read',
          md: `
## The question

Using the Met Office's Oxford records (1853 to 2025), has Oxford got warmer? By how much, and is it speeding up?

\`annual\` is ready for you: the average daily high temperature for each year (a Series indexed by year).

**Your plan:**
1. Compare the first 30 years with the latest 30 years
2. Fit a straight-line trend and express it per century
3. Check whether recent warming is faster than the long-term rate
4. Draw a clear chart

\`np.polyfit(x, y, 1)\` fits a straight line and returns \`[slope, intercept]\`.
`,
        },
        {
          kind: 'code',
          id: 'm17-l2-compare',
          prompt: 'Create `early` (the mean of `annual` for 1853 to 1882) and `recent` (the mean for 1996 to 2025), both rounded to 2 decimal places, and `rise`: `recent - early`, also rounded to 2 places.',
          setup: ANNUAL_SETUP,
          data: [WEATHER_FILE],
          starter: 'import numpy as np\n# annual: average daily high for each year, indexed by year\n',
          solution: 'import numpy as np\nearly = round(annual.loc[1853:1882].mean(), 2)\nrecent = round(annual.loc[1996:2025].mean(), 2)\nrise = round(recent - early, 2)\n',
          tests: `e = round(annual.loc[1853:1882].mean(), 2)
r = round(annual.loc[1996:2025].mean(), 2)
assert early == e, f"early should be {e}."
assert recent == r, f"recent should be {r}."
assert rise == round(r - e, 2), f"rise should be {round(r - e, 2)}."
assert rise > 1, "Oxford's recent 30 years are over a degree warmer."`,
          hints: ['annual.loc[1853:1882] selects 30 years (loc includes both ends).', 'Round each mean, then subtract.'],
          review: true,
        },
        {
          kind: 'code',
          id: 'm17-l2-trend',
          prompt: 'Use `np.polyfit` to fit straight lines, and express each slope **per century** (× 100), rounded to 2 decimal places:\n\n- `trend_all`: the whole record\n- `trend_recent`: 1976 to 2025 only\n\nThen create `accelerating`: `True` if the recent trend is steeper.',
          setup: ANNUAL_SETUP,
          data: [WEATHER_FILE],
          starter: 'import numpy as np\n',
          solution: 'import numpy as np\nslope_all = np.polyfit(annual.index, annual.values, 1)[0]\nlate = annual.loc[1976:2025]\nslope_recent = np.polyfit(late.index, late.values, 1)[0]\ntrend_all = round(slope_all * 100, 2)\ntrend_recent = round(slope_recent * 100, 2)\naccelerating = trend_recent > trend_all\n',
          tests: `import numpy as _np
a = round(_np.polyfit(annual.index, annual.values, 1)[0] * 100, 2)
l = annual.loc[1976:2025]
b = round(_np.polyfit(l.index, l.values, 1)[0] * 100, 2)
assert trend_all == a, f"trend_all should be {a} °C per century."
assert trend_recent == b, f"trend_recent should be {b} °C per century."
assert bool(accelerating) is True, "Recent warming is much faster than the long-term average."`,
          hints: ['np.polyfit(annual.index, annual.values, 1)[0] is the slope in °C per year.', 'Multiply by 100 for per century. Repeat on annual.loc[1976:2025].'],
        },
        {
          kind: 'code',
          id: 'm17-l2-chart',
          prompt: 'Draw the story: plot `annual` as a thin grey line, its **10-year rolling mean** as a thicker line on top, and a title that states the finding. Label the y-axis in °C and add a legend.',
          setup: ANNUAL_SETUP,
          data: [WEATHER_FILE],
          starter: 'import matplotlib.pyplot as plt\n',
          solution: 'import matplotlib.pyplot as plt\nfig, ax = plt.subplots(figsize=(10, 4))\nax.plot(annual.index, annual.values, color="lightgray", linewidth=1, label="Yearly average")\nsmooth = annual.rolling(10).mean()\nax.plot(smooth.index, smooth.values, linewidth=2.5, label="10-year average")\nax.set_title("Oxford\'s daily highs have risen over 1.5 °C since the 1800s")\nax.set_ylabel("Average daily high (°C)")\nax.set_xlabel("Year")\nax.legend()\n',
          tests: `import matplotlib.pyplot as plt
assert plt.get_fignums(), "Draw the chart."
ax = plt.gcf().axes[0]
lines = ax.get_lines()
assert len(lines) == 2, f"Draw two lines: the yearly values and the 10-year rolling mean; found {len(lines)}."
import numpy as _np
rolled = annual.rolling(10).mean().values
assert any(_np.allclose(_np.nan_to_num(l.get_ydata(), nan=-99), _np.nan_to_num(rolled, nan=-99)) for l in lines), "One line should be annual.rolling(10).mean()."
assert ax.get_title().strip() and "°C" in ax.get_ylabel() and ax.get_legend() is not None, "Add a title, a y-axis label in °C and a legend."`,
          hints: ['ax.plot(annual.index, annual.values, color="lightgray", label="Yearly average")', 'smooth = annual.rolling(10).mean(); plot it with a thicker linewidth.', 'Finish with ax.set_title, ax.set_ylabel and ax.legend().'],
        },
      ],
    },
    {
      id: 'm17-l3',
      title: 'Capstone: wealth and health',
      summary: 'How does life expectancy relate to income? Find the countries that break the pattern.',
      steps: [
        {
          kind: 'read',
          md: `
## The question

In 2007, how closely did a country's wealth (GDP per person) predict its life expectancy? And which countries did much **better or worse** than their wealth would suggest?

GDP is extremely skewed, so analysts use its **logarithm**: \`np.log10(gdp)\`. On a log scale, each step of 1 means ten times richer, which turns a curved relationship into a roughly straight one.

A model's **residual** is actual minus predicted. Big residuals point at countries with a story worth investigating.

\`g07\` is ready: the 2007 rows of \`gapminder\`.
`,
        },
        {
          kind: 'code',
          id: 'm17-l3-corr',
          prompt: 'Add a column `log_gdp` (base-10 log of `gdp_per_cap`) to `g07`. Then create `r_raw` (the correlation between `gdp_per_cap` and `life_exp`) and `r_log` (between `log_gdp` and `life_exp`), both rounded to 3 decimal places.',
          setup: GAP_2007_SETUP,
          data: [GAPMINDER_FILE],
          starter: 'import numpy as np\n# g07: gapminder rows for 2007\n',
          solution: 'import numpy as np\ng07["log_gdp"] = np.log10(g07["gdp_per_cap"])\nr_raw = round(g07["gdp_per_cap"].corr(g07["life_exp"]), 3)\nr_log = round(g07["log_gdp"].corr(g07["life_exp"]), 3)\n',
          tests: `import numpy as _np
assert "log_gdp" in g07.columns and _np.allclose(g07["log_gdp"], _np.log10(g07["gdp_per_cap"])), "log_gdp should be np.log10(g07[\\"gdp_per_cap\\"])."
assert r_raw == round(g07["gdp_per_cap"].corr(g07["life_exp"]), 3), "Check r_raw."
lg = _np.log10(g07["gdp_per_cap"])
assert r_log == round(lg.corr(g07["life_exp"]), 3), "Check r_log."
assert r_log > r_raw, "The log scale reveals a stronger straight-line relationship."`,
          hints: ['g07["log_gdp"] = np.log10(g07["gdp_per_cap"])', 'a.corr(b) for each pair.'],
          review: true,
        },
        {
          kind: 'code',
          id: 'm17-l3-residuals',
          prompt: 'Fit a straight line of `life_exp` on `log_gdp` with `np.polyfit`. Add `predicted` and `residual` (actual minus predicted) columns to `g07`. Then create `worse`: a list of the **5 countries** with the most negative residuals (furthest below the line), most negative first.',
          setup: `${GAP_2007_SETUP}g07["log_gdp"] = np.log10(g07["gdp_per_cap"])\n`,
          data: [GAPMINDER_FILE],
          starter: 'import numpy as np\n# g07 has a log_gdp column\n',
          solution: 'import numpy as np\nslope, intercept = np.polyfit(g07["log_gdp"], g07["life_exp"], 1)\ng07["predicted"] = slope * g07["log_gdp"] + intercept\ng07["residual"] = g07["life_exp"] - g07["predicted"]\nworse = g07.sort_values("residual")["country"].head(5).tolist()\n',
          tests: `import numpy as _np
s, i = _np.polyfit(g07["log_gdp"], g07["life_exp"], 1)
res = g07["life_exp"] - (s * g07["log_gdp"] + i)
assert "residual" in g07.columns and _np.allclose(g07["residual"], res), "residual should be life_exp minus the fitted line's prediction."
want = g07.assign(_r=res).sort_values("_r")["country"].head(5).tolist()
assert list(worse) == want, f"Expected {want}, got {list(worse)}."`,
          hints: [
            'slope, intercept = np.polyfit(g07["log_gdp"], g07["life_exp"], 1)',
            'predicted = slope * log_gdp + intercept; residual = life_exp - predicted',
            'Sort by residual (ascending) and take the first 5 countries.',
          ],
        },
        {
          kind: 'choice',
          id: 'm17-l3-interpret',
          question: 'Several southern African countries sit far below the line in 2007, despite middle incomes. What\'s the most responsible way to report this?',
          options: [
            'Wealth doesn\'t matter for health',
            'These countries had much lower life expectancy than their income predicts, which is worth investigating (for example, the HIV/AIDS epidemic of the time), rather than claiming a cause from this data alone',
            'The data must be wrong, so remove them',
            'Poorer countries are unhealthy because of bad decisions',
          ],
          answer: 1,
          explain: 'Residuals flag what the model can\'t explain. Report them, suggest plausible explanations as hypotheses, and don\'t overclaim causes from one correlation.',
        },
      ],
    },
    {
      id: 'm17-l4',
      title: 'Capstone: an end-to-end species classifier',
      summary: 'Compare models with cross-validation, pick one, then test it once.',
      steps: [
        {
          kind: 'read',
          md: `
## The professional way to build a model

1. Split off a **test set** and don't touch it
2. Compare candidate models using **cross-validation on the training set only**
3. Pick the best, fit it on the whole training set
4. Evaluate **once** on the test set, and report that number
5. Use it to make predictions on genuinely new data

Checking the test score repeatedly while tweaking the model quietly overfits to the test set. Cross-validation on the training set is for choosing; the test set is for the final, honest grade.

The split is ready: \`X_train\`, \`X_test\`, \`y_train\`, \`y_test\`, with four measurements (bill length, bill depth, flipper length, body mass) to predict \`species\`.
`,
        },
        {
          kind: 'code',
          id: 'm17-l4-compare',
          prompt: `Compare three candidate models with **5-fold cross-validation on the training set**. Create \`cv_scores\`: a dictionary mapping each name to its mean score, rounded to 3 decimal places:

- \`"tree"\`: \`DecisionTreeClassifier(max_depth=3, random_state=0)\`
- \`"logistic"\`: a \`Pipeline\` of \`StandardScaler\` then \`LogisticRegression(max_iter=1000)\`
- \`"knn"\`: a \`Pipeline\` of \`StandardScaler\` then \`KNeighborsClassifier(n_neighbors=5)\`

Then create \`best\`: the name with the highest score.`,
          setup: PENGUIN_MODEL_SETUP,
          data: [PENGUINS_FILE],
          starter: 'from sklearn.model_selection import cross_val_score\nfrom sklearn.pipeline import Pipeline\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.tree import DecisionTreeClassifier\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.neighbors import KNeighborsClassifier\n',
          solution: 'from sklearn.model_selection import cross_val_score\nfrom sklearn.pipeline import Pipeline\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.tree import DecisionTreeClassifier\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.neighbors import KNeighborsClassifier\nmodels = {\n    "tree": DecisionTreeClassifier(max_depth=3, random_state=0),\n    "logistic": Pipeline([("scale", StandardScaler()), ("model", LogisticRegression(max_iter=1000))]),\n    "knn": Pipeline([("scale", StandardScaler()), ("model", KNeighborsClassifier(n_neighbors=5))]),\n}\ncv_scores = {name: round(cross_val_score(m, X_train, y_train, cv=5).mean(), 3) for name, m in models.items()}\nbest = max(cv_scores, key=cv_scores.get)\n',
          tests: `from sklearn.model_selection import cross_val_score as _cv
from sklearn.pipeline import Pipeline as _P
from sklearn.preprocessing import StandardScaler as _S
from sklearn.tree import DecisionTreeClassifier as _T
from sklearn.linear_model import LogisticRegression as _L
from sklearn.neighbors import KNeighborsClassifier as _K
want = {
    "tree": round(_cv(_T(max_depth=3, random_state=0), X_train, y_train, cv=5).mean(), 3),
    "logistic": round(_cv(_P([("s", _S()), ("m", _L(max_iter=1000))]), X_train, y_train, cv=5).mean(), 3),
    "knn": round(_cv(_P([("s", _S()), ("m", _K(n_neighbors=5))]), X_train, y_train, cv=5).mean(), 3),
}
assert cv_scores == want, f"Expected {want} (cross-validate on the TRAINING set), got {cv_scores}."
assert best == max(want, key=want.get), f"best should be {max(want, key=want.get)!r}."`,
          hints: [
            'Put the three models in a dictionary, then loop over it.',
            'cross_val_score(model, X_train, y_train, cv=5).mean()',
            'max(cv_scores, key=cv_scores.get) gives the name with the highest score.',
          ],
          review: true,
        },
        {
          kind: 'code',
          id: 'm17-l4-final',
          prompt: 'Your comparison picked the scaled logistic regression. Fit it on the **whole training set**, then create `test_accuracy` (rounded to 3 decimal places) and `new_prediction`: the predicted species for a newly measured penguin with bill length **47.5**, bill depth **15.0**, flipper length **217** and mass **5200** (pass it as a one-row DataFrame with the same column names as `X`).',
          setup: PENGUIN_MODEL_SETUP,
          data: [PENGUINS_FILE],
          starter: 'import pandas as pd\nfrom sklearn.pipeline import Pipeline\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.linear_model import LogisticRegression\n',
          solution: 'import pandas as pd\nfrom sklearn.pipeline import Pipeline\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.linear_model import LogisticRegression\nmodel = Pipeline([("scale", StandardScaler()), ("model", LogisticRegression(max_iter=1000))])\nmodel.fit(X_train, y_train)\ntest_accuracy = round(model.score(X_test, y_test), 3)\nnew = pd.DataFrame([{"bill_length_mm": 47.5, "bill_depth_mm": 15.0, "flipper_length_mm": 217, "body_mass_g": 5200}])\nnew_prediction = model.predict(new)[0]\n',
          tests: `from sklearn.pipeline import Pipeline as _P
from sklearn.preprocessing import StandardScaler as _S
from sklearn.linear_model import LogisticRegression as _L
_m = _P([("s", _S()), ("m", _L(max_iter=1000))]).fit(X_train, y_train)
assert test_accuracy == round(_m.score(X_test, y_test), 3), f"test_accuracy should be {round(_m.score(X_test, y_test), 3)}."
assert test_accuracy > 0.95, "The final model should be over 95% accurate on the test set."
assert new_prediction == "Gentoo", f"A long, shallow bill with long flippers and 5.2 kg is a Gentoo; got {new_prediction!r}."`,
          hints: [
            'model = Pipeline([("scale", StandardScaler()), ("model", LogisticRegression(max_iter=1000))]).fit(X_train, y_train)',
            'new = pd.DataFrame([{"bill_length_mm": 47.5, "bill_depth_mm": 15.0, "flipper_length_mm": 217, "body_mass_g": 5200}])',
            'model.predict(new)[0]',
          ],
        },
      ],
    },
    {
      id: 'm17-l5',
      title: 'Communicating your findings',
      summary: 'The last step decides whether anyone acts on your work.',
      steps: [
        {
          kind: 'read',
          md: `
## Write for the reader, not yourself

Decision-makers rarely read code. A good findings summary:

1. **Leads with the answer**: "Oxford's daily highs are about 1.6 °C warmer than in the mid-1800s"
2. **Gives the key numbers, rounded sensibly**: 1.6 °C, not 1.6341 °C
3. **States uncertainty and limits**: one weather station; some early values are estimates
4. **Says what to do next**, where relevant
5. **Uses one clear chart** per main point

Avoid jargon ("R² of 0.62") unless your audience uses it; translate it ("the model explains about 60% of the variation").

## Generating reports from code

Build summary text from computed values, never by retyping numbers. Then the report updates when the data does, and can't contain typos.
`,
        },
        {
          kind: 'choice',
          id: 'm17-l5-best',
          question: 'Which is the best opening line for a report to a non-technical manager?',
          options: [
            '"I ran np.polyfit on annual.values and the coefficient was 0.0098."',
            '"Oxford\'s average daily high has risen by about 1.6 °C since the mid-1800s, and warming since 1976 has been several times faster than the long-term rate."',
            '"The data had 2,076 rows and 7 columns."',
            '"Climate is complicated, so no conclusions are possible."',
          ],
          answer: 1,
          explain: 'Lead with the answer in plain language, with sensibly rounded numbers. Method details belong in an appendix.',
        },
        {
          kind: 'code',
          id: 'm17-l5-report',
          prompt: `Generate a three-line report from the Oxford data. Using \`annual\`, compute the values yourself and print exactly this format (with your computed numbers, **1 decimal place**):

~~~text
Oxford climate summary (Met Office, 1853-2025)
Average daily high, 1853-1882: ##.# °C
Average daily high, 1996-2025: ##.# °C (+#.# °C)
~~~

(Each ##.# stands for a number you calculate.)`,
          setup: ANNUAL_SETUP,
          data: [WEATHER_FILE],
          starter: '# annual: average daily high for each year\n',
          solution: 'early = annual.loc[1853:1882].mean()\nrecent = annual.loc[1996:2025].mean()\nprint("Oxford climate summary (Met Office, 1853-2025)")\nprint(f"Average daily high, 1853-1882: {early:.1f} °C")\nprint(f"Average daily high, 1996-2025: {recent:.1f} °C (+{recent - early:.1f} °C)")\n',
          tests: `e = annual.loc[1853:1882].mean()
r = annual.loc[1996:2025].mean()
want = ["Oxford climate summary (Met Office, 1853-2025)", f"Average daily high, 1853-1882: {e:.1f} °C", f"Average daily high, 1996-2025: {r:.1f} °C (+{r - e:.1f} °C)"]
assert lines == want, "Expected:\\n" + "\\n".join(want) + "\\nGot:\\n" + "\\n".join(lines)
assert ".1f" in source, "Build the numbers into the text with format specifiers, rather than typing them."`,
          hints: ['Compute early and recent with annual.loc[...].mean().', 'f"...: {early:.1f} °C" formats to 1 decimal place.'],
          review: true,
        },
        {
          kind: 'read',
          md: `
## You made it

You started with \`print("Hello, world!")\`. You've since:

- written functions, classes and regular expressions, and debugged and reviewed code
- analysed real datasets with NumPy and pandas, and queried them with SQL
- drawn honest charts, measured uncertainty and tested differences
- trained, evaluated and compared machine learning models
- answered real questions about climate, global health and wildlife

That's the core toolkit of a working data scientist. The next step is **your own project**: pick a question you care about, find open data (data.gov.uk, the ONS, Kaggle), and go round the loop.

Keep your streak going: reviews keep this knowledge fresh, and the daily puzzle keeps your code-reviewing eye sharp. One step at a time. **+= 1**.
`,
        },
      ],
    },
  ],
};
