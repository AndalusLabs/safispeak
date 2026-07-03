/* SafiSpeak redesign — Settings slide-over (swipe-right or chevron dismisses). */

import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS, useAnimatedStyle, useSharedValue, withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, font, motion } from '../theme';
import { haptic, sfx } from '../sfx';
import { AppSettings } from '../store';
import { restorePurchases } from '../monetization';
import Icon, { IconName } from '../components/Icon';
import { RoundBtn, Toggle } from '../components/ui';

const TIMES = ['08:00', '12:30', '20:00'];

export function SettingsScreen({ settings, premium, onChange, onBack, onReplayIntro, onReset, onRestored, width }: {
  settings: AppSettings;
  premium: boolean;
  onChange: (s: AppSettings) => void;
  onBack: () => void;
  onReplayIntro: () => void;
  onReset: () => void;
  onRestored: () => void;
  width: number;
}) {
  const [restoring, setRestoring] = React.useState(false);

  const restore = async () => {
    if (restoring) return;
    setRestoring(true);
    const res = await restorePurchases();
    setRestoring(false);
    if (res.ok) {
      sfx('win');
      haptic('success');
      onRestored();
      Alert.alert('Restore purchases', 'Your subscription is back. Welcome home!');
    } else if (res.message) {
      Alert.alert('Restore purchases', res.message);
    }
  };
  const insets = useSafeAreaInsets();
  const enter = useSharedValue(width);
  const dx = useSharedValue(0);

  React.useEffect(() => {
    enter.value = withTiming(0, motion.spring);
  }, [enter]);

  const dismiss = React.useCallback(() => {
    enter.value = withTiming(width, { duration: 240 });
    setTimeout(onBack, 230);
  }, [enter, width, onBack]);

  const pan = Gesture.Pan()
    .activeOffsetX(10)
    .failOffsetY([-12, 12])
    .onUpdate((e) => { dx.value = Math.max(0, e.translationX); })
    .onEnd((e) => {
      if (e.translationX > 90 || e.velocityX > 500) {
        runOnJS(dismiss)();
      } else {
        dx.value = withTiming(0, motion.spring);
      }
    });

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: enter.value + dx.value }],
  }));

  const set = <K extends keyof AppSettings>(k: K, v: AppSettings[K]) =>
    onChange({ ...settings, [k]: v });

  const confirmReset = () => {
    Alert.alert(
      'Reset progress?',
      'This wipes your XP, streak and completed lessons. There is no undo.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: onReset },
      ],
    );
  };

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.screen, style]}>
        <View style={[styles.top, { marginTop: insets.top + 8 }]}>
          <RoundBtn icon="chevL" onPress={dismiss} />
          <View style={styles.topMid}>
            <Text style={styles.topTitle}>Settings</Text>
          </View>
          <View style={{ width: 38 }} />
        </View>
        <ScrollView contentContainerStyle={{ paddingTop: 4, paddingBottom: insets.bottom + 20 }} showsVerticalScrollIndicator={false}>
          <Group label="EXPERIENCE">
            <Row icon="volume" title="Sound effects" first>
              <Toggle on={settings.sound} onChange={(v) => set('sound', v)} />
            </Row>
            <Row icon="buzz" title="Haptics">
              <Toggle on={settings.haptics} onChange={(v) => set('haptics', v)} />
            </Row>
          </Group>

          <Group label="REMINDERS">
            <Row icon="bell" title="Daily reminder" first>
              <Toggle on={settings.reminder} onChange={(v) => set('reminder', v)} />
            </Row>
            {settings.reminder && (
              <View style={styles.timeChips}>
                {TIMES.map((t) => {
                  const on = settings.remTime === t;
                  return (
                    <Pressable key={t}
                      style={[styles.timeChip, on && styles.timeChipOn]}
                      onPress={() => { sfx('tap'); haptic('light'); set('remTime', t); }}>
                      <Text style={[styles.timeChipText, on && { color: colors.brand }]}>{t}</Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </Group>

          <Group label="SUBSCRIPTION">
            <Row icon="star" title={premium ? 'SafiSpeak Pro · active' : 'Restore purchases'} first
              onPress={premium ? undefined : restore}>
              {premium
                ? <Icon name="check" size={17} color={colors.brand} />
                : <Text style={styles.restoreHint}>{restoring ? '…' : 'Restore'}</Text>}
            </Row>
          </Group>

          <Group label="ACCOUNT">
            <Row icon="play" title="Replay intro" first onPress={onReplayIntro}>
              <Icon name="chevR" size={17} color="#B9B2A0" />
            </Row>
            <Row icon="refresh" title="Reset progress" danger onPress={confirmReset}>
              <Icon name="chevR" size={17} color={colors.redDark} />
            </Row>
          </Group>

          <Text style={styles.foot}>SafiSpeak · v2.0 · Say it the Darija way</Text>
        </ScrollView>
      </Animated.View>
    </GestureDetector>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.group}>
      <Text style={styles.groupLabel}>{label}</Text>
      {children}
    </View>
  );
}

function Row({ icon, title, first, danger, onPress, children }: {
  icon: IconName; title: string; first?: boolean; danger?: boolean;
  onPress?: () => void; children: React.ReactNode;
}) {
  const inner = (
    <>
      <View style={[styles.rowIcon, danger && { backgroundColor: colors.redTint }]}>
        <Icon name={icon} size={19} color={danger ? colors.redDark : colors.brand} />
      </View>
      <Text style={[styles.rowTitle, danger && { color: colors.redDark }]}>{title}</Text>
      {children}
    </>
  );
  const rowStyle = [styles.row, !first && styles.rowBorder];
  if (onPress) {
    return (
      <Pressable
        style={({ pressed }) => [...rowStyle, pressed && { backgroundColor: colors.appBg }]}
        onPress={() => { sfx('tap'); haptic('light'); onPress(); }}
      >
        {inner}
      </Pressable>
    );
  }
  return <View style={rowStyle}>{inner}</View>;
}

const styles = StyleSheet.create({
  screen: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.appBg,
    zIndex: 50,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
  },
  topMid: {
    flex: 1,
    alignItems: 'center',
  },
  topTitle: {
    fontFamily: font.extra,
    fontSize: 17,
    color: colors.ink900,
  },
  group: {
    marginHorizontal: 16,
    marginTop: 6,
    marginBottom: 14,
    backgroundColor: colors.card,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#1F2A37',
    shadowOpacity: 0.07,
    shadowRadius: 11,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  groupLabel: {
    paddingTop: 13,
    paddingHorizontal: 16,
    paddingBottom: 5,
    fontFamily: font.extra,
    fontSize: 11.5,
    letterSpacing: 1.6,
    color: colors.sand400,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 11,
    paddingHorizontal: 16,
  },
  rowBorder: {
    borderTopWidth: 1,
    borderTopColor: '#F7F1E3',
  },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: '#EAF4EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: {
    flex: 1,
    fontFamily: font.bold,
    fontSize: 15.5,
    color: colors.ink800,
  },
  timeChips: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 2,
    paddingBottom: 14,
    paddingLeft: 62,
    paddingRight: 16,
  },
  timeChip: {
    borderWidth: 2,
    borderColor: colors.optionBorder,
    backgroundColor: colors.card,
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 14,
  },
  timeChipOn: {
    borderColor: colors.brand,
    backgroundColor: '#F0FAF5',
  },
  timeChipText: {
    fontFamily: font.extra,
    fontSize: 13.5,
    color: colors.sand600,
  },
  restoreHint: {
    fontFamily: font.extra,
    fontSize: 13,
    color: colors.brand,
  },
  foot: {
    textAlign: 'center',
    fontFamily: font.semibold,
    fontSize: 12.5,
    color: colors.sand400,
    paddingVertical: 16,
    paddingBottom: 40,
  },
});
