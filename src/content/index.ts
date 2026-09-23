import type { ExerciseStep, Lesson, Module, PlannedModule } from './types';
import { m01 } from './modules/m01-first-steps';
import { m02 } from './modules/m02-decisions-loops';
import { m03 } from './modules/m03-collections';
import { PUZZLES } from './puzzles';

export { PUZZLES };
export const MODULES: Module[] = [m01, m02, m03];

/** The rest of the course, shown on the map as "coming soon". */
export const PLANNED: PlannedModule[] = [
  { number: 4, title: 'Functions', blurb: 'Package code into reusable tools.', topics: ['def and return', 'parameters and defaults', 'scope', 'docstrings'] },
  { number: 5, title: 'Text in depth', blurb: 'Split, search and format text like a pro.', topics: ['split and join', 'searching text', 'formatting numbers', 'cleaning messy text'] },
  { number: 6, title: 'Errors and debugging', blurb: 'Read tracebacks calmly and review code, including AI code.', topics: ['reading tracebacks', 'try and except', 'raising errors', 'a debugging method'] },
  { number: 7, title: 'Comprehensions and iteration', blurb: 'Write loops in one clear line.', topics: ['list and dict comprehensions', 'enumerate and zip', 'sorting with key', 'lambda'] },
  { number: 8, title: 'Files and the standard library', blurb: 'Read real files and use Python\'s built-in toolbox.', topics: ['reading and writing files', 'csv and json', 'imports', 'math, statistics, datetime, collections'] },
  { number: 9, title: 'Classes and objects', blurb: 'Model the world with your own types.', topics: ['classes and __init__', 'methods', 'dataclasses', 'when to use a class'] },
  { number: 10, title: 'NumPy', blurb: 'Fast maths on whole arrays of numbers.', topics: ['arrays', 'vectorised maths', 'boolean masks', 'aggregations'] },
  { number: 11, title: 'pandas fundamentals', blurb: 'The data scientist\'s spreadsheet, in code.', topics: ['Series and DataFrames', 'selecting and filtering', 'sorting', 'new columns'] },
  { number: 12, title: 'Analysing data with pandas', blurb: 'Answer real questions from real datasets.', topics: ['groupby', 'merging tables', 'missing data', 'dates and times'] },
  { number: 13, title: 'Visualisation', blurb: 'Turn numbers into charts people understand.', topics: ['matplotlib basics', 'choosing the right chart', 'labelling', 'telling a story'] },
  { number: 14, title: 'Capstone projects', blurb: 'Full analyses of UK open data, from question to insight.', topics: ['framing a question', 'cleaning', 'analysis', 'presenting findings'] },
];

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
