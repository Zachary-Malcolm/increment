// A year of activity as a GitHub-style grid of squares: one per day, greener for more XP.
import { addDays, parseDay } from '../lib/dates';
import type { Progress } from '../lib/progress';

const CELL = 11;
const GAP = 3;
const LEFT = 28;
const TOP = 16;
const WEEKS = 53;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function level(xp: number): number {
  if (xp <= 0) return 0;
  if (xp < 20) return 1;
  if (xp < 50) return 2;
  if (xp < 100) return 3;
  return 4;
}

export function Heatmap({ progress, today }: { progress: Progress; today: string }) {
  // Weeks run Monday to Sunday; the last column holds the current week.
  const weekday = (parseDay(today).getDay() + 6) % 7; // Monday = 0
  const start = addDays(today, -weekday - (WEEKS - 1) * 7);
  const frozen = new Set(progress.frozenDays);
  const cells = [];
  const labels = [];
  let lastMonth = -1;
  for (let c = 0; c < WEEKS; c++) {
    const monday = addDays(start, c * 7);
    const month = parseDay(monday).getMonth();
    if (month !== lastMonth && c < WEEKS - 2) {
      if (lastMonth !== -1 || parseDay(monday).getDate() <= 7) {
        labels.push(<text key={`m${c}`} x={LEFT + c * (CELL + GAP)} y={10}>{MONTHS[month]}</text>);
      }
      lastMonth = month;
    }
    for (let r = 0; r < 7; r++) {
      const day = addDays(start, c * 7 + r);
      if (day > today) continue;
      const xp = progress.activity[day] ?? 0;
      const isFrozen = frozen.has(day) && xp === 0;
      const date = parseDay(day).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
      cells.push(
        <rect
          key={day}
          x={LEFT + c * (CELL + GAP)}
          y={TOP + r * (CELL + GAP)}
          width={CELL}
          height={CELL}
          rx={2}
          fill={isFrozen ? 'var(--ice)' : `var(--heat-${level(xp)})`}
          fillOpacity={isFrozen ? 0.55 : 1}
          stroke={day === today ? 'var(--muted)' : 'none'}
        >
          <title>{isFrozen ? `Streak freeze used · ${date}` : `${xp} XP · ${date}`}</title>
        </rect>,
      );
    }
  }
  const width = LEFT + WEEKS * (CELL + GAP);
  const height = TOP + 7 * (CELL + GAP);
  const activeDays = Object.values(progress.activity).filter((x) => x > 0).length;
  return (
    <div>
      <div className="heatmap-wrap">
        <svg className="heatmap" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Activity over the last year: ${activeDays} active days`}>
          {labels}
          {['Mon', 'Wed', 'Fri'].map((d, i) => (
            <text key={d} x={0} y={TOP + (i * 2) * (CELL + GAP) + 9}>{d}</text>
          ))}
          {cells}
        </svg>
      </div>
      <div className="heat-legend">
        <span className="freeze" style={{ marginRight: 'auto' }}>
          <i style={{ background: 'var(--ice)', opacity: 0.55, marginRight: 6, verticalAlign: -1 }} />streak freeze
        </span>
        Less {[0, 1, 2, 3, 4].map((l) => <i key={l} style={{ background: `var(--heat-${l})` }} />)} More
      </div>
    </div>
  );
}
