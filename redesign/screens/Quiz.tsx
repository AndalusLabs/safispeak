/* SafiSpeak redesign — mixed exercise session (Duolingo-style):
   multiple choice + listen-and-pick + match-the-pairs, with Safi reactions,
   swipe-up feedback sheets, and wrong answers re-queued until correct. */

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS, useAnimatedStyle, useSharedValue,
  withDelay, withSequence, withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, font, motion } from '../theme';
import { haptic, sfx } from '../sfx';
import {
  ChoiceExercise, Exercise, Lesson, ListenExercise, MatchExercise, Word, makeSession,
} from '../lessons';
import { playWord } from '../wordAudio';
import Icon from '../components/Icon';
import Safi from '../components/Safi';
import { CounterChip, ProgressBar, SwipeHint } from '../components/ui';
import { LessonTop } from './Lesson';

type SessionItem = Exercise & { key: string; retry?: boolean };

export function QuizScreen({ lesson, onExit, onFinish }: {
  lesson: Lesson;
  onExit: () => void;
  onFinish: (result: { correct: number; total: number }) => void;
}) {
  const [items, setItems] = React.useState<SessionItem[]>(
    () => makeSession(lesson).map((e, i) => ({ ...e, key: `${i}` })),
  );
  const [idx, setIdx] = React.useState(0);
  const firstTry = React.useRef(0);
  const uniqueTotal = React.useRef(items.length);

  const advance = React.useCallback((correct: boolean) => {
    const cur = items[idx];
    if (correct && !cur.retry) firstTry.current++;
    const next = correct ? items : [...items, { ...cur, key: cur.key + '~', retry: true }];
    if (!correct) setItems(next);
    const ni = idx + 1;
    if (ni >= next.length) {
      onFinish({ correct: firstTry.current, total: uniqueTotal.current });
    } else {
      setIdx(ni);
    }
  }, [items, idx, onFinish]);

  const item = items[Math.min(idx, items.length - 1)];

  return (
    <View style={styles.screen}>
      <LessonTop onExit={onExit}>
        <View style={{ flex: 1 }}>
          <ProgressBar pct={(idx / items.length) * 100} height={10} />
        </View>
        <CounterChip gold icon="star" label={`${Math.min(idx + 1, items.length)}/${items.length}`} />
      </LessonTop>

      {item.kind === 'choice' && <ChoiceBody key={item.key} q={item} onDone={advance} />}
      {item.kind === 'listen' && <ListenBody key={item.key} ex={item} onDone={advance} />}
      {item.kind === 'match' && <MatchBody key={item.key} ex={item} onDone={advance} />}
    </View>
  );
}

/* slide-in wrapper: every new exercise enters from the right with overshoot */
function EnterBody({ children }: { children: React.ReactNode }) {
  const enter = useSharedValue(46);
  const fade = useSharedValue(0);
  React.useEffect(() => {
    enter.value = withTiming(0, { duration: 380, easing: motion.bounce });
    fade.value = withTiming(1, { duration: 380 });
  }, [enter, fade]);
  const style = useAnimatedStyle(() => ({
    opacity: fade.value,
    transform: [{ translateX: enter.value }],
  }));
  return <Animated.View style={[styles.body, style]}>{children}</Animated.View>;
}

/* ============ exercise: multiple choice ============ */
function ChoiceBody({ q, onDone }: { q: ChoiceExercise; onDone: (correct: boolean) => void }) {
  const [picked, setPicked] = React.useState<number | null>(null);
  const reveal = picked !== null;
  const wasRight = reveal && q.options[picked!] === q.answer;

  const pick = (i: number) => {
    if (reveal) return;
    const right = q.options[i] === q.answer;
    sfx(right ? 'correct' : 'wrong');
    haptic(right ? 'medium' : 'error');
    setPicked(i);
  };

  React.useEffect(() => {
    if (!reveal) return;
    const t = setTimeout(() => playWord(q.word.d), 600);
    return () => clearTimeout(t);
  }, [reveal, q]);

  return (
    <>
      <EnterBody>
        <View style={styles.promptRow}>
          <Safi expression={reveal ? (wasRight ? 'happy' : 'sad') : 'thinking'}
            animation={reveal ? (wasRight ? 'bounce' : 'shake') : 'bob'} size={86} />
          <Bubble>
            <Text style={styles.bubbleText}>
              {q.promptPre}<Text style={styles.bubbleBold}>{q.promptWord}</Text>{q.promptPost}
            </Text>
          </Bubble>
        </View>
        <OptionGrid options={q.options} answer={q.answer} picked={picked} onPick={pick} />
      </EnterBody>
      {reveal && (
        <FeedbackSheet good={!!wasRight}
          title={wasRight ? 'Mzyan! Exactly right.' : 'Almost!'}
          subPlain={wasRight ? `“${q.word.d}” — ${q.word.e}` : undefined}
          subAnswer={wasRight ? undefined : q.answer}
          onNext={() => onDone(!!wasRight)} />
      )}
    </>
  );
}

/* ============ exercise: listen & pick ============ */
function ListenBody({ ex, onDone }: { ex: ListenExercise; onDone: (correct: boolean) => void }) {
  const [picked, setPicked] = React.useState<number | null>(null);
  const reveal = picked !== null;
  const wasRight = reveal && ex.options[picked!] === ex.answer;

  React.useEffect(() => {
    const t = setTimeout(() => playWord(ex.word.d), 450);
    return () => clearTimeout(t);
  }, [ex]);

  const pick = (i: number) => {
    if (reveal) return;
    const right = ex.options[i] === ex.answer;
    sfx(right ? 'correct' : 'wrong');
    haptic(right ? 'medium' : 'error');
    setPicked(i);
  };

  return (
    <>
      <EnterBody>
        <View style={styles.promptRow}>
          <Safi expression={reveal ? (wasRight ? 'happy' : 'sad') : 'thinking'}
            animation={reveal ? (wasRight ? 'bounce' : 'shake') : 'bob'} size={86} />
          <Bubble>
            <Text style={styles.bubbleText}>What do you hear?</Text>
            <Pressable style={styles.speakerBtn} onPress={() => playWord(ex.word.d)}>
              <Icon name="volume" size={24} color="#fff" />
            </Pressable>
          </Bubble>
        </View>
        <OptionGrid options={ex.options} answer={ex.answer} picked={picked} onPick={pick} />
      </EnterBody>
      {reveal && (
        <FeedbackSheet good={!!wasRight}
          title={wasRight ? 'Mzyan! Sharp ears.' : 'Almost!'}
          subPlain={wasRight ? `“${ex.word.d}” — ${ex.word.e}` : undefined}
          subAnswer={wasRight ? undefined : ex.answer}
          onNext={() => onDone(!!wasRight)} />
      )}
    </>
  );
}

/* ============ exercise: match the pairs ============ */
function MatchBody({ ex, onDone }: { ex: MatchExercise; onDone: (correct: boolean) => void }) {
  const rights = React.useMemo(
    () => [...ex.pairs].sort(() => Math.random() - 0.5), [ex]);
  const [sel, setSel] = React.useState<string | null>(null);
  const [matched, setMatched] = React.useState<string[]>([]); // darija keys
  const [errPair, setErrPair] = React.useState<{ d: string; e: string } | null>(null);
  const mistakes = React.useRef(0);
  const doneRef = React.useRef(false);

  const tapLeft = (w: Word) => {
    if (matched.includes(w.d) || doneRef.current) return;
    sfx('tap'); haptic('light');
    playWord(w.d);
    setSel(w.d);
  };

  const tapRight = (w: Word) => {
    if (matched.includes(w.d) || !sel || doneRef.current) return;
    if (w.d === sel) {
      sfx('correct'); haptic('medium');
      const next = [...matched, w.d];
      setMatched(next);
      setSel(null);
      if (next.length === ex.pairs.length) {
        doneRef.current = true;
        setTimeout(() => onDone(mistakes.current === 0), 650);
      }
    } else {
      mistakes.current++;
      sfx('wrong'); haptic('error');
      setErrPair({ d: sel, e: w.e });
      setSel(null);
      setTimeout(() => setErrPair(null), 380);
    }
  };

  const allDone = matched.length === ex.pairs.length;

  return (
    <EnterBody>
      <View style={styles.promptRow}>
        <Safi expression={allDone ? 'celebrate' : errPair ? 'sad' : 'thinking'}
          animation={allDone ? 'bounce' : errPair ? 'shake' : 'bob'} size={86} />
        <Bubble>
          <Text style={styles.bubbleText}>Match the pairs</Text>
        </Bubble>
      </View>
      <View style={styles.matchCols}>
        <View style={styles.matchCol}>
          {ex.pairs.map((w) => (
            <MatchTile key={w.d} label={w.d}
              state={matched.includes(w.d) ? 'matched' : errPair?.d === w.d ? 'error' : sel === w.d ? 'selected' : 'none'}
              onPress={() => tapLeft(w)} />
          ))}
        </View>
        <View style={styles.matchCol}>
          {rights.map((w) => (
            <MatchTile key={w.e} label={w.e}
              state={matched.includes(w.d) ? 'matched' : errPair?.e === w.e ? 'error' : 'none'}
              onPress={() => tapRight(w)} />
          ))}
        </View>
      </View>
      <Text style={styles.matchHint}>Tap a Darija word, then its meaning</Text>
    </EnterBody>
  );
}

function MatchTile({ label, state, onPress }: {
  label: string;
  state: 'none' | 'selected' | 'matched' | 'error';
  onPress: () => void;
}) {
  const shakeX = useSharedValue(0);
  React.useEffect(() => {
    if (state === 'error') {
      shakeX.value = withSequence(
        withTiming(-5, { duration: 70 }), withTiming(5, { duration: 70 }),
        withTiming(-3, { duration: 70 }), withTiming(0, { duration: 70 }),
      );
    }
  }, [state, shakeX]);
  const anim = useAnimatedStyle(() => ({ transform: [{ translateX: shakeX.value }] }));
  return (
    <Pressable onPress={onPress} disabled={state === 'matched'}>
      <Animated.View style={[
        styles.matchTile,
        state === 'selected' && styles.matchTileSel,
        state === 'matched' && styles.matchTileDone,
        state === 'error' && styles.matchTileErr,
        anim,
      ]}>
        <Text style={[
          styles.matchTileText,
          state === 'selected' && { color: colors.brand },
          state === 'matched' && { color: colors.brandDeep },
          state === 'error' && { color: colors.redDark },
        ]}>{label}</Text>
      </Animated.View>
    </Pressable>
  );
}

/* ============ shared bits ============ */

function Bubble({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.bubble}>
      <View style={styles.bubbleTail} />
      {children}
    </View>
  );
}

function OptionGrid({ options, answer, picked, onPick }: {
  options: string[]; answer: string; picked: number | null; onPick: (i: number) => void;
}) {
  const reveal = picked !== null;
  return (
    <View style={styles.options}>
      {options.map((opt, i) => (
        <QuizOption key={i} idx={i} label={opt}
          state={!reveal ? 'none'
            : opt === answer ? 'correct'
            : i === picked ? 'wrong'
            : 'dim'}
          onPress={() => onPick(i)} />
      ))}
    </View>
  );
}

function QuizOption({ idx, label, state, onPress }: {
  idx: number; label: string; state: 'none' | 'correct' | 'wrong' | 'dim'; onPress: () => void;
}) {
  const pop = useSharedValue(0);
  const shakeX = useSharedValue(0);
  const punch = useSharedValue(1);
  React.useEffect(() => {
    pop.value = withDelay(idx * 60, withTiming(1, { duration: 340, easing: motion.bounce }));
  }, [idx, pop]);
  React.useEffect(() => {
    if (state === 'correct') {
      punch.value = withSequence(
        withTiming(1.06, { duration: 190, easing: motion.bounce }),
        withTiming(1, { duration: 190 }),
      );
    } else if (state === 'wrong') {
      shakeX.value = withSequence(
        withTiming(-6, { duration: 90 }), withTiming(6, { duration: 90 }),
        withTiming(-3, { duration: 90 }), withTiming(0, { duration: 90 }),
      );
    }
  }, [state, punch, shakeX]);

  const anim = useAnimatedStyle(() => ({
    opacity: pop.value,
    transform: [
      { scale: (0.86 + pop.value * 0.14) * punch.value },
      { translateX: shakeX.value },
    ],
  }));

  return (
    <Pressable style={styles.optionCell} onPress={onPress}>
      <Animated.View style={[
        styles.option,
        state === 'correct' && styles.optionCorrect,
        state === 'wrong' && styles.optionWrong,
        state === 'dim' && { opacity: 0.42 },
        state !== 'dim' && anim,
      ]}>
        <Text style={[
          styles.optionText,
          state === 'correct' && { color: colors.brandDeep },
          state === 'wrong' && { color: colors.redDark },
        ]}>{label}</Text>
      </Animated.View>
    </Pressable>
  );
}

function FeedbackSheet({ good, title, subPlain, subAnswer, onNext }: {
  good: boolean;
  title: string;
  subPlain?: string;
  subAnswer?: string;
  onNext: () => void;
}) {
  const insets = useSafeAreaInsets();
  const enter = useSharedValue(300);
  const dy = useSharedValue(0);
  React.useEffect(() => {
    enter.value = withTiming(0, { duration: 440, easing: motion.bounce });
  }, [enter]);

  const advance = React.useCallback(() => {
    sfx('swipe');
    onNext();
  }, [onNext]);

  const pan = Gesture.Pan()
    .onUpdate((e) => { dy.value = Math.min(0, e.translationY); })
    .onEnd((e) => {
      if (e.translationY < -55 || e.velocityY < -500) {
        runOnJS(advance)();
      } else {
        dy.value = withTiming(0, motion.spring);
      }
    });
  const tap = Gesture.Tap().onEnd(() => { runOnJS(advance)(); });
  const gesture = Gesture.Race(pan, tap);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: enter.value + dy.value }],
  }));

  const tone = good ? colors.brandDeep : colors.redDark;

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[
        styles.sheet,
        { backgroundColor: good ? colors.greenTint : colors.redTint, paddingBottom: 24 + insets.bottom },
        style,
      ]}>
        <View style={[styles.grabber, { backgroundColor: tone }]} />
        <View style={styles.sheetHead}>
          <Icon name={good ? 'check' : 'x'} size={26} color={tone} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.sheetTitle, { color: tone }]}>{title}</Text>
            <Text style={[styles.sheetSub, { color: tone }]}>
              {subPlain ?? <>The answer is <Text style={{ fontFamily: font.extra }}>“{subAnswer}”</Text></>}
            </Text>
          </View>
        </View>
        <SwipeHint dir="up" label="Swipe up to continue" color={tone} />
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.appBg,
  },
  body: {
    flex: 1,
    paddingTop: 14,
    paddingHorizontal: 18,
    gap: 22,
  },
  promptRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  bubble: {
    flex: 1,
    marginTop: 14,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#1F2A37',
    shadowOpacity: 0.07,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  bubbleTail: {
    position: 'absolute',
    left: -8,
    top: 22,
    width: 0,
    height: 0,
    borderTopWidth: 8,
    borderBottomWidth: 8,
    borderRightWidth: 9,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: colors.card,
  },
  bubbleText: {
    flex: 1,
    fontFamily: font.semibold,
    fontSize: 18,
    lineHeight: 25,
    color: colors.ink800,
  },
  bubbleBold: {
    fontFamily: font.extra,
  },
  speakerBtn: {
    width: 46,
    height: 46,
    borderRadius: 999,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.brandDeep,
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionCell: {
    width: '47%',
    flexGrow: 1,
  },
  option: {
    backgroundColor: colors.card,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: colors.optionBorder,
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  optionCorrect: {
    backgroundColor: colors.greenTint,
    borderColor: colors.brand,
  },
  optionWrong: {
    backgroundColor: colors.redTint,
    borderColor: colors.red,
  },
  optionText: {
    fontFamily: font.bold,
    fontSize: 18,
    color: colors.ink800,
    textAlign: 'center',
  },
  matchCols: {
    flexDirection: 'row',
    gap: 12,
  },
  matchCol: {
    flex: 1,
    gap: 10,
  },
  matchTile: {
    backgroundColor: colors.card,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: colors.optionBorder,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  matchTileSel: {
    borderColor: colors.brand,
    backgroundColor: '#F0FAF5',
  },
  matchTileDone: {
    borderColor: colors.brand,
    backgroundColor: colors.greenTint,
    opacity: 0.55,
  },
  matchTileErr: {
    borderColor: colors.red,
    backgroundColor: colors.redTint,
  },
  matchTileText: {
    fontFamily: font.bold,
    fontSize: 16,
    color: colors.ink800,
    textAlign: 'center',
  },
  matchHint: {
    textAlign: 'center',
    fontFamily: font.bold,
    fontSize: 12.5,
    color: colors.sand400,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 20,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingTop: 12,
    paddingHorizontal: 22,
    shadowColor: '#1F2A37',
    shadowOpacity: 0.14,
    shadowRadius: 17,
    shadowOffset: { width: 0, height: -10 },
    elevation: 12,
  },
  grabber: {
    width: 44,
    height: 5,
    borderRadius: 999,
    opacity: 0.25,
    alignSelf: 'center',
    marginBottom: 12,
  },
  sheetHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  sheetTitle: {
    fontFamily: font.extra,
    fontSize: 19,
  },
  sheetSub: {
    fontFamily: font.semibold,
    fontSize: 15,
    opacity: 0.85,
  },
});
