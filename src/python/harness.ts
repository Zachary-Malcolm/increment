// The Python side of every run. The browser worker and the content checker (scripts/check-content.ts)
// both load this same code into Pyodide, so an answer that passes the checker passes in the app.
//
// run_submission(code, setup, tests) runs the learner's code, then the exercise's hidden tests, and returns
// a JSON string:
//   { ok, output, error: {type, message, line, friendly} | null, failure: string | null, images: [base64 PNG] }
// Tests are plain Python using `assert condition, "message for the learner"`. They run in the learner's
// namespace, plus `output` (everything printed), `lines` (output split into lines, blank ones dropped),
// `source` (the learner's code as text) and `rerun(**values)` (runs the code again from scratch with the
// given variables set first; returns its namespace, including its own `output` and `lines`).
// `printed(fn, *args)` calls one of the learner's functions and returns the lines it printed.
// Charts: tests can inspect matplotlib figures (e.g. plt.gca().get_title()) before they are captured as PNGs.

export const HARNESS_PY = String.raw`
import sys, os, io, json, base64, traceback, builtins, contextlib

# Charts are drawn off-screen and sent back to the page as PNG images.
os.environ["MPLBACKEND"] = "Agg"

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

def _prepare_libraries():
    # Tidy defaults for libraries the code has loaded: wide tables print on one line, and no chart is
    # left over from a previous run.
    if "pandas" in sys.modules:
        pd = sys.modules["pandas"]
        pd.set_option("display.width", 120)
        pd.set_option("display.max_columns", 20)
    if "matplotlib.pyplot" in sys.modules:
        sys.modules["matplotlib.pyplot"].close("all")

def _capture_charts():
    # PNGs of any figures the code drew, then close them.
    if "matplotlib.pyplot" not in sys.modules:
        return []
    plt = sys.modules["matplotlib.pyplot"]
    images = []
    for num in plt.get_fignums():
        buf = io.BytesIO()
        plt.figure(num).savefig(buf, format="png", dpi=90, bbox_inches="tight")
        images.append(base64.b64encode(buf.getvalue()).decode("ascii"))
    plt.close("all")
    return images

def _printed(fn, *args, **kwargs):
    # For tests: call fn and return the non-blank lines it printed.
    buf = _Capped()
    with contextlib.redirect_stdout(buf):
        fn(*args, **kwargs)
    return [l for l in buf.getvalue().splitlines() if l.strip()]

def run_submission(code, setup="", tests=""):
    ns = {"__name__": "__main__", "input": _no_input}
    _prepare_libraries()
    if setup:
        exec(compile(setup, "<setup>", "exec"), ns)
    _prepare_libraries()
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
        ns["printed"] = _printed
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
    images = _capture_charts()
    return json.dumps({"ok": ok, "output": output, "error": error, "failure": failure, "images": images})
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
  /** Charts the code drew, as base64 PNGs. */
  images?: string[];
}
