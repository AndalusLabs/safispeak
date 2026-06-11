/* SafiSpeak redesign — gradient + zellige backgrounds via react-native-svg
   (the app does not bundle expo-linear-gradient). */

import React from 'react';
import { StyleSheet } from 'react-native';
import Svg, {
  Defs, G, LinearGradient, Pattern, RadialGradient, Rect, Stop,
} from 'react-native-svg';
import { ZELLIGE_TILE, colors } from '../theme';

/* hero: linear-gradient(155deg, #0B7A4F → #00A86B) + 8-point star zellige at 9% white */
export function HeroBackground() {
  return (
    <Svg style={StyleSheet.absoluteFillObject} width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
      <Defs>
        <LinearGradient id="herograd" x1="0%" y1="0%" x2="46%" y2="100%">
          <Stop offset="0" stopColor={colors.heroGradFrom} />
          <Stop offset="1" stopColor={colors.heroGradTo} />
        </LinearGradient>
        <Pattern id="zellige" width={ZELLIGE_TILE} height={ZELLIGE_TILE} patternUnits="userSpaceOnUse">
          <G fill="none" stroke="#ffffff" strokeOpacity={0.09} strokeWidth={1.5}>
            <Rect x={14} y={14} width={28} height={28} />
            <Rect x={14} y={14} width={28} height={28} transform="rotate(45 28 28)" />
          </G>
        </Pattern>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#herograd)" />
      <Rect width="100%" height="100%" fill="url(#zellige)" />
    </Svg>
  );
}

/* radial cream glow, used by onboarding (#FFF7E3 @18%) and celebration (#FFF3D6 @26%) */
export function RadialGlowBackground({ inner, cy = '18%' }: { inner: string; cy?: string }) {
  return (
    <Svg style={StyleSheet.absoluteFillObject} width="100%" height="100%">
      <Defs>
        <RadialGradient id="glow" cx="50%" cy={cy} r="70%">
          <Stop offset="0" stopColor={inner} />
          <Stop offset="1" stopColor={colors.appBg} />
        </RadialGradient>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#glow)" />
    </Svg>
  );
}
