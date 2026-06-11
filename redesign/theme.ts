/* SafiSpeak redesign — design tokens.
   Mapped 1:1 from design_handoff_safispeak_redesign/tokens + styles. */

import { Easing } from 'react-native-reanimated';

export const colors = {
  // surfaces
  appBg: '#FBF6EC',
  card: '#FFFFFF',
  hairline: '#F0E9D8',

  // brand greens
  brand: '#00A86B',
  brandPress: '#00845A',
  brandDeep: '#0B6B45',
  heroGradFrom: '#0B7A4F',
  heroGradTo: '#00A86B',

  // gold
  gold: '#FFC83D',
  gold500: '#FFC107',
  goldTint: '#FFF3D6',
  goldText: '#B8860B',

  // red (errors / fez)
  red: '#E14B3B',
  redDark: '#B5392C',
  redTint: '#FDE3DF',

  // success tint
  greenTint: '#DDF2E7',
  greenText: '#0E6B45',

  // ink
  ink900: '#1F2A37',
  ink800: '#111827',
  ink700: '#333333',
  ink600: '#4B5563',

  // sands (muted)
  sand600: '#A39B85',
  sand400: '#C5BCA4',
  sand300: '#DDD4C0',
  sandLocked: '#B9B09A',
  sandFill: '#EFE8D8',
  pathDotted: '#DDD5C2',

  // streak flame
  flame: '#C2410C',
  flameTint: '#FFE8DC',

  // misc accents
  blueText: '#1D4ED8',
  blueTint: '#E0EDFF',
  amber: '#D97706',
  optionBorder: '#EFE7D4',
} as const;

/* Baloo 2 — weight → bundled font file */
export const font = {
  regular: 'Baloo2-Regular',
  medium: 'Baloo2-Medium',
  semibold: 'Baloo2-SemiBold',
  bold: 'Baloo2-Bold',
  extra: 'Baloo2-ExtraBold',
} as const;

export const radius = {
  card: 18,
  cardLg: 22,
  cardXl: 26,
  button: 18,
  pill: 999,
  tabbar: 24,
  sheet: 30,
} as const;

/* Motion — the prototype's bezier curves, usable in withTiming */
export const motion = {
  spring: { duration: 480, easing: Easing.bezier(0.3, 1.4, 0.45, 1) },
  calm: { duration: 230, easing: Easing.bezier(0.25, 0.8, 0.3, 1) },
  fast: { duration: 160, easing: Easing.bezier(0.4, 0, 0.2, 1) },
  bounce: Easing.bezier(0.34, 1.56, 0.64, 1),
  easeOut: Easing.bezier(0.22, 1, 0.36, 1),
} as const;

export const ZELLIGE_TILE = 56;
