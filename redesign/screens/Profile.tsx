/* SafiSpeak redesign — Profile tab: avatar, streak week, stats, achievements. */

import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, font } from '../theme';
import Icon, { IconName } from '../components/Icon';
import Safi from '../components/Safi';
import { RoundBtn } from '../components/ui';

const WEEK = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export function ProfileScreen({ name, xp, streak, completed, accuracy, onSettings }: {
  name: string;
  xp: number;
  streak: number;
  completed: number[];
  accuracy: number;
  onSettings: () => void;
}) {
  const insets = useSafeAreaInsets();
  const wordsLearned = completed.length * 3;
  const todayIdx = (new Date().getDay() + 6) % 7; // Monday = 0

  const stats: { icon: IconName; n: string | number; k: string; c: string; bg: string }[] = [
    { icon: 'star', n: xp, k: 'Total XP', c: colors.goldText, bg: colors.goldTint },
    { icon: 'flame', n: streak, k: 'Day streak', c: colors.flame, bg: colors.flameTint },
    { icon: 'book', n: wordsLearned, k: 'Words learned', c: colors.greenText, bg: colors.greenTint },
    { icon: 'target', n: `${accuracy}%`, k: 'Accuracy', c: colors.blueText, bg: colors.blueTint },
  ];

  const badges: { icon: IconName; t: string; got: boolean }[] = [
    { icon: 'play', t: 'First steps', got: completed.length > 0 },
    { icon: 'flame', t: '3-day flame', got: streak >= 3 },
    { icon: 'book', t: 'Word collector', got: wordsLearned >= 9 },
    { icon: 'target', t: 'Sharpshooter', got: accuracy >= 90 },
  ];

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 116 }} showsVerticalScrollIndicator={false}>
      <View style={[styles.hero, { paddingTop: insets.top + 20 }]}>
        <View style={[styles.gear, { top: insets.top + 8 }]}>
          <RoundBtn icon="gear" onPress={onSettings} />
        </View>
        <View style={styles.avatar}>
          <Safi expression="wink" animation="none" size={64} />
        </View>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.meta}>Learning Darija · joined June 2026</Text>
      </View>

      {/* streak card */}
      <View style={styles.card}>
        <View style={styles.cardTitleRow}>
          <Icon name="flame" size={18} color={colors.flame} />
          <Text style={styles.cardTitle}>{streak}-day streak</Text>
        </View>
        <View style={styles.week}>
          {WEEK.map((d, i) => {
            const done = streak > 0 && i >= todayIdx - streak + 1 && i <= todayIdx;
            const today = i === todayIdx;
            return (
              <View key={i} style={styles.weekDay}>
                <View style={[
                  styles.weekDot,
                  done && { backgroundColor: colors.flameTint },
                  today && styles.weekToday,
                ]}>
                  {done && <Icon name="flame" size={15} color={colors.flame} />}
                </View>
                <Text style={styles.weekLbl}>{d}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* 2×2 stat cards */}
      <View style={styles.statGrid}>
        {stats.map((s) => (
          <View key={s.k} style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: s.bg }]}>
              <Icon name={s.icon} size={19} color={s.c} />
            </View>
            <Text style={styles.statN}>{s.n}</Text>
            <Text style={styles.statK}>{s.k}</Text>
          </View>
        ))}
      </View>

      {/* achievements */}
      <View style={styles.card}>
        <View style={styles.cardTitleRow}>
          <Icon name="trophy" size={18} color={colors.flame} />
          <Text style={styles.cardTitle}>Achievements</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.badges}>
            {badges.map((b) => (
              <View key={b.t} style={styles.badge}>
                <View style={[styles.badgeCoin, b.got && styles.badgeCoinGot]}>
                  <Icon name={b.icon} size={20} color={b.got ? colors.goldText : '#C9C0A8'} />
                </View>
                <Text style={[styles.badgeText, b.got && { color: colors.ink700 }]}>{b.t}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.appBg,
  },
  hero: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
    gap: 6,
  },
  gear: {
    position: 'absolute',
    right: 18,
  },
  avatar: {
    width: 94,
    height: 94,
    borderRadius: 999,
    backgroundColor: colors.greenTint,
    borderWidth: 3,
    borderColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    paddingTop: 10,
  },
  name: {
    fontFamily: font.extra,
    fontSize: 25,
    lineHeight: 30,
    color: colors.ink900,
    textTransform: 'capitalize',
  },
  meta: {
    fontFamily: font.semibold,
    fontSize: 13.5,
    color: colors.sand600,
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 14,
    backgroundColor: colors.card,
    borderRadius: 22,
    paddingVertical: 16,
    paddingHorizontal: 18,
    shadowColor: '#1F2A37',
    shadowOpacity: 0.07,
    shadowRadius: 11,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 13,
  },
  cardTitle: {
    fontFamily: font.extra,
    fontSize: 16,
    color: colors.ink900,
  },
  week: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weekDay: {
    alignItems: 'center',
    gap: 6,
  },
  weekDot: {
    width: 34,
    height: 34,
    borderRadius: 999,
    backgroundColor: '#F3EDDD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekToday: {
    borderWidth: 2.5,
    borderColor: colors.brand,
  },
  weekLbl: {
    fontFamily: font.bold,
    fontSize: 12,
    color: colors.sand600,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginHorizontal: 16,
    marginBottom: 14,
  },
  statCard: {
    width: '47%',
    flexGrow: 1,
    backgroundColor: colors.card,
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 3,
    shadowColor: '#1F2A37',
    shadowOpacity: 0.07,
    shadowRadius: 11,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  statN: {
    fontFamily: font.extra,
    fontSize: 24,
    lineHeight: 26,
    color: colors.ink900,
  },
  statK: {
    fontFamily: font.bold,
    fontSize: 12.5,
    color: colors.sand600,
  },
  badges: {
    flexDirection: 'row',
    gap: 10,
    paddingBottom: 2,
  },
  badge: {
    alignItems: 'center',
    gap: 7,
    minWidth: 82,
  },
  badgeCoin: {
    width: 54,
    height: 54,
    borderRadius: 999,
    backgroundColor: '#F3EDDD',
    borderWidth: 2,
    borderColor: '#E8E0CB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeCoinGot: {
    backgroundColor: colors.goldTint,
    borderColor: '#F5CD4F',
    shadowColor: '#F5CD4F',
    shadowOpacity: 0.4,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  badgeText: {
    fontFamily: font.bold,
    fontSize: 11.5,
    color: colors.sand400,
    textAlign: 'center',
  },
});
