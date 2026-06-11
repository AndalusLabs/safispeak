/* SafiSpeak redesign — lesson chrome: flashcards screen + intro bottom sheet. */

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  FadeIn, runOnJS, useAnimatedStyle, useSharedValue, withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, font, motion } from '../theme';
import { sfx } from '../sfx';
import { Lesson } from '../lessons';
import { playWord } from '../wordAudio';
import Icon from '../components/Icon';
import Safi from '../components/Safi';
import { FlashDeck, DeckStats, DeckControl } from '../components/FlashDeck';
import { DeckGuide, useDeckGuide } from '../components/DeckGuide';
import { AppButton, CounterChip, RoundBtn } from '../components/ui';

/* shared top bar for lesson stages */
export function LessonTop({ onExit, children }: { onExit: () => void; children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.top, { marginTop: insets.top + 8 }]}>
      <RoundBtn icon="x" onPress={onExit} />
      {children}
    </View>
  );
}

/* ============ flashcards stage ============ */
export function CardsScreen({ lesson, onExit, onFinish }: {
  lesson: Lesson; onExit: () => void; onFinish: () => void;
}) {
  const [stat, setStat] = React.useState<DeckStats>({ got: 0, again: 0 });
  const deck = React.useRef<DeckControl | null>(null);
  const guide = useDeckGuide();
  const total = lesson.words.length;
  return (
    <View style={styles.screen}>
      <LessonTop onExit={onExit}>
        <View style={styles.topMid}>
          <Text style={styles.topTitle}>{lesson.title}</Text>
          <Text style={styles.topSub}>Learn the words</Text>
        </View>
        <CounterChip icon="check" label={`${Math.min(stat.got, total)}/${total}`} />
      </LessonTop>
      <View style={styles.deckZone}>
        <FlashDeck cards={lesson.words} onStat={setStat} onDone={() => onFinish()} controlRef={deck} />
      </View>
      <View style={styles.legendRow}>
        <Pressable style={({ pressed }) => [styles.legend, pressed && styles.legendPressed]}
          onPress={() => deck.current?.grade(-1)}>
          <Icon name="chevL" size={16} color={colors.amber} />
          <Text style={[styles.legendText, { color: colors.amber }]}>Again</Text>
        </Pressable>
        <Pressable style={({ pressed }) => [styles.legend, pressed && styles.legendPressed]}
          onPress={() => deck.current?.grade(1)}>
          <Text style={[styles.legendText, { color: colors.brand }]}>Know it</Text>
          <Icon name="chevR" size={16} color={colors.brand} />
        </Pressable>
      </View>
      {guide.show && <DeckGuide onDismiss={guide.dismiss} />}
    </View>
  );
}

/* ============ lesson intro bottom sheet ============ */
export function LessonIntroSheet({ lesson, completed, onStart, onClose }: {
  lesson: Lesson; completed: boolean; onStart: () => void; onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const dy = useSharedValue(0);
  const entered = useSharedValue(400);

  React.useEffect(() => {
    entered.value = withTiming(0, { duration: 460, easing: motion.bounce });
  }, [entered]);

  const dismiss = React.useCallback(() => {
    entered.value = withTiming(440, { duration: 240 });
    setTimeout(onClose, 220);
  }, [entered, onClose]);

  const pan = Gesture.Pan()
    .onUpdate((e) => { dy.value = Math.max(0, e.translationY); })
    .onEnd((e) => {
      if (e.translationY > 80 || e.velocityY > 500) {
        runOnJS(dismiss)();
      } else {
        dy.value = withTiming(0, motion.spring);
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: entered.value + dy.value }],
  }));

  return (
    <View style={StyleSheet.absoluteFillObject}>
      <Animated.View entering={FadeIn.duration(240)} style={styles.veil}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={dismiss} />
      </Animated.View>
      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.introSheet, { paddingBottom: 38 + insets.bottom }, sheetStyle]}>
          <View style={styles.grabber} />
          <View style={styles.introHead}>
            <View style={{ flexShrink: 1 }}>
              <Text style={styles.introEyebrow}>{completed ? 'REVIEW LESSON' : 'UP NEXT'}</Text>
              <Text style={styles.introTitle}>{lesson.title}</Text>
              <Text style={styles.introSub}>{lesson.sub}</Text>
            </View>
            <Safi expression="happy" animation="bob" size={74} />
          </View>
          <View style={styles.wordChips}>
            {lesson.words.map((w) => (
              <Pressable key={w.d} style={styles.wordChip} onPress={() => playWord(w.d)}>
                <Text style={styles.wordChipD}>{w.d}</Text>
                <Text style={styles.wordChipE}>{w.e}</Text>
              </Pressable>
            ))}
          </View>
          <AppButton icon="play" onPress={() => { sfx('tap'); onStart(); }}>
            {completed ? 'Practice again' : 'Start lesson'}
          </AppButton>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.appBg,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
  },
  topMid: {
    flex: 1,
    alignItems: 'center',
  },
  topTitle: {
    fontFamily: font.extra,
    fontSize: 17,
    color: colors.ink900,
  },
  topSub: {
    fontFamily: font.semibold,
    fontSize: 12.5,
    color: colors.sand600,
  },
  deckZone: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 380,
    paddingVertical: 8,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 292,
    alignSelf: 'center',
    paddingBottom: 26,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  legendText: {
    fontFamily: font.extra,
    fontSize: 13.5,
  },
  legendPressed: {
    transform: [{ scale: 0.94 }],
    backgroundColor: '#FFFBF2',
  },
  veil: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(18,26,20,0.46)',
  },
  introSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.appBg,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  grabber: {
    width: 44,
    height: 5,
    borderRadius: 999,
    backgroundColor: colors.sand600,
    opacity: 0.25,
    alignSelf: 'center',
    marginBottom: 12,
  },
  introHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  introEyebrow: {
    fontFamily: font.extra,
    fontSize: 12,
    letterSpacing: 2,
    color: colors.brand,
  },
  introTitle: {
    fontFamily: font.extra,
    fontSize: 27,
    lineHeight: 33,
    color: colors.ink900,
  },
  introSub: {
    fontFamily: font.semibold,
    fontSize: 15,
    color: colors.sand600,
  },
  wordChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
    marginBottom: 18,
  },
  wordChip: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 13,
    gap: 1,
  },
  wordChipD: {
    fontFamily: font.extra,
    fontSize: 15,
    color: colors.ink900,
  },
  wordChipE: {
    fontFamily: font.semibold,
    fontSize: 12,
    color: colors.sand600,
  },
});
