/* SafiSpeak redesign — hard paywall (Medina style).
   Shown when a non-premium user opens any lesson after the free one.
   Psychology per Ayoub: the user just finished lesson 1 and is motivated —
   one clear monthly offer, no free escape hatch besides going back. */

import React from 'react';
import {
  ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Text, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, font, radius } from '../theme';
import { haptic, sfx } from '../sfx';
import { getMonthlyPrice, purchaseMonthly, restorePurchases } from '../monetization';
import Icon, { IconName } from '../components/Icon';
import { HeroBackground } from '../components/Gradients';
import { AppButton } from '../components/ui';

const BENEFITS: { icon: IconName; title: string; sub: string }[] = [
  { icon: 'book', title: 'All units & lessons', sub: 'The full path, from Salam to real conversations' },
  { icon: 'volume', title: 'Real Darija voices', sub: 'Native-quality audio on every word' },
  { icon: 'cards', title: 'Unlimited practice', sub: 'Flashcards, quizzes and review — no limits' },
  { icon: 'star', title: 'New lessons monthly', sub: 'Fresh words and topics added regularly' },
];

export function PaywallScreen({ onUnlocked, onClose }: {
  onUnlocked: () => void;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const [price, setPrice] = React.useState('€4.99');
  const [busy, setBusy] = React.useState<'buy' | 'restore' | null>(null);

  React.useEffect(() => {
    let mounted = true;
    getMonthlyPrice().then((p) => { if (mounted) setPrice(p.priceString); });
    return () => { mounted = false; };
  }, []);

  const buy = async () => {
    if (busy) return;
    setBusy('buy');
    const res = await purchaseMonthly();
    setBusy(null);
    if (res.ok) {
      sfx('win');
      haptic('success');
      onUnlocked();
    } else if (!res.cancelled && res.message) {
      Alert.alert('Purchase', res.message);
    }
  };

  const restore = async () => {
    if (busy) return;
    setBusy('restore');
    const res = await restorePurchases();
    setBusy(null);
    if (res.ok) {
      sfx('win');
      haptic('success');
      onUnlocked();
    } else if (res.message) {
      Alert.alert('Restore purchases', res.message);
    }
  };

  return (
    <View style={styles.root}>
      {/* hero */}
      <View style={[styles.hero, { paddingTop: insets.top + 10 }]}>
        <HeroBackground />
        <Pressable hitSlop={12} style={styles.close}
          onPress={() => { sfx('tap'); haptic('light'); onClose(); }}>
          <Icon name="x" size={20} color="#fff" />
        </Pressable>
        <Image source={require('../../assets/images/medina-mosque.png')}
          style={styles.mosque} resizeMode="contain" />
        <Text style={styles.kick}>SAFISPEAK PREMIUM</Text>
        <Text style={styles.title}>Keep going —{'\n'}unlock every lesson</Text>
      </View>

      <ScrollView style={styles.body} contentContainerStyle={{ paddingBottom: insets.bottom + 18 }}
        showsVerticalScrollIndicator={false}>
        {BENEFITS.map((b) => (
          <View key={b.title} style={styles.benefit}>
            <View style={styles.benefitIcon}>
              <Icon name={b.icon} size={20} color={colors.brand} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.benefitTitle}>{b.title}</Text>
              <Text style={styles.benefitSub}>{b.sub}</Text>
            </View>
            <Icon name="check" size={18} color={colors.brand} />
          </View>
        ))}

        {/* price card */}
        <View style={styles.priceCard}>
          <View style={styles.priceBadge}><Text style={styles.priceBadgeText}>MONTHLY</Text></View>
          <Text style={styles.priceValue}>{price}<Text style={styles.priceUnit}> / month</Text></Text>
          <Text style={styles.priceSub}>Cancel anytime. Lesson 1 stays free forever.</Text>
        </View>

        <AppButton icon="star" onPress={buy}>
          {busy === 'buy' ? 'One moment…' : 'Continue learning'}
        </AppButton>

        <Pressable onPress={restore} hitSlop={8} style={styles.restore}>
          {busy === 'restore'
            ? <ActivityIndicator size="small" color={colors.brand} />
            : <Text style={styles.restoreText}>Restore purchases</Text>}
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.appBg,
  },
  hero: {
    borderBottomLeftRadius: radius.sheet,
    borderBottomRightRadius: radius.sheet,
    overflow: 'hidden',
    paddingHorizontal: 22,
    paddingBottom: 22,
    alignItems: 'center',
  },
  close: {
    position: 'absolute',
    top: 54,
    left: 18,
    zIndex: 3,
    width: 34,
    height: 34,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mosque: {
    width: 190,
    height: 150,
    marginTop: 4,
  },
  kick: {
    fontFamily: font.extra,
    fontSize: 11.5,
    letterSpacing: 2.2,
    color: colors.gold,
    marginTop: 10,
  },
  title: {
    fontFamily: font.extra,
    fontSize: 24,
    lineHeight: 29,
    color: '#fff',
    textAlign: 'center',
    marginTop: 6,
  },
  body: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 16,
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.hairline,
    paddingVertical: 11,
    paddingHorizontal: 13,
    marginBottom: 9,
  },
  benefitIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: colors.greenTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitTitle: {
    fontFamily: font.extra,
    fontSize: 14.5,
    color: colors.ink900,
  },
  benefitSub: {
    fontFamily: font.semibold,
    fontSize: 12,
    color: colors.sand600,
    marginTop: 1,
  },
  priceCard: {
    backgroundColor: colors.goldTint,
    borderRadius: radius.cardLg,
    borderWidth: 1.5,
    borderColor: colors.gold,
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 6,
    marginBottom: 14,
  },
  priceBadge: {
    backgroundColor: colors.gold,
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginBottom: 7,
  },
  priceBadgeText: {
    fontFamily: font.extra,
    fontSize: 10.5,
    letterSpacing: 1.6,
    color: '#4A3A08',
  },
  priceValue: {
    fontFamily: font.extra,
    fontSize: 30,
    color: colors.ink900,
  },
  priceUnit: {
    fontSize: 15,
    color: colors.sand600,
  },
  priceSub: {
    fontFamily: font.semibold,
    fontSize: 12,
    color: colors.goldText,
    marginTop: 4,
  },
  restore: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  restoreText: {
    fontFamily: font.bold,
    fontSize: 13.5,
    color: colors.sand600,
    textDecorationLine: 'underline',
  },
});
