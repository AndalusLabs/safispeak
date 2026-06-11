/* SafiSpeak redesign — Practice tab: free deck of learned words. */

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, font } from '../theme';
import { shuffle } from '../sfx';
import { LESSONS } from '../lessons';
import Icon from '../components/Icon';
import Safi from '../components/Safi';
import { FlashDeck, DeckStats, DeckControl } from '../components/FlashDeck';
import { AppButton } from '../components/ui';

export function PracticeScreen({ completed, onXp }: {
  completed: number[];
  onXp: (n: number) => void;
}) {
  const insets = useSafeAreaInsets();
  const [round, setRound] = React.useState(0);
  const [stat, setStat] = React.useState<DeckStats>({ got: 0, again: 0 });
  const [doneStat, setDoneStat] = React.useState<DeckStats | null>(null);
  const deck = React.useRef<DeckControl | null>(null);

  const words = React.useMemo(() => {
    const learned = LESSONS.filter((l) => completed.includes(l.id)).flatMap((l) => l.words);
    return shuffle(learned.length >= 3 ? learned : LESSONS[0].words);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completed, round]);

  if (doneStat) {
    return (
      <View style={[styles.screen, styles.done, { paddingTop: insets.top + 90 }]}>
        <Safi expression="celebrate" animation="bounce" glow size={150} />
        <Text style={styles.doneTitle}>Deck cleared!</Text>
        <Text style={styles.doneSub}>
          {doneStat.got} known · {doneStat.again} reviews · +{doneStat.got * 2} XP
        </Text>
        <AppButton icon="refresh" onPress={() => {
          setDoneStat(null);
          setStat({ got: 0, again: 0 });
          setRound((r) => r + 1);
        }}>
          Go again
        </AppButton>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={[styles.head, { paddingTop: insets.top + 14 }]}>
        <Text style={styles.title}>Practice</Text>
        <Text style={styles.sub}>Tap to flip · swipe right if you know it</Text>
      </View>
      <View style={styles.deckZone}>
        <FlashDeck key={round} cards={words} onStat={setStat}
          onDone={(s) => { setDoneStat(s); onXp(s.got * 2); }} controlRef={deck} />
      </View>
      <View style={styles.legendRow}>
        <Pressable style={({ pressed }) => [styles.legend, pressed && styles.legendPressed]}
          onPress={() => deck.current?.grade(-1)}>
          <Icon name="chevL" size={16} color={colors.amber} />
          <Text style={[styles.legendText, { color: colors.amber }]}>Again ({stat.again})</Text>
        </Pressable>
        <Pressable style={({ pressed }) => [styles.legend, pressed && styles.legendPressed]}
          onPress={() => deck.current?.grade(1)}>
          <Text style={[styles.legendText, { color: colors.brand }]}>Know it ({stat.got})</Text>
          <Icon name="chevR" size={16} color={colors.brand} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.appBg,
    paddingBottom: 98,
  },
  head: {
    paddingHorizontal: 22,
  },
  title: {
    fontFamily: font.extra,
    fontSize: 28,
    lineHeight: 34,
    color: colors.ink900,
  },
  sub: {
    fontFamily: font.semibold,
    fontSize: 14.5,
    color: colors.sand600,
    marginTop: 4,
  },
  deckZone: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 380,
    paddingVertical: 8,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 292,
    alignSelf: 'center',
    paddingBottom: 26,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  legendText: {
    fontFamily: font.extra,
    fontSize: 13.5,
  },
  legendPressed: {
    transform: [{ scale: 0.94 }],
    backgroundColor: '#FFFBF2',
  },
  done: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 30,
  },
  doneTitle: {
    fontFamily: font.extra,
    fontSize: 28,
    lineHeight: 34,
    color: colors.ink900,
    marginTop: 8,
  },
  doneSub: {
    fontFamily: font.semibold,
    fontSize: 15.5,
    color: colors.ink600,
    marginBottom: 14,
  },
});
