/* SafiSpeak redesign — single persisted app store (AsyncStorage key "safiapp.v2").
   Shape matches the handoff README's State Management section. */

import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';

export type Goal = 'travel' | 'family' | 'culture' | 'fun';

/* answers from the original onboarding questions (restored per Ayoub) */
export type OnboardingProfile = {
  discoverSource: string;
  motivations: string[];
  level: number; // 1..5 self-assessed Darija level
  dailyMinutes: number; // 5 | 10 | 15 | 20
  reminderChosen: boolean;
};

export type AppSettings = {
  sound: boolean;
  haptics: boolean;
  reminder: boolean;
  remTime: string;
};

export type AppState = {
  onboarded: boolean;
  name: string;
  goal: Goal;
  xp: number;
  streak: number;
  lastActiveDay: string | null; // local 'YYYY-MM-DD' of the last completed activity
  completed: number[];
  answers: number;
  correctAnswers: number;
  settings: AppSettings;
  nav: { tab: number };
  premium: boolean; // unlocked via RevenueCat purchase (lesson 1 is free)
  dailyGoal: { day: string; done: number }; // lessons finished today
  profile: OnboardingProfile | null; // onboarding answers (conversion data)
};

export const APP_INITIAL: AppState = {
  onboarded: false, name: 'friend', goal: 'fun',
  xp: 0, streak: 0, lastActiveDay: null, completed: [],
  answers: 0, correctAnswers: 0,
  settings: { sound: true, haptics: true, reminder: false, remTime: '20:00' },
  nav: { tab: 0 },
  premium: false,
  dailyGoal: { day: '', done: 0 },
  profile: null,
};

/* lessons/day derived from the daily minutes chosen in onboarding
   (5 min → 1 lesson … 20 min → 4 lessons; default 2) */
export function dailyGoalTarget(s: AppState): number {
  const min = s.profile?.dailyMinutes ?? 10;
  return Math.max(1, Math.min(4, Math.round(min / 5)));
}

/* dailyGoal after finishing a lesson right now (resets when the day changes) */
export function bumpDailyGoal(s: AppState): Pick<AppState, 'dailyGoal'> {
  const today = todayString();
  return {
    dailyGoal: {
      day: today,
      done: s.dailyGoal.day === today ? s.dailyGoal.done + 1 : 1,
    },
  };
}

/* lessons done today (0 once the day has rolled over) */
export function dailyGoalDone(s: AppState): number {
  return s.dailyGoal.day === todayString() ? s.dailyGoal.done : 0;
}

/* ---- streak helpers ---- */

function dayString(t: number): string {
  const d = new Date(t);
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

export function todayString(): string {
  return dayString(Date.now());
}

/* streak fields after completing an activity right now */
export function bumpStreak(s: AppState): Pick<AppState, 'streak' | 'lastActiveDay'> {
  const today = todayString();
  if (s.lastActiveDay === today) {
    return { streak: Math.max(1, s.streak), lastActiveDay: today };
  }
  const yesterday = dayString(Date.now() - 86_400_000);
  return {
    streak: s.lastActiveDay === yesterday ? s.streak + 1 : 1,
    lastActiveDay: today,
  };
}

/* what the streak is worth *right now* (0 once a day has been skipped) */
export function effectiveStreak(s: AppState): number {
  if (!s.lastActiveDay) return 0;
  const today = todayString();
  const yesterday = dayString(Date.now() - 86_400_000);
  return s.lastActiveDay === today || s.lastActiveDay === yesterday ? s.streak : 0;
}

/* v3: Medina redesign + restored onboarding — fresh start so every device
   sees the new onboarding (v2 progress is intentionally not migrated). */
const KEY = 'safiapp.v3';

type Store = {
  state: AppState;
  ready: boolean;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  resetAll: () => void;
};

const StoreContext = React.createContext<Store | null>(null);

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<AppState>(APP_INITIAL);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (mounted && raw != null) {
          setState((prev) => ({ ...prev, ...JSON.parse(raw) }));
        }
      })
      .catch(() => {})
      .finally(() => { if (mounted) setReady(true); });
    return () => { mounted = false; };
  }, []);

  React.useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem(KEY, JSON.stringify(state)).catch(() => {});
  }, [state, ready]);

  const resetAll = React.useCallback(() => {
    AsyncStorage.removeItem(KEY).catch(() => {});
    setState(APP_INITIAL);
  }, []);

  const value = React.useMemo(() => ({ state, ready, setState, resetAll }), [state, ready, resetAll]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useAppStore(): Store {
  const ctx = React.useContext(StoreContext);
  if (!ctx) throw new Error('useAppStore must be used inside AppStoreProvider');
  return ctx;
}
