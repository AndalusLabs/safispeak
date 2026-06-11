/* SafiSpeak redesign — celebration: confetti, count-up XP, accuracy ring. */

import React from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, font } from '../theme';
import { haptic, sfx } from '../sfx';
import { Lesson } from '../lessons';
import Icon from '../components/Icon';
import Safi from '../components/Safi';
import { RadialGlowBackground } from '../components/Gradients';
import { AppButton, Confetti, ProgressRing, SwipeHint } from '../components/ui';

function useCountUp(target: number, dur = 1100) {
  const [val, setVal] = React.useState(0);
  React.useEffect(() => {
    const t0 = Date.now();
    const iv = setInterval(() => {
      const p = Math.min(1, (Date.now() - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(target * eased));
      if (p >= 1) clearInterval(iv);
    }, 24);
    return () => clearInterval(iv);
  }, [target, dur]);
  return val;
}

export function CelebrateScreen({ lesson, result, onClose }: {
  lesson: Lesson;
  result: { correct: number; total: number };
  onClose: (xpGain: number) => void;
}) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const xpGain = result.correct * 5 + 10;
  const xp = useCountUp(xpGain);
  const pct = Math.round((result.correct / result.total) * 100);

  React.useEffect(() => {
    sfx('win');
    haptic('success');
  }, []);

  const close = React.useCallback(() => {
    sfx('swipe');
    onClose(xpGain);
  }, [onClose, xpGain]);

  const pan = Gesture.Pan().onEnd((e) => {
    if (e.translationY < -60 || e.velocityY < -500) runOnJS(close)();
  });

  return (
    <GestureDetector gesture={pan}>
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <RadialGlowBackground inner="#FFF3D6" cy="26%" />
        <Confetti width={width} height={height} />
        <View style={styles.inner}>
          <Safi expression="celebrate" animation="bounce" glow size={170} />
          <Text style={styles.title}>Mzyan!</Text>
          <Text style={styles.sub}>{lesson.title} complete — you said it the Darija way.</Text>
          <View style={styles.stats}>
            <View style={styles.stat}>
              <View style={styles.statXp}>
                <Icon name="star" size={20} color={colors.gold500} />
                <Text style={styles.statXpText}>+{xp}</Text>
              </View>
              <Text style={styles.statLabel}>XP EARNED</Text>
            </View>
            <View style={styles.stat}>
              <ProgressRing pct={pct} size={74} stroke={8}>
                <Text style={styles.ringText}>{pct}%</Text>
              </ProgressRing>
              <Text style={styles.statLabel}>ACCURACY</Text>
            </View>
          </View>
          <AppButton style={{ alignSelf: 'stretch' }} onPress={() => onClose(xpGain)}>Continue</AppButton>
          <SwipeHint dir="up" label="or swipe up" />
        </View>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.appBg,
  },
  inner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 28,
    paddingBottom: 20,
    zIndex: 6,
  },
  title: {
    fontFamily: font.extra,
    fontSize: 42,
    lineHeight: 48,
    color: colors.ink900,
    marginTop: 4,
  },
  sub: {
    fontFamily: font.semibold,
    fontSize: 16,
    color: colors.ink600,
    textAlign: 'center',
    maxWidth: 280,
  },
  stats: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 14,
    marginBottom: 18,
  },
  stat: {
    backgroundColor: colors.card,
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 18,
    minWidth: 122,
    alignItems: 'center',
    gap: 6,
    shadowColor: '#1F2A37',
    shadowOpacity: 0.1,
    shadowRadius: 13,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  statXp: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    height: 74,
  },
  statXpText: {
    fontFamily: font.extra,
    fontSize: 27,
    color: colors.goldText,
  },
  ringText: {
    fontFamily: font.extra,
    fontSize: 17,
    color: colors.brand,
  },
  statLabel: {
    fontFamily: font.extra,
    fontSize: 11.5,
    letterSpacing: 1,
    color: colors.sand600,
  },
});
