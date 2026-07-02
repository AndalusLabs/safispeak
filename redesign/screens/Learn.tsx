/* SafiSpeak redesign — Learn tab: the serpentine lesson path.
   (Moved out of Home so Home stays a clean dashboard, per Ayoub's reference.) */

import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing, useAnimatedStyle, useReducedMotion, useSharedValue,
  withRepeat, withSequence, withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path as SvgPath } from 'react-native-svg';
import { colors, font } from '../theme';
import { haptic, sfx } from '../sfx';
import { LESSONS, Lesson, UNITS, currentUnit } from '../lessons';
import Icon, { IconName } from '../components/Icon';
import Safi from '../components/Safi';
import { ProgressBar } from '../components/ui';

const W = 366;
const GAP = 122;
const OFFSETS = [0, -1, 0, 1, 0, -1, 0, 1];

export function LearnScreen({ completed, onNode }: {
  completed: number[];
  onNode: (lesson: Lesson, locked: boolean) => void;
}) {
  const insets = useSafeAreaInsets();

  /* layout: each unit gets a header row, then its lessons as serpentine nodes */
  const { headers, nodes, H } = React.useMemo(() => {
    const hs: { unitId: number; title: string; y: number }[] = [];
    const ns: { lesson: Lesson; unitId: number; x: number; y: number }[] = [];
    let y = 64;
    let n = 0;
    for (const u of UNITS) {
      hs.push({ unitId: u.id, title: u.title, y });
      y += 96;
      for (const l of u.lessons) {
        ns.push({ lesson: l, unitId: u.id, x: W / 2 + OFFSETS[n % OFFSETS.length] * 96, y });
        y += GAP;
        n++;
      }
      y += 6;
    }
    return { headers: hs, nodes: ns, H: y + 40 };
  }, []);

  const currentId = LESSONS.findIndex((l) => !completed.includes(l.id));
  const unit = currentUnit(completed);
  const unitDone = unit.lessons.filter((l) => completed.includes(l.id)).length;

  const seg = (a: { x: number; y: number }, b: { x: number; y: number }) =>
    `M ${a.x} ${a.y} C ${a.x} ${a.y + GAP * 0.55}, ${b.x} ${b.y - GAP * 0.55}, ${b.x} ${b.y}`;

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 116 }} showsVerticalScrollIndicator={false}>
      {/* compact unit header */}
      <View style={[styles.unitCard, { marginTop: Math.max(60, insets.top + 12) }]}>
        <View style={styles.unitIcon}>
          <Icon name="book" size={22} color={colors.brandDeep} />
        </View>
        <View style={styles.unitMid}>
          <Text style={styles.unitTitle}>Unit {unit.id + 1} · {unit.title}</Text>
          <ProgressBar pct={(unitDone / unit.lessons.length) * 100} />
        </View>
        <Text style={styles.unitCount}>{unitDone}/{unit.lessons.length}</Text>
      </View>

      {/* serpentine path with unit headers */}
      <View style={[styles.path, { height: H }]}>
        <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={StyleSheet.absoluteFillObject}>
          {nodes.slice(0, -1).map((p, i) => {
            const next = nodes[i + 1];
            if (p.unitId !== next.unitId) return null;
            const solid = completed.includes(p.lesson.id) && completed.includes(next.lesson.id);
            return (
              <SvgPath key={i} d={seg(p, next)} fill="none"
                stroke={solid ? colors.brand : colors.pathDotted}
                strokeWidth={5} strokeLinecap="round"
                strokeDasharray={solid ? undefined : '0.1 14'} />
            );
          })}
        </Svg>
        {headers.map((h) => (
          <View key={`u${h.unitId}`} style={[styles.unitHeader, { top: h.y }]}>
            <View style={styles.unitHeaderLine} />
            <View style={styles.unitHeaderCard}>
              <Text style={styles.unitHeaderEyebrow}>UNIT {h.unitId + 1}</Text>
              <Text style={styles.unitHeaderTitle}>{h.title}</Text>
            </View>
            <View style={styles.unitHeaderLine} />
          </View>
        ))}
        {nodes.map((p, i) => {
          const l = p.lesson;
          const done = completed.includes(l.id);
          const current = i === currentId;
          const locked = !done && !current;
          return (
            <View key={l.id} style={[styles.nodeWrap, { left: p.x, top: p.y }]}>
              {current && <StartBubble />}
              <PathNode done={done} current={current} locked={locked}
                onPress={() => onNode(l, locked)} />
              <Text style={[styles.nodeLabel, locked && { color: colors.sandLocked }]}>{l.title}</Text>
              {current && (
                <View style={[styles.pathSafi, p.x < W / 2 ? styles.safiRight : styles.safiLeft]}>
                  <Safi expression="idle" animation="bob" size={72}
                    style={p.x >= W / 2 ? { transform: [{ scaleX: -1 }] } : undefined} />
                </View>
              )}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

function PathNode({ done, current, locked, onPress }: {
  done: boolean; current: boolean; locked: boolean; onPress: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const scale = useSharedValue(1);
  const shakeX = useSharedValue(0);
  const pulse = useSharedValue(0);

  React.useEffect(() => {
    if (current && !reduceMotion) {
      pulse.value = withRepeat(withTiming(1, { duration: 1800, easing: Easing.out(Easing.ease) }), -1);
    } else {
      pulse.value = 0;
    }
  }, [current, reduceMotion, pulse]);

  const press = () => {
    if (locked) {
      sfx('wrong');
      haptic('error');
      shakeX.value = withSequence(
        withTiming(-6, { duration: 60 }), withTiming(6, { duration: 60 }),
        withTiming(-4, { duration: 60 }), withTiming(4, { duration: 60 }),
        withTiming(0, { duration: 60 }),
      );
      return;
    }
    sfx('tap');
    haptic('light');
    onPress();
  };

  const nodeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateX: shakeX.value }],
  }));
  const ringStyle = useAnimatedStyle(() => ({
    opacity: 0.34 * (1 - pulse.value),
    transform: [{ scale: 1 + pulse.value * 0.45 }],
  }));

  const icon: IconName = done ? 'check' : locked ? 'lock' : 'play';
  const iconColor = done ? '#fff' : locked ? colors.sandLocked : colors.brand;

  return (
    <View style={styles.nodeStack}>
      {current && <Animated.View style={[styles.pulseRing, ringStyle]} />}
      <View style={[styles.nodeEdge, {
        backgroundColor: done ? colors.brandPress : colors.sand300,
      }]} />
      <Pressable
        onPressIn={() => { scale.value = withTiming(0.92, { duration: 140 }); }}
        onPressOut={() => { scale.value = withTiming(1, { duration: 140 }); }}
        onPress={press}
      >
        <Animated.View style={[
          styles.node,
          done && { backgroundColor: colors.brand },
          current && styles.nodeCurrent,
          locked && { backgroundColor: colors.sandFill },
          nodeStyle,
        ]}>
          <Icon name={icon} size={done || current ? 26 : 22} color={iconColor} />
        </Animated.View>
      </Pressable>
    </View>
  );
}

function StartBubble() {
  const reduceMotion = useReducedMotion();
  const ty = useSharedValue(0);
  React.useEffect(() => {
    if (reduceMotion) return;
    ty.value = withRepeat(
      withSequence(
        withTiming(-5, { duration: 700, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 700, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
    );
  }, [reduceMotion, ty]);
  const anim = useAnimatedStyle(() => ({ transform: [{ translateY: ty.value }] }));
  return (
    <Animated.View style={[styles.startBubble, anim]} pointerEvents="none">
      <Text style={styles.startBubbleText}>START</Text>
      <View style={styles.startBubbleTail} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.appBg,
  },
  unitCard: {
    marginHorizontal: 18,
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.hairline,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#1F2A37',
    shadowOpacity: 0.09,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  unitIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.greenTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unitMid: {
    flex: 1,
  },
  unitTitle: {
    fontFamily: font.extra,
    fontSize: 15.5,
    color: colors.ink900,
    marginBottom: 6,
  },
  unitCount: {
    fontFamily: font.extra,
    fontSize: 14,
    color: colors.sand600,
  },
  path: {
    width: W,
    alignSelf: 'center',
    marginTop: 6,
  },
  unitHeader: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 10,
    transform: [{ translateY: -28 }],
  },
  unitHeaderLine: {
    flex: 1,
    height: 2,
    borderRadius: 999,
    backgroundColor: '#E8E0CB',
  },
  unitHeaderCard: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 18,
    shadowColor: '#1F2A37',
    shadowOpacity: 0.07,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  unitHeaderEyebrow: {
    fontFamily: font.extra,
    fontSize: 11.5,
    letterSpacing: 1.6,
    color: colors.brand,
  },
  unitHeaderTitle: {
    fontFamily: font.extra,
    fontSize: 17,
    color: colors.ink900,
  },
  nodeWrap: {
    position: 'absolute',
    alignItems: 'center',
    transform: [{ translateX: -33 }, { translateY: -33 }],
    width: 66,
  },
  nodeStack: {
    width: 66,
    height: 71,
  },
  nodeEdge: {
    position: 'absolute',
    top: 5,
    width: 66,
    height: 66,
    borderRadius: 999,
  },
  node: {
    width: 66,
    height: 66,
    borderRadius: 999,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeCurrent: {
    borderWidth: 3.5,
    borderColor: colors.brand,
  },
  pulseRing: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 66,
    height: 66,
    borderRadius: 999,
    borderWidth: 4,
    borderColor: colors.brand,
  },
  nodeLabel: {
    marginTop: 9,
    fontFamily: font.bold,
    fontSize: 14,
    color: colors.ink600,
    width: 140,
    textAlign: 'center',
  },
  startBubble: {
    position: 'absolute',
    top: -36,
    zIndex: 3,
    backgroundColor: colors.card,
    paddingVertical: 6,
    paddingHorizontal: 13,
    borderRadius: 999,
    shadowColor: '#1F2A37',
    shadowOpacity: 0.16,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  startBubbleText: {
    fontFamily: font.extra,
    fontSize: 12,
    letterSpacing: 1.5,
    color: colors.brand,
  },
  startBubbleTail: {
    position: 'absolute',
    bottom: -5,
    alignSelf: 'center',
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: colors.card,
  },
  pathSafi: {
    position: 'absolute',
    top: -14,
  },
  safiRight: {
    left: 78,
  },
  safiLeft: {
    right: 78,
  },
});
