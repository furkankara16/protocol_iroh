// ── DATA CONSTANTS ──
// All static data, schemas, and configuration used across the app.

import { normalizeDateStr } from './utils.js';

export const STORAGE_KEY = 'iroh_protocol_data';

export const monthContext = {
  1: "Novelty phase. High motivation. Enjoy it \u2014 but don't trust it. It's not discipline yet, it's enthusiasm.",
  2: "The resistance. Motivation drops. The routines feel mechanical. This is the most important month. Most people quit here.",
  3: "The valley. You may feel more emotionally volatile than before. This is a positive sign \u2014 you're feeling things you previously suppressed. Stay the course.",
  4: "Stabilization. The routines start to feel like yours, not like something you're performing.",
  5: "First integration. You'll notice the gap between stimulus and response in real time \u2014 not just in review.",
  6: "First integration continues. A new kind of confidence that doesn't need to announce itself.",
  7: "Deepening. The practices become a genuine source of pleasure, not obligation.",
  8: "Deepening continues. You're becoming someone you didn't plan. The archetype is a compass, not a mould.",
  9: "Generativity. You begin to orient outward. Others start coming to you \u2014 for advice, for steadiness, for presence.",
  10: "Generativity continues. The shift from self-construction to contribution.",
  11: "Integration. Not completion \u2014 the work is permanent. But the foundation is built.",
  12: "Integration. You stop thinking about 'becoming' anything. You are simply operating from a broader base."
};

export const monthlyChallenges = {
  1: "Eat alone at a restaurant. No phone.",
  2: "Have a conversation with someone you'd normally avoid \u2014 a stranger, someone intimidating, someone you disagree with. Seek to understand, not to persuade.",
  3: "24-hour fast (water only).",
  4: "Write a letter to someone you've wronged. Send it or don't \u2014 the writing is the practice.",
  5: "Spend a full day in silence. No speech, no texting, no social media.",
  6: "Do something you're bad at in public \u2014 dance class, open mic, art class.",
  7: "Cold immersion \u2014 lake, river, or ice bath. 2 minutes minimum.",
  8: "Revisit the letter from month 4. Write another if needed.",
  9: "Mentor someone. Teach a skill you have to someone who wants it.",
  10: "Spend 48 hours without any screen.",
  11: "Have a difficult conversation you've been postponing.",
  12: "Sit with your journal from the past year. Read it cover to cover. Write a single page: who were you, who are you now, what remains."
};

export const readingList = [
  { id: 1, title: "Meditations", author: "Marcus Aurelius", translation: "Hays", months: "1\u20132", instruction: "One entry per morning. Open to any page." },
  { id: 2, title: "Tao Te Ching", author: "Lao Tzu", translation: "Mitchell", months: "2\u20133", instruction: "One chapter per morning. 81 short chapters." },
  { id: 3, title: "The Body Keeps the Score", author: "Bessel van der Kolk", translation: null, months: "3\u20134", instruction: "One chapter per week." },
  { id: 4, title: "Man's Search for Meaning", author: "Viktor Frankl", translation: null, months: "5", instruction: "Read in two sittings." },
  { id: 5, title: "The Analects", author: "Confucius", translation: "Slingerland", months: "6\u20137", instruction: "One section per week with Sunday study." },
  { id: 6, title: "Letting Go", author: "David Hawkins", translation: null, months: "7\u20138", instruction: "Practice the technique as you encounter it." },
  { id: 7, title: "The Master and His Emissary", author: "Iain McGilchrist", translation: null, months: "9\u201312", instruction: "Long book. No rush. It's the capstone." }
];

export const DEFAULT_MORNING_TEMPLATE = [
  { key: 'noPhone', label: 'No phone \u2014 first 20 minutes', description: "Keep the phone completely out of reach for the first 20 minutes after waking. It sets the tone that you lead the day instead of reacting to it." },
  { key: 'coldExposure', label: 'Cold exposure', description: "Use 30-90 seconds of cold water on the face and forearms, or finish with a brief cold shower. A short hit of discomfort builds steadiness before harder things arrive." },
  { key: 'breathwork', label: 'Breathwork \u2014 4-7-8 \u00d7 6 cycles', description: "Inhale for 4 seconds, hold for 7, exhale for 8, and repeat for 6 full cycles. Six rounds is enough to reduce noise and create a clean start." },
  { key: 'meditation', label: 'Meditation \u2014 10 min', description: '' },
  { key: 'journaling', label: 'Journaling \u2014 stream of consciousness', description: "Write continuously for 5-10 minutes or one full page without editing, censoring, or rereading. Let the page catch what your mind would otherwise drag through the day." },
  { key: 'philosophyRead', label: 'Philosophy reading \u2014 one passage', description: "Read one short passage slowly and pause to note a single idea or line that matters. Carry that idea with you and let it shape the rest of the morning." }
];

export const DEFAULT_EVENING_TEMPLATE = [
  { key: 'dailyReview', label: 'Daily review \u2014 three questions', description: "Answer the three reflection prompts in a few honest lines before sleep, even if the answers are brief. Honest review turns repetition into learning." },
  { key: 'bodyScan', label: 'Body scan \u2014 10 min', description: "Spend 10 minutes moving attention slowly from toes to head and relaxing tension where you notice it. Releasing stored tension makes rest part of the practice, not an accident." }
];

export const trainingFocus = {
  1: { phase: "Bodyweight Foundations", focus: "Build the habit of three strength sessions a week and make every rep look the same.", session: "Do 3 sessions with 2-4 sets each of push-ups, squats, rows, and planks. Stop while form is still clean.", progression: "Add 1-2 reps per set before making the variation harder.", recovery: "Leave 1-2 reps in reserve and keep off days easy enough that the next session feels welcome." },
  2: { phase: "Bodyweight Foundations", focus: "Increase total work slightly without turning training into a grind.", session: "Keep the same 3 weekly sessions and add one extra set only if recovery and technique still feel steady.", progression: "Progress reps first, then leverage or tempo. Do not chase failure.", recovery: "If soreness hangs around for more than two days, hold volume steady for a week." },
  3: { phase: "Barbell Introduction", focus: "Learn the main lifts with repeatable setup, range, and bar path.", session: "Do 3 sessions and alternate squat, press, and row with squat, bench, and deadlift. Keep the load light enough to move cleanly.", progression: "Add small jumps only when every working set stays technically sound.", recovery: "Film a set or slow down the first rep instead of adding weight too fast." },
  4: { phase: "Barbell Introduction", focus: "Turn technique into a stable routine and make the bar feel familiar.", session: "Stay with 3 sessions and use the same warm-up pattern before each working set so every lift starts the same way.", progression: "Add 2.5-5 lb when the previous session felt crisp. Repeat the load when it did not.", recovery: "Protect sleep and appetite now that external load is rising." },
  5: { phase: "Linear Progression", focus: "Build strength through small, repeatable increases instead of dramatic sessions.", session: "Run 3 sessions centered on squat, press or bench, row, and deadlift with 3-5 working sets on the main lifts.", progression: "Add a small amount to the bar each session if all planned reps were honest and controlled.", recovery: "Rest 2-4 minutes between hard sets so quality stays high." },
  6: { phase: "Linear Progression", focus: "Keep momentum while managing fatigue before it starts to leak into everything else.", session: "Keep the same 3-session structure and keep assistance work minimal so recovery goes to the basics.", progression: "If bar speed drops for multiple sessions, repeat the load once before trying to move up again.", recovery: "Use one lighter walk or mobility day between sessions instead of adding extra lifting." },
  7: { phase: "Linear Progression", focus: "Protect consistency and make strength work feel ordinary rather than dramatic.", session: "Do 3 sessions and prioritize the first two compound lifts of the day. Treat anything after that as optional.", progression: "Add load only when the last rep still looks like the first.", recovery: "End sessions with a little left in the tank so next week is easy to repeat." },
  8: { phase: "Linear Progression", focus: "Consolidate gains and stop confusing variety with progress.", session: "Repeat the same main movements for 3 sessions and keep a short training log so you can see what is actually moving upward.", progression: "Use the smallest jump available. Stable progress beats frequent stalls.", recovery: "If motivation dips, shorten the session but still complete the main work." },
  9: { phase: "Intermediate Structure", focus: "Shift from session-to-session jumps to week-to-week progress.", session: "Train 3-4 times a week and give your main lifts a heavy, moderate, and lighter exposure across the week.", progression: "Improve one variable each week: load, reps, or bar speed.", recovery: "Hard days should feel hard, which means easy days need to stay easy." },
  10: { phase: "Intermediate Structure", focus: "Train with more intention and stop maxing out your recovery budget.", session: "Use 3-4 sessions and let one lift lead the week while the others stay at maintenance or moderate volume.", progression: "Plan increases weekly rather than daily, and take smaller jumps than you think you need.", recovery: "If two lifts stall at once, trim volume slightly before changing everything." },
  11: { phase: "Intermediate Structure", focus: "Balance strength gains with durability so the system still feels sustainable.", session: "Keep the main lifts first, then add a small amount of accessory work only for obvious weak points.", progression: "Push the lifts that are responding and hold steady elsewhere.", recovery: "Protect your joints with full range, controlled lowering, and one easier week if fatigue keeps climbing." },
  12: { phase: "Intermediate Structure", focus: "Finish the year with steadiness and clear proof of what has become normal.", session: "Run the same 3-4 session structure you could realistically keep after the protocol ends.", progression: "Choose conservative weekly increases and value repeatability over testing.", recovery: "Use this month to leave yourself a sustainable next step, not a dramatic finish." }
};

export const emotionWords = [
  { label: "high energy \u00b7 difficult", words: ["angry","anxious","frustrated","overwhelmed","agitated","panicked","irritated","restless","hostile","terrified","manic","defensive"] },
  { label: "low energy \u00b7 difficult", words: ["sad","disappointed","lonely","empty","numb","hopeless","guilty","ashamed","resigned","hollow","depleted","apathetic","melancholic"] },
  { label: "high energy \u00b7 pleasant", words: ["excited","inspired","energized","alive","eager","passionate","elated","curious","amused","proud","playful","determined"] },
  { label: "low energy \u00b7 pleasant", words: ["calm","peaceful","content","grateful","tender","gentle","serene","steady","grounded","warm","safe","relieved","settled"] }
];

// ── EMOTION QUADRANT MAPPING ──
export const QUADRANT_COLORS = ['#b45050', '#6464a0', '#c4a03c', '#5aa078'];
export const QUADRANT_LABELS = ['High energy \u00b7 Difficult', 'Low energy \u00b7 Difficult', 'High energy \u00b7 Pleasant', 'Low energy \u00b7 Pleasant'];
export const QUADRANT_Y_RATIOS = [0.88, 0.63, 0.12, 0.37];

export const emotionQuadrantMap = {};
emotionWords.forEach((group, qi) => {
  group.words.forEach(w => { emotionQuadrantMap[w.toLowerCase()] = qi; });
});

export function getEmotionQuadrant(value) {
  const raw = String(value || '').trim().toLowerCase();
  if (!raw) return -1;
  if (Object.prototype.hasOwnProperty.call(emotionQuadrantMap, raw)) {
    return emotionQuadrantMap[raw];
  }

  const segments = raw.split(/[;,/]+/).map(part => part.trim()).filter(Boolean);
  for (const segment of segments) {
    if (Object.prototype.hasOwnProperty.call(emotionQuadrantMap, segment)) {
      return emotionQuadrantMap[segment];
    }
  }

  const tokens = raw.match(/[a-z']+/g) || [];
  for (const token of tokens) {
    if (Object.prototype.hasOwnProperty.call(emotionQuadrantMap, token)) {
      return emotionQuadrantMap[token];
    }
  }

  return -1;
}

export const meditationProgression = {
  1: { technique: "focused attention", description: "Count each exhale from 1 to 10, then start over. When you lose count, begin again at 1. The practice is the returning, not the counting." },
  2: { technique: "body-anchored awareness", description: "Rest attention on physical sensations \u2014 the weight of your hands, the rhythm of breath in your chest. When the mind pulls away, return to the body. You\u2019re building a home base." },
  3: { technique: "open awareness", description: "Sit with open awareness \u2014 no object, no anchor. Let whatever arises pass without engagement. The point is not calm, but a little more space between impulse and action." }
};

export function getMeditationStage(month) {
  if (month <= 3) return 1;
  if (month <= 6) return 2;
  return 3;
}

export function getTodayPractice(dayOfWeek) {
  const map = {
    0: { type: "philosophy", label: "Philosophy Study", sublabel: "Deep read + written reflection", duration: "60 min", description: "Spend 60 minutes reading one substantial section and writing a short reflection afterward. Write a few lines so the reading becomes thought, not consumption." },
    1: { type: "strength", label: "Strength Training", sublabel: "Compound lifts", duration: "45 min", description: "Do 45 minutes of compound lifts with 3-5 working sets across your main movements. The goal is not drama but repeated proof that you can carry load well." },
    2: { type: "walk", label: "Silent Walk", sublabel: "No headphones, no destination", duration: "30 min", description: "Walk for 30 minutes without headphones, podcasts, or a destination goal. Let your thoughts settle at the pace of your body." },
    3: { type: "strength", label: "Strength Training", sublabel: "Compound lifts", duration: "45 min", description: "Do 45 minutes of compound lifts with 3-5 working sets across your main movements. The goal is not drama but repeated proof that you can carry load well." },
    4: { type: "craft", label: "Craft Practice", sublabel: "Hands-on skill, no audience", duration: "45 min", description: "Spend 45 minutes on one hands-on skill with no posting, sharing, or audience in mind. Skill deepens when your hands work quietly for their own sake." },
    5: { type: "strength", label: "Strength Training", sublabel: "Compound lifts", duration: "45 min", description: "Do 45 minutes of compound lifts with 3-5 working sets across your main movements. The goal is not drama but repeated proof that you can carry load well." },
    6: { type: "solitude", label: "Extended Solitude + Nature", sublabel: "Hike, water, forest \u2014 no phone", duration: "90 min", description: "Spend 90 minutes outside without your phone, ideally near water, trees, or open space. Let boredom pass so attention can widen again." }
  };
  return map[dayOfWeek];
}

export function getBookForMonth(month) {
  if (month <= 2) return 1;
  if (month <= 3) return 2;
  if (month <= 4) return 3;
  if (month === 5) return 4;
  if (month <= 7) return 5;
  if (month <= 8) return 6;
  return 7;
}

export function generateRitualKey() {
  return 'custom_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
}

export function normalizeRitualItem(item) {
  if (!item || typeof item !== 'object') return { key: generateRitualKey(), label: '', description: '' };
  return {
    key: typeof item.key === 'string' && item.key ? item.key : generateRitualKey(),
    label: typeof item.label === 'string' ? item.label : '',
    description: typeof item.description === 'string' ? item.description : ''
  };
}

export function normalizeReadingBook(book, fallbackId) {
  return {
    id: parseInt(book.id, 10) || fallbackId,
    title: typeof book.title === 'string' ? book.title : '',
    author: typeof book.author === 'string' ? book.author : '',
    translation: typeof book.translation === 'string' ? book.translation : null,
    months: typeof book.months === 'string' ? book.months : '',
    instruction: typeof book.instruction === 'string' ? book.instruction : '',
    startDate: normalizeDateStr(book.startDate) || '',
    endDate: normalizeDateStr(book.endDate) || ''
  };
}

export function createDefaultReadingBooks() {
  return readingList.map((book, index) => normalizeReadingBook(book, index + 1));
}

export const BOOK_DESCRIPTION_LENGTH = 240;
export const BOOK_LOOKUP_SOURCE = 'Open Library';
export const BOOK_DESCRIPTION_FALLBACK_SOURCE = 'Google Books';
export const BOOK_LOOKUP_SERVICES = `${BOOK_LOOKUP_SOURCE} and ${BOOK_DESCRIPTION_FALLBACK_SOURCE}`;
export const BOOK_METADATA_LOOKUP_VERSION = 2;
