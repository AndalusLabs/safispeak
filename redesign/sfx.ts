/* SafiSpeak redesign — sound effects + haptics, gated by Settings.
   Mirrors the prototype's sfx()/haptic() globals. The synth blips
   (tap/swipe/flip) have no bundled samples, so they are haptic-only;
   correct/wrong/win use the existing mp3 assets. */

import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

let soundOn = true;
let hapticsOn = true;

export function setSfxGates(gates: { sound: boolean; haptics: boolean }) {
  soundOn = gates.sound;
  hapticsOn = gates.haptics;
}

const SAMPLES: Partial<Record<SfxKind, number>> = {
  correct: require('../assets/sounds/correct.mp3'),
  wrong: require('../assets/sounds/wrong.mp3'),
  win: require('../assets/sounds/winning.mp3'),
};

export type SfxKind = 'tap' | 'swipe' | 'flip' | 'correct' | 'wrong' | 'win';

const cache = new Map<SfxKind, Audio.Sound>();

export async function sfx(kind: SfxKind) {
  if (!soundOn) return;
  const src = SAMPLES[kind];
  if (!src) return;
  try {
    let sound = cache.get(kind);
    if (!sound) {
      const created = await Audio.Sound.createAsync(src, { shouldPlay: false });
      sound = created.sound;
      cache.set(kind, sound);
    }
    await sound.replayAsync();
  } catch {
    // sound is decorative — never let it crash the app
  }
}

export type HapticKind = 'light' | 'medium' | 'heavy' | 'success' | 'error';

export function haptic(kind: HapticKind = 'light') {
  if (!hapticsOn || Platform.OS === 'web') return;
  try {
    switch (kind) {
      case 'light':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case 'medium':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'heavy':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
      case 'success':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case 'error':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;
    }
  } catch {
    // ignore
  }
}

export function shuffle<T>(arr: readonly T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
