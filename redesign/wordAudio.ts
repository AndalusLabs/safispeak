/* SafiSpeak redesign — bundled Darija word audio (generated once with Gemini TTS
   by scripts/generate-voices.js). Keys match the `d` field in lessons.ts. */

import { Audio } from 'expo-av';

export const WORD_AUDIO: Record<string, number> = {
  'Salam': require('../assets/sounds/words/salam.wav'),
  'Labas?': require('../assets/sounds/words/labas.wav'),
  'Bikhir': require('../assets/sounds/words/bikhir.wav'),
  'Chokran': require('../assets/sounds/words/chokran.wav'),
  'Afak': require('../assets/sounds/words/afak.wav'),
  'Smahli': require('../assets/sounds/words/smahli.wav'),
  'Wakha': require('../assets/sounds/words/wakha.wav'),
  'Iyeh': require('../assets/sounds/words/iyeh.wav'),
  'La': require('../assets/sounds/words/la.wav'),
  'Bslama': require('../assets/sounds/words/bslama.wav'),
  'Thella': require('../assets/sounds/words/thella.wav'),
  'Ghedda': require('../assets/sounds/words/ghedda.wav'),
  'Atay': require('../assets/sounds/words/atay.wav'),
  'Qahwa': require('../assets/sounds/words/qahwa.wav'),
  'Zwin': require('../assets/sounds/words/zwin.wav'),
  // Unit 2 — Everyday life
  'Wahed': require('../assets/sounds/words/wahed.wav'),
  'Jouj': require('../assets/sounds/words/jouj.wav'),
  'Tlata': require('../assets/sounds/words/tlata.wav'),
  'Rbaa': require('../assets/sounds/words/rbaa.wav'),
  'Khamsa': require('../assets/sounds/words/khamsa.wav'),
  'Setta': require('../assets/sounds/words/setta.wav'),
  'Khouya': require('../assets/sounds/words/khouya.wav'),
  'Khti': require('../assets/sounds/words/khti.wav'),
  'Sahbi': require('../assets/sounds/words/sahbi.wav'),
  'Souk': require('../assets/sounds/words/souk.wav'),
  'Khodra': require('../assets/sounds/words/khodra.wav'),
  'Fakya': require('../assets/sounds/words/fakya.wav'),
  'Bchhal?': require('../assets/sounds/words/bchhal.wav'),
  'Ghali': require('../assets/sounds/words/ghali.wav'),
  'Rkhis': require('../assets/sounds/words/rkhis.wav'),
  // Unit 3 — Getting around
  'Taksi': require('../assets/sounds/words/taksi.wav'),
  'Yallah': require('../assets/sounds/words/yallah.wav'),
  'Wqef': require('../assets/sounds/words/wqef.wav'),
  'Nishan': require('../assets/sounds/words/nishan.wav'),
  'Limen': require('../assets/sounds/words/limen.wav'),
  'Liser': require('../assets/sounds/words/liser.wav'),
  'Lyouma': require('../assets/sounds/words/lyouma.wav'),
  'Lbareh': require('../assets/sounds/words/lbareh.wav'),
  'Simana': require('../assets/sounds/words/simana.wav'),
  'Daba': require('../assets/sounds/words/daba.wav'),
  'Men baad': require('../assets/sounds/words/menbaad.wav'),
  'Bekri': require('../assets/sounds/words/bekri.wav'),
  'Shta': require('../assets/sounds/words/shta.wav'),
  'Shems': require('../assets/sounds/words/shems.wav'),
  'Berd': require('../assets/sounds/words/berd.wav'),
};

const cache = new Map<string, Audio.Sound>();
let current: Audio.Sound | null = null;

/* Play the native pronunciation of a Darija word. Safe to call for any
   string — unknown words are silently ignored. Not gated by the sfx
   setting: hearing the word is core content, not a sound effect. */
export async function playWord(d: string) {
  const src = WORD_AUDIO[d];
  if (!src) return;
  try {
    let sound = cache.get(d);
    if (!sound) {
      const created = await Audio.Sound.createAsync(src, { shouldPlay: false });
      sound = created.sound;
      cache.set(d, sound);
    }
    if (current && current !== sound) {
      await current.stopAsync().catch(() => {});
    }
    current = sound;
    await sound.replayAsync();
  } catch {
    // audio is best-effort; never crash gameplay
  }
}
