import type { ExerciseStep, Lesson, Module, PlannedModule } from './types';
import { m01 } from './modules/m01-first-steps';
import { m02 } from './modules/m02-decisions-loops';
import { m03 } from './modules/m03-collections';
import { m04 } from './modules/m04-functions';
import { m05 } from './modules/m05-text';
import { m06 } from './modules/m06-errors';
import { m07 } from './modules/m07-comprehensions';
import { m08 } from './modules/m08-files-stdlib';
import { m09 } from './modules/m09-classes';
import { m10 } from './modules/m10-numpy';
import { m11 } from './modules/m11-pandas';
import { PUZZLES } from './puzzles';

export { PUZZLES };
export const MODULES: Module[] = [m01, m02, m03, m04, m05, m06, m07, m08, m09, m10, m11];

/** The full course plan. Modules not written yet show on the map as "coming soon". */
const ROADMAP: PlannedModule[] = [
  { number: 4, title: 'Functions', blurb: 'Package code into reusable tools.', topics: ['def and return', 'parameters and defaults', 'scope', 'docstrings'] },
  { number: 5, title: 'Text in depth', blurb: 'Split, search, format and clean text, including regular expressions.', topics: ['slicing and searching', 'split and join', 'formatting numbers', 'cleaning messy text', 'regular expressions'] },
  { number: 6, title: 'Errors and debugging', blurb: 'Read tracebacks calmly and review code, including AI code.', topics: ['reading tracebacks', 'try and except', 'raising errors', 'a debugging method', 'reviewing AI code'] },
  { number: 7, title: 'Tuples, sets and comprehensions', blurb: 'More ways to hold data, and loops in one clear line.', topics: ['tuples', 'sets', 'list and dict comprehensions', 'enumerate, zip and sorting with key'] },
  { number: 8, title: 'Files and the standard library', blurb: "Read real files and use Python's built-in toolbox.", topics: ['reading and writing files', 'csv and json', 'imports', 'math, statistics, datetime, collections'] },
  { number: 9, title: 'Classes and objects', blurb: 'Model the world with your own types.', topics: ['classes and __init__', 'methods', 'dataclasses', 'inheritance'] },
  { number: 10, title: 'NumPy', blurb: 'Fast maths on whole arrays of numbers.', topics: ['arrays', 'vectorised maths', 'boolean masks', 'aggregations', 'random simulation'] },
  { number: 11, title: 'pandas fundamentals', blurb: "The data scientist's spreadsheet, in code.", topics: ['Series and DataFrames', 'reading CSVs', 'selecting and filtering', 'sorting', 'new columns'] },
  { number: 12, title: 'Analysing data with pandas', blurb: 'Clean, group, combine and reshape real datasets.', topics: ['missing data', 'groupby', 'merging tables', 'pivot tables', 'dates and time series'] },
  { number: 13, title: 'Visualisation', blurb: 'Turn numbers into charts people understand.', topics: ['matplotlib basics', 'choosing the right chart', 'plotting from pandas', 'honest charts'] },
  { number: 14, title: 'Statistics for data science', blurb: 'Describe data, measure relationships and reason about uncertainty.', topics: ['centre and spread', 'distributions', 'correlation', 'sampling and confidence', 'comparing groups'] },
  { number: 15, title: 'SQL for data analysis', blurb: 'Query databases, the language every data team speaks.', topics: ['SELECT and WHERE', 'ORDER BY', 'GROUP BY', 'JOIN', 'SQL with pandas'] },
  { number: 16, title: 'Machine learning basics', blurb: 'Train, evaluate and trust your first models with scikit-learn.', topics: ['features and targets', 'train/test split', 'regression', 'classification', 'overfitting', 'clustering'] },
  { number: 17, title: 'Capstone projects', blurb: 'Full analyses of real data, from question to insight.', topics: ['the data science workflow', 'UK climate', 'global development', 'an end-to-end model'] },
];
export const PLANNED: PlannedModule[] = ROADMAP.filter((p) => !MODULES.some((m) => m.number === p.number));

/** Every lesson in course order. */
export const LESSONS: Lesson[] = MODULES.flatMap((m) => m.lessons);

const lessonById = new Map(LESSONS.map((l) => [l.id, l]));
const moduleByLesson = new Map(MODULES.flatMap((m) => m.lessons.map((l) => [l.id, m] as const)));
const exerciseById = new Map<string, { step: ExerciseStep; lesson: Lesson }>();
for (const lesson of LESSONS) {
  for (const step of lesson.steps) {
    if (step.kind !== 'read') exerciseById.set(step.id, { step, lesson });
  }
}

export const findLesson = (id: string) => lessonById.get(id);
export const moduleOf = (lessonId: string) => moduleByLesson.get(lessonId);
export const findExercise = (id: string) => exerciseById.get(id);

/** Exercises from a lesson that become spaced-repetition cards once the lesson is completed. */
export function reviewableSteps(lesson: Lesson): ExerciseStep[] {
  return lesson.steps.filter(
    (s): s is ExerciseStep => s.kind === 'predict' || s.kind === 'choice' || (s.kind === 'code' && !!s.review),
  );
}

export function nextLesson(id: string): Lesson | undefined {
  const i = LESSONS.findIndex((l) => l.id === id);
  return i >= 0 ? LESSONS[i + 1] : undefined;
}
