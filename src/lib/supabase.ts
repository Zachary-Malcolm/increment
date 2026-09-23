// Accounts and cloud saving via Supabase. Optional: without the environment variables the app runs in
// guest mode and keeps progress in this browser only.
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Progress } from './progress';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey, { auth: { flowType: 'pkce', persistSession: true, detectSessionInUrl: true } }) : null;

export const googleEnabled = import.meta.env.VITE_ENABLE_GOOGLE === 'true';

export async function loadRemoteProgress(userId: string): Promise<Progress | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from('progress').select('data').eq('user_id', userId).maybeSingle();
  if (error) throw error;
  return (data?.data as Progress | undefined) ?? null;
}

export async function saveRemoteProgress(userId: string, progress: Progress): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase
    .from('progress')
    .upsert({ user_id: userId, data: progress, updated_at: new Date().toISOString() });
  if (error) throw error;
}

/** Permanently deletes the signed-in user's account and saved progress (see supabase/schema.sql). */
export async function deleteAccount(): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.rpc('delete_my_account');
  if (error) throw error;
  await supabase.auth.signOut();
}
