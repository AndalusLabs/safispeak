/* SafiSpeak redesign — Profile tab: avatar, account status, streak week,
   achievements. (The learning stats live in the Progress tab.) */

import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, font } from '../theme';
import { haptic, sfx } from '../sfx';
import { Account, getAccount } from '../auth';
import { supabase } from '../supabase';
import Icon, { IconName } from '../components/Icon';
import Safi from '../components/Safi';
import { RoundBtn } from '../components/ui';

const WEEK = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export function ProfileScreen({ name, xp, streak, completed, accuracy, onSettings, onAccount }: {
  name: string;
  xp: number;
  streak: number;
  completed: number[];
  accuracy: number;
  onSettings: () => void;
  onAccount: () => void;
}) {
  const insets = useSafeAreaInsets();
  const wordsLearned = completed.length * 3;
  const todayIdx = (new Date().getDay() + 6) % 7; // Monday = 0

  /* account status card — refreshes whenever the auth session changes */
  const [account, setAccount] = React.useState<Account | null>(null);
  React.useEffect(() => {
    getAccount().then(setAccount);
    if (!supabase) return;
    const { data } = supabase.auth.onAuthStateChange(() => {
      getAccount().then(setAccount);
    });
    return () => data.subscription.unsubscribe();
  }, []);
  const synced = !!account && !account.anonymous && !!account.email;

  const badges: { icon: IconName; t: string; got: boolean }[] = [
    { icon: 'play', t: 'First steps', got: completed.length > 0 },
    { icon: 'flame', t: '3-day flame', got: streak >= 3 },
    { icon: 'book', t: 'Word collector', got: wordsLearned >= 9 },
    { icon: 'target', t: 'Sharpshooter', got: accuracy >= 90 },
    { icon: 'check', t: 'Unit finisher', got: completed.length >= 5 },
    { icon: 'star', t: 'Week warrior', got: streak >= 7 },
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

      {/* account status */}
      <Pressable style={[styles.card, styles.accountCard, synced && styles.accountCardSynced]}
        onPress={() => { sfx('tap'); haptic('light'); onAccount(); }}>
        <View style={[styles.accountIcon, synced && { backgroundColor: colors.greenTint }]}>
          <Icon name={synced ? 'check' : 'user'} size={20} color={synced ? colors.brand : colors.goldText} />
        </View>
        <View style={{ flex: 1 }}>
          {synced ? (
            <>
              <Text style={styles.accountTitle}>Progress backed up</Text>
              <Text style={styles.accountSub} numberOfLines={1}>{account?.email}</Text>
            </>
          ) : (
            <>
              <Text style={styles.accountTitle}>You’re learning as a guest</Text>
              <Text style={styles.accountSub}>Create a free account to save your progress</Text>
            </>
          )}
        </View>
        {synced ? (
          <View style={styles.syncedChip}>
            <Text style={styles.syncedChipText}>Synced</Text>
          </View>
        ) : (
          <View style={styles.accountBtn}>
            <Text style={styles.accountBtnText}>Create account</Text>
          </View>
        )}
      </Pressable>

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
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.goldTint,
  },
  accountCardSynced: {
    backgroundColor: colors.card,
  },
  accountIcon: {
    width: 42,
    height: 42,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountTitle: {
    fontFamily: font.extra,
    fontSize: 14.5,
    color: colors.ink900,
  },
  accountSub: {
    fontFamily: font.semibold,
    fontSize: 12,
    color: colors.sand600,
    marginTop: 1,
  },
  accountBtn: {
    backgroundColor: colors.brand,
    paddingVertical: 9,
    paddingHorizontal: 13,
    borderRadius: 999,
  },
  accountBtnText: {
    fontFamily: font.extra,
    fontSize: 12,
    color: '#fff',
  },
  syncedChip: {
    backgroundColor: colors.greenTint,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  syncedChipText: {
    fontFamily: font.extra,
    fontSize: 12,
    color: colors.greenText,
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
