import { NavLink, Outlet, Link } from 'react-router-dom';
import { dayKey } from '../lib/dates';
import { levelInfo, streakInfo } from '../lib/progress';
import { dueCardIds } from '../lib/srs';
import { useStore } from '../state/store';

export function Logo() {
  return (
    <Link to="/" className="logo" aria-label="Increment home">
      <span className="logo-mark">+= 1</span>
      <span>Increment</span>
    </Link>
  );
}

export function Layout() {
  const { progress, update, user } = useStore();
  const today = dayKey();
  const streak = streakInfo(progress, today);
  const { level } = levelInfo(progress.xp);
  const due = dueCardIds(progress, new Date()).length;

  const links = [
    { to: '/', label: 'Home', icon: '⌂', end: true },
    { to: '/learn', label: 'Learn', icon: '▤' },
    { to: '/review', label: 'Review', icon: '↻', badge: due },
    { to: '/puzzles', label: 'Puzzles', icon: '⚑' },
  ];

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-inner">
          <Logo />
          <nav className="nav" aria-label="Main">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end}>
                {l.label}
                {l.badge ? <span className="badge" aria-label={`${l.badge} due`}>{l.badge}</span> : null}
              </NavLink>
            ))}
          </nav>
          <div className="topbar-stats">
            <span
              className={`stat-chip streak ${streak.activeToday ? '' : 'cold'}`}
              title={streak.activeToday ? `${streak.current}-day streak. Done for today!` : 'Do a lesson, review or puzzle today to extend your streak'}
            >
              🔥 {streak.current}
            </span>
            <span className="stat-chip xp hide-mobile" title={`${progress.xp} XP in total`}>Lv {level}</span>
            <button
              className="icon-btn"
              onClick={() => update((p) => ({ ...p, sound: !p.sound }))}
              aria-label={progress.sound ? 'Mute sounds' : 'Turn sounds on'}
              title={progress.sound ? 'Sound on' : 'Sound off'}
            >
              {progress.sound ? '🔊' : '🔇'}
            </button>
            <NavLink to="/account" className="icon-btn" aria-label="Account and settings" title={user?.email ?? 'Account'}>
              {user ? '●' : '○'} <span className="hide-mobile">{user ? 'Account' : 'Sign in'}</span>
            </NavLink>
          </div>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
      <nav className="tabbar" aria-label="Main">
        {links.map((l) => (
          <NavLink key={l.to} to={l.to} end={l.end}>
            <span style={{ fontSize: 18 }}>{l.icon}</span>
            {l.label}
            {l.badge ? <span className="badge">{l.badge}</span> : null}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
