/* SafiSpeak redesign — onboarding with the ORIGINAL questions restored
   (Ayoub, June 11: "Onboarding khaso yerja3 kima kan, bedelo ghir design —
   the questions matter for converting users"). Original flow from
   safispeak-main/app/onboarding-flow.tsx, rendered in the new design. */

import React from 'react';
import {
  KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text,
  TextInput, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, font, radius } from '../theme';
import { haptic, sfx } from '../sfx';
import { Goal, OnboardingProfile } from '../store';
import Icon, { IconName } from '../components/Icon';
import Safi from '../components/Safi';
import { RadialGlowBackground } from '../components/Gradients';
import { AppButton } from '../components/ui';

type Step =
  | 'intro' | 'questions-intro' | 'discover-source' | 'motivation'
  | 'darija-level' | 'learning-goal' | 'motivation-goal' | 'name'
  | 'notifications' | 'encouragement' | 'first-lesson';

const ORDER: Step[] = [
  'intro', 'questions-intro', 'discover-source', 'motivation', 'darija-level',
  'learning-goal', 'motivation-goal', 'name', 'notifications', 'encouragement',
  'first-lesson',
];

/* the 4 questions drive the progress bar, like the original */
const QUESTION_STEPS: Step[] = ['discover-source', 'motivation', 'darija-level', 'learning-goal'];

const DISCOVER_OPTIONS = ['TikTok', 'Google', 'YouTube', 'App Store', 'Family & Friends'];

const MOTIVATION_OPTIONS: { id: string; text: string; icon: IconName; color: string }[] = [
  { id: 'productive', text: 'Spend my time productively', icon: 'target', color: '#D9A52E' },
  { id: 'family', text: 'Connect with family & friends', icon: 'user', color: '#E14B3B' },
  { id: 'studies', text: 'Support my studies', icon: 'book', color: '#1E9E8A' },
  { id: 'career', text: 'Boost my career', icon: 'trophy', color: '#1D6FD8' },
  { id: 'fun', text: 'Just for fun', icon: 'star', color: '#8E52C8' },
  { id: 'travel', text: 'Prepare for travel', icon: 'arrowR', color: '#E0862E' },
  { id: 'other', text: 'Other …', icon: 'pencil', color: '#2E9E5B' },
];

const LEVEL_OPTIONS = [
  { id: 1, text: 'Darija is completely new to me', level: 0 },
  { id: 2, text: 'I know a few common words', level: 1 },
  { id: 3, text: 'I can handle simple conversations', level: 2 },
  { id: 4, text: 'I can talk about different everyday topics', level: 3 },
  { id: 5, text: 'I can discuss most topics in detail', level: 4 },
];

const GOAL_OPTIONS = [
  { id: '5min', text: '5 min/day (Relaxed)', words: 25 },
  { id: '10min', text: '10 min/day (Standard)', words: 50 },
  { id: '15min', text: '15 min/day (Serious)', words: 75 },
  { id: '20min', text: '20 min/day (Intense)', words: 100 },
];

const BENEFITS: { icon: IconName; text: string }[] = [
  { icon: 'buzz', text: 'Build confidence in conversations' },
  { icon: 'book', text: 'Expand your vocabulary quickly' },
  { icon: 'target', text: 'Develop a lasting learning habit' },
];

/* first selected motivation → the store's Goal (used across the app) */
function toGoal(motivations: string[]): Goal {
  if (motivations.includes('travel')) return 'travel';
  if (motivations.includes('family')) return 'family';
  if (motivations.includes('fun')) return 'fun';
  return 'culture';
}

export function Onboarding({ onDone }: {
  onDone: (name: string, goal: Goal, profile: OnboardingProfile) => void;
}) {
  const insets = useSafeAreaInsets();
  const [step, setStep] = React.useState<Step>('intro');
  const [source, setSource] = React.useState('');
  const [motivations, setMotivations] = React.useState<string[]>([]);
  const [level, setLevel] = React.useState<number | null>(null);
  const [goalId, setGoalId] = React.useState('');
  const [name, setName] = React.useState('');
  const [reminder, setReminder] = React.useState<boolean | null>(null);

  const idx = ORDER.indexOf(step);
  const qIdx = QUESTION_STEPS.indexOf(step);
  const wordsPerWeek = GOAL_OPTIONS.find((g) => g.id === goalId)?.words ?? 50;

  const canProceed = () => {
    switch (step) {
      case 'discover-source': return source !== '';
      case 'motivation': return motivations.length > 0;
      case 'darija-level': return level !== null;
      case 'learning-goal': return goalId !== '';
      case 'notifications': return reminder !== null;
      default: return true;
    }
  };

  const finish = () => {
    onDone(name.trim() || 'friend', toGoal(motivations), {
      discoverSource: source,
      motivations,
      level: level ?? 1,
      dailyMinutes: parseInt(goalId, 10) || 10,
      reminderChosen: reminder === true,
    });
  };

  const next = () => {
    if (!canProceed()) return;
    if (step === 'first-lesson') { finish(); return; }
    setStep(ORDER[idx + 1]);
  };

  const back = () => {
    if (idx > 0) setStep(ORDER[idx - 1]);
  };

  const allowNotifications = async () => {
    setReminder(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const Notifications = require('expo-notifications');
      await Notifications.requestPermissionsAsync();
    } catch {
      // permission module unavailable (e.g. web) — the choice is still saved
    }
  };

  const buttonLabel =
    step === 'intro' ? 'NEXT'
    : step === 'questions-intro' ? "LET'S GO"
    : step === 'first-lesson' ? 'START LESSON'
    : 'CONTINUE';

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <RadialGlowBackground inner="#F4EFDF" cy="18%" />

      {/* back + progress (question steps only, like the original) */}
      {qIdx !== -1 || step === 'motivation-goal' || step === 'name' || step === 'notifications' || step === 'encouragement' ? (
        <View style={styles.header}>
          <Pressable hitSlop={10} onPress={() => { sfx('tap'); haptic('light'); back(); }} style={styles.back}>
            <Icon name="chevL" size={20} color={colors.ink700} />
          </Pressable>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, {
              width: `${Math.min(100, Math.max(8, ((qIdx === -1 ? 4 : qIdx) / QUESTION_STEPS.length) * 100))}%`,
            }]} />
          </View>
        </View>
      ) : <View style={styles.headerSpace} />}

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {step === 'intro' && (
            <View style={styles.center}>
              <Safi expression="wink" animation="wave" glow size={170} />
              <Bubble big text="Hi! I'm Safi, your friend in learning Darija." />
            </View>
          )}

          {step === 'questions-intro' && (
            <View style={styles.center}>
              <Safi expression="happy" animation="bob" size={150} />
              <Bubble big text="Let's get to know you! Just 4 quick questions before we start your first lesson" />
            </View>
          )}

          {step === 'discover-source' && (
            <View>
              <QuestionHead text="How did you discover SafiSpeak?" />
              {DISCOVER_OPTIONS.map((o) => (
                <Option key={o} text={o} on={source === o}
                  onPress={() => setSource(o)} />
              ))}
            </View>
          )}

          {step === 'motivation' && (
            <View>
              <QuestionHead text="Why do you want to learn Darija?" />
              {MOTIVATION_OPTIONS.map((o) => {
                const on = motivations.includes(o.id);
                return (
                  <Pressable key={o.id} style={[styles.option, on && styles.optionOn]}
                    onPress={() => {
                      sfx('tap'); haptic('light');
                      setMotivations(on ? motivations.filter((m) => m !== o.id) : [...motivations, o.id]);
                    }}>
                    <Icon name={o.icon} size={19} color={o.color} />
                    <Text style={[styles.optionText, on && styles.optionTextOn]}>{o.text}</Text>
                    <View style={[styles.checkbox, on && styles.checkboxOn]}>
                      {on && <Icon name="check" size={13} color="#fff" />}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}

          {step === 'darija-level' && (
            <View>
              <QuestionHead text="How good is your Darija?" />
              {LEVEL_OPTIONS.map((o) => (
                <Pressable key={o.id} style={[styles.option, level === o.id && styles.optionOn]}
                  onPress={() => { sfx('tap'); haptic('light'); setLevel(o.id); }}>
                  <Text style={[styles.optionText, level === o.id && styles.optionTextOn]}>{o.text}</Text>
                  <View style={styles.levelBars}>
                    {[0, 1, 2, 3].map((b) => (
                      <View key={b} style={[styles.levelBar, b < o.level && styles.levelBarOn]} />
                    ))}
                  </View>
                </Pressable>
              ))}
            </View>
          )}

          {step === 'learning-goal' && (
            <View>
              <QuestionHead text="What is your daily learning goal?" />
              {GOAL_OPTIONS.map((o) => (
                <Option key={o.id} text={o.text} on={goalId === o.id}
                  onPress={() => setGoalId(o.id)} />
              ))}
            </View>
          )}

          {step === 'motivation-goal' && (
            <View style={styles.center}>
              <Safi expression="happy" animation="bounce" glow size={150} />
              <Bubble big text={`Awesome, that's ${wordsPerWeek} words per week!`} />
            </View>
          )}

          {step === 'name' && (
            <View style={styles.center}>
              <Safi expression="happy" animation="bob" size={110} />
              <Bubble text="One last thing — what should I call you?" />
              <TextInput
                style={styles.input}
                placeholder="Your name"
                placeholderTextColor={colors.sand400}
                value={name}
                maxLength={14}
                onChangeText={setName}
              />
            </View>
          )}

          {step === 'notifications' && (
            <View>
              <QuestionHead text="My reminders help make learning a habit!" />
              <View style={styles.notifBox}>
                <Text style={styles.notifTitle}>SafiSpeak would like to send you notifications</Text>
                <Text style={styles.notifSub}>
                  Reminders help you stay on track with your daily learning goal.
                </Text>
                <View style={styles.notifRow}>
                  <Pressable
                    style={[styles.notifBtn, styles.notifBtnGhost, reminder === false && styles.notifBtnGhostOn]}
                    onPress={() => { sfx('tap'); haptic('light'); setReminder(false); }}>
                    <Text style={[styles.notifBtnGhostText, reminder === false && { color: colors.ink900 }]}>
                      Don't Allow
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[styles.notifBtn, styles.notifBtnSolid, reminder === true && styles.notifBtnSolidOn]}
                    onPress={() => { sfx('tap'); haptic('success'); allowNotifications(); }}>
                    <Text style={styles.notifBtnSolidText}>Allow</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          )}

          {step === 'encouragement' && (
            <View style={styles.center}>
              <Safi expression="happy" animation="bob" size={110} />
              <Bubble text="You can achieve this in 2 months!" />
              <View style={styles.benefits}>
                {BENEFITS.map((b) => (
                  <View key={b.text} style={styles.benefit}>
                    <View style={styles.benefitIcon}>
                      <Icon name={b.icon} size={19} color={colors.brand} />
                    </View>
                    <Text style={styles.benefitText}>{b.text}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {step === 'first-lesson' && (
            <View style={styles.center}>
              <Safi expression="wink" animation="bounce" glow size={150} />
              <Bubble big text="Great! Here's your first lesson. We'll start with some flashcards to get you up to speed!" />
            </View>
          )}
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom + 18 }]}>
          <View style={!canProceed() && styles.btnDisabled}>
            <AppButton style={{ alignSelf: 'stretch' }} onPress={next}>
              {buttonLabel}
            </AppButton>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

/* Safi's speech bubble (new design, replaces the original's bubble) */
function Bubble({ text, big = false }: { text: string; big?: boolean }) {
  return (
    <View style={[styles.bubble, big && styles.bubbleBig]}>
      <View style={styles.bubbleTail} />
      <Text style={[styles.bubbleText, big && styles.bubbleTextBig]}>{text}</Text>
    </View>
  );
}

/* small Safi + question bubble above the options */
function QuestionHead({ text }: { text: string }) {
  return (
    <View style={styles.qHead}>
      <Safi expression="idle" animation="bob" size={62} />
      <View style={styles.qBubble}>
        <View style={styles.qBubbleTail} />
        <Text style={styles.qBubbleText}>{text}</Text>
      </View>
    </View>
  );
}

function Option({ text, on, onPress }: { text: string; on: boolean; onPress: () => void }) {
  return (
    <Pressable style={[styles.option, on && styles.optionOn]}
      onPress={() => { sfx('tap'); haptic('light'); onPress(); }}>
      <Text style={[styles.optionText, on && styles.optionTextOn]}>{text}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.appBg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 4,
  },
  headerSpace: {
    height: 46,
  },
  back: {
    width: 36,
    height: 36,
    borderRadius: 999,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.hairline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressTrack: {
    flex: 1,
    height: 10,
    borderRadius: 999,
    backgroundColor: colors.sandFill,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: colors.brand,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 22,
    paddingVertical: 14,
  },
  center: {
    alignItems: 'center',
    gap: 6,
  },

  /* big bubble under Safi */
  bubble: {
    backgroundColor: colors.card,
    borderRadius: radius.cardLg,
    borderWidth: 1,
    borderColor: colors.hairline,
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginTop: 16,
    maxWidth: 320,
    shadowColor: '#1F2A37',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  bubbleBig: {
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  bubbleTail: {
    position: 'absolute',
    top: -8,
    alignSelf: 'center',
    left: '50%',
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: colors.card,
  },
  bubbleText: {
    fontFamily: font.bold,
    fontSize: 15.5,
    lineHeight: 22,
    color: colors.ink900,
    textAlign: 'center',
  },
  bubbleTextBig: {
    fontSize: 17.5,
    lineHeight: 25,
  },

  /* question header (small Safi + bubble) */
  qHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  qBubble: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.hairline,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  qBubbleTail: {
    position: 'absolute',
    left: -7,
    top: 20,
    width: 0,
    height: 0,
    borderTopWidth: 7,
    borderBottomWidth: 7,
    borderRightWidth: 7,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: colors.card,
  },
  qBubbleText: {
    fontFamily: font.extra,
    fontSize: 16.5,
    lineHeight: 22,
    color: colors.ink900,
  },

  /* answer options */
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.optionBorder,
    borderRadius: radius.card,
    paddingVertical: 13,
    paddingHorizontal: 15,
    marginBottom: 9,
  },
  optionOn: {
    borderColor: colors.brand,
    backgroundColor: '#EFF5EF',
  },
  optionText: {
    flex: 1,
    fontFamily: font.bold,
    fontSize: 14.5,
    color: colors.ink700,
  },
  optionTextOn: {
    color: colors.brand,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: colors.sand300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  levelBars: {
    flexDirection: 'row',
    gap: 3,
  },
  levelBar: {
    width: 7,
    height: 16,
    borderRadius: 3,
    backgroundColor: colors.sandFill,
  },
  levelBarOn: {
    backgroundColor: colors.brand,
  },

  /* name input */
  input: {
    alignSelf: 'stretch',
    marginTop: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.optionBorder,
    backgroundColor: colors.card,
    fontFamily: font.bold,
    fontSize: 16,
    color: colors.ink900,
    textAlign: 'center',
  },

  /* notifications mock sheet */
  notifBox: {
    backgroundColor: colors.card,
    borderRadius: radius.cardLg,
    borderWidth: 1,
    borderColor: colors.hairline,
    padding: 18,
    shadowColor: '#1F2A37',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  notifTitle: {
    fontFamily: font.extra,
    fontSize: 16,
    color: colors.ink900,
    textAlign: 'center',
  },
  notifSub: {
    fontFamily: font.medium,
    fontSize: 13,
    lineHeight: 19,
    color: colors.ink600,
    textAlign: 'center',
    marginTop: 6,
  },
  notifRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  notifBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 14,
  },
  notifBtnGhost: {
    borderWidth: 2,
    borderColor: colors.optionBorder,
    backgroundColor: colors.card,
  },
  notifBtnGhostOn: {
    borderColor: colors.sand600,
  },
  notifBtnGhostText: {
    fontFamily: font.bold,
    fontSize: 14.5,
    color: colors.sand600,
  },
  notifBtnSolid: {
    backgroundColor: colors.brand,
  },
  notifBtnSolidOn: {
    backgroundColor: colors.brandPress,
  },
  notifBtnSolidText: {
    fontFamily: font.extra,
    fontSize: 14.5,
    color: '#fff',
  },

  /* encouragement benefits */
  benefits: {
    alignSelf: 'stretch',
    marginTop: 16,
    gap: 9,
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.hairline,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  benefitIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: colors.greenTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitText: {
    flex: 1,
    fontFamily: font.bold,
    fontSize: 14,
    color: colors.ink900,
  },

  footer: {
    paddingHorizontal: 22,
    paddingTop: 8,
  },
  btnDisabled: {
    opacity: 0.45,
  },
});
