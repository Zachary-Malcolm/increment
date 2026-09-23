// The shape of all course content. Every answer is proven by `npm run check-content`, which runs each
// solution through the same Python harness the app uses:
//  - code steps: the solution must pass the tests, and the starter code must NOT pass them;
//  - predict steps: the code is run and its printed output must equal the option marked as the answer;
//  - puzzles: the buggy code must fail, the fixed code must pass, and exactly the bug lines may differ.

/** A page of explanation (Markdown). Python code blocks are syntax-highlighted. */
export interface ReadStep {
  kind: 'read';
  md: string;
}

/** Write code that passes hidden tests. */
export interface CodeStep {
  kind: 'code';
  id: string;
  prompt: string; // Markdown
  starter: string;
  solution: string;
  tests: string; // Python asserts; `output` and `lines` hold what was printed
  hints: string[];
  setup?: string; // runs before the learner's code (e.g. loads a dataset)
  data?: string[]; // dataset files from public/data that setup needs
  /** Also add this exercise to spaced-repetition reviews. */
  review?: boolean;
}

/** Read some code and choose what it prints. The checker runs the code to prove the answer. */
export interface PredictStep {
  kind: 'predict';
  id: string;
  code: string;
  options: string[];
  answer: number;
  explain: string;
  setup?: string;
  data?: string[];
}

/** A multiple-choice concept question. */
export interface ChoiceStep {
  kind: 'choice';
  id: string;
  question: string; // Markdown
  options: string[];
  answer: number;
  explain: string;
}

export type ExerciseStep = CodeStep | PredictStep | ChoiceStep;
export type Step = ReadStep | ExerciseStep;

export interface Lesson {
  id: string;
  title: string;
  summary: string;
  steps: Step[];
}

export interface Module {
  id: string;
  number: number;
  title: string;
  blurb: string;
  lessons: Lesson[];
}

/** A module on the roadmap that hasn't been written yet. */
export interface PlannedModule {
  number: number;
  title: string;
  blurb: string;
  topics: string[];
}

/** A chess.com-style puzzle: AI-written code with a bug to spot and fix. */
export interface Puzzle {
  id: string;
  title: string;
  /** Difficulty on the same scale as the learner's puzzle rating (roughly 400 to 2000). */
  rating: number;
  concepts: string[];
  /** What the code was supposed to do, as the "AI assistant" was asked. */
  task: string;
  buggy: string;
  fixed: string;
  /** 1-based line numbers in `buggy` that contain the bug. */
  bugLines: number[];
  tests: string;
  explain: string;
  setup?: string;
  data?: string[];
  /** Describes any variables the setup provides, shown above the code (Markdown). */
  given?: string;
}
