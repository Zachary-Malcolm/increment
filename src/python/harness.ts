// The Python side of every run. The browser worker and the content checker (scripts/check-content.ts)
// both load this same code into Pyodide, so an answer that passes the checker passes in the app.
//
// run_submission(code, setup, tests) runs the learner's code, then the exercise's hidden tests, and returns
// a JSON string:
//   { ok, output, error: {type, message, line, friendly} | null, failure: string | null }
// Tests are plain Python using `assert condition, "message for the learner"`. They run in the learner's
// namespace, plus `output` (everything printed), `lines` (output split into lines, blank ones dropped),
// `source` (the learner's code as text) and `rerun(**values)` (runs the code again from scratch with the
// given variables set first; returns its namespace, including its own `output` and `lines`).

export const HARNESS_PY = String.raw`
import sys, io, json, traceback, builtins, contextlib

_MAX_OUTPUT = 20000

_FRIENDLY = {
    "NameError": "Python doesn't recognise a name. Check the spelling, and that you created the variable before using it.",
    "SyntaxError": "Python couldn't read this line. Look for a missing bracket, quote or colon.",
    "IndentationError": "The indentation (spaces at the start of lines) doesn't line up. Lines inside an if, loop or function need to be indented by the same amount.",
    "TypeError": "An operation got the wrong kind of value, such as adding text to a number. Check the types of the values involved.",
    "ValueError": "The value has the right type but can't be used, such as int('hello').",
    "ZeroDivisionError": "Something was divided by zero.",
    "IndexError": "You asked for a position that doesn't exist. Remember positions start at 0, so the last item of a 3-item list is at index 2.",
    "KeyError": "That key isn't in the dictionary (yet). Check its spelling and capitals, or use .get(key, default) for keys that might be missing.",
    "AttributeError": "That value doesn't have the method or attribute you used. Check the spelling, and the type of the value.",
    "UnboundLocalError": "A variable was used before it was given a value inside this function.",
    "RecursionError": "A function kept calling itself without stopping.",
}

def _no_input(*args, **kwargs):
    raise RuntimeError("input() isn't available here. Store the value in a variable instead.")

def _error_info(exc, source_name):
    etype = type(exc).__name__
    line = None
    if isinstance(exc, SyntaxError) and exc.filename == source_name:
        line = exc.lineno
    else:
        for frame in traceback.extract_tb(exc.__traceback__):
            if frame.filename == source_name:
                line = frame.lineno
    message = str(exc) if not isinstance(exc, SyntaxError) else (exc.msg or "invalid syntax")
    friendly = _FRIENDLY.get(etype, "")
    return {"type": etype, "message": message, "line": line, "friendly": friendly}

class _Capped(io.StringIO):
    def write(self, s):
        if self.tell() < _MAX_OUTPUT:
            return super().write(s)
        return len(s)

def _make_rerun(code):
    # Lets tests run the learner's code again with different starting values, so an answer has to work
    # in general rather than hard-coding the expected result.
    def rerun(**values):
        ns = {"__name__": "__main__", "input": _no_input}
        ns.update(values)
        buf = _Capped()
        with contextlib.redirect_stdout(buf):
            exec(compile(code, "<your code>", "exec"), ns)
        ns["output"] = buf.getvalue()
        ns["lines"] = [l for l in ns["output"].splitlines() if l.strip()]
        return ns
    return rerun

def run_submission(code, setup="", tests=""):
    ns = {"__name__": "__main__", "input": _no_input}
    if setup:
        exec(compile(setup, "<setup>", "exec"), ns)
    buf = _Capped()
    error = None
    with contextlib.redirect_stdout(buf):
        try:
            exec(compile(code, "<your code>", "exec"), ns)
        except BaseException as exc:
            if isinstance(exc, KeyboardInterrupt):
                raise
            error = _error_info(exc, "<your code>")
    output = buf.getvalue()
    if len(output) >= _MAX_OUTPUT:
        output = output[:_MAX_OUTPUT] + "\n... (output cut short)"
    failure = None
    if error is None and tests:
        ns["output"] = output
        ns["lines"] = [l for l in output.splitlines() if l.strip()]
        ns["source"] = code
        ns["rerun"] = _make_rerun(code)
        test_out = io.StringIO()
        with contextlib.redirect_stdout(test_out):
            try:
                exec(compile(tests, "<tests>", "exec"), ns)
            except AssertionError as exc:
                failure = str(exc) or "Not quite. Check the instructions again."
            except NameError as exc:
                name = getattr(exc, "name", None)
                failure = f"Couldn't find {name!r}. Did you create it, spelled exactly like that?" if name else str(exc)
            except Exception as exc:
                failure = f"Your answer didn't work with the checks ({type(exc).__name__}: {exc})."
    ok = error is None and failure is None
    return json.dumps({"ok": ok, "output": output, "error": error, "failure": failure})
`;

export interface PyError {
  type: string;
  message: string;
  line: number | null;
  friendly: string;
}

export interface RunResult {
  ok: boolean;
  output: string;
  error: PyError | null;
  failure: string | null;
}
