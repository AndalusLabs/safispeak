/* SafiSpeak redesign — swipeable flashcard deck (Tinder-style).
   Tap flips (rotateY, overshoot); drag follows the finger (y ×0.35,
   rotation dx×0.075°); release past 105px or with velocity flies the card
   out. Left-swiped cards re-queue at the back. */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { colors, font, motion } from '../theme';
import { haptic, sfx } from '../sfx';
import { Word } from '../lessons';
import { playWord } from '../wordAudio';

export type DeckStats = { got: number; again: number };

type QueuedCard = Word & { key: string };

export const DECK_W = 292;
export const DECK_H = 372;

export type DeckControl = { grade: (dir: 1 | -1) => void };

export function FlashDeck({ cards, onDone, onStat, controlRef }: {
  cards: Word[];
  onDone: (stats: DeckStats) => void;
  onStat?: (stats: DeckStats) => void;
  controlRef?: React.MutableRefObject<DeckControl | null>;
}) {
  const [queue, setQueue] = React.useState<QueuedCard[]>(
    () => cards.map((c, i) => ({ ...c, key: `${i}-${c.d}` })),
  );
  const [flipped, setFlipped] = React.useState(false);
  const stats = React.useRef<DeckStats>({ got: 0, again: 0 });
  const flyingRef = React.useRef(false);
  const queueRef = React.useRef<QueuedCard[]>([]);
  queueRef.current = queue;

  const dx = useSharedValue(0);
  const dy = useSharedValue(0);
  const rot = useSharedValue(0);
  const fade = useSharedValue(1);

  const grade = React.useCallback((dir: 1 | -1, releaseY: number) => {
    if (flyingRef.current || queueRef.current.length === 0) return;
    flyingRef.current = true;
    sfx(dir > 0 ? 'correct' : 'swipe');
    haptic(dir > 0 ? 'medium' : 'light');
    const flyEase = Easing.bezier(0.5, 0.05, 0.8, 0.5);
    dx.value = withTiming(dir * 560, { duration: 270, easing: flyEase });
    dy.value = withTiming(releaseY * 0.4 - 40, { duration: 270, easing: flyEase });
    rot.value = withTiming(dir * 28, { duration: 270, easing: flyEase });
    fade.value = withTiming(0.85, { duration: 270 });
    setTimeout(() => {
      setQueue((q) => {
        const [top, ...rest] = q;
        if (dir > 0) stats.current.got++;
        else stats.current.again++;
        onStat?.({ ...stats.current });
        const next = dir > 0 ? rest : [...rest, { ...top, key: top.key + 'r' }];
        if (next.length === 0) setTimeout(() => onDone({ ...stats.current }), 240);
        return next;
      });
      dx.value = 0; dy.value = 0; rot.value = 0; fade.value = 1;
      flyingRef.current = false;
      setFlipped(false);
    }, 270);
  }, [dx, dy, rot, fade, onDone, onStat]);

  const flip = React.useCallback(() => {
    if (flyingRef.current) return;
    sfx('flip');
    haptic('light');
    setFlipped((f) => !f);
  }, []);

  /* let the legend buttons grade the top card (same fly-out as a swipe) */
  React.useEffect(() => {
    if (!controlRef) return;
    controlRef.current = { grade: (dir) => grade(dir, 0) };
    return () => { controlRef.current = null; };
  }, [controlRef, grade]);

  /* speak the Darija word whenever a new card reaches the top, and again on flip */
  const topWord = queue[0]?.d;
  React.useEffect(() => {
    if (topWord) playWord(topWord);
  }, [topWord]);
  React.useEffect(() => {
    if (flipped && topWord) playWord(topWord);
  }, [flipped, topWord]);

  const pan = Gesture.Pan()
    .activeOffsetX([-4, 4])
    .onUpdate((e) => {
      if (flyingRef.current) return;
      dx.value = e.translationX;
      dy.value = e.translationY;
      rot.value = e.translationX * 0.075;
    })
    .onEnd((e) => {
      if (flyingRef.current) return;
      const commit = Math.abs(e.translationX) > 105 || Math.abs(e.velocityX) > 550;
      if (commit) {
        runOnJS(grade)(e.translationX > 0 ? 1 : -1, e.translationY);
      } else {
        dx.value = withTiming(0, motion.spring);
        dy.value = withTiming(0, motion.spring);
        rot.value = withTiming(0, motion.spring);
      }
    });
  const tap = Gesture.Tap().maxDuration(10000).onEnd(() => { runOnJS(flip)(); });
  const gesture = Gesture.Race(pan, tap);

  const topStyle = useAnimatedStyle(() => ({
    opacity: fade.value,
    transform: [
      { translateX: dx.value },
      { translateY: dy.value * 0.35 },
      { rotate: `${rot.value}deg` },
    ],
  }));

  const gotStamp = useAnimatedStyle(() => ({
    opacity: Math.max(0, Math.min(1, dx.value / 85)),
  }));
  const againStamp = useAnimatedStyle(() => ({
    opacity: Math.max(0, Math.min(1, -dx.value / 85)),
  }));

  return (
    <View style={styles.deck}>
      {queue.slice(0, 3).map((c, i) => {
        const isTop = i === 0;
        return (
          <CardSlot key={c.key} depth={i} zIndex={5 - i}>
            {isTop ? (
              <GestureDetector gesture={gesture}>
                <Animated.View style={[StyleSheet.absoluteFillObject, topStyle]}>
                  <FlipCard card={c} flipped={flipped} />
                  <Animated.View style={[styles.stamp, styles.stampGot, gotStamp]}>
                    <Text style={[styles.stampText, { color: colors.brand }]}>Got it!</Text>
                  </Animated.View>
                  <Animated.View style={[styles.stamp, styles.stampAgain, againStamp]}>
                    <Text style={[styles.stampText, { color: colors.amber }]}>Again</Text>
                  </Animated.View>
                </Animated.View>
              </GestureDetector>
            ) : (
              <FlipCard card={c} flipped={false} />
            )}
          </CardSlot>
        );
      })}
    </View>
  );
}

/* lower cards sit +11px and −4.5% scale per depth, springing up the stack */
function CardSlot({ depth, zIndex, children }: {
  depth: number; zIndex: number; children: React.ReactNode;
}) {
  const d = useSharedValue(depth);
  React.useEffect(() => {
    d.value = withTiming(depth, motion.spring);
  }, [depth, d]);
  const style = useAnimatedStyle(() => ({
    transform: [
      { translateY: d.value * 11 },
      { scale: 1 - d.value * 0.045 },
    ],
  }));
  return (
    <Animated.View style={[StyleSheet.absoluteFillObject, { zIndex }, style]}>
      {children}
    </Animated.View>
  );
}

function FlipCard({ card, flipped }: { card: Word; flipped: boolean }) {
  const f = useSharedValue(flipped ? 1 : 0);
  React.useEffect(() => {
    f.value = withTiming(flipped ? 1 : 0, { duration: 520, easing: motion.bounce });
  }, [flipped, f]);
  const frontStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 900 }, { rotateY: `${f.value * 180}deg` }],
  }));
  const backStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 900 }, { rotateY: `${180 + f.value * 180}deg` }],
  }));
  return (
    <View style={styles.cardWrap}>
      <Animated.View style={[styles.face, frontStyle]}>
        <Text style={styles.eyebrow}>DARIJA</Text>
        <Text style={styles.word}>{card.d}</Text>
        <Text style={styles.ph}>{card.ph}</Text>
        <Text style={styles.tip}>Tap to flip</Text>
      </Animated.View>
      <Animated.View style={[styles.face, styles.faceBack, backStyle]}>
        <Text style={styles.eyebrow}>ENGLISH</Text>
        <Text style={styles.word}>{card.e}</Text>
        <Text style={styles.ph}>“{card.d}”</Text>
        <Text style={styles.tip}>Swipe → if you know it</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  deck: {
    width: DECK_W,
    height: DECK_H,
  },
  cardWrap: {
    flex: 1,
  },
  face: {
    ...StyleSheet.absoluteFillObject,
    backfaceVisibility: 'hidden',
    borderRadius: 26,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 24,
    shadowColor: '#1F2A37',
    shadowOpacity: 0.11,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 18 },
    elevation: 8,
  },
  faceBack: {
    backgroundColor: '#FFF8E6', // cream gradient stand-in (#FFFDF6 → #FFF3D6)
  },
  eyebrow: {
    fontFamily: font.extra,
    fontSize: 12,
    letterSpacing: 2,
    color: colors.brand,
  },
  word: {
    fontFamily: font.extra,
    fontSize: 40,
    lineHeight: 44,
    color: colors.ink900,
    textAlign: 'center',
  },
  ph: {
    fontFamily: font.semibold,
    fontSize: 16,
    color: colors.sand600,
  },
  tip: {
    position: 'absolute',
    bottom: 18,
    fontFamily: font.bold,
    fontSize: 12.5,
    color: colors.sand400,
  },
  stamp: {
    position: 'absolute',
    top: 22,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 3,
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  stampGot: {
    left: 18,
    borderColor: colors.brand,
    transform: [{ rotate: '-12deg' }],
  },
  stampAgain: {
    right: 18,
    borderColor: colors.amber,
    transform: [{ rotate: '12deg' }],
  },
  stampText: {
    fontFamily: font.extra,
    fontSize: 20,
  },
});
