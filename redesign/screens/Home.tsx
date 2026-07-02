/* SafiSpeak redesign — Home (Medina dashboard, from Ayoub's reference):
   greeting → CURRENT UNIT hero (mosque art) → Choose a topic → Today's goal
   (lantern art) → Quick practice → Tip of the day → serpentine lesson path. */

import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing, useAnimatedStyle, useReducedMotion, useSharedValue,
  withRepeat, withSequence, withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path as SvgPath } from 'react-native-svg';
import { colors, font, radius } from '../theme';
import { haptic, sfx } from '../sfx';
import { LESSONS, Lesson, UNITS, currentUnit } from '../lessons';
import { DAILY_GOAL_TARGET } from '../store';
import Icon, { IconName } from '../components/Icon';
import Safi from '../components/Safi';

const W = 366;
const GAP = 122;
const OFFSETS = [0, -1, 0, 1, 0, -1, 0, 1];

const MOSQUE = require('../../assets/images/medina-mosque.png');
const LANTERN = require('../../assets/images/medina-lantern.png');

const TOPIC_META: { icon: IconName; tint: string }[] = [
  { icon: 'book', tint: colors.greenTint },
  { icon: 'cards', tint: colors.goldTint },
  { icon: 'target', tint: colors.blueTint },
];

const TIPS = [
  'Listen to Darija in real life: songs, videos, or conversations with locals.',
  'Say new words out loud — your mouth learns faster than your eyes.',
  'Two minutes every day beats one hour once a week.',
  'Use "Salam" and "Chokran" today — locals light up when you try.',
  'Replay a finished lesson to make the words stick for good.',
];

export function HomeScreen({ name, xp, streak, completed, onNode, dailyDone, onGoPractice }: {
  name: string;
  xp: number;
  streak: number;
  completed: number[];
  onNode: (lesson: Lesson, locked: boolean) => void;
  dailyDone: number;
  onGoPractice: () => void;
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
  const current = currentId === -1 ? LESSONS[LESSONS.length - 1] : LESSONS[currentId];
  const unit = currentUnit(completed);
  const unitDone = unit.lessons.filter((l) => completed.includes(l.id)).length;
  const tip = TIPS[Math.floor(Date.now() / 86_400_000) % TIPS.length];

  const openCurrent = () => onNode(current, false);

  const seg = (a: { x: number; y: number }, b: { x: number; y: number }) =>
    `M ${a.x} ${a.y} C ${a.x} ${a.y + GAP * 0.55}, ${b.x} ${b.y - GAP * 0.55}, ${b.x} ${b.y}`;

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 116 }} showsVerticalScrollIndicator={false}>
      {/* greeting */}
      <View style={[styles.topRow, { paddingTop: Math.max(60, insets.top + 12) }]}>
        <View>
          <Text style={styles.greet}>Salam, {name}!</Text>
          <Text style={styles.greetSub}>Ready for today’s words?</Text>
        </View>
        <View style={styles.chips}>
          <View style={styles.chip}>
            <Icon name="flame" size={15} color={colors.flame} />
            <Text style={styles.chipText}>{streak}</Text>
          </View>
          <View style={styles.chip}>
            <Icon name="star" size={15} color={colors.gold500} />
            <Text style={styles.chipText}>{xp}</Text>
          </View>
        </View>
      </View>

      {/* CURRENT UNIT hero */}
      <Pressable style={styles.hero} onPress={() => { sfx('tap'); haptic('light'); openCurrent(); }}>
        <Image source={MOSQUE} style={styles.heroArt} resizeMode="contain" />
        <Text style={styles.heroKick}>CURRENT UNIT</Text>
        <Text style={styles.heroTitle}>Unit {unit.id + 1}{'\n'}{unit.title}</Text>
        <View style={styles.heroBar}>
          <View style={[styles.heroBarFill, { width: `${Math.max(6, (unitDone / unit.lessons.length) * 100)}%` }]} />
        </View>
        <Text style={styles.heroCount}>{unitDone} / {unit.lessons.length} lessons completed</Text>
        <View style={styles.heroCta}>
          <Text style={styles.heroCtaText}>Continue</Text>
          <Icon name="chevR" size={15} color={colors.ink900} />
        </View>
      </Pressable>

      {/* choose a topic */}
      <View style={styles.secHead}>
        <Text style={styles.secTitle}>Choose a topic</Text>
        <Text style={styles.secCount}>{completed.length}/{LESSONS.length} lessons</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.topicsRow}>
        {UNITS.map((u) => {
          const meta = TOPIC_META[u.id % TOPIC_META.length];
          const done = u.lessons.filter((l) => completed.includes(l.id)).length;
          const first = u.lessons.find((l) => !completed.includes(l.id)) ?? u.lessons[0];
          const locked = first.id > (currentId === -1 ? LESSONS.length : currentId);
          return (
            <Pressable key={u.id} style={[styles.topic, { backgroundColor: meta.tint }]}
              onPress={() => { sfx('tap'); haptic('light'); onNode(first, locked); }}>
              {locked && (
                <View style={styles.topicLock}>
                  <Icon name="lock" size={12} color={colors.sand600} />
                </View>
              )}
              <View style={styles.topicIcon}>
                <Icon name={meta.icon} size={26} color={locked ? colors.sandLocked : colors.brand} />
              </View>
              <Text style={[styles.topicTitle, locked && { color: colors.sandLocked }]}>{u.title}</Text>
              <Text style={styles.topicSub}>{locked ? 'Locked' : `${u.lessons.length} lessons`}</Text>
              <View style={styles.topicLine}>
                <View style={[styles.topicLineFill, { width: `${(done / u.lessons.length) * 100}%` }]} />
              </View>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* today's goal */}
      <View style={styles.goal}>
        <Image source={LANTERN} style={styles.goalArt} resizeMode="contain" />
        <Text style={styles.goalTitle}>Today’s goal</Text>
        <Text style={styles.goalSub}>Complete {DAILY_GOAL_TARGET} lessons</Text>
        <View style={styles.goalSteps}>
          {Array.from({ length: DAILY_GOAL_TARGET }, (_, i) => (
            <React.Fragment key={i}>
              {i > 0 && <View style={[styles.goalLine, i < dailyDone && styles.goalLineOn]} />}
              <View style={[styles.goalStep, i < dailyDone && styles.goalStepOn]}>
                {i < dailyDone
                  ? <Icon name="check" size={14} color="#fff" />
                  : <Text style={styles.goalStepNum}>{i + 1}</Text>}
              </View>
            </React.Fragment>
          ))}
        </View>
        <Pressable style={styles.goalBtn} onPress={() => { sfx('tap'); haptic('light'); openCurrent(); }}>
          <Icon name="book" size={16} color="#fff" />
          <Text style={styles.goalBtnText}>Start lesson</Text>
        </Pressable>
      </View>

      {/* quick practice */}
      <Pressable style={styles.qp} onPress={() => { sfx('tap'); haptic('light'); onGoPractice(); }}>
        <View style={styles.qpArt}>
          <View style={styles.qpBubble}>
            <Text style={styles.qpArabic}>كيفاش</Text>
            <Text style={styles.qpLatin}>Kifach?</Text>
          </View>
          <View style={styles.qpBubbleTail} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.qpTitle}>Quick practice</Text>
          <Text style={styles.qpSub}>Review the words you’ve learned</Text>
          <View style={styles.qpBtn}>
            <Icon name="cards" size={14} color={colors.brand} />
            <Text style={styles.qpBtnText}>Practice now</Text>
          </View>
        </View>
        <Icon name="chevR" size={18} color={colors.sand400} />
      </Pressable>

      {/* tip of the day */}
      <View style={styles.tip}>
        <View style={styles.tipIcon}>
          <Icon name="volume" size={19} color={colors.goldText} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.tipTitle}>Tip of the day</Text>
          <Text style={styles.tipText}>{tip}</Text>
        </View>
      </View>

      {/* lesson path */}
      <View style={styles.pathHead}>
        <Text style={styles.secTitle}>Your lesson path</Text>
      </View>
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
          const current2 = i === currentId;
          const locked = !done && !current2;
          return (
            <View key={l.id} style={[styles.nodeWrap, { left: p.x, top: p.y }]}>
              {current2 && <StartBubble />}
              <PathNode done={done} current={current2} locked={locked}
                onPress={() => onNode(l, locked)} />
              <Text style={[styles.nodeLabel, locked && { color: colors.sandLocked }]}>{l.title}</Text>
              {current2 && (
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
      {/* 3D bottom edge */}
      <View style={[styles.nodeEdge, {
        backgroundColor: done ? colors.brandPress : locked ? colors.sand300 : colors.sand300,
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

  /* greeting */
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  greet: {
    fontFamily: font.extra,
    fontSize: 24,
    color: colors.ink900,
  },
  greetSub: {
    fontFamily: font.semibold,
    fontSize: 13.5,
    color: colors.sand600,
    marginTop: 2,
  },
  chips: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 7,
    paddingHorizontal: 11,
    borderRadius: 999,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  chipText: {
    fontFamily: font.extra,
    fontSize: 13.5,
    color: colors.ink900,
  },

  /* hero */
  hero: {
    marginHorizontal: 18,
    borderRadius: radius.cardXl,
    backgroundColor: colors.brand,
    overflow: 'hidden',
    padding: 20,
    minHeight: 258,
    shadowColor: colors.brandDeep,
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  heroArt: {
    position: 'absolute',
    right: -18,
    bottom: -4,
    width: 218,
    height: 194,
  },
  heroKick: {
    fontFamily: font.extra,
    fontSize: 11,
    letterSpacing: 2.2,
    color: '#CBDFCF',
  },
  heroTitle: {
    fontFamily: font.extra,
    fontSize: 26,
    lineHeight: 31,
    color: '#fff',
    marginTop: 8,
  },
  heroBar: {
    width: 190,
    height: 9,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.28)',
    marginTop: 46,
    overflow: 'hidden',
  },
  heroBarFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: colors.gold,
  },
  heroCount: {
    fontFamily: font.semibold,
    fontSize: 13,
    color: '#D8E6DA',
    marginTop: 10,
  },
  heroCta: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 999,
    shadowColor: '#08130D',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  heroCtaText: {
    fontFamily: font.extra,
    fontSize: 14.5,
    color: colors.ink900,
  },

  /* sections */
  secHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    marginTop: 22,
    marginBottom: 12,
  },
  secTitle: {
    fontFamily: font.extra,
    fontSize: 18,
    color: colors.ink900,
  },
  secCount: {
    fontFamily: font.bold,
    fontSize: 12.5,
    color: colors.sand600,
  },

  /* topics */
  topicsRow: {
    paddingHorizontal: 18,
    gap: 10,
  },
  topic: {
    width: 118,
    borderRadius: 20,
    padding: 13,
  },
  topicLock: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 22,
    height: 22,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  topicIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topicTitle: {
    fontFamily: font.extra,
    fontSize: 13.5,
    color: colors.ink900,
    marginTop: 9,
  },
  topicSub: {
    fontFamily: font.semibold,
    fontSize: 11.5,
    color: colors.sand600,
    marginTop: 1,
  },
  topicLine: {
    height: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.08)',
    marginTop: 10,
    overflow: 'hidden',
  },
  topicLineFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: colors.brand,
  },

  /* today's goal */
  goal: {
    marginHorizontal: 18,
    marginTop: 20,
    borderRadius: radius.cardXl,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.hairline,
    padding: 18,
    minHeight: 128,
  },
  goalArt: {
    position: 'absolute',
    right: 14,
    top: -12,
    width: 64,
    height: 132,
  },
  goalTitle: {
    fontFamily: font.extra,
    fontSize: 17.5,
    color: colors.ink900,
  },
  goalSub: {
    fontFamily: font.semibold,
    fontSize: 13,
    color: colors.sand600,
    marginTop: 2,
  },
  goalSteps: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    width: 118,
  },
  goalStep: {
    width: 30,
    height: 30,
    borderRadius: 999,
    backgroundColor: colors.card,
    borderWidth: 2.5,
    borderColor: colors.sand300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalStepOn: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  goalStepNum: {
    fontFamily: font.extra,
    fontSize: 12.5,
    color: colors.sand600,
  },
  goalLine: {
    flex: 1,
    height: 3,
    backgroundColor: colors.sand300,
  },
  goalLineOn: {
    backgroundColor: colors.brand,
  },
  goalBtn: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: colors.brand,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 999,
    shadowColor: colors.brandDeep,
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  goalBtnText: {
    fontFamily: font.extra,
    fontSize: 13.5,
    color: '#fff',
  },

  /* quick practice */
  qp: {
    marginHorizontal: 18,
    marginTop: 14,
    borderRadius: radius.cardXl,
    backgroundColor: colors.greenTint,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  qpArt: {
    width: 104,
    alignItems: 'center',
  },
  qpBubble: {
    backgroundColor: colors.brand,
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  qpBubbleTail: {
    alignSelf: 'flex-start',
    marginLeft: 18,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 9,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: colors.brand,
  },
  qpArabic: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.gold,
  },
  qpLatin: {
    fontFamily: font.extra,
    fontSize: 13.5,
    color: '#fff',
    marginTop: 1,
  },
  qpTitle: {
    fontFamily: font.extra,
    fontSize: 17,
    color: colors.ink900,
  },
  qpSub: {
    fontFamily: font.semibold,
    fontSize: 12.5,
    color: colors.sand600,
    marginTop: 2,
  },
  qpBtn: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.card,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 999,
    marginTop: 10,
  },
  qpBtnText: {
    fontFamily: font.extra,
    fontSize: 12.5,
    color: colors.brand,
  },

  /* tip */
  tip: {
    marginHorizontal: 18,
    marginTop: 14,
    borderRadius: radius.cardXl,
    backgroundColor: colors.goldTint,
    padding: 17,
    flexDirection: 'row',
    gap: 13,
    alignItems: 'flex-start',
  },
  tipIcon: {
    width: 42,
    height: 42,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipTitle: {
    fontFamily: font.extra,
    fontSize: 15.5,
    color: colors.ink900,
  },
  tipText: {
    fontFamily: font.semibold,
    fontSize: 12.5,
    lineHeight: 18,
    color: colors.goldText,
    marginTop: 3,
  },

  /* path */
  pathHead: {
    paddingHorizontal: 22,
    marginTop: 26,
    marginBottom: 2,
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
