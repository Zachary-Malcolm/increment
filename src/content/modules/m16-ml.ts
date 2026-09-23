import type { Module } from '../types';
import { PENGUINS_DF_SETUP, PENGUINS_FILE } from '../datasets';

const FEATURES = '["bill_length_mm", "bill_depth_mm", "flipper_length_mm"]';

/** clean: penguins with no missing measurements; X (3 measurements) and y (body mass). */
const REG_SETUP = `${PENGUINS_DF_SETUP}
features = ${FEATURES}
clean = penguins.dropna(subset=features + ["body_mass_g"])
X = clean[features]
y = clean["body_mass_g"]
`;

/** Train/test split already made, for later regression lessons. */
const SPLIT_SETUP = `${REG_SETUP}
from sklearn.model_selection import train_test_split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42)
`;

/** Species classification data: two bill measurements, stratified split. */
const CLASS_SETUP = `${PENGUINS_DF_SETUP}
from sklearn.model_selection import train_test_split
clean = penguins.dropna(subset=["bill_length_mm", "bill_depth_mm"])
X = clean[["bill_length_mm", "bill_depth_mm"]]
y = clean["species"]
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=0, stratify=y)
`;

export const m16: Module = {
  id: 'm16',
  number: 16,
  title: 'Machine learning basics',
  blurb: 'Train, evaluate and trust your first models with scikit-learn.',
  lessons: [
    {
      id: 'm16-l1',
      title: 'What is machine learning?',
      summary: 'Features, targets, and the kinds of problems models solve.',
      steps: [
        {
          kind: 'read',
          md: `
## Learning from examples

Instead of writing rules by hand, **machine learning** finds patterns in examples:

- **Features** (\`X\`): the inputs, e.g. a penguin's bill and flipper measurements
- **Target** (\`y\`): what you want to predict, e.g. its body mass or its species

| Type | Target | Example |
|---|---|---|
| **Regression** | a number | predict body mass (g) |
| **Classification** | a category | predict species |
| **Clustering** (unsupervised) | none: find groups | group penguins by shape, without labels |

Regression and classification are **supervised**: the model learns from examples where the right answer is known.

## scikit-learn

**scikit-learn** (\`sklearn\`) is Python's standard ML library. Every model works the same way:

~~~python
model = SomeModel()
model.fit(X_train, y_train)          # learn from examples
predictions = model.predict(X_new)   # use what it learned
~~~

\`X\` is a table (DataFrame) with one row per example; \`y\` is a single column (Series). Models can't handle missing values, so drop or fill them first.
`,
        },
        {
          kind: 'choice',
          id: 'm16-l1-type',
          question: 'A bank wants to predict whether a transaction is **fraud or not fraud**. What kind of problem is this?',
          options: ['Regression', 'Classification', 'Clustering', 'Not a machine learning problem'],
          answer: 1,
          explain: 'The target is a category (fraud / not fraud), so it\'s classification.',
        },
        {
          kind: 'code',
          id: 'm16-l1-xy',
          prompt: 'Prepare data to predict body mass from bill length, bill depth and flipper length:\n\n- `clean`: `penguins` with rows dropped where **any** of those four columns is missing\n- `X`: the three feature columns from `clean`\n- `y`: the `body_mass_g` column from `clean`',
          setup: PENGUINS_DF_SETUP,
          data: [PENGUINS_FILE],
          starter: `import pandas as pd\nfeatures = ${FEATURES}\n`,
          solution: `import pandas as pd\nfeatures = ${FEATURES}\nclean = penguins.dropna(subset=features + ["body_mass_g"])\nX = clean[features]\ny = clean["body_mass_g"]\n`,
          tests: `assert len(clean) == 342, f"Two penguins have no measurements, so clean should have 342 rows; got {len(clean)}."
assert list(X.columns) == ["bill_length_mm", "bill_depth_mm", "flipper_length_mm"] and X.shape == (342, 3), f"X should be the 3 feature columns; got shape {X.shape}."
assert y.name == "body_mass_g" and len(y) == 342, "y should be the body_mass_g column of clean."
assert X.isna().sum().sum() == 0 and y.isna().sum() == 0, "There should be no missing values left."`,
          hints: ['clean = penguins.dropna(subset=features + ["body_mass_g"])', 'X = clean[features]; y = clean["body_mass_g"]'],
          review: true,
        },
      ],
    },
    {
      id: 'm16-l2',
      title: 'Train, test, predict',
      summary: 'Hold back data to test on, and fit your first model.',
      steps: [
        {
          kind: 'read',
          md: `
## Never grade a model on its homework

A model that has seen an example can simply remember it. To find out how it does on **new** data, split the data first:

~~~python
from sklearn.model_selection import train_test_split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42)
~~~

- **Training set** (75%): the model learns from this
- **Test set** (25%): kept hidden until the end, to measure performance honestly
- \`random_state\` makes the random split reproducible

## Linear regression

The simplest regression model fits a straight-line relationship (in many dimensions):

~~~python
from sklearn.linear_model import LinearRegression
model = LinearRegression()
model.fit(X_train, y_train)
predictions = model.predict(X_test)
print(model.score(X_test, y_test))    # R², covered next lesson
~~~
`,
        },
        {
          kind: 'code',
          id: 'm16-l2-fit',
          prompt: '`X` and `y` are ready. Split them with `test_size=0.25` and `random_state=42`, fit a `LinearRegression` on the training set, and create `predictions` for the test set.',
          setup: REG_SETUP,
          data: [PENGUINS_FILE],
          starter: 'from sklearn.model_selection import train_test_split\nfrom sklearn.linear_model import LinearRegression\n# X and y are ready\n',
          solution: 'from sklearn.model_selection import train_test_split\nfrom sklearn.linear_model import LinearRegression\nX_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42)\nmodel = LinearRegression()\nmodel.fit(X_train, y_train)\npredictions = model.predict(X_test)\n',
          tests: `from sklearn.model_selection import train_test_split as _tts
from sklearn.linear_model import LinearRegression as _LR
_a, _b, _c, _d = _tts(X, y, test_size=0.25, random_state=42)
assert len(X_test) == len(_b) == 86 and (X_test.index == _b.index).all(), "Split with test_size=0.25 and random_state=42."
want = _LR().fit(_a, _c).predict(_b)
assert len(predictions) == len(want) and all(abs(p - w) < 1e-6 for p, w in zip(predictions, want)), "predictions should be model.predict(X_test) from a LinearRegression fitted on the training set."`,
          hints: ['X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42)', 'model = LinearRegression(); model.fit(X_train, y_train)', 'predictions = model.predict(X_test)'],
          review: true,
        },
        {
          kind: 'choice',
          id: 'm16-l2-why-split',
          question: 'Why evaluate a model on a test set it never trained on?',
          options: [
            'Training is faster with less data',
            'Because what matters is how it performs on new, unseen data, and it could simply memorise the training data',
            'scikit-learn requires it',
            'To make the accuracy look higher',
          ],
          answer: 1,
          explain: 'Scoring on training data rewards memorising. The test set simulates the future data the model will actually face.',
        },
      ],
    },
    {
      id: 'm16-l3',
      title: 'Evaluating regression',
      summary: 'MAE, RMSE, R², and always compare with a baseline.',
      steps: [
        {
          kind: 'read',
          md: `
## How wrong are the predictions?

| Metric | Meaning | Good when |
|---|---|---|
| **MAE** (mean absolute error) | the average size of the errors, in the target's units | small |
| **RMSE** (root mean squared error) | like MAE but punishes big errors more | small |
| **R²** | the share of the variation the model explains (1 is perfect, 0 is no better than guessing the mean) | close to 1 |

~~~python
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
mae = mean_absolute_error(y_test, predictions)
rmse = mean_squared_error(y_test, predictions) ** 0.5
r2 = r2_score(y_test, predictions)
~~~

## Always have a baseline

Is an MAE of 300 g good? Compare it with a dumb **baseline**: predict the training average for everyone. If your model doesn't beat that clearly, it isn't useful.

## Inside the model

\`model.coef_\` holds one number per feature: how much the prediction changes per unit of that feature, holding the others fixed. \`model.intercept_\` is the constant.
`,
        },
        {
          kind: 'code',
          id: 'm16-l3-metrics',
          prompt: 'The split is ready (`X_train`, `X_test`, `y_train`, `y_test`). Fit a `LinearRegression`, then create `mae`, `rmse` and `r2` for the test set, plus `baseline_mae`: the MAE of predicting the **training mean** for every test penguin. Round everything to 1 decimal place (r2 to 3).',
          setup: SPLIT_SETUP,
          data: [PENGUINS_FILE],
          starter: 'from sklearn.linear_model import LinearRegression\nfrom sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score\n',
          solution: 'from sklearn.linear_model import LinearRegression\nfrom sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score\nmodel = LinearRegression().fit(X_train, y_train)\npred = model.predict(X_test)\nmae = round(mean_absolute_error(y_test, pred), 1)\nrmse = round(mean_squared_error(y_test, pred) ** 0.5, 1)\nr2 = round(r2_score(y_test, pred), 3)\nbaseline = [y_train.mean()] * len(y_test)\nbaseline_mae = round(mean_absolute_error(y_test, baseline), 1)\n',
          tests: `from sklearn.linear_model import LinearRegression as _LR
from sklearn.metrics import mean_absolute_error as _mae, mean_squared_error as _mse, r2_score as _r2
_p = _LR().fit(X_train, y_train).predict(X_test)
assert mae == round(_mae(y_test, _p), 1), f"mae should be {round(_mae(y_test, _p), 1)}."
assert rmse == round(_mse(y_test, _p) ** 0.5, 1), f"rmse should be {round(_mse(y_test, _p) ** 0.5, 1)}."
assert r2 == round(_r2(y_test, _p), 3), f"r2 should be {round(_r2(y_test, _p), 3)}."
assert baseline_mae == round(_mae(y_test, [y_train.mean()] * len(y_test)), 1), "baseline_mae: predict y_train.mean() for every test penguin."
assert mae < baseline_mae, "The model should beat the baseline."`,
          hints: [
            'mean_absolute_error(y_test, pred); RMSE is mean_squared_error(y_test, pred) ** 0.5',
            'For the baseline, predict y_train.mean() for every test row: [y_train.mean()] * len(y_test)',
          ],
          review: true,
        },
        {
          kind: 'predict',
          id: 'm16-l3-r2',
          code: 'from sklearn.metrics import r2_score\ny_true = [10, 20, 30]\nprint(r2_score(y_true, [20, 20, 20]))\n',
          options: ['0.0', '1.0', '-1.0', '0.5'],
          answer: 0,
          explain: 'Predicting the mean (20) for everything explains none of the variation, which is exactly an R² of 0.',
        },
      ],
    },
    {
      id: 'm16-l4',
      title: 'Classification',
      summary: 'Predict a penguin\'s species from its bill, and measure accuracy.',
      steps: [
        {
          kind: 'read',
          md: `
## Predicting categories

The workflow is identical; only the model and the metrics change. \`X\` holds bill length and depth; \`y\` is the species. The split uses \`stratify=y\` so each species appears in the same proportion in both sets.

~~~python
from sklearn.linear_model import LogisticRegression
model = LogisticRegression(max_iter=1000)
model.fit(X_train, y_train)
print(model.predict(X_test[:3]))
print(model.score(X_test, y_test))     # accuracy: the share predicted correctly
~~~

## Beyond accuracy: the confusion matrix

Accuracy can hide problems (a model that always says "not fraud" is 99.9% accurate!). A **confusion matrix** shows exactly which classes get mixed up:

~~~python
from sklearn.metrics import confusion_matrix
confusion_matrix(y_test, predictions, labels=["Adelie", "Chinstrap", "Gentoo"])
~~~

Rows are the true classes; columns are the predictions. Everything off the diagonal is a mistake.
`,
        },
        {
          kind: 'code',
          id: 'm16-l4-logistic',
          prompt: 'The stratified split is ready. Fit a `LogisticRegression(max_iter=1000)` and create `accuracy` (on the test set, rounded to 3 decimal places) and `cm`: the confusion matrix with `labels=["Adelie", "Chinstrap", "Gentoo"]`.',
          setup: CLASS_SETUP,
          data: [PENGUINS_FILE],
          starter: 'from sklearn.linear_model import LogisticRegression\nfrom sklearn.metrics import confusion_matrix\n',
          solution: 'from sklearn.linear_model import LogisticRegression\nfrom sklearn.metrics import confusion_matrix\nmodel = LogisticRegression(max_iter=1000).fit(X_train, y_train)\npred = model.predict(X_test)\naccuracy = round(model.score(X_test, y_test), 3)\ncm = confusion_matrix(y_test, pred, labels=["Adelie", "Chinstrap", "Gentoo"])\n',
          tests: `from sklearn.linear_model import LogisticRegression as _L
from sklearn.metrics import confusion_matrix as _cm
_m = _L(max_iter=1000).fit(X_train, y_train)
assert accuracy == round(_m.score(X_test, y_test), 3), f"accuracy should be {round(_m.score(X_test, y_test), 3)}."
assert accuracy > 0.9, "Two bill measurements are enough to tell the species apart over 90% of the time."
want = _cm(y_test, _m.predict(X_test), labels=["Adelie", "Chinstrap", "Gentoo"])
assert (cm == want).all(), "cm should be confusion_matrix(y_test, predictions, labels=[...])."`,
          hints: ['model = LogisticRegression(max_iter=1000).fit(X_train, y_train)', 'model.score(X_test, y_test) is the accuracy.', 'confusion_matrix(y_test, model.predict(X_test), labels=["Adelie", "Chinstrap", "Gentoo"])'],
          review: true,
        },
        {
          kind: 'choice',
          id: 'm16-l4-accuracy-trap',
          question: 'Only 1 in 1,000 transactions is fraud. A model that always predicts "not fraud" has what accuracy, and is it useful?',
          options: [
            '50%, and it\'s useless',
            '99.9%, and it\'s very useful',
            '99.9%, but it\'s useless: it never catches any fraud',
            '0%',
          ],
          answer: 2,
          explain: 'With imbalanced classes, accuracy misleads. Look at the confusion matrix, or metrics like precision and recall for the rare class.',
        },
      ],
    },
    {
      id: 'm16-l5',
      title: 'Overfitting and cross-validation',
      summary: 'When a model memorises instead of learning, and how to catch it.',
      steps: [
        {
          kind: 'read',
          md: `
## Overfitting

A **decision tree** asks yes/no questions ("bill length > 43 mm?"). With no limit, it keeps splitting until it gets every training example right, memorising noise rather than learning patterns. That's **overfitting**: excellent on the training data, worse on new data.

The tell-tale sign is a **big gap between training and test scores**. Limiting complexity (like \`max_depth=3\`) usually closes it.

## Cross-validation

One test split can be lucky or unlucky. **k-fold cross-validation** splits the data into k parts, trains k times (each part takes a turn as the test set), and averages the scores:

~~~python
from sklearn.model_selection import cross_val_score
scores = cross_val_score(model, X, y, cv=5)
print(scores.mean())
~~~

## Data leakage

**Leakage** is when information from the test set sneaks into training, for example scaling the data using the mean of **all** rows before splitting. It makes models look better than they are. Do every preparation step on the training data only; a \`Pipeline\` makes that automatic.
`,
        },
        {
          kind: 'code',
          id: 'm16-l5-trees',
          prompt: 'Using the species split, fit two `DecisionTreeClassifier`s with `random_state=0`: `deep` (no depth limit) and `shallow` (`max_depth=2`). Create `deep_train`, `deep_test`, `shallow_train` and `shallow_test`: their accuracies, rounded to 3 decimal places.',
          setup: CLASS_SETUP,
          data: [PENGUINS_FILE],
          starter: 'from sklearn.tree import DecisionTreeClassifier\n',
          solution: 'from sklearn.tree import DecisionTreeClassifier\ndeep = DecisionTreeClassifier(random_state=0).fit(X_train, y_train)\nshallow = DecisionTreeClassifier(max_depth=2, random_state=0).fit(X_train, y_train)\ndeep_train = round(deep.score(X_train, y_train), 3)\ndeep_test = round(deep.score(X_test, y_test), 3)\nshallow_train = round(shallow.score(X_train, y_train), 3)\nshallow_test = round(shallow.score(X_test, y_test), 3)\n',
          tests: `from sklearn.tree import DecisionTreeClassifier as _T
_d = _T(random_state=0).fit(X_train, y_train)
_s = _T(max_depth=2, random_state=0).fit(X_train, y_train)
assert deep_train == round(_d.score(X_train, y_train), 3) and deep_test == round(_d.score(X_test, y_test), 3), "Check the deep tree's scores."
assert shallow_train == round(_s.score(X_train, y_train), 3) and shallow_test == round(_s.score(X_test, y_test), 3), "Check the shallow tree's scores (max_depth=2)."
assert deep_train == 1.0, "The unlimited tree memorises the training data perfectly."
assert deep_train - deep_test > shallow_train - shallow_test, "Notice the deep tree's bigger gap between train and test: overfitting."`,
          hints: ['DecisionTreeClassifier(random_state=0).fit(X_train, y_train)', 'model.score(X_train, y_train) and model.score(X_test, y_test)'],
          review: true,
        },
        {
          kind: 'code',
          id: 'm16-l5-cv',
          prompt: 'Build a `Pipeline` that **scales** the features (`StandardScaler`) then fits `LogisticRegression(max_iter=1000)`, and score it with **5-fold cross-validation** on the full `X` and `y`. Store the mean score, rounded to 3 decimal places, in `cv_mean`.',
          setup: CLASS_SETUP,
          data: [PENGUINS_FILE],
          starter: 'from sklearn.pipeline import Pipeline\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.model_selection import cross_val_score\n',
          solution: 'from sklearn.pipeline import Pipeline\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.model_selection import cross_val_score\npipe = Pipeline([("scale", StandardScaler()), ("model", LogisticRegression(max_iter=1000))])\ncv_mean = round(cross_val_score(pipe, X, y, cv=5).mean(), 3)\n',
          tests: `from sklearn.pipeline import Pipeline as _P
from sklearn.preprocessing import StandardScaler as _S
from sklearn.linear_model import LogisticRegression as _L
from sklearn.model_selection import cross_val_score as _cv
want = round(_cv(_P([("s", _S()), ("m", _L(max_iter=1000))]), X, y, cv=5).mean(), 3)
assert cv_mean == want, f"cv_mean should be {want}, got {cv_mean}."`,
          hints: ['Pipeline([("scale", StandardScaler()), ("model", LogisticRegression(max_iter=1000))])', 'cross_val_score(pipe, X, y, cv=5).mean()'],
        },
        {
          kind: 'choice',
          id: 'm16-l5-leak',
          question: 'Which of these causes **data leakage**?',
          options: [
            'Splitting into train and test before doing anything else',
            'Filling missing values with the mean of the whole dataset, then splitting',
            'Using cross-validation',
            'Setting random_state',
          ],
          answer: 1,
          explain: 'The fill value was calculated using test rows, so information from the test set leaked into training. Compute it from the training set only, or use a Pipeline.',
        },
      ],
    },
    {
      id: 'm16-l6',
      title: 'Clustering: finding groups without labels',
      summary: 'Unsupervised learning with k-means.',
      steps: [
        {
          kind: 'read',
          md: `
## No answers given

In **unsupervised** learning there's no target. The algorithm looks for structure by itself. **k-means** splits data into k clusters of similar points:

~~~python
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

X_scaled = StandardScaler().fit_transform(X)       # put features on the same scale
km = KMeans(n_clusters=3, n_init=10, random_state=0)
labels = km.fit_predict(X_scaled)                  # a cluster number (0, 1, 2) for each row
~~~

**Scale first**: k-means measures distances, so a feature measured in grams would swamp one in millimetres.

Clusters are just numbers; *you* decide what they mean. A crosstab against a known label is a good sanity check. Clustering is used for customer segmentation, grouping documents, and spotting anomalies.
`,
        },
        {
          kind: 'code',
          id: 'm16-l6-kmeans',
          prompt: 'Cluster the penguins by their three measurements without looking at species. Scale `X` with `StandardScaler`, run `KMeans(n_clusters=3, n_init=10, random_state=0)`, and store the labels in `clusters`. Then create `table`: a crosstab of `clean["species"]` against `clusters`.',
          setup: `${REG_SETUP}`,
          data: [PENGUINS_FILE],
          starter: 'import pandas as pd\nfrom sklearn.cluster import KMeans\nfrom sklearn.preprocessing import StandardScaler\n# X: 3 measurements for each penguin in clean\n',
          solution: 'import pandas as pd\nfrom sklearn.cluster import KMeans\nfrom sklearn.preprocessing import StandardScaler\nX_scaled = StandardScaler().fit_transform(X)\nclusters = KMeans(n_clusters=3, n_init=10, random_state=0).fit_predict(X_scaled)\ntable = pd.crosstab(clean["species"], clusters)\n',
          tests: `from sklearn.cluster import KMeans as _K
from sklearn.preprocessing import StandardScaler as _S
_c = _K(n_clusters=3, n_init=10, random_state=0).fit_predict(_S().fit_transform(X))
assert len(clusters) == len(X) and (clusters == _c).all(), "Scale X, then KMeans(n_clusters=3, n_init=10, random_state=0).fit_predict(...)."
want = pd.crosstab(clean["species"], _c)
assert table.values.tolist() == want.values.tolist(), "table should be pd.crosstab(clean[\\"species\\"], clusters)."
assert max(want.loc["Gentoo"]) == want.loc["Gentoo"].sum(), "Notice: every Gentoo lands in one cluster, found without any labels."`,
          hints: ['X_scaled = StandardScaler().fit_transform(X)', 'clusters = KMeans(n_clusters=3, n_init=10, random_state=0).fit_predict(X_scaled)', 'pd.crosstab(clean["species"], clusters)'],
          review: true,
        },
        {
          kind: 'choice',
          id: 'm16-l6-scale',
          question: 'Why scale features before k-means?',
          options: [
            'k-means only works on numbers between 0 and 1',
            'It uses distances, so features with big units (like grams) would dominate those with small units (like mm)',
            'Scaling makes it run faster',
            'It isn\'t needed',
          ],
          answer: 1,
          explain: 'Without scaling, a 100 g difference outweighs a 10 mm difference purely because of units. Scaling puts every feature on an equal footing.',
        },
      ],
    },
  ],
};
