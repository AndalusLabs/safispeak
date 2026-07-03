/* SafiSpeak redesign — auth: anonymous-first, like the original app.
   The user starts learning instantly with a silent anonymous account;
   attaching an email (6-digit code) makes progress + purchases portable.
   Everything is guarded: with no network/config the app stays local-only. */

import { supabase } from './supabase';

export type Account = { id: string; email: string | null; anonymous: boolean };

/** Silent sign-in at startup: reuse the session or create an anonymous user. */
export async function ensureSignedIn(): Promise<Account | null> {
  if (!supabase) return null;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) return toAccount(session.user);
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error || !data.user) return null; // e.g. anonymous sign-ins disabled
    return toAccount(data.user);
  } catch {
    return null;
  }
}

export async function getAccount(): Promise<Account | null> {
  if (!supabase) return null;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user ? toAccount(session.user) : null;
  } catch {
    return null;
  }
}

export type AuthResult = { ok: true } | { ok: false; message: string };

/** Send a 6-digit login code to the email (creates the account if new). */
export async function requestEmailCode(email: string): Promise<AuthResult> {
  if (!supabase) return { ok: false, message: 'Backup is not available right now.' };
  try {
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { shouldCreateUser: true },
    });
    if (error) return { ok: false, message: error.message };
    return { ok: true };
  } catch (e: any) {
    return { ok: false, message: e?.message ?? 'Could not send the code.' };
  }
}

/** Verify the emailed code — on success the session becomes that email user. */
export async function verifyEmailCode(email: string, code: string): Promise<AuthResult> {
  if (!supabase) return { ok: false, message: 'Backup is not available right now.' };
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: code.trim(),
      type: 'email',
    });
    if (error || !data.session) return { ok: false, message: error?.message ?? 'Wrong code.' };
    return { ok: true };
  } catch (e: any) {
    return { ok: false, message: e?.message ?? 'Verification failed.' };
  }
}

/** Sign out of the email account and fall back to a fresh anonymous user. */
export async function signOutToAnonymous(): Promise<Account | null> {
  if (!supabase) return null;
  try {
    await supabase.auth.signOut();
  } catch {
    // ignore
  }
  return ensureSignedIn();
}

function toAccount(u: { id: string; email?: string | null; is_anonymous?: boolean }): Account {
  const email = u.email ?? null;
  return { id: u.id, email, anonymous: !email && (u.is_anonymous ?? true) };
}
