/* SafiSpeak — one-time batch: generate Darija word audio with Gemini TTS.
   Usage: node scripts/generate-voices.js
   Reads API keys (one per line) from ../../key.txt relative to the project root,
   writes 24kHz mono WAVs to assets/sounds/words/.

   Words must stay in sync with redesign/lessons.ts. */

const fs = require('fs');
const path = require('path');

const MODEL = process.env.TTS_MODEL || 'gemini-3.1-flash-tts-preview';
const VOICE = 'Kore';
const OUT_DIR = path.join(__dirname, '..', 'assets', 'sounds', 'words');
const KEYS_FILE = path.join(__dirname, '..', '..', '..', 'key.txt');
const DELAY_MS = 6500; // stay under free-tier requests-per-minute

const WORDS = [
  { d: 'Salam', file: 'salam' },
  { d: 'Labas?', file: 'labas' },
  { d: 'Bikhir', file: 'bikhir' },
  { d: 'Chokran', file: 'chokran' },
  { d: 'Afak', file: 'afak' },
  { d: 'Smahli', file: 'smahli' },
  { d: 'Wakha', file: 'wakha' },
  { d: 'Iyeh', file: 'iyeh' },
  { d: 'La', file: 'la' },
  { d: 'Bslama', file: 'bslama' },
  { d: 'Thella', file: 'thella' },
  { d: 'Ghedda', file: 'ghedda' },
  { d: 'Atay', file: 'atay' },
  { d: 'Qahwa', file: 'qahwa' },
  { d: 'Zwin', file: 'zwin' },
  // Unit 2 — Everyday life
  // numbers: prompt with the digit so Gemini uses its own Darija counting
  { d: 'Wahed', file: 'wahed', say: 'the number 1' },
  { d: 'Jouj', file: 'jouj', say: 'the number 2' },
  { d: 'Tlata', file: 'tlata', say: 'the number 3' },
  { d: 'Rbaa', file: 'rbaa', say: 'the number 4' },
  { d: 'Khamsa', file: 'khamsa', say: 'the number 5' },
  { d: 'Setta', file: 'setta', say: 'the number 6' },
  { d: 'Khouya', file: 'khouya' },
  { d: 'Khti', file: 'khti' },
  { d: 'Sahbi', file: 'sahbi' },
  { d: 'Souk', file: 'souk' },
  { d: 'Khodra', file: 'khodra' },
  { d: 'Fakya', file: 'fakya' },
  { d: 'Bchhal?', file: 'bchhal' },
  { d: 'Ghali', file: 'ghali' },
  { d: 'Rkhis', file: 'rkhis' },
  // Unit 3 — Getting around
  { d: 'Taksi', file: 'taksi' },
  { d: 'Yallah', file: 'yallah' },
  { d: 'Wqef', file: 'wqef' },
  { d: 'Nishan', file: 'nishan' },
  { d: 'Limen', file: 'limen' },
  { d: 'Liser', file: 'liser' },
  { d: 'Lyouma', file: 'lyouma' },
  { d: 'Lbareh', file: 'lbareh' },
  { d: 'Simana', file: 'simana' },
  { d: 'Daba', file: 'daba' },
  { d: 'Men baad', file: 'menbaad' },
  { d: 'Bekri', file: 'bekri' },
  { d: 'Shta', file: 'shta' },
  { d: 'Shems', file: 'shems' },
  { d: 'Berd', file: 'berd' },
];

const keys = fs.readFileSync(KEYS_FILE, 'utf8')
  .split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
let keyIdx = 0;

function wavFromPcm(pcm, rate = 24000, channels = 1, bits = 16) {
  const blockAlign = channels * (bits / 8);
  const byteRate = rate * blockAlign;
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(rate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bits, 34);
  header.write('data', 36);
  header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]);
}

async function generate(word, attempt = 0) {
  const key = keys[keyIdx % keys.length];
  const text = word.say
    ? `Say only ${word.say} in Moroccan Darija — slowly and clearly, with warm friendly intonation, like a language teacher. Say nothing else.`
    : `Say this single Moroccan Darija word slowly and clearly, with warm friendly intonation, like a language teacher. Say only the word itself: ${word.d}`;
  const body = {
    contents: [{ parts: [{ text }] }],
    generationConfig: {
      responseModalities: ['AUDIO'],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICE } } },
    },
  };
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
    {
      method: 'POST',
      headers: { 'x-goog-api-key': key, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
  );
  if (res.status === 429 || res.status === 503) {
    if (attempt >= keys.length * 3) throw new Error(`rate-limited on all keys for ${word.d}`);
    keyIdx++;
    console.log(`  rate limit (${res.status}) — switching key, retrying in 15s...`);
    await new Promise((r) => setTimeout(r, 15000));
    return generate(word, attempt + 1);
  }
  if (res.status === 403) {
    // key revoked/denied — drop it from the pool and try the next one
    const bad = keys.indexOf(key);
    if (bad !== -1) keys.splice(bad, 1);
    if (keys.length === 0) throw new Error('all API keys are denied (403)');
    console.log(`  key denied (403) — dropped it, ${keys.length} key(s) left, retrying...`);
    return generate(word, attempt + 1);
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const json = await res.json();
  const part = json.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
  if (!part) throw new Error(`no audio in response for ${word.d}`);
  return Buffer.from(part.inlineData.data, 'base64');
}

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  for (const word of WORDS) {
    const out = path.join(OUT_DIR, `${word.file}.wav`);
    // real clips are >50KB; small files are silent placeholders to replace
    if (fs.existsSync(out) && fs.statSync(out).size > 15000) {
      console.log(`skip (exists): ${word.file}.wav`);
      continue;
    }
    process.stdout.write(`generating "${word.d}" -> ${word.file}.wav ... `);
    const pcm = await generate(word);
    fs.writeFileSync(out, wavFromPcm(pcm));
    console.log(`ok (${Math.round(pcm.length / 1024)} KB, ~${(pcm.length / 48000).toFixed(1)}s)`);
    await new Promise((r) => setTimeout(r, DELAY_MS));
  }
  console.log('done. all word audio written to assets/sounds/words/');
})().catch((e) => {
  console.error('FAILED:', e.message);
  process.exit(1);
});
