/* SafiSpeak redesign — Home (Ayoub's reference, one clean frame):
   greeting → CURRENT UNIT hero (mosque) → Choose a topic (lesson cards) →
   Today's goal (lantern) → Quick practice → Tip of the day. The lesson
   path lives in the Learn tab. */

import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, font, radius } from '../theme';
import { haptic, sfx } from '../sfx';
import { LESSONS, Lesson, currentUnit } from '../lessons';
import Icon from '../components/Icon';

const MOSQUE = require('../../assets/images/medina-mosque.png');
const LANTERN = require('../../assets/images/medina-lantern.png');

/* topic card tints, rotating like the reference's pastel row */
const TINTS = [colors.greenTint, '#FBEAE1', '#FCF3DA', '#EDEAF4', '#E6EEF4'];

const TIPS = [
  'Listen to Darija in real life: songs, videos, or conversations with locals.',
  'Say new words out loud — your mouth learns faster than your eyes.',
  'Two minutes every day beats one hour once a week.',
  'Use "Salam" and "Chokran" today — locals light up when you try.',
  'Replay a finished lesson to make the words stick for good.',
];

export function HomeScreen({ name, xp, streak, completed, onNode, dailyDone, dailyTarget, onGoPractice, onSeeAll }: {
  name: string;
  xp: number;
  streak: number;
  completed: number[];
  onNode: (lesson: Lesson, locked: boolean) => void;
  dailyDone: number;
  dailyTarget: number;
  onGoPractice: () => void;
  onSeeAll: () => void;
}) {
  const insets = useSafeAreaInsets();

  const currentId = LESSONS.findIndex((l) => !completed.includes(l.id));
  const current = currentId === -1 ? LESSONS[LESSONS.length - 1] : LESSONS[currentId];
  const unit = currentUnit(completed);
  const unitDone = unit.lessons.filter((l) => completed.includes(l.id)).length;
  const tip = TIPS[Math.floor(Date.now() / 86_400_000) % TIPS.length];

  const openCurrent = () => onNode(current, false);

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 112 }} showsVerticalScrollIndicator={false}>
      {/* greeting */}
      <View style={[styles.topRow, { paddingTop: Math.max(58, insets.top + 10) }]}>
        <View>
          <Text style={styles.greet}>Salam, {name}!</Text>
          <Text style={styles.greetSub}>Learn Darija together</Text>
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
        <View style={styles.heroSun} />
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
        <Pressable style={styles.seeAll} onPress={() => { sfx('tap'); haptic('light'); onSeeAll(); }}>
          <Text style={styles.seeAllText}>See all</Text>
          <Icon name="chevR" size={14} color={colors.sand600} />
        </Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.topicsRow}>
        {LESSONS.map((l, i) => {
          const done = completed.includes(l.id);
          const isCurrent = i === currentId;
          const locked = !done && !isCurrent;
          return (
            <Pressable key={l.id} style={[styles.topic, { backgroundColor: TINTS[i % TINTS.length] }]}
              onPress={() => onNode(l, locked)}>
              {locked && (
                <View style={styles.topicLock}>
                  <Icon name="lock" size={12} color={colors.sand600} />
                </View>
              )}
              <View style={styles.topicIcon}>
                <Icon name={done ? 'check' : isCurrent ? 'play' : 'book'} size={24}
                  color={locked ? colors.sandLocked : colors.brand} />
              </View>
              <Text style={[styles.topicTitle, locked && { color: colors.sandLocked }]} numberOfLines={2}>
                {l.title}
              </Text>
              <Text style={styles.topicSub}>{locked ? 'Locked' : `${l.words.length} words`}</Text>
              <View style={styles.topicLine}>
                <View style={[styles.topicLineFill, { width: done ? '100%' : isCurrent ? '35%' : 0 }]} />
              </View>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* today's goal */}
      <View style={styles.goal}>
        <Image source={LANTERN} style={styles.goalArt} resizeMode="contain" />
        <Text style={styles.goalTitle}>Today’s goal</Text>
        <Text style={styles.goalSub}>Complete {dailyTarget} {dailyTarget === 1 ? 'lesson' : 'lessons'}</Text>
        <View style={styles.goalRow}>
          <View style={styles.goalSteps}>
            {Array.from({ length: dailyTarget }, (_, i) => (
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
    </ScrollView>
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
    fontSize: 23,
    color: colors.ink900,
  },
  greetSub: {
    fontFamily: font.semibold,
    fontSize: 13,
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
    minHeight: 250,
    shadowColor: colors.brandDeep,
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  heroSun: {
    position: 'absolute',
    right: 150,
    top: 24,
    width: 52,
    height: 52,
    borderRadius: 999,
    backgroundColor: colors.gold,
  },
  heroArt: {
    position: 'absolute',
    right: -6,
    bottom: -2,
    width: 168,
    height: 148,
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
    width: 155,
    height: 9,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.28)',
    marginTop: 44,
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
  seeAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  seeAllText: {
    fontFamily: font.bold,
    fontSize: 13.5,
    color: colors.sand600,
  },

  /* topics */
  topicsRow: {
    paddingHorizontal: 18,
    gap: 10,
  },
  topic: {
    width: 116,
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
    lineHeight: 17,
    color: colors.ink900,
    marginTop: 9,
    minHeight: 34,
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
    backgroundColor: '#F7EFE0',
    borderWidth: 1,
    borderColor: colors.hairline,
    padding: 18,
  },
  goalArt: {
    position: 'absolute',
    right: 12,
    top: -6,
    width: 46,
    height: 100,
  },
  goalTitle: {
    fontFamily: font.extra,
    fontSize: 17.5,
    color: colors.ink900,
  },
  goalSub: {
    fontFamily: font.semibold,
    fontSize: 13,
    color: '#877E6A',
    marginTop: 2,
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  goalSteps: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    maxWidth: 168,
    marginRight: 10,
  },
  goalStep: {
    width: 30,
    height: 30,
    borderRadius: 999,
    backgroundColor: colors.card,
    borderWidth: 2.5,
    borderColor: '#D5CBB4',
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
    backgroundColor: '#D5CBB4',
  },
  goalLineOn: {
    backgroundColor: colors.brand,
  },
  goalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: colors.brand,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 999,
    marginRight: 52,
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
});
