// App-wide state: the signed-in user (if any) and their progress.
// Progress is local-first: it is always saved in this browser straight away, and when signed in it is
// also saved to Supabase shortly after each change. On sign-in, guest progress is merged into the account.
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { dayKey } from '../lib/dates';
import { applyFreezes, emptyProgress, mergeProgress, normalise, type Progress } from '../lib/progress';
import { setSoundEnabled } from '../lib/sound';
import { loadRemoteProgress, saveRemoteProgress, supabase } from '../lib/supabase';

type SyncStatus = 'local' | 'syncing' | 'synced' | 'error';

interface Store {
  progress: Progress;
  update: (change: (p: Progress) => Progress) => void;
  user: User | null;
  authReady: boolean;
  sync: SyncStatus;
}

const StoreContext = createContext<Store | null>(null);

const GUEST = 'guest';
const storageKey = (owner: string) => `increment.progress.${owner}`;

function readLocal(owner: string): Progress | null {
  try {
    const raw = localStorage.getItem(storageKey(owner));
    return raw ? normalise(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

function writeLocal(owner: string, p: Progress) {
  try {
    localStorage.setItem(storageKey(owner), JSON.stringify(p));
  } catch {
    // Storage can be full or blocked (private windows); the in-memory copy still works.
  }
}

function removeLocal(owner: string) {
  try {
    localStorage.removeItem(storageKey(owner));
  } catch {
    /* ignore */
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<Progress>(() => applyFreezes(readLocal(GUEST) ?? emptyProgress(), dayKey()));
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(!supabase);
  const [sync, setSync] = useState<SyncStatus>('local');
  const userRef = useRef<User | null>(null);
  const saveTimer = useRef<number | undefined>(undefined);

  const pushRemote = useCallback((p: Progress) => {
    const u = userRef.current;
    if (!u) return;
    window.clearTimeout(saveTimer.current);
    setSync('syncing');
    saveTimer.current = window.setTimeout(() => {
      saveRemoteProgress(u.id, p).then(() => setSync('synced'), () => setSync('error'));
    }, 1500);
  }, []);

  // Load the account's progress on sign-in, merging in anything done as a guest.
  const adoptUser = useCallback(async (u: User | null) => {
    userRef.current = u;
    setUser(u);
    if (!u) {
      setSync('local');
      setProgress(applyFreezes(readLocal(GUEST) ?? emptyProgress(), dayKey()));
      return;
    }
    setSync('syncing');
    let merged = readLocal(u.id) ?? emptyProgress();
    try {
      const remote = await loadRemoteProgress(u.id);
      if (remote) merged = mergeProgress(merged, normalise(remote));
      setSync('synced');
    } catch {
      setSync('error');
    }
    const guest = readLocal(GUEST);
    if (guest && guest.xp > 0) {
      merged = mergeProgress(merged, guest);
      removeLocal(GUEST);
    }
    merged = applyFreezes(merged, dayKey());
    writeLocal(u.id, merged);
    setProgress(merged);
    pushRemote(merged);
  }, [pushRemote]);

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      await adoptUser(data.session?.user ?? null);
      setAuthReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      const next = session?.user ?? null;
      if (event === 'SIGNED_IN' && next?.id !== userRef.current?.id) void adoptUser(next);
      if (event === 'SIGNED_OUT') void adoptUser(null);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [adoptUser]);

  useEffect(() => setSoundEnabled(progress.sound), [progress.sound]);

  const update = useCallback((change: (p: Progress) => Progress) => {
    setProgress((prev) => {
      const next = { ...change(prev), updatedAt: new Date().toISOString() };
      writeLocal(userRef.current?.id ?? GUEST, next);
      pushRemote(next);
      return next;
    });
  }, [pushRemote]);

  const value = useMemo(() => ({ progress, update, user, authReady, sync }), [progress, update, user, authReady, sync]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const s = useContext(StoreContext);
  if (!s) throw new Error('useStore must be used inside StoreProvider');
  return s;
}
