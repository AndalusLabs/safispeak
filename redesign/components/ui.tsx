/* SafiSpeak redesign — shared UI: 3D button, chips, progress ring, toggle,
   swipe hint, pager dots, confetti. Ported from app-ui.jsx / styles. */

import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  SharedValue,
  useAnimatedProps,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { colors, font, motion } from '../theme';
import { haptic, sfx } from '../sfx';
import Icon, { IconName } from './Icon';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/* ---- Chunky 3D press button (box-shadow: 0 5px 0 press-color) ---- */
export function AppButton({
  children, icon, onPress, style, color = colors.brand, pressColor = colors.brandPress,
}: {
  children: React.ReactNode;
  icon?: IconName;
  onPress?: () => void;
  style?: ViewStyle;
  color?: string;
  pressColor?: string;
}) {
  const down = useSharedValue(0);
  const faceStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: down.value * 4 }],
  }));
  return (
    <Pressable
      onPressIn={() => { down.value = withTiming(1, { duration: 120 }); }}
      onPressOut={() => { down.value = withTiming(0, { duration: 120 }); }}
      onPress={() => { sfx('tap'); haptic('light'); onPress?.(); }}
      style={[styles.btn3dBase, { backgroundColor: pressColor }, style]}
    >
      <Animated.View style={[styles.btn3dFace, { backgroundColor: color }, faceStyle]}>
        {icon && <Icon name={icon} size={20} color="#fff" />}
        <Text style={styles.btn3dText}>{children}</Text>
      </Animated.View>
    </Pressable>
  );
}

/* ---- 38px round white button ---- */
export function RoundBtn({ icon, onPress, style }: { icon: IconName; onPress?: () => void; style?: ViewStyle }) {
  const scale = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Pressable
      onPressIn={() => { scale.value = withTiming(0.9, { duration: 120 }); }}
      onPressOut={() => { scale.value = withTiming(1, { duration: 120 }); }}
      onPress={() => { sfx('tap'); haptic('light'); onPress?.(); }}
    >
      <Animated.View style={[styles.roundBtn, anim, style]}>
        <Icon name={icon} size={20} color={colors.ink700} />
      </Animated.View>
    </Pressable>
  );
}

/* ---- counter chip (green / gold) ---- */
export function CounterChip({ icon, label, gold = false }: { icon: IconName; label: string; gold?: boolean }) {
  return (
    <View style={[styles.counterChip, gold && styles.counterChipGold]}>
      <Icon name={icon} size={14} color={gold ? colors.goldText : colors.brandDeep} />
      <Text style={[styles.counterChipText, { color: gold ? colors.goldText : colors.brandDeep }]}>{label}</Text>
    </View>
  );
}

/* ---- animated progress ring ---- */
export function ProgressRing({
  pct = 0, size = 96, stroke = 9, color = colors.brand, track = '#EDE7D8', children, animate = true,
}: {
  pct?: number; size?: number; stroke?: number; color?: string; track?: string;
  children?: React.ReactNode; animate?: boolean;
}) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const shown = useSharedValue(animate ? 0 : pct);
  React.useEffect(() => {
    shown.value = animate
      ? withTiming(pct, { duration: 1100, easing: motion.easeOut })
      : pct;
  }, [pct, animate, shown]);
  const props = useAnimatedProps(() => ({
    strokeDashoffset: circ * (1 - shown.value / 100),
  }));
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <AnimatedCircle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={`${circ}`} animatedProps={props} />
      </Svg>
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <View style={styles.ringCenter}>{children}</View>
      </View>
    </View>
  );
}

/* ---- progress bar (unit card / quiz) ---- */
export function ProgressBar({ pct, height = 8, track = '#EFE8D8' }: { pct: number; height?: number; track?: string }) {
  const w = useSharedValue(0);
  React.useEffect(() => {
    w.value = withTiming(pct, { duration: 480, easing: motion.easeOut });
  }, [pct, w]);
  const fill = useAnimatedStyle(() => ({ width: `${w.value}%` }));
  return (
    <View style={{ height, backgroundColor: track, borderRadius: 999, overflow: 'hidden' }}>
      <Animated.View style={[{ height: '100%', backgroundColor: colors.brand, borderRadius: 999 }, fill]} />
    </View>
  );
}

/* ---- toggle switch 50×30, springing knob ---- */
export function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  const x = useSharedValue(on ? 20 : 0);
  React.useEffect(() => {
    x.value = withTiming(on ? 20 : 0, motion.spring);
  }, [on, x]);
  const knob = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  return (
    <Pressable
      onPress={() => { sfx('tap'); haptic('light'); onChange(!on); }}
      style={[styles.switch, { backgroundColor: on ? colors.brand : '#E5DEC9' }]}
    >
      <Animated.View style={[styles.switchKnob, knob]} />
    </Pressable>
  );
}

/* ---- bobbing swipe hint ---- */
export function SwipeHint({ dir = 'up', label, color = colors.sand600 }: { dir?: 'up' | 'right'; label: string; color?: string }) {
  const reduceMotion = useReducedMotion();
  const ty = useSharedValue(0);
  React.useEffect(() => {
    if (reduceMotion) return;
    ty.value = withRepeat(
      withSequence(
        withTiming(-4, { duration: 700, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 700, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
    );
  }, [reduceMotion, ty]);
  const anim = useAnimatedStyle(() => ({ transform: [{ translateY: ty.value }] }));
  return (
    <Animated.View style={[dir === 'right' ? styles.hintRow : styles.hintCol, anim]}>
      <Icon name={dir === 'up' ? 'chevU' : 'chevR'} size={18} color={color} />
      <Text style={[styles.hintText, { color }]}>{label}</Text>
    </Animated.View>
  );
}

/* ---- pager dots: 8px circle, active stretches to 24px pill ---- */
export function Dots({ n, i }: { n: number; i: number }) {
  return (
    <View style={styles.dots}>
      {Array.from({ length: n }, (_, k) => <Dot key={k} on={k === i} />)}
    </View>
  );
}

function Dot({ on }: { on: boolean }) {
  const w = useSharedValue(on ? 24 : 8);
  React.useEffect(() => {
    w.value = withTiming(on ? 24 : 8, motion.spring);
  }, [on, w]);
  const anim = useAnimatedStyle(() => ({
    width: w.value,
    backgroundColor: on ? colors.brand : '#DDD4BD',
  }));
  return <Animated.View style={[styles.dot, anim]} />;
}

/* ---- confetti burst (ported from the canvas version) ---- */
/* Medina palette confetti (deep green / gold / fez red / terracotta) */
const CONFETTI_COLORS = ['#1F5C43', '#F2C14E', '#E14B3B', '#E0862E', '#FFFFFF', '#2E7A58'];
const FRAMES = 190; // ≈ duration / 16.7ms

type Particle = {
  x0: number; y0: number; vx: number; vy: number;
  w: number; h: number; rot0: number; vr: number; c: string; delay: number;
};

export function Confetti({ width, height, count = 90, duration = 3200 }: {
  width: number; height: number; count?: number; duration?: number;
}) {
  const particles = React.useMemo<Particle[]>(() =>
    Array.from({ length: count }, () => ({
      x0: width / 2 + (Math.random() - 0.5) * width * 0.35,
      y0: height * 0.35 + (Math.random() - 0.5) * height * 0.1,
      vx: (Math.random() - 0.5) * 8,
      vy: -4 - Math.random() * 7,
      w: 4 + Math.random() * 4.5,
      h: 2.5 + Math.random() * 3,
      rot0: Math.random() * 180,
      vr: (Math.random() - 0.5) * 17,
      c: CONFETTI_COLORS[(Math.random() * CONFETTI_COLORS.length) | 0],
      delay: Math.random() * 12,
    })), [count, width, height]);

  const p = useSharedValue(0);
  React.useEffect(() => {
    p.value = 0;
    p.value = withTiming(1, { duration, easing: Easing.linear });
  }, [duration, p]);

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {particles.map((pc, idx) => <ConfettiPiece key={idx} pc={pc} p={p} />)}
    </View>
  );
}

function ConfettiPiece({ pc, p }: { pc: Particle; p: SharedValue<number> }) {
  const style = useAnimatedStyle(() => {
    const t = Math.max(0, p.value * FRAMES - pc.delay);
    const x = pc.x0 + pc.vx * t;
    const y = pc.y0 + pc.vy * t + 0.105 * t * t;
    const fade = interpolate(p.value, [0, 0.85, 1], [1, 1, 0]);
    return {
      opacity: t <= 0 ? 0 : fade,
      transform: [
        { translateX: x },
        { translateY: y },
        { rotate: `${pc.rot0 + pc.vr * t}deg` },
      ],
    };
  });
  return (
    <Animated.View
      style={[{
        position: 'absolute', left: -pc.w / 2, top: -pc.h / 2,
        width: pc.w, height: pc.h, backgroundColor: pc.c,
      }, style]}
    />
  );
}

const styles = StyleSheet.create({
  btn3dBase: {
    borderRadius: 18,
  },
  btn3dFace: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    paddingHorizontal: 24,
    borderRadius: 18,
    marginBottom: 5,
  },
  btn3dText: {
    color: '#fff',
    fontFamily: font.extra,
    fontSize: 17,
    letterSpacing: 0.3,
  },
  roundBtn: {
    width: 38,
    height: 38,
    borderRadius: 999,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.hairline,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1F2A37',
    shadowOpacity: 0.07,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  counterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: colors.greenTint,
  },
  counterChipGold: {
    backgroundColor: colors.goldTint,
  },
  counterChipText: {
    fontFamily: font.extra,
    fontSize: 14,
  },
  ringCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  switch: {
    width: 50,
    height: 30,
    borderRadius: 999,
    padding: 3,
  },
  switchKnob: {
    width: 24,
    height: 24,
    borderRadius: 999,
    backgroundColor: '#fff',
    shadowColor: '#1F2A37',
    shadowOpacity: 0.25,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  hintCol: {
    alignItems: 'center',
    marginTop: 12,
    opacity: 0.6,
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    opacity: 0.6,
  },
  hintText: {
    fontFamily: font.bold,
    fontSize: 12.5,
  },
  dots: {
    flexDirection: 'row',
    gap: 7,
  },
  dot: {
    height: 8,
    borderRadius: 999,
  },
});
