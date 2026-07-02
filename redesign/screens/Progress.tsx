/* SafiSpeak redesign — Progress tab: overall ring, stat tiles, per-unit bars. */

import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, font, radius } from '../theme';
import { LESSONS, UNITS } from '../lessons';
import Icon, { IconName } from '../components/Icon';
import { ProgressBar, ProgressRing } from '../components/ui';

function Stat({ icon, tint, color, value, label }: {
  icon: IconName; tint: string; color: string; value: string; label: string;
}) {
  return (
    <View style={styles.stat}>
      <View style={[styles.statIcon, { backgroundColor: tint }]}>
        <Icon name={icon} size={19} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export function ProgressScreen({ xp, streak, completed, accuracy }: {
  xp: number;
  streak: number;
  completed: number[];
  accuracy: number;
}) {
  const insets = useSafeAreaInsets();
  const pct = Math.round((completed.length / LESSONS.length) * 100);
  const words = completed.length * 3;

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 116 }} showsVerticalScrollIndicator={false}>
      <Text style={[styles.title, { marginTop: Math.max(60, insets.top + 12) }]}>Progress</Text>

      {/* overall ring */}
      <View style={styles.ringCard}>
        <ProgressRing pct={pct} size={108} stroke={10}>
          <Text style={styles.ringPct}>{pct}%</Text>
        </ProgressRing>
        <View style={{ flex: 1 }}>
          <Text style={styles.ringTitle}>Your Darija journey</Text>
          <Text style={styles.ringSub}>
            {completed.length} of {LESSONS.length} lessons completed.{'\n'}
            Keep going — every lesson counts!
          </Text>
        </View>
      </View>

      {/* stat tiles */}
      <View style={styles.statsRow}>
        <Stat icon="flame" tint={colors.flameTint} color={colors.flame} value={`${streak}`} label="Day streak" />
        <Stat icon="star" tint={colors.goldTint} color={colors.goldText} value={`${xp}`} label="Total XP" />
      </View>
      <View style={styles.statsRow}>
        <Stat icon="target" tint={colors.greenTint} color={colors.brand} value={`${accuracy}%`} label="Accuracy" />
        <Stat icon="book" tint={colors.blueTint} color={colors.blueText} value={`${words}`} label="Words learned" />
      </View>

      {/* per-unit progress */}
      <Text style={styles.secTitle}>Units</Text>
      {UNITS.map((u) => {
        const done = u.lessons.filter((l) => completed.includes(l.id)).length;
        return (
          <View key={u.id} style={styles.unitCard}>
            <View style={styles.unitTop}>
              <Text style={styles.unitTitle}>Unit {u.id + 1} · {u.title}</Text>
              <Text style={styles.unitCount}>{done}/{u.lessons.length}</Text>
            </View>
            <ProgressBar pct={(done / u.lessons.length) * 100} />
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.appBg,
  },
  title: {
    fontFamily: font.extra,
    fontSize: 24,
    color: colors.ink900,
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  ringCard: {
    marginHorizontal: 18,
    backgroundColor: colors.card,
    borderRadius: radius.cardXl,
    borderWidth: 1,
    borderColor: colors.hairline,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    shadowColor: '#1F2A37',
    shadowOpacity: 0.07,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  ringPct: {
    fontFamily: font.extra,
    fontSize: 22,
    color: colors.brand,
  },
  ringTitle: {
    fontFamily: font.extra,
    fontSize: 16.5,
    color: colors.ink900,
  },
  ringSub: {
    fontFamily: font.semibold,
    fontSize: 12.5,
    lineHeight: 18,
    color: colors.sand600,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 18,
    marginTop: 12,
  },
  stat: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.cardLg,
    borderWidth: 1,
    borderColor: colors.hairline,
    padding: 14,
  },
  statIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontFamily: font.extra,
    fontSize: 22,
    color: colors.ink900,
    marginTop: 8,
  },
  statLabel: {
    fontFamily: font.semibold,
    fontSize: 12,
    color: colors.sand600,
    marginTop: 1,
  },
  secTitle: {
    fontFamily: font.extra,
    fontSize: 18,
    color: colors.ink900,
    paddingHorizontal: 22,
    marginTop: 22,
    marginBottom: 10,
  },
  unitCard: {
    marginHorizontal: 18,
    marginBottom: 10,
    backgroundColor: colors.card,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.hairline,
    padding: 14,
  },
  unitTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  unitTitle: {
    fontFamily: font.extra,
    fontSize: 14.5,
    color: colors.ink900,
  },
  unitCount: {
    fontFamily: font.extra,
    fontSize: 13,
    color: colors.sand600,
  },
});
