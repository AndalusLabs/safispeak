/* SafiSpeak redesign — root: state, swipeable tabs, lesson-flow overlays.
   Flow: path → introSheet → cards → quiz → celebrate → path
   (X exits to path at any point; progress commits on celebrate-close). */

import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, {
  useAnimatedStyle, useSharedValue, withTiming,
} from 'react-native-reanimated';
import { colors, motion } from './theme';
import { haptic, setSfxGates, sfx } from './sfx';
import { Lesson } from './lessons';
import { bumpDailyGoal, bumpStreak, dailyGoalDone, effectiveStreak, useAppStore } from './store';
import { checkPremium, initPurchases } from './monetization';
import { Pager } from './components/Pager';
import { TabBar } from './components/TabBar';
import { Onboarding } from './screens/Onboarding';
import { HomeScreen } from './screens/Home';
import { PracticeScreen } from './screens/Practice';
import { ProfileScreen } from './screens/Profile';
import { CardsScreen, LessonIntroSheet } from './screens/Lesson';
import { QuizScreen } from './screens/Quiz';
import { CelebrateScreen } from './screens/Celebrate';
import { SettingsScreen } from './screens/Settings';
import { PaywallScreen } from './screens/Paywall';

/* Ayoub's monetization model: lesson 1 free → hard paywall before lesson 2. */
const FREE_LESSONS = 1;

type Overlay =
  | { t: 'intro'; lesson: Lesson; redo: boolean }
  | { t: 'cards'; lesson: Lesson }
  | { t: 'quiz'; lesson: Lesson }
  | { t: 'celebrate'; lesson: Lesson; result: { correct: number; total: number } }
  | { t: 'settings' }
  | { t: 'paywall'; lesson: Lesson };

export default function App() {
  const { width } = useWindowDimensions();
  const { state: s, setState: setS, ready, resetAll } = useAppStore();
  const [tab, setTabRaw] = React.useState(0);
  const [overlay, setOverlay] = React.useState<Overlay | null>(null);
  const [closing, setClosing] = React.useState(false);

  /* restore persisted tab once the store has loaded */
  React.useEffect(() => {
    if (ready) setTabRaw(s.nav.tab || 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  /* sound + haptic gates */
  React.useEffect(() => {
    setSfxGates(s.settings);
  }, [s.settings]);

  /* RevenueCat: init once, and re-sync an existing subscription (reinstalls) */
  React.useEffect(() => {
    if (!ready) return;
    initPurchases()
      .then(() => checkPremium())
      .then((owned) => {
        if (owned) setS((p) => (p.premium ? p : { ...p, premium: true }));
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  const setTab = (n: number) => {
    setTabRaw(n);
    setS((p) => ({ ...p, nav: { tab: n } }));
  };

  const accuracy = s.answers ? Math.round((s.correctAnswers / s.answers) * 100) : 100;

  const openOverlay = (o: Overlay) => { setClosing(false); setOverlay(o); };
  const closeOverlay = () => {
    setClosing(true);
    setTimeout(() => { setOverlay(null); setClosing(false); }, 300);
  };

  const onNode = (lesson: Lesson, locked: boolean) => {
    if (locked) return; // shake + sound handled by the node itself
    if (!s.premium && lesson.id >= FREE_LESSONS) {
      openOverlay({ t: 'paywall', lesson });
      return;
    }
    openOverlay({ t: 'intro', lesson, redo: s.completed.includes(lesson.id) });
  };

  const finishQuiz = (lesson: Lesson, result: { correct: number; total: number }) => {
    setS((p) => ({
      ...p,
      answers: p.answers + result.total,
      correctAnswers: p.correctAnswers + result.correct,
    }));
    openOverlay({ t: 'celebrate', lesson, result });
  };

  const closeCelebrate = (lesson: Lesson, xpGain: number) => {
    setS((p) => ({
      ...p,
      ...bumpStreak(p),
      ...bumpDailyGoal(p),
      xp: p.xp + xpGain,
      completed: p.completed.includes(lesson.id) ? p.completed : [...p.completed, lesson.id],
    }));
    closeOverlay();
  };

  if (!ready) {
    return <View style={styles.root} />;
  }

  if (!s.onboarded) {
    return (
      <View style={styles.root}>
        <StatusBar style="dark" />
        <Onboarding onDone={(name, goal, profile) => {
          sfx('win');
          haptic('success');
          setS((p) => ({
            ...p, onboarded: true, name, goal, profile,
            settings: { ...p.settings, reminder: profile.reminderChosen },
          }));
        }} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar style={overlay?.t === 'paywall' ? 'light' : 'dark'} />
      <Pager index={tab} count={3} onIndex={setTab} width={width}>
        <HomeScreen name={s.name} xp={s.xp} streak={effectiveStreak(s)} completed={s.completed}
          onNode={onNode} dailyDone={dailyGoalDone(s)} onGoPractice={() => setTab(1)} />
        <PracticeScreen completed={s.completed}
          onXp={(n) => setS((p) => ({ ...p, ...bumpStreak(p), xp: p.xp + n }))} />
        <ProfileScreen name={s.name} xp={s.xp} streak={effectiveStreak(s)} completed={s.completed}
          accuracy={accuracy} onSettings={() => openOverlay({ t: 'settings' })} />
      </Pager>
      <TabBar tab={tab} onTab={setTab} />

      {overlay && (
        <OverlayHost closing={closing} animated={overlay.t !== 'intro' && overlay.t !== 'settings'}>
          {overlay.t === 'intro' && (
            <LessonIntroSheet lesson={overlay.lesson} completed={overlay.redo}
              onClose={() => { setOverlay(null); setClosing(false); }}
              onStart={() => openOverlay({ t: 'cards', lesson: overlay.lesson })} />
          )}
          {overlay.t === 'cards' && (
            <CardsScreen lesson={overlay.lesson} onExit={closeOverlay}
              onFinish={() => openOverlay({ t: 'quiz', lesson: overlay.lesson })} />
          )}
          {overlay.t === 'quiz' && (
            <QuizScreen lesson={overlay.lesson} onExit={closeOverlay}
              onFinish={(result) => finishQuiz(overlay.lesson, result)} />
          )}
          {overlay.t === 'celebrate' && (
            <CelebrateScreen lesson={overlay.lesson} result={overlay.result}
              onClose={(xpGain) => closeCelebrate(overlay.lesson, xpGain)} />
          )}
          {overlay.t === 'paywall' && (
            <PaywallScreen
              onClose={() => { setOverlay(null); setClosing(false); }}
              onUnlocked={() => {
                const target = overlay.lesson;
                setS((p) => ({ ...p, premium: true }));
                openOverlay({ t: 'intro', lesson: target, redo: s.completed.includes(target.id) });
              }} />
          )}
          {overlay.t === 'settings' && (
            <SettingsScreen settings={s.settings} width={width}
              onChange={(settings) => setS((p) => ({ ...p, settings }))}
              onBack={() => { setOverlay(null); setClosing(false); }}
              onReplayIntro={() => {
                setOverlay(null);
                setS((p) => ({ ...p, onboarded: false }));
              }}
              onReset={resetAll} />
          )}
        </OverlayHost>
      )}
    </View>
  );
}

/* full-screen overlay container: pops in (translateY 58 → 0 with overshoot),
   sinks out on close. Sheets/slide-overs animate themselves instead. */
function OverlayHost({ closing, animated, children }: {
  closing: boolean; animated: boolean; children: React.ReactNode;
}) {
  const ty = useSharedValue(animated ? 58 : 0);
  const op = useSharedValue(animated ? 0 : 1);

  React.useEffect(() => {
    if (closing && animated) {
      ty.value = withTiming(90, { duration: 300 });
      op.value = withTiming(0, { duration: 300 });
    } else if (animated) {
      ty.value = withTiming(0, { duration: 400, easing: motion.bounce });
      op.value = withTiming(1, { duration: 400 });
    }
  }, [closing, animated, ty, op]);

  const style = useAnimatedStyle(() => ({
    opacity: op.value,
    transform: [{ translateY: ty.value }],
  }));

  return (
    <Animated.View style={[StyleSheet.absoluteFillObject, { zIndex: 60 }, style]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.appBg,
  },
});
