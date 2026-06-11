/* SafiSpeak redesign — 2.1px-stroke rounded icon set, ported from app-ui.jsx. */

import React from 'react';
import Svg, { Circle, G, Path, Rect } from 'react-native-svg';

export type IconName =
  | 'home' | 'cards' | 'user' | 'gear' | 'flame' | 'star' | 'book' | 'target'
  | 'chevL' | 'chevR' | 'chevU' | 'check' | 'x' | 'lock' | 'volume' | 'bell'
  | 'buzz' | 'refresh' | 'pencil' | 'arrowR' | 'play' | 'trophy';

function glyph(name: IconName, color: string) {
  switch (name) {
    case 'home':
      return <Path d="M4 11.4 12 4.4l8 7M6.3 9.7v9.9h11.4V9.7" />;
    case 'cards':
      return (
        <G>
          <Rect x={8.2} y={3.4} width={12} height={15.5} rx={2.4} transform="rotate(8 14 11)" />
          <Rect x={3.6} y={5.2} width={12} height={15.5} rx={2.4} />
        </G>
      );
    case 'user':
      return (
        <G>
          <Circle cx={12} cy={8} r={3.7} />
          <Path d="M5 20.2c1.2-3.9 4-5.7 7-5.7s5.8 1.8 7 5.7" />
        </G>
      );
    case 'gear':
      return (
        <G>
          <Circle cx={12} cy={12} r={3.1} />
          <Path d="M12 2.8v2.6M12 18.6v2.6M21.2 12h-2.6M5.4 12H2.8M18.5 5.5l-1.9 1.9M7.4 16.6l-1.9 1.9M18.5 18.5l-1.9-1.9M7.4 7.4 5.5 5.5" />
        </G>
      );
    case 'flame':
      return <Path fill={color} stroke="none" d="M12 2.4c.7 4.2 5 6 5 10.6a5 5 0 0 1-10 0c0-2.4 1.5-3.9 2.5-5.5.9-1.4 2-2.9 2.5-5.1zm0 14.9a2.3 2.3 0 0 0 2.3-2.3c0-1.5-1.2-2.2-2.3-3.8-1.1 1.6-2.3 2.3-2.3 3.8A2.3 2.3 0 0 0 12 17.3z" />;
    case 'star':
      return <Path fill={color} stroke="none" d="m12 2.8 2.7 5.6 6.1.8-4.5 4.2 1.2 6L12 16.5l-5.5 2.9 1.2-6L3.2 9.2l6.1-.8L12 2.8z" />;
    case 'book':
      return <Path d="M4.5 5.5A2.5 2.5 0 0 1 7 3h12.5v15H7a2.5 2.5 0 0 0-2.5 2.5v-15zM7 3v15M19.5 18v3H7" />;
    case 'target':
      return (
        <G>
          <Circle cx={12} cy={12} r={8.2} />
          <Circle cx={12} cy={12} r={4.4} />
          <Circle cx={12} cy={12} r={1.2} fill={color} stroke="none" />
        </G>
      );
    case 'chevL':
      return <Path d="M14.6 5.4 8 12l6.6 6.6" />;
    case 'chevR':
      return <Path d="M9.4 5.4 16 12l-6.6 6.6" />;
    case 'chevU':
      return <Path d="M5.4 14.6 12 8l6.6 6.6" />;
    case 'check':
      return <Path d="m5 12.6 4.4 4.4L19 7.4" />;
    case 'x':
      return <Path d="M6 6l12 12M18 6 6 18" />;
    case 'lock':
      return (
        <G>
          <Rect x={5.6} y={10.4} width={12.8} height={9.6} rx={2.6} />
          <Path d="M8.6 10.4V8a3.4 3.4 0 0 1 6.8 0v2.4" />
        </G>
      );
    case 'volume':
      return (
        <G>
          <Path fill={color} stroke="none" d="M4 9.4v5.2h3.4L12 19V5L7.4 9.4H4z" />
          <Path d="M15.2 9.2a4.2 4.2 0 0 1 0 5.6M17.6 6.7a8 8 0 0 1 0 10.6" />
        </G>
      );
    case 'bell':
      return (
        <G>
          <Path d="M6.4 16v-5.2a5.6 5.6 0 0 1 11.2 0V16l1.6 2.6H4.8L6.4 16z" />
          <Path d="M10 21.2a2.1 2.1 0 0 0 4 0" />
        </G>
      );
    case 'buzz':
      return (
        <G>
          <Rect x={8.2} y={3.4} width={7.6} height={17.2} rx={2.2} />
          <Path d="M3.6 9c-1 2-1 4 0 6M20.4 9c1 2 1 4 0 6" />
        </G>
      );
    case 'refresh':
      return <Path d="M19.6 5.4v4.2h-4.2M4.4 18.6v-4.2h4.2M5 9.8a7.4 7.4 0 0 1 13.6-1.6M19 14.2A7.4 7.4 0 0 1 5.4 15.8" />;
    case 'pencil':
      return <Path d="m4.6 19.4.9-3.7L16.6 4.6a2 2 0 0 1 2.8 2.8L8.3 18.5l-3.7.9z" />;
    case 'arrowR':
      return <Path d="M4.8 12h14M13.4 6.4l5.6 5.6-5.6 5.6" />;
    case 'play':
      return <Path fill={color} stroke="none" d="M8.4 5.6v12.8L18.6 12 8.4 5.6z" />;
    case 'trophy':
      return (
        <G>
          <Path d="M8 4h8v5.2a4 4 0 0 1-8 0V4zM8 5.4H4.8a3.2 3.2 0 0 0 3.4 3.4M16 5.4h3.2a3.2 3.2 0 0 1-3.4 3.4" />
          <Path d="M12 13.2v3.2M8.8 20h6.4M12 16.4c-1.6 0-2.4 1.2-2.4 3.6h4.8c0-2.4-.8-3.6-2.4-3.6z" />
        </G>
      );
  }
}

export function Icon({ name, size = 22, color = '#333333' }: { name: IconName; size?: number; color?: string }) {
  return (
    <Svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color}
      strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round">
      {glyph(name, color)}
    </Svg>
  );
}

export default Icon;
