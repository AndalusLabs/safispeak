/* Safi — the SafiSpeak mascot. A glowing Moroccan lantern (fanous) with a
   red fez, a friendly face, and stubby arms. Faithful port of the handoff's
   components/mascot/Safi.jsx to react-native-svg + reanimated.

   Expressions: idle | happy | celebrate | sad | wink | thinking
   Animations:  none | bob (idle float) | bounce (one-shot joy) | shake (wrong) | wave
*/

import React from 'react';
import { ViewStyle } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Ellipse, G, Line, Path, Rect } from 'react-native-svg';

const AnimatedG = Animated.createAnimatedComponent(G);

const INK = '#0E5A30';
const C = {
  fez: '#E14B3B',
  fezDk: '#B5392C',
  fezHi: '#F47567',
  body: '#1E8A4C',
  bodyDk: INK,
  bodyMid: '#23A05A',
  glass: '#FFC83D',
  glassHi: '#FFE08A',
  glassDk: '#F2A91E',
  ink: INK,
  white: '#fff',
  cheek: '#FF8B6B',
  tassel: '#2A2A2A',
  ray: '#FFD43B',
  shadow: '#E6DEC8',
};

export type SafiExpression = 'idle' | 'happy' | 'celebrate' | 'sad' | 'wink' | 'thinking';
export type SafiAnimation = 'none' | 'bob' | 'bounce' | 'shake' | 'wave';

function Eyes({ expr, blink }: { expr: SafiExpression; blink: boolean }) {
  if (expr === 'happy' || expr === 'celebrate') {
    return (
      <G fill="none" stroke={C.ink} strokeWidth={7} strokeLinecap="round">
        <Path d="M96 150 q12 -16 24 0" />
        <Path d="M150 150 q12 -16 24 0" />
      </G>
    );
  }
  if (expr === 'sad') {
    return (
      <G>
        <Circle cx={108} cy={153} r={11} fill={C.white} stroke={C.ink} strokeWidth={3.5} />
        <Circle cx={110} cy={157} r={6} fill={C.ink} />
        <Circle cx={162} cy={153} r={11} fill={C.white} stroke={C.ink} strokeWidth={3.5} />
        <Circle cx={160} cy={157} r={6} fill={C.ink} />
        <Path d="M96 140 q12 -5 22 3" fill="none" stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
        <Path d="M174 140 q-12 -5 -22 3" fill="none" stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
      </G>
    );
  }
  if (expr === 'thinking') {
    return (
      <G>
        <Circle cx={108} cy={150} r={12} fill={C.white} stroke={C.ink} strokeWidth={3.5} />
        <Circle cx={104} cy={148} r={6.5} fill={C.ink} />
        <Circle cx={162} cy={150} r={12} fill={C.white} stroke={C.ink} strokeWidth={3.5} />
        <Circle cx={158} cy={148} r={6.5} fill={C.ink} />
        <Path d="M150 136 q12 -3 22 2" fill="none" stroke={C.ink} strokeWidth={4.5} strokeLinecap="round" />
      </G>
    );
  }
  if (expr === 'wink') {
    return (
      <G>
        <Circle cx={108} cy={150} r={12} fill={C.white} stroke={C.ink} strokeWidth={3.5} />
        <Circle cx={111} cy={152} r={6.5} fill={C.ink} />
        <Circle cx={113} cy={150} r={2.2} fill={C.white} />
        <Path d="M150 152 q12 -14 24 0" fill="none" stroke={C.ink} strokeWidth={7} strokeLinecap="round" />
      </G>
    );
  }
  // idle / default — auto-blink squishes the eye group vertically around y=150
  const s = blink ? 0.08 : 1;
  return (
    <G transform={[{ translateY: 150 * (1 - s) }, { scaleY: s }]}>
      <Circle cx={108} cy={150} r={13} fill={C.white} stroke={C.ink} strokeWidth={3.5} />
      <Circle cx={111} cy={153} r={7} fill={C.ink} />
      <Circle cx={113.5} cy={150.5} r={2.4} fill={C.white} />
      <Circle cx={162} cy={150} r={13} fill={C.white} stroke={C.ink} strokeWidth={3.5} />
      <Circle cx={165} cy={153} r={7} fill={C.ink} />
      <Circle cx={167.5} cy={150.5} r={2.4} fill={C.white} />
    </G>
  );
}

function Mouth({ expr }: { expr: SafiExpression }) {
  if (expr === 'celebrate')
    return (
      <G>
        <Path d="M118 178 q17 26 34 0 q-17 10 -34 0Z" fill={C.ink} />
        <Path d="M124 182 q11 7 22 0Z" fill={C.fez} />
      </G>
    );
  if (expr === 'happy')
    return <Path d="M120 176 q15 18 30 0" fill="none" stroke={C.ink} strokeWidth={6} strokeLinecap="round" />;
  if (expr === 'sad')
    return <Path d="M122 184 q13 -12 26 0" fill="none" stroke={C.ink} strokeWidth={6} strokeLinecap="round" />;
  if (expr === 'thinking')
    return <Path d="M124 180 h20" fill="none" stroke={C.ink} strokeWidth={6} strokeLinecap="round" />;
  if (expr === 'wink')
    return <Path d="M122 176 q13 16 26 0" fill="none" stroke={C.ink} strokeWidth={6} strokeLinecap="round" />;
  return <Path d="M124 176 q11 12 22 0" fill="none" stroke={C.ink} strokeWidth={6} strokeLinecap="round" />;
}

export function Safi({
  expression = 'idle',
  animation = 'bob',
  size = 160,
  glow = false,
  style,
}: {
  expression?: SafiExpression;
  animation?: SafiAnimation;
  size?: number;
  glow?: boolean;
  style?: ViewStyle;
}) {
  const reduceMotion = useReducedMotion();
  const height = size * (338 / 270);
  const showRays = expression === 'celebrate' || expression === 'happy';

  /* whole-body animation (bob / bounce / shake / wave-bob) */
  const ty = useSharedValue(0);
  const tx = useSharedValue(0);
  const rot = useSharedValue(0);
  const sx = useSharedValue(1);
  const sy = useSharedValue(1);

  React.useEffect(() => {
    cancelAnimation(ty); cancelAnimation(tx); cancelAnimation(rot);
    cancelAnimation(sx); cancelAnimation(sy);
    ty.value = 0; tx.value = 0; rot.value = 0; sx.value = 1; sy.value = 1;
    if (reduceMotion || animation === 'none') return;

    if (animation === 'bob' || animation === 'wave') {
      ty.value = withRepeat(
        withSequence(
          withTiming(-height * 0.07, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
      );
    } else if (animation === 'bounce') {
      // 0% ty0 s1 · 30% ty-18% s(1.04,.96) · 55% ty0 s(.98,1.03) · 75% ty-6% · 100% ty0 s1 (700ms)
      ty.value = withSequence(
        withTiming(-height * 0.18, { duration: 210, easing: Easing.out(Easing.quad) }),
        withTiming(0, { duration: 175, easing: Easing.in(Easing.quad) }),
        withTiming(-height * 0.06, { duration: 140, easing: Easing.out(Easing.quad) }),
        withTiming(0, { duration: 175, easing: Easing.in(Easing.quad) }),
      );
      sx.value = withSequence(
        withTiming(1.04, { duration: 210 }),
        withTiming(0.98, { duration: 175 }),
        withTiming(1, { duration: 315 }),
      );
      sy.value = withSequence(
        withTiming(0.96, { duration: 210 }),
        withTiming(1.03, { duration: 175 }),
        withTiming(1, { duration: 315 }),
      );
    } else if (animation === 'shake') {
      // ±5% translate with ±3° rotate, 500ms
      tx.value = withSequence(
        withTiming(-size * 0.05, { duration: 100 }),
        withTiming(size * 0.05, { duration: 100 }),
        withTiming(-size * 0.04, { duration: 100 }),
        withTiming(size * 0.04, { duration: 100 }),
        withTiming(0, { duration: 100 }),
      );
      rot.value = withSequence(
        withTiming(-3, { duration: 100 }),
        withTiming(3, { duration: 100 }),
        withTiming(-2, { duration: 100 }),
        withTiming(2, { duration: 100 }),
        withTiming(0, { duration: 100 }),
      );
    }
  }, [animation, reduceMotion, expression, height, size, ty, tx, rot, sx, sy]);

  const bodyStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: tx.value },
      { translateY: ty.value },
      { rotate: `${rot.value}deg` },
      { scaleX: sx.value },
      { scaleY: sy.value },
    ],
  }));

  /* wave — right arm rotates -52° at the shoulder (620ms loop) */
  const arm = useSharedValue(0);
  React.useEffect(() => {
    cancelAnimation(arm);
    arm.value = 0;
    if (animation === 'wave' && !reduceMotion) {
      arm.value = withRepeat(
        withSequence(
          withTiming(-52, { duration: 310, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 310, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
      );
    }
  }, [animation, reduceMotion, arm]);
  const armProps = useAnimatedProps(() => ({ rotation: arm.value }));

  /* rays pulse (1.3s loop) */
  const ray = useSharedValue(1);
  React.useEffect(() => {
    cancelAnimation(ray);
    ray.value = 1;
    if (showRays && !reduceMotion) {
      ray.value = withRepeat(
        withSequence(
          withTiming(0.55, { duration: 650, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 650, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
      );
    }
  }, [showRays, reduceMotion, ray]);
  const rayProps = useAnimatedProps(() => ({ opacity: ray.value }));

  /* auto-blink every ~4.4s (idle eyes only) */
  const [blink, setBlink] = React.useState(false);
  React.useEffect(() => {
    if (reduceMotion || (expression !== 'idle')) return;
    const iv = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 130);
    }, 4400);
    return () => clearInterval(iv);
  }, [expression, reduceMotion]);

  return (
    <Animated.View style={[{ width: size, height }, bodyStyle, style]}>
      <Svg viewBox="0 0 270 338" width={size} height={height}>
        {glow && <Ellipse cx={135} cy={190} rx={120} ry={120} fill={C.glass} opacity={0.18} />}
        {showRays && (
          <AnimatedG animatedProps={rayProps} stroke={C.ray} strokeWidth={6} strokeLinecap="round">
            <Line x1={44} y1={120} x2={22} y2={112} />
            <Line x1={40} y1={150} x2={16} y2={150} />
            <Line x1={44} y1={180} x2={22} y2={190} />
            <Line x1={226} y1={120} x2={248} y2={112} />
            <Line x1={230} y1={150} x2={254} y2={150} />
            <Line x1={226} y1={180} x2={248} y2={190} />
          </AnimatedG>
        )}
        <Ellipse cx={135} cy={322} rx={78} ry={12} fill={C.shadow} />

        {/* arms */}
        <Path d="M58 196 q-26 4 -30 30" fill="none" stroke={C.bodyDk} strokeWidth={11} strokeLinecap="round" />
        <Circle cx={26} cy={230} r={9} fill={C.body} stroke={C.bodyDk} strokeWidth={4} />
        <AnimatedG animatedProps={armProps} origin="212, 196">
          <Path d="M212 196 q26 4 30 30" fill="none" stroke={C.bodyDk} strokeWidth={11} strokeLinecap="round" />
          <Circle cx={244} cy={230} r={9} fill={C.body} stroke={C.bodyDk} strokeWidth={4} />
        </AnimatedG>

        {/* fez */}
        <G transform="translate(0 8) rotate(-9 150 70)">
          <Path d="M196 36 q22 6 18 40" fill="none" stroke={C.tassel} strokeWidth={4} />
          <Circle cx={214} cy={78} r={8} fill={C.tassel} />
          <Path d="M104 64 L196 64 L184 30 Q150 18 116 30 Z" fill={C.fez} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
          <Path d="M116 30 Q150 18 184 30 Q150 40 116 30Z" fill={C.fezHi} />
          <Rect x={100} y={60} width={100} height={12} rx={6} fill={C.fezDk} stroke={C.ink} strokeWidth={5} />
        </G>

        {/* dome */}
        <Path d="M84 116 Q135 64 186 116 Z" fill={C.bodyMid} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
        <Path d="M100 110 Q135 80 170 110" fill="none" stroke={C.bodyDk} strokeWidth={4} opacity={0.6} />
        <Circle cx={135} cy={98} r={4.5} fill={C.glass} />
        <Rect x={80} y={114} width={110} height={14} rx={7} fill={C.body} stroke={C.ink} strokeWidth={5} />

        {/* glass body */}
        <Path d="M74 130 L196 130 L186 250 Q135 264 84 250 Z" fill={C.glass} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
        <Path d="M88 134 L96 246 Q90 244 86 242 Z" fill={C.glassHi} opacity={0.7} />
        <Path d="M182 134 L174 246 Q180 244 184 242 Z" fill={C.glassDk} opacity={0.5} />

        {/* cheeks */}
        <Ellipse cx={92} cy={172} rx={10} ry={7} fill={C.cheek} opacity={0.65} />
        <Ellipse cx={178} cy={172} rx={10} ry={7} fill={C.cheek} opacity={0.65} />

        {/* face */}
        <Eyes expr={expression} blink={blink} />
        <Mouth expr={expression} />

        {/* base */}
        <Rect x={92} y={250} width={86} height={18} rx={6} fill={C.body} stroke={C.ink} strokeWidth={5} />
        <Path d="M104 268 L166 268 L176 296 L94 296 Z" fill={C.glass} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
        <Rect x={86} y={294} width={98} height={14} rx={7} fill={C.body} stroke={C.ink} strokeWidth={5} />
      </Svg>
    </Animated.View>
  );
}

export default Safi;
