/* SafiSpeak redesign — floating pill tab bar (Learn / Practice / Profile). */

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { colors, font, motion } from '../theme';
import { haptic, sfx } from '../sfx';
import Icon, { IconName } from './Icon';

const TAB_DEFS: { id: number; icon: IconName; label: string }[] = [
  { id: 0, icon: 'home', label: 'Learn' },
  { id: 1, icon: 'cards', label: 'Practice' },
  { id: 2, icon: 'user', label: 'Profile' },
];

export function TabBar({ tab, onTab }: { tab: number; onTab: (i: number) => void }) {
  return (
    <View style={styles.bar}>
      {TAB_DEFS.map((t) => (
        <TabItem key={t.id} def={t} active={tab === t.id}
          onPress={() => { if (tab !== t.id) { sfx('tap'); haptic('light'); onTab(t.id); } }} />
      ))}
    </View>
  );
}

function TabItem({ def, active, onPress }: {
  def: { icon: IconName; label: string }; active: boolean; onPress: () => void;
}) {
  const lift = useSharedValue(active ? 1 : 0);
  React.useEffect(() => {
    lift.value = withTiming(active ? 1 : 0, motion.spring);
  }, [active, lift]);
  const bubble = useAnimatedStyle(() => ({
    transform: [
      { translateY: lift.value * -2 },
      { scale: 1 + lift.value * 0.06 },
    ],
  }));
  return (
    <Pressable style={styles.item} onPress={onPress}>
      <Animated.View style={[styles.bubble, active && styles.bubbleActive, bubble]}>
        <Icon name={def.icon} size={22} color={active ? '#fff' : colors.sand600} />
      </Animated.View>
      <Text style={[styles.label, { color: active ? colors.brand : colors.sand600 }]}>{def.label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 16,
    height: 66,
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.hairline,
    flexDirection: 'row',
    padding: 6,
    shadowColor: '#1F2A37',
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 14 },
    elevation: 10,
    zIndex: 30,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    borderRadius: 18,
  },
  bubble: {
    width: 42,
    height: 30,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubbleActive: {
    backgroundColor: colors.brand,
  },
  label: {
    fontFamily: font.extra,
    fontSize: 11.5,
    letterSpacing: 0.2,
  },
});
