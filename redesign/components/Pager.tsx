/* SafiSpeak redesign — horizontal snap pager (the prototype's Swiper).
   Direction-locked (|dx| > |dy|×1.2 after 7px), rubber-band at the ends,
   commits at 22% width or velocity. */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { motion } from '../theme';
import { haptic, sfx } from '../sfx';

export function Pager({
  index, count, onIndex, width, children, style,
}: {
  index: number;
  count: number;
  onIndex: (i: number) => void;
  width: number;
  children: React.ReactNode;
  style?: object;
}) {
  const pos = useSharedValue(-index * width);
  const indexSv = useSharedValue(index);

  React.useEffect(() => {
    indexSv.value = index;
    pos.value = withTiming(-index * width, motion.spring);
  }, [index, width, pos, indexSv]);

  const commit = React.useCallback((next: number) => {
    if (next !== index) { sfx('swipe'); haptic('light'); onIndex(next); }
  }, [index, onIndex]);

  const pan = Gesture.Pan()
    .activeOffsetX([-7, 7])
    .failOffsetY([-12, 12])
    .onUpdate((e) => {
      let d = e.translationX;
      const i = indexSv.value;
      if ((i === 0 && d > 0) || (i === count - 1 && d < 0)) d *= 0.32;
      pos.value = -i * width + d;
    })
    .onEnd((e) => {
      const i = indexSv.value;
      const d = e.translationX;
      const go = Math.abs(d) > width * 0.22 || Math.abs(e.velocityX) > 450;
      let next = i;
      if (go && Math.abs(d) > 12) {
        next = Math.max(0, Math.min(count - 1, i + (d < 0 ? 1 : -1)));
      }
      pos.value = withTiming(-next * width, motion.spring);
      if (next !== i) runOnJS(commit)(next);
    });

  const track = useAnimatedStyle(() => ({
    transform: [{ translateX: pos.value }],
  }));

  return (
    <GestureDetector gesture={pan}>
      <View style={[styles.clip, style]}>
        <Animated.View style={[styles.track, { width: width * count }, track]}>
          {React.Children.map(children, (child, i) => (
            <View key={i} style={{ width, height: '100%', overflow: 'hidden' }}>{child}</View>
          ))}
        </Animated.View>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  clip: {
    flex: 1,
    overflow: 'hidden',
  },
  track: {
    flexDirection: 'row',
    height: '100%',
  },
});
