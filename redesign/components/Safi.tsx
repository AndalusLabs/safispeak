/* Safi — the SafiSpeak mascot. A glowing Moroccan lantern (fanous) with
   NO face and NO human features (Ayoub, June 11: "bla 3aynin awla lami7
   d l'insan"). Character comes from the warm inner flame and motion.

   Expressions map to the flame: idle | happy | celebrate (bright + rays)
   | sad (dim) | wink | thinking. Animations: none | bob | bounce | shake | wave. */

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
const AnimatedEllipse = Animated.createAnimatedComponent(Ellipse);

const C = {
  metal: '#1F5C43',
  metalDk: '#123B2C',
  metalHi: '#2E7A58',
  glass: '#F2C14E',
  glassHi: '#FFE08A',
  glassDk: '#DBA32B',
  flame: '#FFF3CF',
  flameCore: '#FFFDF4',
  ray: '#F2C14E',
  shadow: '#E6DEC8',
};

export type SafiExpression = 'idle' | 'happy' | 'celebrate' | 'sad' | 'wink' | 'thinking';
export type SafiAnimation = 'none' | 'bob' | 'bounce' | 'shake' | 'wave';

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
  const bright = expression === 'celebrate' || expression === 'happy' || expression === 'wink';
  const dim = expression === 'sad';
  const showRays = expression === 'celebrate' || expression === 'happy';

  /* whole-body animation (bob / bounce / shake / wave≈bob) */
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
      if (animation === 'wave') {
        // gentle pendulum sway instead of a waving arm
        rot.value = withRepeat(
          withSequence(
            withTiming(-4, { duration: 620, easing: Easing.inOut(Easing.ease) }),
            withTiming(4, { duration: 620, easing: Easing.inOut(Easing.ease) }),
          ),
          -1,
          true,
        );
      }
    } else if (animation === 'bounce') {
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

  /* flame flicker — the lantern's "life" (1.4s loop) */
  const flame = useSharedValue(1);
  React.useEffect(() => {
    cancelAnimation(flame);
    flame.value = 1;
    if (reduceMotion) return;
    flame.value = withRepeat(
      withSequence(
        withTiming(dim ? 0.45 : bright ? 0.92 : 0.72, { duration: 700, easing: Easing.inOut(Easing.ease) }),
        withTiming(dim ? 0.6 : 1, { duration: 700, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
    );
  }, [bright, dim, reduceMotion, flame]);
  const flameProps = useAnimatedProps(() => ({ opacity: flame.value }));

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

        {/* hanging ring + finial */}
        <Circle cx={135} cy={34} r={13} fill="none" stroke={C.metalDk} strokeWidth={7} />
        <Circle cx={135} cy={56} r={7} fill={C.glassDk} stroke={C.metalDk} strokeWidth={4} />

        {/* dome cap */}
        <Path d="M84 116 Q135 58 186 116 Z" fill={C.metalHi} stroke={C.metalDk} strokeWidth={5} strokeLinejoin="round" />
        <Path d="M100 110 Q135 78 170 110" fill="none" stroke={C.metalDk} strokeWidth={4} opacity={0.55} />
        {/* pierced dome dots (fanous filigree) */}
        <Circle cx={118} cy={98} r={3.2} fill={C.metalDk} opacity={0.8} />
        <Circle cx={135} cy={88} r={3.2} fill={C.metalDk} opacity={0.8} />
        <Circle cx={152} cy={98} r={3.2} fill={C.metalDk} opacity={0.8} />
        <Rect x={80} y={114} width={110} height={14} rx={7} fill={C.metal} stroke={C.metalDk} strokeWidth={5} />

        {/* glass body */}
        <Path d="M74 130 L196 130 L186 250 Q135 264 84 250 Z" fill={C.glass} stroke={C.metalDk} strokeWidth={5} strokeLinejoin="round" />
        {/* glass shine + shade */}
        <Path d="M88 134 L96 246 Q90 244 86 242 Z" fill={C.glassHi} opacity={0.7} />
        <Path d="M182 134 L174 246 Q180 244 184 242 Z" fill={C.glassDk} opacity={0.5} />

        {/* inner flame — Safi's life, instead of a face */}
        <AnimatedEllipse animatedProps={flameProps} cx={135} cy={186} rx={34} ry={44} fill={C.flame} />
        <Ellipse cx={135} cy={192} rx={16} ry={24} fill={C.flameCore} />
        <Path d="M135 156 q10 14 0 26 q-10 -12 0 -26Z" fill={C.glassDk} opacity={0.55} />

        {/* arched frame bars over the glass (Moroccan arch silhouette) */}
        <Path d="M108 250 L108 176 Q108 152 135 148 Q162 152 162 176 L162 250"
          fill="none" stroke={C.metal} strokeWidth={5} opacity={0.75} />
        <Line x1={135} y1={130} x2={135} y2={148} stroke={C.metal} strokeWidth={4} opacity={0.6} />

        {/* base */}
        <Rect x={92} y={250} width={86} height={18} rx={6} fill={C.metal} stroke={C.metalDk} strokeWidth={5} />
        <Path d="M104 268 L166 268 L176 296 L94 296 Z" fill={C.glass} stroke={C.metalDk} strokeWidth={5} strokeLinejoin="round" />
        <Circle cx={120} cy={282} r={3} fill={C.metalDk} opacity={0.7} />
        <Circle cx={135} cy={282} r={3} fill={C.metalDk} opacity={0.7} />
        <Circle cx={150} cy={282} r={3} fill={C.metalDk} opacity={0.7} />
        <Rect x={86} y={294} width={98} height={14} rx={7} fill={C.metal} stroke={C.metalDk} strokeWidth={5} />
      </Svg>
    </Animated.View>
  );
}

export default Safi;
