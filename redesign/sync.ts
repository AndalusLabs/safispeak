/* SafiSpeak redesign — cloud progress backup (table progress_v2).
   The local store is ALWAYS the source of truth; the cloud row is a backup
   that makes progress survive reinstalls and device changes. Pull only
   happens into a fresh install (no local progress yet). */

import { AppState } from './store';
import { supabase } from './supabase';

/** Fire-and-forget upsert of the local state to the user's cloud row. */
export async function pushProgress(s: AppState): Promise<void> {
  if (!supabase) return;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;
    await supabase.from('progress_v2').upsert({
      user_id: session.user.id,
      completed: s.completed,
      xp: s.xp,
      streak: s.streak,
      last_active_day: s.lastActiveDay,
      daily_goal: s.dailyGoal,
      premium: s.premium,
      onboarding_profile: s.profile,
      updated_at: new Date().toISOString(),
    });
  } catch {
    // offline is fine — next push wins
  }
}

/** On a fresh install (no local progress): adopt the cloud backup if it has any. */
export async function pullIfFresh(s: AppState): Promise<Partial<AppState> | null> {
  if (!supabase) return null;
  if (s.completed.length > 0 || s.xp > 0) return null; // local progress wins
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;
    const { data } = await supabase
      .from('progress_v2')
      .select('completed,xp,streak,last_active_day,daily_goal,premium,onboarding_profile')
      .eq('user_id', session.user.id)
      .maybeSingle();
    if (!data) return null;
    const hasCloud = (data.completed?.length ?? 0) > 0 || (data.xp ?? 0) > 0 || data.premium;
    if (!hasCloud) return null;
    return {
      completed: data.completed ?? [],
      xp: data.xp ?? 0,
      streak: data.streak ?? 0,
      lastActiveDay: data.last_active_day ?? null,
      dailyGoal: data.daily_goal ?? { day: '', done: 0 },
      premium: !!data.premium,
      profile: data.onboarding_profile ?? null,
      onboarded: true, // a cloud backup implies they finished onboarding before
    };
  } catch {
    return null;
  }
}
