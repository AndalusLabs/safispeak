/* SafiSpeak redesign — lesson data + quiz builder (ported from screens-lesson.jsx). */

import { shuffle } from './sfx';

export type Word = { d: string; e: string; ph: string };
export type Lesson = { id: number; title: string; sub: string; words: Word[] };
export type Unit = { id: number; title: string; lessons: Lesson[] };

export const UNITS: Unit[] = [
  { id: 0, title: 'First words', lessons: [
    { id: 0, title: 'Greetings', sub: 'Your first words', words: [
      { d: 'Salam', e: 'Hello', ph: 'sa-LAAM' },
      { d: 'Labas?', e: 'How are you?', ph: 'la-BAS' },
      { d: 'Bikhir', e: "I'm fine", ph: 'bi-KHEER' },
    ]},
    { id: 1, title: 'Politeness', sub: 'Make friends fast', words: [
      { d: 'Chokran', e: 'Thank you', ph: 'shok-RAN' },
      { d: 'Afak', e: 'Please', ph: 'a-FAK' },
      { d: 'Smahli', e: 'Excuse me', ph: 'smah-LEE' },
    ]},
    { id: 2, title: 'Yes, no & okay', sub: 'Tiny words, big power', words: [
      { d: 'Wakha', e: 'Okay', ph: 'WA-kha' },
      { d: 'Iyeh', e: 'Yes', ph: 'ee-YEH' },
      { d: 'La', e: 'No', ph: 'LAA' },
    ]},
    { id: 3, title: 'Goodbyes', sub: 'Leave like a local', words: [
      { d: 'Bslama', e: 'Goodbye', ph: 'bes-LAA-ma' },
      { d: 'Thella', e: 'Take care', ph: 't-HEL-la' },
      { d: 'Ghedda', e: 'Tomorrow', ph: 'GHED-da' },
    ]},
    { id: 4, title: 'At the café', sub: 'Order like you mean it', words: [
      { d: 'Atay', e: 'Mint tea', ph: 'a-TAY' },
      { d: 'Qahwa', e: 'Coffee', ph: 'QAH-wa' },
      { d: 'Zwin', e: 'Delicious / nice', ph: 'ZWEEN' },
    ]},
  ]},
  { id: 1, title: 'Everyday life', lessons: [
    { id: 5, title: 'Numbers 1–3', sub: 'Count like a pro', words: [
      { d: 'Wahed', e: '1', ph: 'WA-hed' },
      { d: 'Jouj', e: '2', ph: 'JOOJ' },
      { d: 'Tlata', e: '3', ph: 'TLA-ta' },
    ]},
    { id: 6, title: 'Numbers 4–6', sub: 'Keep counting', words: [
      { d: 'Rbaa', e: '4', ph: 'reb-AA' },
      { d: 'Khamsa', e: '5', ph: 'KHAM-sa' },
      { d: 'Setta', e: '6', ph: 'SET-ta' },
    ]},
    { id: 7, title: 'Your people', sub: 'Family & friends', words: [
      { d: 'Khouya', e: 'My brother', ph: 'KHOO-ya' },
      { d: 'Khti', e: 'My sister', ph: 'KH-tee' },
      { d: 'Sahbi', e: 'My friend', ph: 'SAH-bee' },
    ]},
    { id: 8, title: 'At the market', sub: 'Fresh & local', words: [
      { d: 'Souk', e: 'Market', ph: 'SOOK' },
      { d: 'Khodra', e: 'Vegetables', ph: 'KHO-dra' },
      { d: 'Fakya', e: 'Fruit', ph: 'FAK-ya' },
    ]},
    { id: 9, title: 'How much?', sub: 'Bargain time', words: [
      { d: 'Bchhal?', e: 'How much?', ph: 'bish-HAL' },
      { d: 'Ghali', e: 'Expensive', ph: 'GHA-lee' },
      { d: 'Rkhis', e: 'Cheap', ph: 'r-KHEES' },
    ]},
  ]},
  { id: 2, title: 'Getting around', lessons: [
    { id: 10, title: 'Taxi talk', sub: 'Ride like a local', words: [
      { d: 'Taksi', e: 'Taxi', ph: 'TAK-see' },
      { d: 'Yallah', e: "Let's go", ph: 'YAL-lah' },
      { d: 'Wqef', e: 'Stop', ph: 'w-QEF' },
    ]},
    { id: 11, title: 'Directions', sub: 'Find your way', words: [
      { d: 'Nishan', e: 'Straight ahead', ph: 'ni-SHAN' },
      { d: 'Limen', e: 'To the right', ph: 'LEE-men' },
      { d: 'Liser', e: 'To the left', ph: 'LEE-ser' },
    ]},
    { id: 12, title: 'Days', sub: 'What day is it?', words: [
      { d: 'Lyouma', e: 'Today', ph: 'l-YOO-ma' },
      { d: 'Lbareh', e: 'Yesterday', ph: 'l-BA-reh' },
      { d: 'Simana', e: 'Week', ph: 'see-MA-na' },
    ]},
    { id: 13, title: 'Time', sub: 'Right on time', words: [
      { d: 'Daba', e: 'Now', ph: 'DA-ba' },
      { d: 'Men baad', e: 'Later', ph: 'men-BAAD' },
      { d: 'Bekri', e: 'Early', ph: 'BEK-ree' },
    ]},
    { id: 14, title: 'Weather', sub: 'Rain or shine', words: [
      { d: 'Shta', e: 'Rain', ph: 'SHTA' },
      { d: 'Shems', e: 'Sun', ph: 'SHEMS' },
      { d: 'Berd', e: 'Cold', ph: 'BERD' },
    ]},
  ]},
];

export const LESSONS: Lesson[] = UNITS.flatMap((u) => u.lessons);
export const ALL_WORDS: Word[] = LESSONS.flatMap((l) => l.words);

/* the unit the learner is currently working through */
export function currentUnit(completed: number[]): Unit {
  for (const u of UNITS) {
    if (u.lessons.some((l) => !completed.includes(l.id))) return u;
  }
  return UNITS[UNITS.length - 1];
}

export type QuizQuestion = {
  /* prompt renders as: pre <bold>“word”</bold> ? */
  promptPre: string;
  promptWord: string;
  promptPost: string;
  options: string[];
  answer: string;
  word: Word;
};

/* ---- mixed exercise session (Duolingo-style) ---- */

export type ChoiceExercise = QuizQuestion & { kind: 'choice' };
export type ListenExercise = { kind: 'listen'; word: Word; options: string[]; answer: string };
export type MatchExercise = { kind: 'match'; pairs: Word[] };
export type Exercise = ChoiceExercise | ListenExercise | MatchExercise;

/* a lesson session: 4 choice + one listen per word + one match-the-pairs,
   shuffled. Wrong answers are re-queued by the quiz screen. */
export function makeSession(lesson: Lesson): Exercise[] {
  const choices: Exercise[] = makeQuiz(lesson).map((q) => ({ kind: 'choice' as const, ...q }));
  const listens: Exercise[] = lesson.words.map((w) => ({
    kind: 'listen' as const,
    word: w,
    options: shuffle([w.d, ...shuffle(ALL_WORDS.filter((p) => p.d !== w.d)).slice(0, 3).map((p) => p.d)]),
    answer: w.d,
  }));
  const match: Exercise = { kind: 'match', pairs: lesson.words };
  return shuffle([...choices, ...listens, match]);
}

export function makeQuiz(lesson: Lesson): QuizQuestion[] {
  const qs: QuizQuestion[] = [];
  lesson.words.forEach((w, i) => {
    const toD = i % 2 === 0;
    const distract = shuffle(ALL_WORDS.filter((p) => p.d !== w.d)).slice(0, 3);
    qs.push(toD
      ? { promptPre: 'How do you say ', promptWord: `“${w.e}”`, promptPost: '?',
          options: shuffle([w.d, ...distract.map((o) => o.d)]), answer: w.d, word: w }
      : { promptPre: 'What does ', promptWord: `“${w.d}”`, promptPost: ' mean?',
          options: shuffle([w.e, ...distract.map((o) => o.e)]), answer: w.e, word: w });
  });
  const w0 = lesson.words[0];
  const extra = shuffle(ALL_WORDS.filter((p) => p.d !== w0.d)).slice(0, 3);
  qs.push({ promptPre: 'What does ', promptWord: `“${w0.d}”`, promptPost: ' mean?',
    options: shuffle([w0.e, ...extra.map((o) => o.e)]), answer: w0.e, word: w0 });
  return shuffle(qs);
}
