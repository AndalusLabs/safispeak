/* SafiSpeak redesign — swipeable onboarding flow (4 slides). */

import React from 'react';
import {
  KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  Easing, useAnimatedStyle, useReducedMotion, useSharedValue,
  withRepeat, withSequence, withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, font } from '../theme';
import { haptic, sfx } from '../sfx';
import { Goal } from '../store';
import Icon, { IconName } from '../components/Icon';
import Safi from '../components/Safi';
import { Pager } from '../components/Pager';
import { RadialGlowBackground } from '../components/Gradients';
import { AppButton, Dots, SwipeHint } from '../components/ui';

const GOALS: { id: Goal; t: string; icon: IconName }[] = [
  { id: 'travel', t: 'Travel to Morocco', icon: 'arrowR' },
  { id: 'family', t: 'Talk with family', icon: 'user' },
  { id: 'culture', t: 'Love the culture', icon: 'star' },
  { id: 'fun', t: 'Just for fun', icon: 'play' },
];

export function Onboarding({ onDone }: { onDone: (name: string, goal: Goal) => void }) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [i, setI] = React.useState(0);
  const [name, setName] = React.useState('');
  const [goal, setGoal] = React.useState<Goal | null>(null);
  const N = 4;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <RadialGlowBackground inner="#FFF7E3" cy="18%" />
      <Pager index={i} count={N} onIndex={setI} width={width}>
        {/* 1 — meet Safi */}
        <View style={styles.slide}>
          <Safi expression="wink" animation="wave" glow size={185} />
          <Text style={styles.brand}>SafiSpeak</Text>
          <Text style={styles.tag}>Say it the Darija way!</Text>
          <Text style={styles.body}>
            I’m <Text style={styles.bodyBold}>Safi</Text> — your friend in learning Moroccan Arabic.
            No grammar drills, just real words you’ll actually use.
          </Text>
        </View>

        {/* 2 — learn by swiping */}
        <View style={styles.slide}>
          <MiniDeck />
          <Text style={styles.title}>Learn with a flick</Text>
          <Text style={styles.body}>
            Everything is a swipe — flip cards, grade yourself, glide between lessons.
            Your thumb does the studying.
          </Text>
        </View>

        {/* 3 — streak */}
        <View style={styles.slide}>
          <View style={styles.flameRingOuter}>
            <View style={styles.flameRingMid}>
              <View style={styles.flameRing}>
                <Icon name="flame" size={64} color={colors.flame} />
              </View>
            </View>
          </View>
          <Text style={styles.title}>Keep your flame lit</Text>
          <Text style={styles.body}>
            A few minutes a day grows your streak. Safi remembers — and celebrates —
            every day you show up.
          </Text>
        </View>

        {/* 4 — name + goal */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={[styles.slide, styles.slideForm]}
        >
          <Safi expression="happy" animation="bob" size={96} />
          <Text style={styles.title}>Yallah, let’s start!</Text>
          <TextInput
            style={styles.input}
            placeholder="What should Safi call you?"
            placeholderTextColor={colors.sand400}
            value={name}
            maxLength={14}
            onChangeText={setName}
          />
          <View style={styles.goals}>
            {GOALS.map((g) => {
              const on = goal === g.id;
              return (
                <Pressable
                  key={g.id}
                  style={[styles.goal, on && styles.goalOn]}
                  onPress={() => { sfx('tap'); haptic('light'); setGoal(g.id); }}
                >
                  <Icon name={g.icon} size={18} color={on ? colors.brand : colors.ink700} />
                  <Text style={[styles.goalText, on && { color: colors.brand }]}>{g.t}</Text>
                </Pressable>
              );
            })}
          </View>
          <AppButton
            style={{ alignSelf: 'stretch' }}
            onPress={() => onDone(name.trim() || 'friend', goal || 'fun')}
          >
            Start learning
          </AppButton>
        </KeyboardAvoidingView>
      </Pager>

      <View style={[styles.footer, { bottom: 28 + insets.bottom }]} pointerEvents="none">
        <Dots n={N} i={i} />
        {i < N - 1 ? <SwipeHint dir="right" label="Swipe" /> : <View style={{ height: 26 }} />}
      </View>
    </View>
  );
}

/* mini flashcard stack: tinted cards rotated ±7-8° behind a swaying white card */
function MiniDeck() {
  const reduceMotion = useReducedMotion();
  const sway = useSharedValue(-2.5);
  const fling = useSharedValue(0);
  React.useEffect(() => {
    if (reduceMotion) return;
    sway.value = withRepeat(
      withSequence(
        withTiming(2.5, { duration: 1350, easing: Easing.inOut(Easing.ease) }),
        withTiming(-2.5, { duration: 1350, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
    );
    fling.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 750, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 750, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
    );
  }, [reduceMotion, sway, fling]);
  const frontStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${sway.value}deg` }],
  }));
  const flingStyle = useAnimatedStyle(() => ({
    opacity: 0.4 + fling.value * 0.6,
    transform: [{ translateX: fling.value * 12 }],
  }));
  return (
    <View style={styles.miniDeck}>
      <View style={[styles.miniCard, styles.miniCardB3]} />
      <View style={[styles.miniCard, styles.miniCardB2]} />
      <Animated.View style={[styles.miniCard, frontStyle]}>
        <Text style={styles.miniWord}>Salam</Text>
        <Text style={styles.miniPh}>sa-LAAM · Hello</Text>
      </Animated.View>
      <Animated.View style={[styles.fling, flingStyle]}>
        <Icon name="arrowR" size={22} color={colors.brand} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.appBg,
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 30,
    paddingBottom: 100,
  },
  slideForm: {
    gap: 12,
    paddingBottom: 90,
  },
  brand: {
    fontFamily: font.extra,
    fontSize: 46,
    lineHeight: 54,
    color: colors.brand,
    letterSpacing: -1,
    marginTop: 10,
  },
  tag: {
    fontFamily: font.bold,
    fontSize: 18,
    color: colors.goldText,
  },
  title: {
    fontFamily: font.extra,
    fontSize: 29,
    lineHeight: 35,
    color: colors.ink900,
    marginTop: 14,
  },
  body: {
    fontFamily: font.medium,
    fontSize: 16,
    lineHeight: 24.8,
    color: colors.ink600,
    textAlign: 'center',
    maxWidth: 300,
    marginTop: 6,
  },
  bodyBold: {
    fontFamily: font.bold,
  },
  miniDeck: {
    width: 210,
    height: 230,
  },
  miniCard: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.card,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.hairline,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    shadowColor: '#1F2A37',
    shadowOpacity: 0.1,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 14 },
    elevation: 6,
  },
  miniCardB2: {
    transform: [{ rotate: '7deg' }, { translateY: 8 }],
    backgroundColor: colors.goldTint,
  },
  miniCardB3: {
    transform: [{ rotate: '-8deg' }, { translateY: 15 }],
    backgroundColor: colors.greenTint,
  },
  miniWord: {
    fontFamily: font.extra,
    fontSize: 32,
    color: colors.ink900,
  },
  miniPh: {
    fontFamily: font.semibold,
    fontSize: 13,
    color: colors.sand600,
  },
  fling: {
    position: 'absolute',
    right: -34,
    top: '44%',
  },
  flameRingOuter: {
    width: 200,
    height: 200,
    borderRadius: 999,
    backgroundColor: '#FFF8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  flameRingMid: {
    width: 168,
    height: 168,
    borderRadius: 999,
    backgroundColor: '#FFF1E6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flameRing: {
    width: 136,
    height: 136,
    borderRadius: 999,
    backgroundColor: colors.flameTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    alignSelf: 'stretch',
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
  goals: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    alignSelf: 'stretch',
  },
  goal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.optionBorder,
    backgroundColor: colors.card,
    width: '47%',
    flexGrow: 1,
  },
  goalOn: {
    borderColor: colors.brand,
    backgroundColor: '#F0FAF5', // brand 7% on white
  },
  goalText: {
    fontFamily: font.bold,
    fontSize: 13.5,
    color: colors.ink700,
    flexShrink: 1,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: 10,
  },
});
