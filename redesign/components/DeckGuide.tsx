/* SafiSpeak redesign — first-time flashcard guide overlay.
   Shown once (persisted), explains: tap to flip, swipe right = know it,
   swipe left = again. */

import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { colors, font } from '../theme';
import Icon, { IconName } from './Icon';
import Safi from './Safi';
import { AppButton } from './ui';

const KEY = 'safiapp.deckGuideSeen';

export function useDeckGuide() {
  const [show, setShow] = React.useState(false);
  React.useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((v) => { if (v == null) setShow(true); })
      .catch(() => {});
  }, []);
  const dismiss = React.useCallback(() => {
    setShow(false);
    AsyncStorage.setItem(KEY, '1').catch(() => {});
  }, []);
  return { show, dismiss };
}

function Row({ icon, tint, title, sub }: { icon: IconName; tint: string; title: string; sub: string }) {
  return (
    <View style={styles.row}>
      <View style={[styles.rowIcon, { backgroundColor: tint }]}>
        <Icon name={icon} size={20} color={colors.ink800} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowSub}>{sub}</Text>
      </View>
    </View>
  );
}

export function DeckGuide({ onDismiss }: { onDismiss: () => void }) {
  return (
    <Animated.View entering={FadeIn.duration(220)} style={styles.veil}>
      <Animated.View entering={ZoomIn.duration(320)} style={styles.card}>
        <View style={styles.safiRow}>
          <Safi expression="happy" animation="bob" size={70} />
          <Text style={styles.title}>How the cards work</Text>
        </View>
        <Row icon="cards" tint={colors.goldTint}
          title="Tap the card" sub="Flip it to see the meaning" />
        <Row icon="chevR" tint={colors.greenTint}
          title="Swipe right — Know it" sub="Or press the green button below" />
        <Row icon="chevL" tint={colors.flameTint}
          title="Swipe left — Again" sub="The card comes back until you know it" />
        <AppButton onPress={onDismiss} style={{ alignSelf: 'stretch', marginTop: 6 }}>
          Wakha, got it!
        </AppButton>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  veil: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(18,26,20,0.46)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 80,
    padding: 24,
  },
  card: {
    alignSelf: 'stretch',
    backgroundColor: colors.appBg,
    borderRadius: 26,
    padding: 20,
    gap: 14,
    shadowColor: '#1F2A37',
    shadowOpacity: 0.2,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 16 },
    elevation: 12,
  },
  safiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    flex: 1,
    fontFamily: font.extra,
    fontSize: 22,
    lineHeight: 27,
    color: colors.ink900,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: 16,
    padding: 12,
  },
  rowIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: {
    fontFamily: font.extra,
    fontSize: 15,
    color: colors.ink900,
  },
  rowSub: {
    fontFamily: font.semibold,
    fontSize: 12.5,
    color: colors.sand600,
  },
});
