import { useState, type FormEvent } from 'react';
import { deleteAccount, googleEnabled, supabase } from '../lib/supabase';
import { useStore } from '../state/store';

const redirectTo = () => `${location.origin}${import.meta.env.BASE_URL}`;

export function AccountPage() {
  const { user } = useStore();
  return (
    <div className="narrow">
      <h1 className="page-title">{user ? 'Your account' : 'Account'}</h1>
      {!supabase ? <NoAccounts /> : user ? <SignedIn /> : <SignInForm />}
      <Settings />
    </div>
  );
}

function NoAccounts() {
  return (
    <div className="card">
      <p style={{ marginTop: 0 }}>Accounts aren't switched on for this copy of Increment yet.</p>
      <p className="muted" style={{ marginBottom: 0 }}>Your progress is saved in this browser, so you can keep learning. It won't follow you to other devices until accounts are set up.</p>
    </div>
  );
}

function SignInForm() {
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: 'error' | 'info'; text: string } | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    setBusy(true);
    setMessage(null);
    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: redirectTo() } });
        if (error) throw error;
        if (!data.session) setMessage({ kind: 'info', text: 'Check your inbox for a link to confirm your email, then come back and sign in.' });
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: redirectTo() });
        if (error) throw error;
        setMessage({ kind: 'info', text: "If there's an account for that email, a reset link is on its way." });
      }
    } catch (err) {
      setMessage({ kind: 'error', text: err instanceof Error ? err.message : 'Something went wrong. Please try again.' });
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    if (!supabase) return;
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: redirectTo() } });
    if (error) setMessage({ kind: 'error', text: error.message });
  }

  return (
    <div className="card">
      <p className="muted" style={{ marginTop: 0 }}>Save your progress and streak, and pick up on any device. Anything you've done as a guest is kept.</p>
      {mode !== 'reset' && (
        <div className="tabs" role="tablist">
          <button role="tab" aria-selected={mode === 'signin'} className={mode === 'signin' ? 'active' : ''} onClick={() => setMode('signin')}>Sign in</button>
          <button role="tab" aria-selected={mode === 'signup'} className={mode === 'signup' ? 'active' : ''} onClick={() => setMode('signup')}>Create account</button>
        </div>
      )}
      <form onSubmit={submit}>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" className="input" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        {mode !== 'reset' && (
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password" className="input" type="password" required minLength={8}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              value={password} onChange={(e) => setPassword(e.target.value)}
            />
            {mode === 'signup' && <span className="faint" style={{ fontSize: 13 }}>At least 8 characters.</span>}
          </div>
        )}
        {message && <div className={`alert ${message.kind === 'error' ? 'alert-error' : 'alert-info'}`} style={{ marginBottom: 14 }}>{message.text}</div>}
        <button className="btn btn-primary btn-block" disabled={busy}>
          {busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : mode === 'signup' ? 'Create account' : 'Send reset link'}
        </button>
      </form>
      <div style={{ marginTop: 12, textAlign: 'center' }}>
        {mode === 'reset'
          ? <button className="btn btn-ghost btn-sm" onClick={() => setMode('signin')}>Back to sign in</button>
          : <button className="btn btn-ghost btn-sm" onClick={() => setMode('reset')}>Forgot password?</button>}
      </div>
      {googleEnabled && mode !== 'reset' && (
        <>
          <div className="divider">or</div>
          <button className="btn btn-block" onClick={google}>Continue with Google</button>
        </>
      )}
    </div>
  );
}

function SignedIn() {
  const { user, progress, sync } = useStore();
  const [confirming, setConfirming] = useState(false);
  const [typed, setTyped] = useState('');
  const [error, setError] = useState('');

  function exportData() {
    const blob = new Blob([JSON.stringify({ email: user?.email, progress }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'increment-progress.json';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  async function remove() {
    try {
      await deleteAccount();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete the account.');
    }
  }

  const syncText = { local: 'Saved in this browser', syncing: 'Saving…', synced: 'Saved to your account', error: "Couldn't reach the server. Saved in this browser; will retry." }[sync];
  return (
    <div className="card stack">
      <div>
        <div className="faint" style={{ fontSize: 13 }}>Signed in as</div>
        <div style={{ fontWeight: 600 }}>{user?.email}</div>
        <div className="muted" style={{ fontSize: 14 }}>{syncText}</div>
      </div>
      <div className="row" style={{ flexWrap: 'wrap' }}>
        <button className="btn" onClick={() => supabase?.auth.signOut()}>Sign out</button>
        <button className="btn btn-ghost" onClick={exportData}>Download my data</button>
      </div>
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
        {!confirming ? (
          <button className="btn btn-ghost btn-sm" style={{ color: 'var(--red)' }} onClick={() => setConfirming(true)}>Delete account…</button>
        ) : (
          <div>
            <p style={{ marginTop: 0 }}>This permanently deletes your account and all saved progress. Type <strong>DELETE</strong> to confirm.</p>
            <input className="input" value={typed} onChange={(e) => setTyped(e.target.value)} aria-label="Type DELETE to confirm" />
            <div className="row" style={{ marginTop: 10 }}>
              <button className="btn btn-danger" disabled={typed !== 'DELETE'} onClick={remove}>Delete forever</button>
              <button className="btn btn-ghost" onClick={() => { setConfirming(false); setTyped(''); }}>Cancel</button>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
          </div>
        )}
      </div>
    </div>
  );
}

function Settings() {
  const { progress, update } = useStore();
  return (
    <div className="card" style={{ marginTop: 16 }}>
      <div className="card-title">Settings</div>
      <label className="switch">
        <span>
          <div style={{ fontWeight: 600 }}>Sound effects</div>
          <div className="muted" style={{ fontSize: 14 }}>Chimes for correct answers and completed lessons</div>
        </span>
        <input type="checkbox" checked={progress.sound} onChange={(e) => update((p) => ({ ...p, sound: e.target.checked }))} style={{ width: 20, height: 20 }} />
      </label>
    </div>
  );
}
