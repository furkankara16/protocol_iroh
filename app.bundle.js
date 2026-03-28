(() => {
  // src/utils.js
  function todayStr() {
    const d = /* @__PURE__ */ new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function dateFromStr(s) {
    const [y, m, d] = s.split("-").map(Number);
    return new Date(y, m - 1, d);
  }
  function normalizeDateStr(value) {
    if (typeof value !== "string") return "";
    const trimmed = value.trim();
    if (!trimmed) return "";
    const match = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (!match) return "";
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return "";
    if (month < 1 || month > 12 || day < 1 || day > 31) return "";
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }
  function formatDateLong(s) {
    const d = dateFromStr(s);
    return d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  }
  function formatDateShort(s) {
    const d = dateFromStr(s);
    return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric" });
  }
  function addDays(dateStr, n) {
    const d = dateFromStr(dateStr);
    d.setDate(d.getDate() + n);
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function isFuture(dateStr) {
    return dateStr > todayStr();
  }
  function escHtml(s) {
    if (!s) return "";
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function debounce(fn, ms) {
    let t;
    return function(...args) {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), ms);
    };
  }
  function logoSVG(cls) {
    return `<div class="logo-mark ${cls || ""}"><svg viewBox="0 0 200 220" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
    <path d="M72 168 C28 148 8 95 30 52 C52 9 110-2 152 20 C194 42 198 100 168 145 C155 165 135 177 118 178" stroke-width="4.5" opacity=".75"/>
    <path d="M68 165 Q68 198 100 205 Q132 198 132 165" stroke-width="4"/>
    <path d="M64 165 L136 165" stroke-width="4"/>
    <path d="M88 158 C83 140 93 128 88 112 C83 96 93 84 88 68" stroke-width="3" opacity=".6"/>
    <path d="M112 158 C117 138 107 126 112 108 C117 90 107 78 112 60" stroke-width="3" opacity=".6"/>
  </svg></div>`;
  }
  function getCurrentMonth(startDate) {
    const start = /* @__PURE__ */ new Date(startDate + "T00:00:00");
    const now = /* @__PURE__ */ new Date();
    const diffMs = now - start;
    const diffDays = Math.floor(diffMs / (1e3 * 60 * 60 * 24));
    return Math.min(12, Math.max(1, Math.floor(diffDays / 30) + 1));
  }
  function getReflectionThemes(days, startDate, todayDate) {
    const stopWords = /* @__PURE__ */ new Set(["the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by", "from", "is", "was", "are", "were", "be", "been", "being", "have", "has", "had", "do", "does", "did", "will", "would", "could", "should", "may", "might", "shall", "can", "need", "must", "i", "me", "my", "we", "us", "our", "you", "your", "he", "him", "his", "she", "her", "it", "its", "they", "them", "their", "that", "this", "these", "those", "what", "which", "who", "whom", "when", "where", "why", "how", "not", "no", "nor", "so", "if", "then", "than", "too", "very", "just", "about", "up", "out", "into", "over", "after", "before", "between", "through", "during", "above", "below", "each", "all", "both", "few", "more", "most", "some", "such", "only", "own", "same", "also", "back", "still", "even", "again", "there", "here", "now", "well", "like", "really", "much", "quite", "thing", "things", "something", "nothing", "everything", "always", "never", "often", "sometimes", "today", "yesterday", "tomorrow", "don", "didn", "doesn", "wasn", "won", "isn", "aren", "weren", "couldn", "shouldn", "wouldn", "haven", "hasn", "hadn", "going", "been", "being", "having", "doing", "got", "get", "getting", "know", "think", "feel", "felt", "want", "went", "going", "make", "made", "said", "say", "tell", "told", "let", "see", "saw", "come", "came", "take", "took", "give", "gave", "keep", "kept", "find", "found", "put", "seem", "seemed", "work", "day", "time", "way", "lot", "bit", "little", "many", "people", "one", "two", "first", "last", "long", "new", "old", "good", "bad", "right", "left", "big", "small", "try", "tried", "because", "instead", "respond", "avoid", "react", "reacted", "avoided", "grateful", "didn't", "create", "week", "morning", "evening"]);
    const wordCounts = {};
    const cutoff = addDays(todayDate, -30);
    Object.keys(days).forEach((ds) => {
      if (ds < cutoff || ds > todayDate || ds < startDate) return;
      const dayData = days[ds];
      const ref = dayData.eveningReflection || {};
      const checkins = dayData.emotionalCheckins || [];
      const wi = dayData.weeklyIntegration || {};
      const allText = [ref.reacted, ref.avoided, ref.grateful, wi.pattern, wi.learning, wi.carryForward, ...checkins.map((c) => c.label)].filter(Boolean).join(" ");
      const words = allText.toLowerCase().replace(/[^a-z\s'-]/g, "").split(/\s+/).filter((w) => w.length > 2 && !stopWords.has(w));
      words.forEach((w) => {
        wordCounts[w] = (wordCounts[w] || 0) + 1;
      });
    });
    return Object.entries(wordCounts).filter(([, c]) => c >= 2).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([word, count]) => ({ word, count }));
  }

  // src/data.js
  var STORAGE_KEY = "iroh_protocol_data";
  var monthContext = {
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
  var monthlyChallenges = {
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
  var readingList = [
    { id: 1, title: "Meditations", author: "Marcus Aurelius", translation: "Hays", months: "1\u20132", instruction: "One entry per morning. Open to any page." },
    { id: 2, title: "Tao Te Ching", author: "Lao Tzu", translation: "Mitchell", months: "2\u20133", instruction: "One chapter per morning. 81 short chapters." },
    { id: 3, title: "The Body Keeps the Score", author: "Bessel van der Kolk", translation: null, months: "3\u20134", instruction: "One chapter per week." },
    { id: 4, title: "Man's Search for Meaning", author: "Viktor Frankl", translation: null, months: "5", instruction: "Read in two sittings." },
    { id: 5, title: "The Analects", author: "Confucius", translation: "Slingerland", months: "6\u20137", instruction: "One section per week with Sunday study." },
    { id: 6, title: "Letting Go", author: "David Hawkins", translation: null, months: "7\u20138", instruction: "Practice the technique as you encounter it." },
    { id: 7, title: "The Master and His Emissary", author: "Iain McGilchrist", translation: null, months: "9\u201312", instruction: "Long book. No rush. It's the capstone." }
  ];
  var DEFAULT_MORNING_TEMPLATE = [
    { key: "noPhone", label: "No phone \u2014 first 20 minutes", description: "Keep the phone completely out of reach for the first 20 minutes after waking. It sets the tone that you lead the day instead of reacting to it." },
    { key: "coldExposure", label: "Cold exposure", description: "Use 30-90 seconds of cold water on the face and forearms, or finish with a brief cold shower. A short hit of discomfort builds steadiness before harder things arrive." },
    { key: "breathwork", label: "Breathwork \u2014 4-7-8 \xD7 6 cycles", description: "Inhale for 4 seconds, hold for 7, exhale for 8, and repeat for 6 full cycles. Six rounds is enough to reduce noise and create a clean start." },
    { key: "meditation", label: "Meditation \u2014 10 min", description: "" },
    { key: "journaling", label: "Journaling \u2014 stream of consciousness", description: "Write continuously for 5-10 minutes or one full page without editing, censoring, or rereading. Let the page catch what your mind would otherwise drag through the day." },
    { key: "philosophyRead", label: "Philosophy reading \u2014 one passage", description: "Read one short passage slowly and pause to note a single idea or line that matters. Carry that idea with you and let it shape the rest of the morning." }
  ];
  var DEFAULT_EVENING_TEMPLATE = [
    { key: "dailyReview", label: "Daily review \u2014 three questions", description: "Answer the three reflection prompts in a few honest lines before sleep, even if the answers are brief. Honest review turns repetition into learning." },
    { key: "bodyScan", label: "Body scan \u2014 10 min", description: "Spend 10 minutes moving attention slowly from toes to head and relaxing tension where you notice it. Releasing stored tension makes rest part of the practice, not an accident." }
  ];
  var trainingFocus = {
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
  var emotionWords = [
    { label: "high energy \xB7 difficult", words: ["angry", "anxious", "frustrated", "overwhelmed", "agitated", "panicked", "irritated", "restless", "hostile", "terrified", "manic", "defensive"] },
    { label: "low energy \xB7 difficult", words: ["sad", "disappointed", "lonely", "empty", "numb", "hopeless", "guilty", "ashamed", "resigned", "hollow", "depleted", "apathetic", "melancholic"] },
    { label: "high energy \xB7 pleasant", words: ["excited", "inspired", "energized", "alive", "eager", "passionate", "elated", "curious", "amused", "proud", "playful", "determined"] },
    { label: "low energy \xB7 pleasant", words: ["calm", "peaceful", "content", "grateful", "tender", "gentle", "serene", "steady", "grounded", "warm", "safe", "relieved", "settled"] }
  ];
  var QUADRANT_COLORS = ["#b45050", "#6464a0", "#c4a03c", "#5aa078"];
  var QUADRANT_LABELS = ["High energy \xB7 Difficult", "Low energy \xB7 Difficult", "High energy \xB7 Pleasant", "Low energy \xB7 Pleasant"];
  var QUADRANT_Y_RATIOS = [0.88, 0.63, 0.12, 0.37];
  var emotionQuadrantMap = {};
  emotionWords.forEach((group, qi) => {
    group.words.forEach((w) => {
      emotionQuadrantMap[w.toLowerCase()] = qi;
    });
  });
  function getEmotionQuadrant(value) {
    const raw = String(value || "").trim().toLowerCase();
    if (!raw) return -1;
    if (Object.prototype.hasOwnProperty.call(emotionQuadrantMap, raw)) {
      return emotionQuadrantMap[raw];
    }
    const segments = raw.split(/[;,/]+/).map((part) => part.trim()).filter(Boolean);
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
  var meditationProgression = {
    1: { technique: "focused attention", description: "Count each exhale from 1 to 10, then start over. When you lose count, begin again at 1. The practice is the returning, not the counting." },
    2: { technique: "body-anchored awareness", description: "Rest attention on physical sensations \u2014 the weight of your hands, the rhythm of breath in your chest. When the mind pulls away, return to the body. You\u2019re building a home base." },
    3: { technique: "open awareness", description: "Sit with open awareness \u2014 no object, no anchor. Let whatever arises pass without engagement. The point is not calm, but a little more space between impulse and action." }
  };
  function getMeditationStage(month) {
    if (month <= 3) return 1;
    if (month <= 6) return 2;
    return 3;
  }
  function getTodayPractice(dayOfWeek) {
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
  function getBookForMonth(month) {
    if (month <= 2) return 1;
    if (month <= 3) return 2;
    if (month <= 4) return 3;
    if (month === 5) return 4;
    if (month <= 7) return 5;
    if (month <= 8) return 6;
    return 7;
  }
  function generateRitualKey() {
    return "custom_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5);
  }
  function normalizeRitualItem(item) {
    if (!item || typeof item !== "object") return { key: generateRitualKey(), label: "", description: "" };
    return {
      key: typeof item.key === "string" && item.key ? item.key : generateRitualKey(),
      label: typeof item.label === "string" ? item.label : "",
      description: typeof item.description === "string" ? item.description : ""
    };
  }
  function normalizeReadingBook2(book, fallbackId) {
    return {
      id: parseInt(book.id, 10) || fallbackId,
      title: typeof book.title === "string" ? book.title : "",
      author: typeof book.author === "string" ? book.author : "",
      translation: typeof book.translation === "string" ? book.translation : null,
      months: typeof book.months === "string" ? book.months : "",
      instruction: typeof book.instruction === "string" ? book.instruction : "",
      startDate: normalizeDateStr(book.startDate) || "",
      endDate: normalizeDateStr(book.endDate) || ""
    };
  }
  function createDefaultReadingBooks() {
    return readingList.map((book, index) => normalizeReadingBook2(book, index + 1));
  }
  var BOOK_DESCRIPTION_LENGTH = 240;
  var BOOK_LOOKUP_SOURCE = "Open Library";
  var BOOK_DESCRIPTION_FALLBACK_SOURCE = "Google Books";
  var BOOK_LOOKUP_SERVICES = `${BOOK_LOOKUP_SOURCE} and ${BOOK_DESCRIPTION_FALLBACK_SOURCE}`;
  var BOOK_METADATA_LOOKUP_VERSION = 2;

  // src/ui-state.js
  var uiState = {
    activeView: "daily",
    viewDate: todayStr(),
    weekOffset: 0,
    pendingBookFocusId: null,
    ritualEditMode: null
    // null | 'morning' | 'evening'
  };
  var _renderCallback = null;
  function setRenderCallback(fn) {
    _renderCallback = fn;
  }
  function getRenderCallback() {
    return _renderCallback;
  }

  // src/state.js
  var state = null;
  function setState(s) {
    state = s;
  }
  function normalizeStateShape(rawState) {
    const next = rawState && typeof rawState === "object" ? rawState : {};
    next.startDate = normalizeDateStr(next.startDate) || todayStr();
    if (!next.days || typeof next.days !== "object") next.days = {};
    const normalizedDays = {};
    Object.entries(next.days).forEach(([rawDate, dayValue]) => {
      const normalizedDate = normalizeDateStr(rawDate);
      if (!normalizedDate) return;
      normalizedDays[normalizedDate] = dayValue;
    });
    next.days = normalizedDays;
    if (!next.monthlyChallenges || typeof next.monthlyChallenges !== "object") next.monthlyChallenges = {};
    for (let i = 1; i <= 12; i++) {
      const month = next.monthlyChallenges[i] || {};
      next.monthlyChallenges[i] = {
        completed: !!month.completed,
        note: typeof month.note === "string" ? month.note : ""
      };
    }
    if (!next.reading || typeof next.reading !== "object") next.reading = {};
    next.reading.notes = typeof next.reading.notes === "string" ? next.reading.notes : "";
    if (!next.reading.customBooks || typeof next.reading.customBooks !== "object") next.reading.customBooks = {};
    if (!Array.isArray(next.reading.books)) {
      next.reading.books = createDefaultReadingBooks().map((baseBook) => {
        const custom = next.reading.customBooks[baseBook.id] || {};
        return normalizeReadingBook2({
          ...baseBook,
          title: custom.title !== void 0 ? custom.title : baseBook.title,
          author: custom.author !== void 0 ? custom.author : baseBook.author,
          startDate: custom.startDate || "",
          endDate: custom.endDate || ""
        }, baseBook.id);
      });
    } else {
      let nextId = 1;
      const seenIds = /* @__PURE__ */ new Set();
      next.reading.books = next.reading.books.map((book, index) => {
        const normalized = normalizeReadingBook2(book, index + 1);
        if (!normalized.id || seenIds.has(normalized.id)) {
          while (seenIds.has(nextId)) nextId++;
          normalized.id = nextId;
        }
        seenIds.add(normalized.id);
        return normalized;
      });
    }
    if (!next.reading.bookMeta || typeof next.reading.bookMeta !== "object") next.reading.bookMeta = {};
    const validBookIds = new Set(next.reading.books.map((book) => book.id));
    Object.keys(next.reading.bookMeta).forEach((id) => {
      if (!validBookIds.has(parseInt(id, 10))) {
        delete next.reading.bookMeta[id];
        return;
      }
      const meta = next.reading.bookMeta[id] || {};
      next.reading.bookMeta[id] = {
        lookupKey: typeof meta.lookupKey === "string" ? meta.lookupKey : "",
        coverUrl: typeof meta.coverUrl === "string" ? meta.coverUrl : "",
        description: typeof meta.description === "string" ? meta.description : "",
        status: typeof meta.status === "string" ? meta.status : "",
        source: typeof meta.source === "string" ? meta.source : "",
        error: typeof meta.error === "string" ? meta.error : "",
        fetchedAt: typeof meta.fetchedAt === "string" ? meta.fetchedAt : "",
        lookupVersion: Number.isFinite(meta.lookupVersion) ? meta.lookupVersion : 0
      };
    });
    const currentBookId = parseInt(next.reading.currentBook, 10);
    next.reading.currentBook = validBookIds.has(currentBookId) ? currentBookId : next.reading.books[0] ? next.reading.books[0].id : null;
    if (!next.ritualTemplate || typeof next.ritualTemplate !== "object") {
      next.ritualTemplate = {
        morning: DEFAULT_MORNING_TEMPLATE.map((i) => ({ ...i })),
        evening: DEFAULT_EVENING_TEMPLATE.map((i) => ({ ...i }))
      };
    } else {
      if (!Array.isArray(next.ritualTemplate.morning) || next.ritualTemplate.morning.length === 0) {
        next.ritualTemplate.morning = DEFAULT_MORNING_TEMPLATE.map((i) => ({ ...i }));
      } else {
        next.ritualTemplate.morning = next.ritualTemplate.morning.map(normalizeRitualItem);
      }
      if (!Array.isArray(next.ritualTemplate.evening) || next.ritualTemplate.evening.length === 0) {
        next.ritualTemplate.evening = DEFAULT_EVENING_TEMPLATE.map((i) => ({ ...i }));
      } else {
        next.ritualTemplate.evening = next.ritualTemplate.evening.map(normalizeRitualItem);
      }
    }
    return next;
  }
  function loadState() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        return normalizeStateShape(JSON.parse(raw));
      } catch (e) {
      }
    }
    return null;
  }
  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
  function commit(mutator, opts = {}) {
    mutator(state);
    if (opts.silent) return;
    save();
    if (opts.render !== false) {
      const render2 = getRenderCallback();
      if (render2) render2();
    }
  }
  function ensureDay(dateStr) {
    if (!state.days[dateStr]) {
      const dow2 = dateFromStr(dateStr).getDay();
      const practice = getTodayPractice(dow2);
      const morning = {};
      state.ritualTemplate.morning.forEach((item) => {
        morning[item.key] = false;
      });
      const evening = {};
      state.ritualTemplate.evening.forEach((item) => {
        evening[item.key] = false;
      });
      state.days[dateStr] = {
        morning,
        evening,
        _ritualKeys: {
          morning: state.ritualTemplate.morning.map((i) => i.key),
          evening: state.ritualTemplate.evening.map((i) => i.key)
        },
        emotionalCheckins: [],
        eveningReflection: { reacted: "", avoided: "", grateful: "" },
        weeklyPractice: { completed: false, type: practice.type }
      };
      if (dow2 === 0) {
        state.days[dateStr].weeklyIntegration = { pattern: "", learning: "", carryForward: "" };
      }
    }
    const dow = dateFromStr(dateStr).getDay();
    if (dow === 0 && !state.days[dateStr].weeklyIntegration) {
      state.days[dateStr].weeklyIntegration = { pattern: "", learning: "", carryForward: "" };
    }
    return state.days[dateStr];
  }
  function getDayCompletion(dayData) {
    if (!dayData) return { completed: 0, total: 0, rate: 0 };
    let completed = 0;
    const mKeys = dayData._ritualKeys ? dayData._ritualKeys.morning : state.ritualTemplate.morning.map((i) => i.key);
    const eKeys = dayData._ritualKeys ? dayData._ritualKeys.evening : state.ritualTemplate.evening.map((i) => i.key);
    let total = mKeys.length + eKeys.length;
    mKeys.forEach((key) => {
      if (dayData.morning && dayData.morning[key]) completed++;
    });
    eKeys.forEach((key) => {
      if (dayData.evening && dayData.evening[key]) completed++;
    });
    if (dayData.weeklyPractice && dayData.weeklyPractice.type) {
      total++;
      if (dayData.weeklyPractice.completed) completed++;
    }
    return { completed, total, rate: total > 0 ? completed / total : 0 };
  }
  function getReadingBooks() {
    if (!state.reading.books) state.reading.books = createDefaultReadingBooks();
    return state.reading.books;
  }
  function getBookDisplay(bookId) {
    return getReadingBooks().find((book) => book.id === bookId) || null;
  }
  function getBookIndex(bookId) {
    return getReadingBooks().findIndex((book) => book.id === bookId);
  }
  function getFallbackBookIdForMonth(month) {
    const books = getReadingBooks();
    if (!books.length) return null;
    const defaultIndex = Math.max(0, readingList.findIndex((book) => book.id === getBookForMonth(month)));
    return books[Math.min(defaultIndex, books.length - 1)].id;
  }
  function getCurrentReadingBookId(month) {
    const books = getReadingBooks();
    if (!books.length) return null;
    const currentBook = parseInt(state.reading.currentBook, 10);
    if (books.some((book) => book.id === currentBook)) return currentBook;
    const fallbackId = getFallbackBookIdForMonth(month);
    state.reading.currentBook = fallbackId;
    return fallbackId;
  }
  function getNextReadingBookId(bookId) {
    const books = getReadingBooks();
    const index = getBookIndex(bookId);
    if (index === -1) return books[0] ? books[0].id : null;
    return books[index + 1] ? books[index + 1].id : bookId;
  }
  function getNewReadingBookId() {
    return getReadingBooks().reduce((maxId, book) => Math.max(maxId, book.id), 0) + 1;
  }
  var bookLookupRuntime = {};
  function getBookMeta(bookId) {
    if (!state.reading.bookMeta) state.reading.bookMeta = {};
    return state.reading.bookMeta[bookId] || {};
  }
  function setBookMeta(bookId, nextMeta) {
    if (!state.reading.bookMeta) state.reading.bookMeta = {};
    state.reading.bookMeta[bookId] = {
      lookupKey: "",
      coverUrl: "",
      description: "",
      status: "",
      source: "",
      error: "",
      fetchedAt: "",
      lookupVersion: 0,
      ...getBookMeta(bookId),
      ...nextMeta
    };
  }
  function clearBookMeta(bookId) {
    if (state.reading.bookMeta) delete state.reading.bookMeta[bookId];
    delete bookLookupRuntime[bookId];
  }
  function normalizeBookText(value) {
    return (value || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/&/g, " and ").replace(/[^a-z0-9]+/g, " ").trim();
  }
  function getBookLookupKey(title, author) {
    const normalizedTitle = normalizeBookText(title);
    const normalizedAuthor = normalizeBookText(author);
    return normalizedTitle && normalizedAuthor ? `${normalizedTitle}::${normalizedAuthor}` : "";
  }
  function sharedTokenCount(a, b) {
    const aTokens = new Set(normalizeBookText(a).split(" ").filter(Boolean));
    const bTokens = normalizeBookText(b).split(" ").filter(Boolean);
    let matches = 0;
    bTokens.forEach((token) => {
      if (aTokens.has(token)) matches++;
    });
    return matches;
  }
  function getOpenLibraryScore(doc, title, author) {
    const candidateTitle = normalizeBookText(doc.title);
    const candidateAuthors = (doc.author_name || []).map(normalizeBookText).filter(Boolean);
    if (!candidateTitle || candidateAuthors.length === 0) return -1;
    const titleKey = normalizeBookText(title);
    const authorKey = normalizeBookText(author);
    let score = 0;
    if (candidateTitle === titleKey) score += 8;
    else if (candidateTitle.includes(titleKey) || titleKey.includes(candidateTitle)) score += 5;
    score += sharedTokenCount(candidateTitle, titleKey);
    if (candidateAuthors.some((name) => name === authorKey)) score += 6;
    else if (candidateAuthors.some((name) => name.includes(authorKey) || authorKey.includes(name))) score += 4;
    else score += Math.max(...candidateAuthors.map((name) => sharedTokenCount(name, authorKey)), 0);
    if (doc.cover_i) score += 1;
    return score;
  }
  function hasFreshBookMetadata(meta, lookupKey) {
    if (!meta || meta.lookupKey !== lookupKey || !meta.status) return false;
    if (!meta.description && (meta.lookupVersion || 0) < BOOK_METADATA_LOOKUP_VERSION) return false;
    return true;
  }
  function chooseBestOpenLibraryDoc(docs, title, author) {
    let bestDoc = null;
    let bestScore = -1;
    (docs || []).forEach((doc) => {
      const score = getOpenLibraryScore(doc, title, author);
      if (score > bestScore) {
        bestScore = score;
        bestDoc = doc;
      }
    });
    return bestScore >= 6 ? bestDoc : null;
  }
  function getGoogleBooksScore(item, title, author) {
    const info = item && item.volumeInfo ? item.volumeInfo : {};
    const candidateTitle = normalizeBookText(info.title);
    const candidateAuthors = (info.authors || []).map(normalizeBookText).filter(Boolean);
    if (!candidateTitle || candidateAuthors.length === 0) return -1;
    const titleKey = normalizeBookText(title);
    const authorKey = normalizeBookText(author);
    let score = 0;
    if (candidateTitle === titleKey) score += 8;
    else if (candidateTitle.includes(titleKey) || titleKey.includes(candidateTitle)) score += 5;
    score += sharedTokenCount(candidateTitle, titleKey);
    if (candidateAuthors.some((name) => name === authorKey)) score += 6;
    else if (candidateAuthors.some((name) => name.includes(authorKey) || authorKey.includes(name))) score += 4;
    else score += Math.max(...candidateAuthors.map((name) => sharedTokenCount(name, authorKey)), 0);
    if (info.description) score += 2;
    return score;
  }
  function chooseBestGoogleBook(items, title, author) {
    let bestItem = null;
    let bestScore = -1;
    (items || []).forEach((item) => {
      const score = getGoogleBooksScore(item, title, author);
      if (score > bestScore) {
        bestScore = score;
        bestItem = item;
      }
    });
    return bestScore >= 6 ? bestItem : null;
  }
  function collapseWhitespace(text) {
    return (text || "").replace(/\s+/g, " ").trim();
  }
  function stripHtml(text) {
    if (!text) return "";
    const probe = document.createElement("div");
    probe.innerHTML = text;
    return probe.textContent || probe.innerText || "";
  }
  function truncateText(text, maxLength) {
    const cleaned = collapseWhitespace(text);
    if (cleaned.length <= maxLength) return cleaned;
    let shortened = cleaned.slice(0, maxLength + 1);
    const lastSpace = shortened.lastIndexOf(" ");
    if (lastSpace > Math.floor(maxLength * 0.65)) shortened = shortened.slice(0, lastSpace);
    else shortened = shortened.slice(0, maxLength);
    return shortened.replace(/[.,;:!? ]+$/g, "") + "\u2026";
  }
  function extractOpenLibraryText(value) {
    if (!value) return "";
    if (typeof value === "string") return value;
    if (Array.isArray(value)) return value.map(extractOpenLibraryText).filter(Boolean).join(" ");
    if (typeof value === "object") {
      if (typeof value.value === "string") return value.value;
      if (typeof value.excerpt === "string") return value.excerpt;
      if (typeof value.text === "string") return value.text;
      if (typeof value.note === "string") return value.note;
    }
    return "";
  }
  function normalizeBookDescription(text) {
    return truncateText(stripHtml(text), BOOK_DESCRIPTION_LENGTH);
  }
  function looksLikeUsefulBookDescription(text) {
    const cleaned = collapseWhitespace(text);
    if (!cleaned) return false;
    if (cleaned.length < 36 && cleaned.split(" ").length < 6) return false;
    return !/^(includes bibliographical references|includes index|translation of|cover title|previously published|abridged|unabridged)\b/i.test(cleaned);
  }
  function pickFirstUsableBookDescription(candidates) {
    for (const candidate of candidates) {
      const cleaned = normalizeBookDescription(candidate);
      if (looksLikeUsefulBookDescription(cleaned)) return cleaned;
    }
    return "";
  }
  function getOpenLibraryDescriptionCandidates(record) {
    if (!record || typeof record !== "object") return [];
    return [
      extractOpenLibraryText(record.description),
      extractOpenLibraryText(record.first_sentence),
      extractOpenLibraryText(record.excerpts),
      extractOpenLibraryText(record.notes)
    ].filter(Boolean);
  }
  function getBookMetaStatus(bookId) {
    const book = getBookDisplay(bookId);
    if (!book) return { tone: "", message: "No book is selected right now." };
    const key = getBookLookupKey(book.title, book.author);
    const meta = getBookMeta(bookId);
    const runtime = bookLookupRuntime[bookId];
    if (!key) return { tone: "", message: "Enter a title and author to auto-fill the cover and description." };
    if (runtime && runtime.lookupKey === key) return { tone: "", message: `Looking up details from ${BOOK_LOOKUP_SERVICES}...` };
    if (meta.lookupKey !== key || !meta.status) return { tone: "", message: "Ready to fetch book details automatically." };
    if (meta.status === "found") return { tone: "success", message: `Auto-filled from ${meta.source || BOOK_LOOKUP_SOURCE}.` };
    if (meta.status === "missing") return { tone: "", message: "No matching cover or description was found for this title yet." };
    return { tone: "error", message: meta.error || `Could not reach ${BOOK_LOOKUP_SERVICES} right now.` };
  }
  async function fetchJsonWithTimeout(url, timeoutMs = 8e3) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) throw new Error(`Request failed with status ${response.status}`);
      return await response.json();
    } finally {
      clearTimeout(timeoutId);
    }
  }
  async function fetchOpenLibraryDescription(workKey, editionKeys = []) {
    const normalizedKey = workKey.startsWith("/works/") ? workKey : `/works/${String(workKey).replace(/^\/+/, "")}`;
    const data = await fetchJsonWithTimeout(`https://openlibrary.org${normalizedKey}.json`);
    let description = pickFirstUsableBookDescription(getOpenLibraryDescriptionCandidates(data));
    if (description) return description;
    const normalizedEditionKeys = (editionKeys || []).map((key) => String(key || "").replace(/^\/+books\//, "").replace(/^\/+/, "")).filter(Boolean);
    for (const editionKey of normalizedEditionKeys.slice(0, 3)) {
      try {
        const editionData = await fetchJsonWithTimeout(`https://openlibrary.org/books/${editionKey}.json`);
        description = pickFirstUsableBookDescription(getOpenLibraryDescriptionCandidates(editionData));
        if (description) return description;
      } catch (err) {
      }
    }
    return "";
  }
  async function fetchGoogleBooksDescription(title, author) {
    const query = `${title} ${author}`;
    const data = await fetchJsonWithTimeout(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&langRestrict=en&printType=books&maxResults=5`);
    const match = chooseBestGoogleBook(data.items || [], title, author);
    if (!match) return "";
    return pickFirstUsableBookDescription([
      match.volumeInfo && match.volumeInfo.description,
      match.searchInfo && match.searchInfo.textSnippet
    ]);
  }
  async function fetchBookMetadata(title, author) {
    let match = null;
    let coverUrl = "";
    let description = "";
    let source = "";
    let openLibraryError = null;
    try {
      const searchUrl = `https://openlibrary.org/search.json?q=${encodeURIComponent(`${title} ${author}`)}&fields=key,title,author_name,cover_i,edition_key&limit=10&lang=en`;
      const searchData = await fetchJsonWithTimeout(searchUrl);
      match = chooseBestOpenLibraryDoc(searchData.docs || [], title, author);
      coverUrl = match && match.cover_i ? `https://covers.openlibrary.org/b/id/${match.cover_i}-M.jpg?default=false` : "";
      source = coverUrl ? BOOK_LOOKUP_SOURCE : "";
    } catch (err) {
      openLibraryError = err;
    }
    if (match) {
      try {
        description = await fetchOpenLibraryDescription(match.key, match.edition_key || []);
      } catch (err) {
        openLibraryError = err;
        description = "";
      }
      if (description) source = BOOK_LOOKUP_SOURCE;
    }
    if (!description) {
      try {
        description = await fetchGoogleBooksDescription(title, author);
      } catch (err) {
        description = "";
      }
      if (description) {
        source = coverUrl ? `${BOOK_LOOKUP_SOURCE} + ${BOOK_DESCRIPTION_FALLBACK_SOURCE}` : BOOK_DESCRIPTION_FALLBACK_SOURCE;
      }
    }
    if (openLibraryError && !coverUrl && !description) throw openLibraryError;
    if (!match && !description) return { coverUrl: "", description: "", source: BOOK_LOOKUP_SOURCE };
    return { coverUrl, description, source: source || BOOK_LOOKUP_SOURCE };
  }
  async function performBookMetadataLookup(bookId, expectedKey) {
    try {
      const book = getBookDisplay(bookId);
      if (!book) return;
      const result = await fetchBookMetadata(book.title, book.author);
      const currentBook = getBookDisplay(bookId);
      if (!currentBook) return;
      if (getBookLookupKey(currentBook.title, currentBook.author) !== expectedKey) return;
      setBookMeta(bookId, {
        lookupKey: expectedKey,
        coverUrl: result.coverUrl || "",
        description: result.description || "",
        status: result.coverUrl || result.description ? "found" : "missing",
        source: result.source || BOOK_LOOKUP_SOURCE,
        error: "",
        fetchedAt: (/* @__PURE__ */ new Date()).toISOString(),
        lookupVersion: BOOK_METADATA_LOOKUP_VERSION
      });
      save();
    } catch (err) {
      const currentBook = getBookDisplay(bookId);
      if (!currentBook) return;
      if (getBookLookupKey(currentBook.title, currentBook.author) !== expectedKey) return;
      setBookMeta(bookId, {
        lookupKey: expectedKey,
        coverUrl: "",
        description: "",
        status: "error",
        source: BOOK_LOOKUP_SOURCE,
        error: `Could not reach ${BOOK_LOOKUP_SERVICES} right now.`,
        fetchedAt: (/* @__PURE__ */ new Date()).toISOString(),
        lookupVersion: BOOK_METADATA_LOOKUP_VERSION
      });
      save();
    } finally {
      const runtime = bookLookupRuntime[bookId];
      if (runtime && runtime.lookupKey === expectedKey) delete bookLookupRuntime[bookId];
      if (uiState.activeView === "progress") {
        const render2 = getRenderCallback();
        if (render2) render2();
      }
    }
  }
  function startBookMetadataLookup(bookId, options = {}) {
    const book = getBookDisplay(bookId);
    if (!book) return Promise.resolve(null);
    const lookupKey = getBookLookupKey(book.title, book.author);
    if (!lookupKey) {
      clearBookMeta(bookId);
      save();
      if (options.render !== false && uiState.activeView === "progress") {
        const render2 = getRenderCallback();
        if (render2) render2();
      }
      return Promise.resolve(null);
    }
    const meta = getBookMeta(bookId);
    const runtime = bookLookupRuntime[bookId];
    const alreadyLoaded = hasFreshBookMetadata(meta, lookupKey);
    if (!options.force && alreadyLoaded) return Promise.resolve(meta);
    if (runtime && runtime.lookupKey === lookupKey) return runtime.promise || Promise.resolve(runtime);
    bookLookupRuntime[bookId] = { lookupKey };
    const promise = performBookMetadataLookup(bookId, lookupKey);
    bookLookupRuntime[bookId].promise = promise;
    if (options.render !== false && uiState.activeView === "progress") {
      const render2 = getRenderCallback();
      if (render2) render2();
    }
    return promise;
  }
  function primeBookMetadataLookups(bookIds) {
    let queued = false;
    bookIds.forEach((bookId) => {
      const book = getBookDisplay(bookId);
      if (!book) return;
      const lookupKey = getBookLookupKey(book.title, book.author);
      if (!lookupKey) return;
      const meta = getBookMeta(bookId);
      const runtime = bookLookupRuntime[bookId];
      if (hasFreshBookMetadata(meta, lookupKey)) return;
      if (runtime && runtime.lookupKey === lookupKey) return;
      bookLookupRuntime[bookId] = { lookupKey };
      bookLookupRuntime[bookId].promise = performBookMetadataLookup(bookId, lookupKey);
      queued = true;
    });
    if (queued) {
      requestAnimationFrame(() => {
        if (uiState.activeView === "progress") {
          const render2 = getRenderCallback();
          if (render2) render2();
        }
      });
    }
  }

  // src/views/daily.js
  function requestRender() {
    const render2 = getRenderCallback();
    if (render2) render2();
  }
  function renderDaily(app) {
    const today = todayStr();
    const future = isFuture(uiState.viewDate);
    const curMonth = getCurrentMonth(state.startDate);
    const day = future ? null : ensureDay(uiState.viewDate);
    const morningItems = state.ritualTemplate.morning.map((item) => {
      if (item.key === "meditation") {
        const stage = meditationProgression[getMeditationStage(curMonth)];
        return { key: item.key, label: `Meditation \u2014 10 min ${stage.technique}`, description: stage.description };
      }
      return { key: item.key, label: item.label, description: item.description };
    });
    const eveningItems = state.ritualTemplate.evening.map((item) => ({
      key: item.key,
      label: item.label,
      description: item.description
    }));
    const dayCompletion = future ? { completed: 0, total: state.ritualTemplate.morning.length + state.ritualTemplate.evening.length + 1 } : getDayCompletion(day);
    const isTodayView = uiState.viewDate === today;
    let html = `<div class="page-shell daily-page">`;
    html += `<div class="view-hero">
    <div class="view-kicker">${isTodayView ? "Today" : "Daily Record"}</div>
    <div class="date-nav">
      <button class="nav-arrow" id="prev-day">\u2190</button>
      <h1>${formatDateLong(uiState.viewDate)}</h1>
      <button class="nav-arrow" id="next-day">\u2192</button>
    </div>
    <div class="view-chip-row">
      <div class="view-chip">Month ${curMonth} of 12</div>
      <div class="view-chip">${future ? "Future date" : `${dayCompletion.completed}/${dayCompletion.total} completed`}</div>
      ${future ? "" : `<div class="view-chip">${day.emotionalCheckins.length}/3 emotional check-ins</div>`}
    </div>
    <div class="view-copy">${monthContext[curMonth]}</div>
    ${!isTodayView ? '<button class="return-today" id="return-today">\u2190 Return to today</button>' : ""}
  </div>`;
    if (future) {
      html += `<div class="journal-card section">
      ${logoSVG("logo-empty")}
      <div class="future-msg">Not yet.</div>
      <div class="future-note">This page opens when the date becomes current.</div>
    </div></div>`;
      app.innerHTML = html;
      bindDayNav();
      const returnBtn = document.getElementById("return-today");
      if (returnBtn) returnBtn.addEventListener("click", () => {
        uiState.viewDate = todayStr();
        requestRender();
      });
      return;
    }
    const mornDone = morningItems.filter((i) => day.morning[i.key]).length;
    html += `<div class="journal-card daily-card section">
    <div class="section-header">
      <h2>Morning</h2>`;
    if (uiState.ritualEditMode === "morning") {
      html += `<button class="ritual-edit-btn active" data-edit-done="morning">done</button>`;
      html += `</div>`;
      state.ritualTemplate.morning.forEach((item, idx) => {
        html += `<div class="ritual-edit-row">
        <button class="ritual-move-btn" data-ritual-move="morning-${idx}-up" title="Move up"${idx === 0 ? " disabled" : ""}>\u2191</button>
        <button class="ritual-move-btn" data-ritual-move="morning-${idx}-down" title="Move down"${idx === state.ritualTemplate.morning.length - 1 ? " disabled" : ""}>\u2193</button>
        <input class="ritual-edit-input" data-ritual-label="morning-${idx}" value="${escHtml(item.label)}">
        <button class="ritual-remove-btn" data-ritual-remove="morning-${idx}" title="Remove">\xD7</button>
      </div>`;
      });
      html += `<div class="ritual-add-row">
      <input class="ritual-edit-input" id="ritual-add-morning-input" placeholder="New morning ritual\u2026">
      <button class="log-btn" id="ritual-add-morning-btn">Add</button>
    </div>
    <div class="ritual-edit-note">Changes apply to today and all future days. Past days keep their original items.</div>`;
    } else {
      html += `<span class="tag">${morningItems.length} items</span>
      <button class="ritual-edit-btn" data-edit-start="morning">customize</button>
      <span class="fraction">${mornDone}/${morningItems.length}</span>
    </div>`;
      morningItems.forEach((item, idx) => {
        const checked = day.morning[item.key];
        html += `<div class="check-row" data-group="morning" data-key="${item.key}" role="checkbox" aria-checked="${!!checked}" tabindex="0">
        <div class="checkbox${checked ? " checked" : ""}"></div>
        <div class="check-copy">
          <div class="check-label${checked ? " checked" : ""}">${item.label}</div>
          <div class="check-description${checked ? " checked" : ""}">${item.description}</div>
        </div>
      </div>`;
      });
    }
    html += `</div>`;
    const dow = dateFromStr(uiState.viewDate).getDay();
    const practice = getTodayPractice(dow);
    html += `<div class="journal-card daily-card section">
    <div class="section-header">
      <h2>Weekly Practice</h2><span class="tag">${practice.duration}</span>
    </div>
    <div class="check-row" data-group="weekly" role="checkbox" aria-checked="${day.weeklyPractice.completed}" tabindex="0">
      <div class="checkbox${day.weeklyPractice.completed ? " checked" : ""}"></div>
      <div class="check-copy">
        <div class="check-label${day.weeklyPractice.completed ? " checked" : ""}">${practice.label} \u2014 ${practice.sublabel}</div>
        <div class="check-description${day.weeklyPractice.completed ? " checked" : ""}">${practice.description}</div>
      </div>
    </div>
  </div>`;
    const checkins = day.emotionalCheckins || [];
    html += `<div class="journal-card daily-card section">
    <div class="journal-card-header">
      <div>
        <h2>Emotional Check-ins</h2>
        <div class="journal-card-note">Three brief snapshots so the day is not remembered as one undifferentiated mood.</div>
      </div>
      <div class="journal-card-aside">${checkins.length}/3</div>
    </div>`;
    checkins.forEach((c, idx) => {
      html += `<div class="checkin-entry">
      <span class="checkin-time">${c.time}</span>
      <span>\u2014 ${escHtml(c.label)}</span>
      <button class="checkin-delete" data-idx="${idx}">\xD7</button>
    </div>`;
    });
    if (checkins.length < 3) {
      html += `<div class="checkin-input-row">
      <input type="text" id="checkin-input" placeholder="What exactly am I feeling right now?" aria-label="Emotional check-in">
      <button class="log-btn" id="log-checkin">Log</button>
    </div>
    <div class="emotion-scaffold">
      <button class="emotion-toggle" id="emotion-toggle">\u25B8 emotion vocabulary</button>
      <div class="emotion-grid" id="emotion-grid">
        ${emotionWords.map((group, gi) => {
        const quadrants = ["high-difficult", "low-difficult", "high-pleasant", "low-pleasant"];
        return `<div class="emotion-group" data-quadrant="${quadrants[gi]}"><div class="emotion-group-label">${group.label}</div><div style="display:flex;flex-wrap:wrap;gap:6px;">` + group.words.map((w) => `<span class="emotion-word">${w}</span>`).join("") + `</div></div>`;
      }).join("")}
      </div>
    </div>`;
    } else {
      html += `<div class="checkin-complete">3/3 logged</div>`;
    }
    html += `</div>`;
    const eveDone = eveningItems.filter((i) => day.evening[i.key]).length;
    html += `<div class="journal-card daily-card section">
    <div class="section-header">
      <h2>Evening</h2>`;
    if (uiState.ritualEditMode === "evening") {
      html += `<button class="ritual-edit-btn active" data-edit-done="evening">done</button>`;
      html += `</div>`;
      state.ritualTemplate.evening.forEach((item, idx) => {
        html += `<div class="ritual-edit-row">
        <button class="ritual-move-btn" data-ritual-move="evening-${idx}-up" title="Move up"${idx === 0 ? " disabled" : ""}>\u2191</button>
        <button class="ritual-move-btn" data-ritual-move="evening-${idx}-down" title="Move down"${idx === state.ritualTemplate.evening.length - 1 ? " disabled" : ""}>\u2193</button>
        <input class="ritual-edit-input" data-ritual-label="evening-${idx}" value="${escHtml(item.label)}">
        <button class="ritual-remove-btn" data-ritual-remove="evening-${idx}" title="Remove">\xD7</button>
      </div>`;
      });
      html += `<div class="ritual-add-row">
      <input class="ritual-edit-input" id="ritual-add-evening-input" placeholder="New evening ritual\u2026">
      <button class="log-btn" id="ritual-add-evening-btn">Add</button>
    </div>
    <div class="ritual-edit-note">Changes apply to today and all future days. Past days keep their original items.</div>`;
    } else {
      html += `<span class="tag">${eveningItems.length} items</span>
      <button class="ritual-edit-btn" data-edit-start="evening">customize</button>
      <span class="fraction">${eveDone}/${eveningItems.length}</span>
    </div>`;
      eveningItems.forEach((item) => {
        const checked = day.evening[item.key];
        html += `<div class="check-row" data-group="evening" data-key="${item.key}" role="checkbox" aria-checked="${!!checked}" tabindex="0">
        <div class="checkbox${checked ? " checked" : ""}"></div>
        <div class="check-copy">
          <div class="check-label${checked ? " checked" : ""}">${item.label}</div>
          <div class="check-description${checked ? " checked" : ""}">${item.description}</div>
        </div>
      </div>`;
      });
    }
    html += `</div>`;
    const ref = day.eveningReflection;
    const hasSome = ref.reacted || ref.avoided || ref.grateful;
    html += `<div class="journal-card daily-card section">
    <div class="expandable-header" id="reflection-toggle">
      <span class="chevron" id="reflection-chevron">\u25B6</span>
      <h2>Evening Reflection</h2>
      ${hasSome ? '<span class="filled-dot"></span>' : ""}
    </div>
    <div class="expandable-body" id="reflection-body">
      <div class="reflection-field">
        <label for="ref-reacted">Where did I react instead of respond?</label>
        <textarea id="ref-reacted" aria-label="Where did I react instead of respond?">${escHtml(ref.reacted)}</textarea>
      </div>
      <div class="reflection-field">
        <label for="ref-avoided">What did I avoid?</label>
        <textarea id="ref-avoided" aria-label="What did I avoid?">${escHtml(ref.avoided)}</textarea>
      </div>
      <div class="reflection-field">
        <label for="ref-grateful">What am I grateful for that I didn't create?</label>
        <textarea id="ref-grateful" aria-label="What am I grateful for that I didn't create?">${escHtml(ref.grateful)}</textarea>
      </div>
    </div>
  </div>`;
    const isSunday = dateFromStr(uiState.viewDate).getDay() === 0;
    if (isSunday) {
      const wi = day.weeklyIntegration || { pattern: "", learning: "", carryForward: "" };
      const hasWI = wi.pattern || wi.learning || wi.carryForward;
      html += `<div class="journal-card daily-card section weekly-integration">
      <div class="expandable-header" id="integration-toggle">
        <span class="chevron" id="integration-chevron">\u25B6</span>
        <h2>Weekly Integration</h2>
        ${hasWI ? '<span class="filled-dot"></span>' : ""}
      </div>
      <div class="expandable-body" id="integration-body">
        <div class="reflection-field">
          <label>What pattern kept showing up this week?</label>
          <textarea id="wi-pattern">${escHtml(wi.pattern)}</textarea>
        </div>
        <div class="reflection-field">
          <label>What am I learning about myself that I didn\u2019t expect?</label>
          <textarea id="wi-learning">${escHtml(wi.learning)}</textarea>
        </div>
        <div class="reflection-field">
          <label>What do I want to carry into next week?</label>
          <textarea id="wi-carryForward">${escHtml(wi.carryForward)}</textarea>
        </div>
      </div>
    </div>`;
    }
    const bookId = getCurrentReadingBookId(curMonth);
    const book = bookId ? getBookDisplay(bookId) : null;
    html += `<div class="journal-card section reading-block">
    <h3>Current Reading</h3>
    ${book ? `<div>${book.title} \u2014 ${book.author}${book.translation ? " (" + book.translation + " translation)" : ""}</div>
         <div style="color:var(--text-tertiary);margin-top:2px;">${book.instruction || "Set the next book from Progress when you are ready."}</div>` : `<div style="color:var(--text-tertiary);">No book added yet.</div>`}
  </div>`;
    const mc = state.monthlyChallenges[curMonth] || { completed: false, note: "" };
    html += `<div class="journal-card daily-card section challenge-block">
    <h3>Monthly Challenge \u2014 Month ${curMonth}</h3>
    <div style="margin:6px 0;line-height:1.5;">${monthlyChallenges[curMonth]}</div>
    <div class="check-row" data-group="challenge" role="checkbox" aria-checked="${mc.completed}" tabindex="0">
      <div class="checkbox${mc.completed ? " checked" : ""}"></div>
      <span class="check-label${mc.completed ? " checked" : ""}">Completed</span>
    </div>
    <div class="challenge-note">
      <textarea id="challenge-note" placeholder="Optional note...">${escHtml(mc.note)}</textarea>
    </div>
  </div></div>`;
    app.innerHTML = html;
    bindDaily(day, curMonth);
  }
  function bindDayNav() {
    document.getElementById("prev-day").addEventListener("click", () => {
      uiState.viewDate = addDays(uiState.viewDate, -1);
      requestRender();
    });
    document.getElementById("next-day").addEventListener("click", () => {
      uiState.viewDate = addDays(uiState.viewDate, 1);
      requestRender();
    });
  }
  function bindDaily(day, curMonth) {
    bindDayNav();
    const returnBtn = document.getElementById("return-today");
    if (returnBtn) returnBtn.addEventListener("click", () => {
      uiState.viewDate = todayStr();
      requestRender();
    });
    function bindCheckRow(selector, handler) {
      document.querySelectorAll(selector).forEach((row) => {
        row.addEventListener("click", handler);
        row.addEventListener("keydown", (e) => {
          if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            handler.call(row, e);
          }
        });
      });
    }
    bindCheckRow('.check-row[data-group="morning"]', function() {
      const key = this.dataset.key;
      commit((s) => {
        s.days[uiState.viewDate].morning[key] = !s.days[uiState.viewDate].morning[key];
      });
    });
    bindCheckRow('.check-row[data-group="evening"]', function() {
      const key = this.dataset.key;
      commit((s) => {
        s.days[uiState.viewDate].evening[key] = !s.days[uiState.viewDate].evening[key];
      });
    });
    bindCheckRow('.check-row[data-group="weekly"]', function() {
      commit((s) => {
        s.days[uiState.viewDate].weeklyPractice.completed = !s.days[uiState.viewDate].weeklyPractice.completed;
      });
    });
    bindCheckRow('.check-row[data-group="challenge"]', function() {
      commit((s) => {
        s.monthlyChallenges[curMonth].completed = !s.monthlyChallenges[curMonth].completed;
      });
    });
    const logBtn = document.getElementById("log-checkin");
    const checkinInput = document.getElementById("checkin-input");
    function logCheckin() {
      if (!checkinInput) return;
      const val = checkinInput.value.trim();
      if (!val) return;
      const now = /* @__PURE__ */ new Date();
      const time = String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0");
      commit((s) => {
        s.days[uiState.viewDate].emotionalCheckins.push({ time, label: val });
      });
    }
    if (logBtn) logBtn.addEventListener("click", logCheckin);
    if (checkinInput) checkinInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") logCheckin();
    });
    document.querySelectorAll(".checkin-delete").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.dataset.idx, 10);
        commit((s) => {
          s.days[uiState.viewDate].emotionalCheckins.splice(idx, 1);
        });
      });
    });
    const toggle = document.getElementById("reflection-toggle");
    const body = document.getElementById("reflection-body");
    const chevron = document.getElementById("reflection-chevron");
    if (toggle) {
      toggle.addEventListener("click", () => {
        body.classList.toggle("open");
        chevron.classList.toggle("open");
      });
    }
    ["reacted", "avoided", "grateful"].forEach((field) => {
      const el = document.getElementById("ref-" + field);
      if (el) {
        const persist = () => commit((s) => {
          s.days[uiState.viewDate].eveningReflection[field] = el.value;
        }, { render: false });
        el.addEventListener("blur", persist);
        el.addEventListener("input", debounce(persist, 300));
      }
    });
    const emotionToggle = document.getElementById("emotion-toggle");
    const emotionGrid = document.getElementById("emotion-grid");
    if (emotionToggle && emotionGrid) {
      emotionToggle.addEventListener("click", () => {
        emotionGrid.classList.toggle("open");
        emotionToggle.textContent = emotionGrid.classList.contains("open") ? "\u25BE emotion vocabulary" : "\u25B8 emotion vocabulary";
      });
      emotionGrid.querySelectorAll(".emotion-word").forEach((word) => {
        word.addEventListener("click", () => {
          const input = document.getElementById("checkin-input");
          if (input) {
            const current = input.value.trim();
            input.value = current ? current + ", " + word.textContent : word.textContent;
            input.focus();
          }
        });
      });
    }
    const wiToggle = document.getElementById("integration-toggle");
    const wiBody = document.getElementById("integration-body");
    const wiChevron = document.getElementById("integration-chevron");
    if (wiToggle) {
      wiToggle.addEventListener("click", () => {
        wiBody.classList.toggle("open");
        wiChevron.classList.toggle("open");
      });
    }
    ["pattern", "learning", "carryForward"].forEach((field) => {
      const el = document.getElementById("wi-" + field);
      if (el) {
        const persist = () => commit((s) => {
          if (!s.days[uiState.viewDate].weeklyIntegration) s.days[uiState.viewDate].weeklyIntegration = { pattern: "", learning: "", carryForward: "" };
          s.days[uiState.viewDate].weeklyIntegration[field] = el.value;
        }, { render: false });
        el.addEventListener("blur", persist);
        el.addEventListener("input", debounce(persist, 300));
      }
    });
    document.querySelectorAll("[data-edit-start]").forEach((btn) => {
      btn.addEventListener("click", () => {
        uiState.ritualEditMode = btn.dataset.editStart;
        requestRender();
      });
    });
    document.querySelectorAll("[data-edit-done]").forEach((btn) => {
      btn.addEventListener("click", () => {
        uiState.ritualEditMode = null;
        requestRender();
      });
    });
    document.querySelectorAll("[data-ritual-move]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const [group, idxStr, dir] = btn.dataset.ritualMove.split("-");
        const idx = parseInt(idxStr, 10);
        const swap = dir === "up" ? idx - 1 : idx + 1;
        const arr = state.ritualTemplate[group];
        if (swap < 0 || swap >= arr.length) return;
        commit((s) => {
          const temp = s.ritualTemplate[group][idx];
          s.ritualTemplate[group][idx] = s.ritualTemplate[group][swap];
          s.ritualTemplate[group][swap] = temp;
        });
      });
    });
    document.querySelectorAll("[data-ritual-remove]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const [group, idxStr] = btn.dataset.ritualRemove.split("-");
        const idx = parseInt(idxStr, 10);
        const item = state.ritualTemplate[group][idx];
        if (!item) return;
        if (state.ritualTemplate[group].length <= 1) return;
        commit((s) => {
          s.ritualTemplate[group].splice(idx, 1);
        });
      });
    });
    ["morning", "evening"].forEach((group) => {
      const input = document.getElementById("ritual-add-" + group + "-input");
      const btn = document.getElementById("ritual-add-" + group + "-btn");
      if (!input || !btn) return;
      function addRitual() {
        const label = input.value.trim();
        if (!label) return;
        commit((s) => {
          s.ritualTemplate[group].push({
            key: generateRitualKey(),
            label,
            description: ""
          });
        });
      }
      btn.addEventListener("click", addRitual);
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") addRitual();
      });
    });
    document.querySelectorAll("[data-ritual-label]").forEach((input) => {
      input.addEventListener("blur", () => {
        const [group, idxStr] = input.dataset.ritualLabel.split("-");
        const idx = parseInt(idxStr, 10);
        const newLabel = input.value.trim();
        if (!newLabel) return;
        commit((s) => {
          if (s.ritualTemplate[group][idx]) s.ritualTemplate[group][idx].label = newLabel;
        }, { render: false });
      });
    });
    const cn = document.getElementById("challenge-note");
    if (cn) {
      const persistNote = () => commit((s) => {
        s.monthlyChallenges[curMonth].note = cn.value;
      }, { render: false });
      cn.addEventListener("blur", persistNote);
      cn.addEventListener("input", debounce(persistNote, 300));
    }
  }

  // src/views/week.js
  function requestRender2() {
    const render2 = getRenderCallback();
    if (render2) render2();
  }
  function renderWeek(app) {
    const today = todayStr();
    const todayDate = dateFromStr(today);
    const d = new Date(todayDate);
    const dayOfWeek = d.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    d.setDate(d.getDate() + mondayOffset + uiState.weekOffset * 7);
    const monday = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
    const days = [];
    for (let i = 0; i < 7; i++) days.push(addDays(monday, i));
    const sunStr = days[6];
    let totalCompleted = 0, totalPossible = 0;
    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const weekEntries = days.map((ds, idx) => {
      const isToday = ds === today;
      const future = isFuture(ds);
      const beforeProtocol = ds < state.startDate;
      const dayData = state.days[ds];
      const comp = getDayCompletion(dayData);
      const isPastProtocolNoData = !future && !beforeProtocol && comp.total === 0;
      totalCompleted += comp.completed;
      totalPossible += isPastProtocolNoData ? state.ritualTemplate.morning.length + state.ritualTemplate.evening.length + 1 : comp.total;
      const dow = dateFromStr(ds).getDay();
      const practice = getTodayPractice(dow);
      const checkins = dayData ? (dayData.emotionalCheckins || []).length : 0;
      const mornCount = dayData ? state.ritualTemplate.morning.filter((i) => dayData.morning && dayData.morning[i.key]).length : 0;
      const eveCount = dayData ? state.ritualTemplate.evening.filter((i) => dayData.evening && dayData.evening[i.key]).length : 0;
      const wpDone = dayData && dayData.weeklyPractice && dayData.weeklyPractice.completed;
      return { ds, idx, isToday, future, beforeProtocol, practice, checkins, mornCount, eveCount, wpDone };
    });
    const pct = totalPossible > 0 ? Math.round(totalCompleted / totalPossible * 100) : 0;
    const activeDays = weekEntries.filter((entry) => !entry.future && !entry.beforeProtocol).length;
    const fullyCompleteDays = weekEntries.filter((entry) => {
      if (entry.future || entry.beforeProtocol) return false;
      const comp = getDayCompletion(state.days[entry.ds]);
      return comp.total > 0 && comp.completed === comp.total;
    }).length;
    let html = `<div class="page-shell week-page">
    <div class="view-hero">
      <div class="view-kicker">Week View</div>
      <div class="view-title-row">
        <div class="view-title">${formatDateShort(monday)} \u2014 ${formatDateShort(sunStr)}</div>
        <div class="view-glance">${pct}% completion</div>
      </div>
      <div class="view-copy">A seven-day view of routines, weekly practice, and emotional check-ins. Click any day to open its page.</div>
      <div class="view-chip-row">
        <div class="view-chip">${activeDays} active day${activeDays === 1 ? "" : "s"}</div>
        <div class="view-chip">${fullyCompleteDays} fully completed</div>
      </div>
      <div class="week-nav">
        <button class="nav-arrow" id="week-prev">\u2190</button>
        <span class="week-nav-label">${uiState.weekOffset === 0 ? "This week" : "Shifted week"}</span>
        <button class="week-btn" id="week-today">This week</button>
        <button class="nav-arrow" id="week-next">\u2192</button>
      </div>
    </div>
    <div class="journal-card section">
      <div class="journal-card-header">
        <div>
          <h2>Weekly Snapshot</h2>
          <div class="journal-card-note">Morning and evening counts show completed items for each day. EC means emotional check-ins.</div>
        </div>
        <div class="journal-card-aside">${formatDateShort(monday)} \u2014 ${formatDateShort(sunStr)}</div>
      </div>
      <div class="week-grid">`;
    weekEntries.forEach((entry) => {
      const { ds, idx, isToday, future, beforeProtocol, practice, checkins, mornCount, eveCount, wpDone } = entry;
      html += `<div class="week-col${isToday ? " today" : ""}" data-date="${ds}">
      <div class="week-day">${dayNames[idx]}</div>
      <div class="week-date">${dateFromStr(ds).getDate()}</div>
      ${future || beforeProtocol ? '<div class="week-stat" style="color:var(--text-tertiary)">\u2014</div>' : `
      <div class="week-stat">AM <span class="${mornCount === state.ritualTemplate.morning.length ? "done" : ""}">${mornCount}/${state.ritualTemplate.morning.length}</span></div>
      <div class="week-stat">PM <span class="${eveCount === state.ritualTemplate.evening.length ? "done" : ""}">${eveCount}/${state.ritualTemplate.evening.length}</span></div>
      <div class="week-stat">${practice.label.split(" ")[0]} ${wpDone ? '<span class="done">\u2713</span>' : "\u2013"}</div>
      <div class="week-stat">EC ${checkins}/3</div>`}
    </div>`;
    });
    html += `</div>
    <div class="week-completion">
    <div class="week-completion-label">Weekly completion rate: ${pct}%</div>
    <div class="week-bar"><div class="week-bar-fill" style="width:${pct}%"></div></div>
  </div></div></div>`;
    app.innerHTML = html;
    document.getElementById("week-prev").addEventListener("click", () => {
      uiState.weekOffset--;
      requestRender2();
    });
    document.getElementById("week-next").addEventListener("click", () => {
      uiState.weekOffset++;
      requestRender2();
    });
    document.getElementById("week-today").addEventListener("click", () => {
      uiState.weekOffset = 0;
      requestRender2();
    });
    document.querySelectorAll(".week-col").forEach((col) => {
      col.addEventListener("click", () => {
        uiState.viewDate = col.dataset.date;
        uiState.activeView = "daily";
        document.querySelectorAll(".nav-tab").forEach((t) => t.classList.remove("active"));
        document.querySelector('[data-view="daily"]').classList.add("active");
        requestRender2();
      });
    });
  }

  // src/views/progress.js
  function requestRender3() {
    const render2 = getRenderCallback();
    if (render2) render2();
  }
  function renderProgress(app) {
    const curMonth = getCurrentMonth(state.startDate);
    const today = todayStr();
    const startDate = dateFromStr(state.startDate);
    const todayDate = dateFromStr(today);
    const trackedDates = Object.keys(state.days).filter((ds) => ds >= state.startDate && ds <= today).sort();
    const readingBooks = getReadingBooks();
    const curBookId = getCurrentReadingBookId(curMonth);
    const currentBookIndex = getBookIndex(curBookId);
    const completedBooks = currentBookIndex === -1 ? 0 : currentBookIndex;
    const activeMonthChallenge = state.monthlyChallenges[curMonth];
    let totalCompletedAcrossProtocol = 0;
    let totalPossibleAcrossProtocol = 0;
    trackedDates.forEach((ds) => {
      const comp = getDayCompletion(state.days[ds]);
      totalCompletedAcrossProtocol += comp.completed;
      totalPossibleAcrossProtocol += comp.total;
    });
    const overallRate = totalPossibleAcrossProtocol > 0 ? Math.round(totalCompletedAcrossProtocol / totalPossibleAcrossProtocol * 100) : 0;
    const trackedDaysLabel = `${trackedDates.length} tracked day${trackedDates.length === 1 ? "" : "s"}`;
    let html = `<div class="progress-page">`;
    html += `<div class="progress-hero">
    <div class="progress-kicker">Protocol Record</div>
    <div class="progress-title-row">
      <div class="progress-title">Month ${curMonth} of 12</div>
      <div class="progress-glance">${formatDateShort(state.startDate)} to ${formatDateShort(today)}</div>
    </div>
    <div class="progress-copy">A quiet record of what has become repeatable. The point here is steadiness, not spectacle.</div>
    <div class="progress-chip-row">
      <div class="progress-chip">Overall completion ${overallRate}%</div>
      <div class="progress-chip">${trackedDaysLabel}</div>
      ${readingBooks.length ? `<div class="progress-chip">${completedBooks}/${readingBooks.length} books marked read</div>` : ""}
    </div>
  </div>`;
    html += `<div class="progress-card section">
    <div class="progress-card-header">
      <div class="progress-card-title">
        <h2>Activity</h2>
        <div class="progress-card-note">A trace of completed days since the protocol began.</div>
      </div>
      <div class="heatmap-legend" aria-hidden="true">
        <span>Low</span>
        <span class="heatmap-swatch"></span>
        <span class="heatmap-swatch level-1"></span>
        <span class="heatmap-swatch level-2"></span>
        <span class="heatmap-swatch level-3"></span>
        <span class="heatmap-swatch level-4"></span>
        <span>High</span>
      </div>
    </div>
    <div class="heatmap-wrap"><div class="heatmap" id="heatmap">`;
    let cur = new Date(startDate);
    const startDow = cur.getDay();
    const alignOffset = startDow === 0 ? -6 : 1 - startDow;
    cur.setDate(cur.getDate() + alignOffset);
    while (cur <= todayDate || cur.getDay() !== 1) {
      html += `<div class="heatmap-col">`;
      for (let r = 0; r < 7; r++) {
        const ds = cur.getFullYear() + "-" + String(cur.getMonth() + 1).padStart(2, "0") + "-" + String(cur.getDate()).padStart(2, "0");
        const inRange = ds >= state.startDate && ds <= today;
        if (inRange) {
          const dayData = state.days[ds];
          const comp = getDayCompletion(dayData);
          let level = "";
          if (comp.rate === 0) level = "";
          else if (comp.rate <= 0.4) level = "level-1";
          else if (comp.rate <= 0.7) level = "level-2";
          else if (comp.rate < 1) level = "level-3";
          else level = "level-4";
          const tip = `${formatDateShort(ds)} \u2014 ${comp.completed}/${comp.total} completed`;
          html += `<div class="heatmap-cell ${level}"><div class="heatmap-tooltip">${tip}</div></div>`;
        } else {
          html += `<div class="heatmap-cell"></div>`;
        }
        cur.setDate(cur.getDate() + 1);
      }
      html += `</div>`;
      if (cur > todayDate) break;
    }
    html += `</div></div></div>`;
    let currentStreak = 0, longestStreak = 0, tempStreak = 0;
    let checkDate = new Date(todayDate);
    while (true) {
      const ds = checkDate.getFullYear() + "-" + String(checkDate.getMonth() + 1).padStart(2, "0") + "-" + String(checkDate.getDate()).padStart(2, "0");
      if (ds < state.startDate) break;
      const dayData = state.days[ds];
      if (dayData && dayData.morning && dayData.morning.meditation) {
        currentStreak++;
      } else {
        break;
      }
      checkDate.setDate(checkDate.getDate() - 1);
    }
    let d2 = dateFromStr(state.startDate);
    tempStreak = 0;
    while (d2 <= todayDate) {
      const ds = d2.getFullYear() + "-" + String(d2.getMonth() + 1).padStart(2, "0") + "-" + String(d2.getDate()).padStart(2, "0");
      const dayData = state.days[ds];
      if (dayData && dayData.morning && dayData.morning.meditation) {
        tempStreak++;
        if (tempStreak > longestStreak) longestStreak = tempStreak;
      } else {
        tempStreak = 0;
      }
      d2.setDate(d2.getDate() + 1);
    }
    const habitKeys = [
      ...state.ritualTemplate.morning.map((item) => ({ key: item.key, group: "morning", label: item.label.split(" \u2014 ")[0] || item.label })),
      ...state.ritualTemplate.evening.map((item) => ({ key: item.key, group: "evening", label: item.label.split(" \u2014 ")[0] || item.label })),
      { key: "weeklyPractice", group: "weekly", label: "Weekly practice" }
    ];
    let totalTrackedDays = 0;
    const habitCounts = {};
    habitKeys.forEach((h) => habitCounts[h.key] = 0);
    Object.keys(state.days).forEach((ds) => {
      if (ds > today || ds < state.startDate) return;
      totalTrackedDays++;
      const dd = state.days[ds];
      habitKeys.forEach((h) => {
        if (h.group === "morning" && dd.morning && dd.morning[h.key]) habitCounts[h.key]++;
        else if (h.group === "evening" && dd.evening && dd.evening[h.key]) habitCounts[h.key]++;
        else if (h.group === "weekly" && dd.weeklyPractice && dd.weeklyPractice.completed) habitCounts[h.key]++;
      });
    });
    html += `<div class="progress-card section">
    <div class="progress-card-header">
      <div class="progress-card-title">
        <h2>Consistency</h2>
        <div class="progress-card-note">Meditation streaks follow the existing protocol rule and show whether the practice is becoming ordinary.</div>
      </div>
      <div class="progress-card-aside">${overallRate}% overall</div>
    </div>
    <div class="progress-metrics">
      <div class="progress-metric">
        <div class="progress-metric-value">${currentStreak}</div>
        <div class="progress-metric-label">Current Meditation Streak</div>
      </div>
      <div class="progress-metric">
        <div class="progress-metric-value">${longestStreak}</div>
        <div class="progress-metric-label">Longest Meditation Streak</div>
      </div>
    </div>`;
    if (totalTrackedDays > 0) {
      html += `<div class="progress-subsection-title">Habit Breakdown</div><div class="habit-bars">`;
      habitKeys.forEach((h) => {
        const pct = Math.round(habitCounts[h.key] / totalTrackedDays * 100);
        const isLow = pct > 0 && pct < 30;
        html += `<div class="habit-bar-row">
        <div class="habit-bar-label">${h.label}</div>
        <div class="habit-bar-track"><div class="habit-bar-fill${isLow ? " low" : ""}" style="width:${pct}%"></div></div>
        <div class="habit-bar-pct${isLow ? " low" : ""}">${pct}%</div>
      </div>`;
      });
      html += `</div>`;
    }
    html += `</div>`;
    const emotionPoints = [];
    const quadrantCounts = [0, 0, 0, 0];
    trackedDates.forEach((ds) => {
      const dd = state.days[ds];
      if (!dd || !dd.emotionalCheckins || !dd.emotionalCheckins.length) return;
      dd.emotionalCheckins.forEach((ci, i) => {
        const word = (ci.label || "").trim().toLowerCase();
        if (!word) return;
        const qi = getEmotionQuadrant(ci.label);
        emotionPoints.push({ date: ds, word: ci.label || word, time: ci.time || "", quadrant: qi, idx: i });
        if (qi >= 0) quadrantCounts[qi]++;
      });
    });
    html += `<div class="progress-card section">
    <div class="progress-card-header">
      <div class="progress-card-title">
        <h2>Emotional Landscape</h2>
        <div class="progress-card-note">Each dot is a logged check-in, placed by its affect quadrant over time.</div>
      </div>
      <div class="progress-card-aside">${emotionPoints.length} check-in${emotionPoints.length === 1 ? "" : "s"}</div>
    </div>`;
    if (!emotionPoints.length) {
      html += `<div class="no-data-note">Log an emotional check-in to see your pattern emerge here.</div>`;
    } else {
      let tlXPos = function(ds) {
        return TL_PAD.l + (dateFromStr(ds).getTime() - startMs) / rangeMs * plotW;
      }, tlHash = function(str) {
        let h = 0;
        for (let i = 0; i < str.length; i++) h = (h << 5) - h + str.charCodeAt(i) | 0;
        return h;
      };
      const TL_W = 600, TL_H = 180;
      const TL_PAD = { l: 10, r: 12, t: 14, b: 22 };
      const plotW = TL_W - TL_PAD.l - TL_PAD.r;
      const plotH = TL_H - TL_PAD.t - TL_PAD.b;
      const startMs = dateFromStr(state.startDate).getTime();
      const endMs = dateFromStr(today).getTime();
      const rangeMs = Math.max(endMs - startMs, 864e5);
      const dotR = emotionPoints.length > 200 ? 2 : emotionPoints.length > 80 ? 2.8 : 3.5;
      let svg = '<svg viewBox="0 0 ' + TL_W + " " + TL_H + '" class="emotion-timeline-svg" role="img" aria-label="Emotion timeline chart">';
      svg += '<rect x="' + TL_PAD.l + '" y="' + TL_PAD.t + '" width="' + plotW + '" height="' + plotH * 0.5 + '" fill="rgba(90,160,120,0.03)" rx="2"/>';
      svg += '<rect x="' + TL_PAD.l + '" y="' + (TL_PAD.t + plotH * 0.5) + '" width="' + plotW + '" height="' + plotH * 0.5 + '" fill="rgba(180,80,80,0.03)" rx="2"/>';
      svg += '<line x1="' + TL_PAD.l + '" y1="' + (TL_PAD.t + plotH * 0.5) + '" x2="' + (TL_W - TL_PAD.r) + '" y2="' + (TL_PAD.t + plotH * 0.5) + '" stroke="rgba(255,255,255,0.06)" stroke-dasharray="4 4"/>';
      svg += '<text x="' + (TL_PAD.l + 4) + '" y="' + (TL_PAD.t + 12) + '" fill="rgba(90,160,120,0.4)" font-size="9" font-family="Lora,serif" letter-spacing="0.08em">PLEASANT</text>';
      svg += '<text x="' + (TL_PAD.l + 4) + '" y="' + (TL_PAD.t + plotH - 4) + '" fill="rgba(180,80,80,0.4)" font-size="9" font-family="Lora,serif" letter-spacing="0.08em">DIFFICULT</text>';
      let mCur = dateFromStr(state.startDate);
      mCur.setDate(1);
      mCur.setMonth(mCur.getMonth() + 1);
      while (mCur.getTime() <= endMs) {
        const mds = mCur.getFullYear() + "-" + String(mCur.getMonth() + 1).padStart(2, "0") + "-01";
        const mx = tlXPos(mds);
        if (mx > TL_PAD.l + 24 && mx < TL_W - TL_PAD.r - 10) {
          svg += '<line x1="' + mx.toFixed(1) + '" y1="' + TL_PAD.t + '" x2="' + mx.toFixed(1) + '" y2="' + (TL_H - TL_PAD.b) + '" stroke="rgba(255,255,255,0.04)"/>';
          const mLabel = mCur.toLocaleDateString("en-GB", { month: "short" });
          svg += '<text x="' + mx.toFixed(1) + '" y="' + (TL_H - TL_PAD.b + 14) + '" fill="rgba(255,255,255,0.18)" font-size="9" text-anchor="middle" font-family="Lora,serif">' + mLabel + "</text>";
        }
        mCur.setMonth(mCur.getMonth() + 1);
      }
      const unknownY = TL_PAD.t + plotH * 0.5;
      const unknownColor = "#8b8377";
      emotionPoints.forEach((pt) => {
        const x = tlXPos(pt.date);
        const baseY = pt.quadrant >= 0 ? TL_PAD.t + plotH * QUADRANT_Y_RATIOS[pt.quadrant] : unknownY;
        const jitter = (tlHash(pt.word + pt.date) % 13 - 6) * 1.2;
        const y = Math.max(TL_PAD.t + 3, Math.min(TL_H - TL_PAD.b - 3, baseY + jitter));
        const color = pt.quadrant >= 0 ? QUADRANT_COLORS[pt.quadrant] : unknownColor;
        const opacity = pt.quadrant >= 0 ? 0.65 : 0.4;
        const tipText = escHtml(pt.word) + (pt.time ? " \xB7 " + escHtml(pt.time) : "") + " \u2014 " + formatDateShort(pt.date);
        svg += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + dotR + '" fill="' + color + '" opacity="' + opacity + '" data-tip="' + tipText + '" style="cursor:default;transition:r 0.1s,opacity 0.1s"/>';
      });
      svg += "</svg>";
      html += '<div class="emotion-timeline-wrap">' + svg + '<div class="emotion-dot-tooltip" id="emotion-dot-tooltip"></div></div>';
      html += '<div class="emotion-timeline-legend">';
      [2, 3, 1, 0].forEach((qi) => {
        html += '<span class="emotion-timeline-legend-item"><span class="emotion-timeline-swatch" style="background:' + QUADRANT_COLORS[qi] + '"></span>' + QUADRANT_LABELS[qi] + "</span>";
      });
      html += "</div>";
      const checkinDays = new Set(emotionPoints.map((p) => p.date)).size;
      const maxQi = quadrantCounts.indexOf(Math.max(...quadrantCounts));
      const dominantLabel = quadrantCounts[maxQi] > 0 ? QUADRANT_LABELS[maxQi].toLowerCase() : null;
      html += '<div class="emotion-timeline-summary">';
      html += '<span class="emotion-timeline-stat">' + checkinDays + " day" + (checkinDays === 1 ? "" : "s") + " with check-ins</span>";
      if (dominantLabel) {
        html += '<span class="emotion-timeline-stat">Most logged: ' + dominantLabel + "</span>";
      }
      html += "</div>";
    }
    html += "</div>";
    html += `<div class="progress-card section">
    <div class="progress-card-header">
      <div class="progress-card-title">
        <h2>Monthly Challenges</h2>
        <div class="progress-card-note">Open any month to revisit the prompt and your note.</div>
      </div>
      <div class="progress-card-aside">${activeMonthChallenge && activeMonthChallenge.completed ? "Marked complete" : `Month ${curMonth} active`}</div>
    </div>
    <div class="monthly-circles">`;
    for (let i = 1; i <= 12; i++) {
      const mc = state.monthlyChallenges[i];
      const cls = mc && mc.completed ? "completed" : i === curMonth ? "current" : "";
      html += `<div class="month-circle ${cls}" data-month="${i}">${i}</div>`;
    }
    html += `</div><div id="challenge-detail"></div></div>`;
    const currentTrainingFocus = trainingFocus[curMonth] || trainingFocus[12];
    html += `<div class="progress-card training-focus-block section">
    <div class="progress-card-header">
      <div class="progress-card-title">
        <h2>Training Focus</h2>
        <div class="progress-card-note">A practical anchor for this phase of the protocol.</div>
      </div>
      <div class="training-focus-phase">Month ${curMonth}: ${escHtml(currentTrainingFocus.phase)}</div>
    </div>
    <div class="training-focus-row">
      <div class="training-focus-label">Focus</div>
      <div class="training-focus-text">${escHtml(currentTrainingFocus.focus)}</div>
    </div>
    <div class="training-focus-row">
      <div class="training-focus-label">Session</div>
      <div class="training-focus-text">${escHtml(currentTrainingFocus.session)}</div>
    </div>
    <div class="training-focus-row">
      <div class="training-focus-label">Progression</div>
      <div class="training-focus-text">${escHtml(currentTrainingFocus.progression)}</div>
    </div>
    <div class="training-focus-row">
      <div class="training-focus-label">Recovery</div>
      <div class="training-focus-text">${escHtml(currentTrainingFocus.recovery)}</div>
    </div>
  </div>`;
    html += `<div class="progress-card reading-progress-block section">
    <div class="progress-card-header">
      <div class="progress-card-title">
        <div class="reading-progress-header">
          <h2>Reading Progress</h2>
          <button class="book-action-btn" id="add-book">Add Book</button>
        </div>
        <div class="progress-card-note">Covers are fetched once. Descriptions are cached when available.</div>
      </div>
      <div class="progress-card-aside">${readingBooks.length ? `${completedBooks}/${readingBooks.length} read` : "No books yet"}</div>
    </div>
    <div>`;
    if (!readingBooks.length) {
      html += `<div class="no-data-note">No books yet. Add one to start tracking.</div>`;
    }
    readingBooks.forEach((book, index) => {
      const isPast = currentBookIndex !== -1 && index < currentBookIndex;
      const isCur = book.id === curBookId;
      const cls = isCur ? "current" : isPast ? "past" : "";
      const checkCls = isPast ? "done" : isCur ? "current-book" : "";
      const stageLabel = isCur ? "Current" : isPast ? "Completed" : "Up Next";
      const stageClass = isPast ? " completed" : isCur ? "" : " up-next";
      const display = getBookDisplay(book.id);
      const lookupKey = getBookLookupKey(display.title, display.author);
      const meta = getBookMeta(book.id);
      const metaMatchesBook = meta.lookupKey === lookupKey;
      const status = getBookMetaStatus(book.id);
      const isLookupRunning = !!(bookLookupRuntime[book.id] && bookLookupRuntime[book.id].lookupKey === lookupKey);
      const description = metaMatchesBook ? meta.description : "";
      const coverUrl = metaMatchesBook ? meta.coverUrl : "";
      const descriptionText = description || (isLookupRunning ? "Searching for a brief description..." : lookupKey ? "A short description will appear here automatically once the lookup completes." : "Add a title and author and the app will fill this in automatically.");
      const coverPlaceholder = isLookupRunning ? "Searching..." : lookupKey ? "No cover yet" : "Add book info";
      const refreshLabel = isLookupRunning ? "Searching..." : metaMatchesBook && meta.status === "found" ? "Refresh" : "Retry";
      html += `<div class="book-row ${cls}" style="align-items:flex-start;">
      <div class="book-check ${checkCls}" data-book-check="${book.id}" style="cursor:pointer;flex-shrink:0;margin-top:3px;"></div>
      <div class="book-main">
        <div class="book-stage${stageClass}">${stageLabel}</div>
        <div class="book-input-row">
          <input class="book-edit" data-book-id="${book.id}" data-field="title" value="${escHtml(display.title)}" placeholder="Title">
          <span class="book-sep">&mdash;</span>
          <input class="book-edit" data-book-id="${book.id}" data-field="author" value="${escHtml(display.author)}" placeholder="Author">
          <button class="book-action-btn" data-remove-book="${book.id}">Remove</button>
        </div>
        <div class="book-date-row">
          <input class="book-edit book-date" data-book-id="${book.id}" data-field="startDate" value="${escHtml(display.startDate)}" placeholder="started">
          <span class="book-arr">&rarr;</span>
          <input class="book-edit book-date" data-book-id="${book.id}" data-field="endDate" value="${escHtml(display.endDate)}" placeholder="finished">
        </div>
        <div class="book-meta">
          <div class="book-cover-shell${isLookupRunning ? " cover-loading" : ""}">
            ${coverUrl ? `<img class="book-cover-img" data-cover-id="${book.id}" src="${escHtml(coverUrl)}" alt="Cover of ${escHtml(display.title || "book")}" loading="lazy" referrerpolicy="no-referrer">
                 <div class="book-cover-placeholder" data-cover-fallback="${book.id}" style="display:none;">No cover</div>` : `<div class="book-cover-placeholder">${coverPlaceholder}</div>`}
          </div>
          <div class="book-meta-copy">
            <div class="book-description${description ? "" : " empty"}">${escHtml(descriptionText)}</div>
            <div class="book-meta-row">
              <div class="book-meta-status${status.tone ? " " + status.tone : ""}">${escHtml(status.message)}</div>
              ${lookupKey ? `<button class="book-meta-refresh" data-book-refresh="${book.id}"${isLookupRunning ? " disabled" : ""}>${refreshLabel}</button>` : ""}
            </div>
          </div>
        </div>
      </div>
    </div>`;
    });
    html += `</div></div>`;
    html += `<div class="progress-card behavioral-block section">
    <div class="progress-card-header">
      <div class="progress-card-title">
        <h2>Internal Reality</h2>
        <div class="progress-card-note">The emotional weather of this month in the protocol.</div>
      </div>
      <div class="progress-card-aside">Month ${curMonth}</div>
    </div>
    <div class="behavioral-copy">${monthContext[curMonth]}</div>
  </div>`;
    html += `${logoSVG("logo-footer")}
  <div class="export-row">
    <button class="export-link" id="export-btn">Export</button>
    <button class="export-link" id="import-btn">Import</button>
    <input type="file" id="import-file" accept=".json">
  </div></div>`;
    app.innerHTML = html;
    const emotionSvg = document.querySelector(".emotion-timeline-svg");
    const emotionTip = document.getElementById("emotion-dot-tooltip");
    if (emotionSvg && emotionTip) {
      let lastCircle = null;
      emotionSvg.addEventListener("mouseover", (e) => {
        const circle = e.target.closest ? e.target.closest("circle") : null;
        if (!circle || !circle.dataset.tip) {
          emotionTip.classList.remove("visible");
          if (lastCircle) {
            lastCircle.setAttribute("r", lastCircle.dataset.baseR || "3.5");
            lastCircle.setAttribute("opacity", lastCircle.dataset.baseOp || "0.65");
            lastCircle = null;
          }
          return;
        }
        const tip = circle.dataset.tip;
        const parts = tip.split(" \u2014 ");
        const wordPart = parts[0];
        const datePart = parts[1] || "";
        emotionTip.innerHTML = "<strong>" + wordPart + "</strong>" + (datePart ? ' <span style="color:var(--text-tertiary)">&mdash; ' + datePart + "</span>" : "");
        emotionTip.classList.add("visible");
        if (lastCircle && lastCircle !== circle) {
          lastCircle.setAttribute("r", lastCircle.dataset.baseR || "3.5");
          lastCircle.setAttribute("opacity", lastCircle.dataset.baseOp || "0.65");
        }
        if (!circle.dataset.baseR) {
          circle.dataset.baseR = circle.getAttribute("r");
          circle.dataset.baseOp = circle.getAttribute("opacity");
        }
        circle.setAttribute("r", parseFloat(circle.dataset.baseR) * 1.8);
        circle.setAttribute("opacity", "1");
        lastCircle = circle;
      });
      emotionSvg.addEventListener("mousemove", (e) => {
        const rect = emotionSvg.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const tipW = emotionTip.offsetWidth || 120;
        const clampedX = Math.max(tipW / 2 + 4, Math.min(rect.width - tipW / 2 - 4, x));
        emotionTip.style.left = clampedX + "px";
        emotionTip.style.top = y - 34 + "px";
      });
      emotionSvg.addEventListener("mouseout", (e) => {
        const related = e.relatedTarget;
        if (!related || !related.closest || !related.closest(".emotion-timeline-svg")) {
          emotionTip.classList.remove("visible");
          if (lastCircle) {
            lastCircle.setAttribute("r", lastCircle.dataset.baseR || "3.5");
            lastCircle.setAttribute("opacity", lastCircle.dataset.baseOp || "0.65");
            lastCircle = null;
          }
        }
      });
    }
    document.querySelectorAll(".book-cover-img[data-cover-id]").forEach((img) => {
      const id = img.dataset.coverId;
      img.addEventListener("error", () => {
        img.style.display = "none";
        const fallback = document.querySelector(`.book-cover-placeholder[data-cover-fallback="${id}"]`);
        if (fallback) fallback.style.display = "flex";
      });
    });
    document.querySelectorAll(".book-check[data-book-check]").forEach((check) => {
      check.addEventListener("click", () => {
        const id = parseInt(check.dataset.bookCheck, 10);
        const cur2 = getCurrentReadingBookId(curMonth);
        commit((s) => {
          if (getBookIndex(id) !== -1 && getBookIndex(cur2) !== -1 && getBookIndex(id) < getBookIndex(cur2)) {
            s.reading.currentBook = id;
          } else {
            s.reading.currentBook = getNextReadingBookId(id);
          }
        });
      });
    });
    const addBookButton = document.getElementById("add-book");
    if (addBookButton) {
      addBookButton.addEventListener("click", () => {
        const newBookId = getNewReadingBookId();
        uiState.pendingBookFocusId = newBookId;
        commit((s) => {
          s.reading.books.push(normalizeReadingBook({
            id: newBookId,
            title: "",
            author: "",
            translation: null,
            months: "",
            instruction: "",
            startDate: "",
            endDate: ""
          }, newBookId));
          if (!s.reading.currentBook) s.reading.currentBook = newBookId;
        });
      });
    }
    document.querySelectorAll("[data-remove-book]").forEach((button) => {
      button.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = parseInt(button.dataset.removeBook, 10);
        const bookToRemove = getBookDisplay(id);
        const bookName = bookToRemove && bookToRemove.title ? bookToRemove.title : "this book";
        if (!confirm(`Remove "${bookName}" and its cover data? This cannot be undone.`)) return;
        if (uiState.pendingBookFocusId === id) uiState.pendingBookFocusId = null;
        commit((s) => {
          const books = s.reading.books;
          const index = books.findIndex((book) => book.id === id);
          if (index === -1) return;
          books.splice(index, 1);
          clearBookMeta(id);
          if (s.reading.currentBook === id) {
            if (books[index]) s.reading.currentBook = books[index].id;
            else if (books[index - 1]) s.reading.currentBook = books[index - 1].id;
            else s.reading.currentBook = null;
          }
        });
      });
    });
    document.querySelectorAll(".book-edit").forEach((input) => {
      input.addEventListener("blur", () => {
        const id = parseInt(input.dataset.bookId, 10);
        const field = input.dataset.field;
        const previousBook = getBookDisplay(id);
        if (!previousBook) return;
        const previousTitle = previousBook.title;
        const previousAuthor = previousBook.author;
        commit((s) => {
          const book = s.reading.books.find((b) => b.id === id);
          if (book) book[field] = input.value;
        }, { render: false });
        const nextBook = getBookDisplay(id);
        const bookIdentityChanged = previousTitle !== nextBook.title || previousAuthor !== nextBook.author;
        if ((field === "title" || field === "author") && bookIdentityChanged) {
          clearBookMeta(id);
          save();
          if (getBookLookupKey(nextBook.title, nextBook.author)) {
            startBookMetadataLookup(id, { force: true });
          } else if (uiState.activeView === "progress") {
            requestRender3();
          }
        }
      });
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") input.blur();
      });
    });
    document.querySelectorAll(".book-meta-refresh[data-book-refresh]").forEach((button) => {
      button.addEventListener("click", () => {
        startBookMetadataLookup(parseInt(button.dataset.bookRefresh, 10), { force: true });
      });
    });
    document.querySelectorAll(".month-circle").forEach((circle) => {
      circle.addEventListener("click", () => {
        const m = parseInt(circle.dataset.month);
        const detail = document.getElementById("challenge-detail");
        const mc = state.monthlyChallenges[m];
        if (detail.dataset.active === String(m)) {
          detail.innerHTML = "";
          detail.dataset.active = "";
          return;
        }
        detail.dataset.active = String(m);
        detail.innerHTML = `<div class="challenge-expand">
        <div class="challenge-expand-title">Month ${m}</div>
        <div>${monthlyChallenges[m]}</div>
        ${mc && mc.note ? '<div style="margin-top:6px;color:var(--text-tertiary);">' + escHtml(mc.note) + "</div>" : ""}
        ${mc && mc.completed ? '<div style="margin-top:4px;color:var(--accent);">Completed</div>' : ""}
      </div>`;
      });
    });
    document.getElementById("export-btn").addEventListener("click", () => {
      const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `iroh_protocol_backup_${todayStr()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });
    document.getElementById("import-btn").addEventListener("click", () => {
      document.getElementById("import-file").click();
    });
    document.getElementById("import-file").addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;
      if (!confirm("This will replace all current data. Continue?")) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          setState(normalizeStateShape(JSON.parse(ev.target.result)));
          save();
          requestRender3();
        } catch (err) {
          alert("Invalid JSON file.");
        }
      };
      reader.readAsText(file);
    });
    if (uiState.pendingBookFocusId) {
      const focusId = uiState.pendingBookFocusId;
      uiState.pendingBookFocusId = null;
      requestAnimationFrame(() => {
        const input = document.querySelector(`.book-edit[data-book-id="${focusId}"][data-field="title"]`);
        if (input) {
          input.focus();
          input.select();
        }
      });
    }
    primeBookMetadataLookups(getReadingBooks().map((book) => book.id));
    document.querySelectorAll(".heatmap-cell").forEach((cell) => {
      cell.addEventListener("click", (e) => {
        const wasActive = cell.classList.contains("tapped");
        document.querySelectorAll(".heatmap-cell.tapped").forEach((c) => c.classList.remove("tapped"));
        if (!wasActive) cell.classList.add("tapped");
        e.stopPropagation();
      });
    });
    if (!renderProgress._clickBound) {
      renderProgress._clickBound = true;
      document.addEventListener("click", () => {
        document.querySelectorAll(".heatmap-cell.tapped").forEach((c) => c.classList.remove("tapped"));
      });
    }
  }

  // src/views/reflections.js
  function renderReflections(app) {
    const today = todayStr();
    const themes = getReflectionThemes(state.days, state.startDate, today);
    const reflectionEntryCount = Object.keys(state.days).filter((ds) => {
      const day = state.days[ds];
      if (!day) return false;
      const ref = day.eveningReflection || {};
      const checkins = day.emotionalCheckins || [];
      const wi = day.weeklyIntegration || {};
      return ref.reacted || ref.avoided || ref.grateful || checkins.length > 0 || wi.pattern || wi.learning || wi.carryForward;
    }).length;
    let html = `<div class="page-shell reflections-page">
    <div class="view-hero">
      <div class="view-kicker">Archive</div>
      <div class="view-title-row">
        <div class="view-title">Reflections</div>
        <div class="view-glance">${reflectionEntryCount} dated entr${reflectionEntryCount === 1 ? "y" : "ies"}</div>
      </div>
      <div class="view-copy">Search evening reflections, emotional check-ins, and weekly integration notes without turning the page into a dashboard.</div>
    </div>
    <div class="journal-card section">
      <div class="journal-card-header">
        <div>
          <h2>Search</h2>
          <div class="journal-card-note">Use a phrase or tap a recurring word from the last 30 days.</div>
        </div>
        <div class="journal-card-aside">${themes.length ? `${themes.length} recurring theme${themes.length === 1 ? "" : "s"}` : "No recurring themes yet"}</div>
      </div>
      <div class="search-input">
        <input type="text" id="reflection-search" placeholder="Search reflections..." aria-label="Search reflections">
      </div>`;
    if (themes.length > 0) {
      html += `<div style="margin-top:14px;">
      <div style="font-size:10px;color:var(--text-tertiary);margin-bottom:8px;letter-spacing:0.06em;text-transform:uppercase;">Recurring words \u2014 last 30 days</div>
      <div class="theme-tags" id="theme-tags">
        ${themes.map((t) => `<span class="theme-tag" data-theme="${escHtml(t.word)}">${t.word} <span style="color:var(--text-tertiary)">${t.count}</span></span>`).join("")}
      </div>
    </div>`;
    }
    html += `</div><div id="reflection-list" class="reflection-list"></div></div>`;
    app.innerHTML = html;
    function renderList(filter) {
      const list = document.getElementById("reflection-list");
      const dates = Object.keys(state.days).sort().reverse();
      let out = "";
      const q = (filter || "").toLowerCase();
      dates.forEach((ds) => {
        const day = state.days[ds];
        const ref = day.eveningReflection || {};
        const checkins = day.emotionalCheckins || [];
        const wi = day.weeklyIntegration || {};
        const hasRef = ref.reacted || ref.avoided || ref.grateful;
        const hasCheckins = checkins.length > 0;
        const hasWI = wi.pattern || wi.learning || wi.carryForward;
        if (!hasRef && !hasCheckins && !hasWI) return;
        if (q) {
          const allText = [ref.reacted, ref.avoided, ref.grateful, wi.pattern, wi.learning, wi.carryForward, ...checkins.map((c) => c.label)].join(" ").toLowerCase();
          if (!allText.includes(q)) return;
        }
        out += `<div class="journal-card reflection-entry">
        <div class="reflection-entry-header">
          <div class="reflection-date">${formatDateLong(ds)}</div>
          <div class="reflection-meta">${checkins.length ? `${checkins.length} check-in${checkins.length === 1 ? "" : "s"}` : hasWI ? "Weekly integration" : "Reflection"}</div>
        </div>`;
        if (ref.reacted) {
          out += `<div class="reflection-q">Where did I react instead of respond?</div>
        <div class="reflection-a">${escHtml(ref.reacted)}</div>`;
        }
        if (ref.avoided) {
          out += `<div class="reflection-q">What did I avoid?</div>
        <div class="reflection-a">${escHtml(ref.avoided)}</div>`;
        }
        if (ref.grateful) {
          out += `<div class="reflection-q">What am I grateful for that I didn't create?</div>
        <div class="reflection-a">${escHtml(ref.grateful)}</div>`;
        }
        if (checkins.length) {
          out += `<div class="reflection-checkins">`;
          checkins.forEach((c) => {
            out += `<div class="reflection-checkin">${c.time} \u2014 ${escHtml(c.label)}</div>`;
          });
          out += `</div>`;
        }
        if (hasWI) {
          if (wi.pattern) {
            out += `<div class="reflection-q reflection-q-wi">What pattern kept showing up this week?</div>
          <div class="reflection-a">${escHtml(wi.pattern)}</div>`;
          }
          if (wi.learning) {
            out += `<div class="reflection-q">What am I learning about myself that I didn\u2019t expect?</div>
          <div class="reflection-a">${escHtml(wi.learning)}</div>`;
          }
          if (wi.carryForward) {
            out += `<div class="reflection-q">What do I want to carry into next week?</div>
          <div class="reflection-a">${escHtml(wi.carryForward)}</div>`;
          }
        }
        out += `</div>`;
      });
      if (!out) out = `<div class="journal-card" style="color:var(--text-tertiary);text-align:center;">${logoSVG("logo-empty")}No reflections yet.</div>`;
      list.innerHTML = out;
    }
    renderList("");
    document.getElementById("reflection-search").addEventListener("input", (e) => {
      document.querySelectorAll(".theme-tag").forEach((t) => t.classList.remove("active"));
      renderList(e.target.value);
    });
    document.querySelectorAll(".theme-tag").forEach((tag) => {
      tag.addEventListener("click", () => {
        const word = tag.dataset.theme;
        const searchInput = document.getElementById("reflection-search");
        const isActive = tag.classList.contains("active");
        document.querySelectorAll(".theme-tag").forEach((t) => t.classList.remove("active"));
        if (isActive) {
          searchInput.value = "";
          renderList("");
        } else {
          tag.classList.add("active");
          searchInput.value = word;
          renderList(word);
        }
      });
    });
  }

  // src/app.js
  function setActiveTab(view) {
    document.querySelectorAll(".nav-tab").forEach((tab) => {
      tab.classList.toggle("active", tab.dataset.view === view);
    });
  }
  function renderSetup() {
    document.getElementById("nav").style.display = "none";
    const app = document.getElementById("app");
    const today = todayStr();
    app.innerHTML = `
    <div class="setup-shell">
      <div class="journal-card setup">
        ${logoSVG("logo-setup")}
        <div class="view-kicker" style="justify-content:center;">Protocol Iroh</div>
        <h1>When does your protocol begin?</h1>
        <div class="setup-copy">Choose the day the record should start. Everything stays local, quiet, and easy to return to.</div>
        <input type="date" id="start-date" value="${today}">
        <button class="begin-btn" id="begin-btn">Begin</button>
      </div>
    </div>
  `;
    document.getElementById("begin-btn").addEventListener("click", () => {
      const startDate = document.getElementById("start-date").value;
      if (!startDate) return;
      setState(normalizeStateShape({ startDate }));
      uiState.activeView = "daily";
      uiState.viewDate = todayStr();
      uiState.weekOffset = 0;
      save();
      document.getElementById("nav").style.display = "flex";
      setupNav();
      setActiveTab("daily");
      render();
    });
  }
  var navBound = false;
  function setupNav() {
    if (navBound) return;
    navBound = true;
    document.querySelectorAll(".nav-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        uiState.activeView = tab.dataset.view;
        setActiveTab(uiState.activeView);
        if (uiState.activeView === "daily") uiState.viewDate = todayStr();
        if (uiState.activeView === "week") uiState.weekOffset = 0;
        render();
      });
    });
    const navLogo = document.getElementById("nav-logo");
    if (navLogo) {
      navLogo.addEventListener("click", () => {
        uiState.activeView = "daily";
        uiState.viewDate = todayStr();
        setActiveTab("daily");
        render();
      });
    }
  }
  var previousView = null;
  function render() {
    const app = document.getElementById("app");
    const viewChanged = uiState.activeView !== previousView;
    setActiveTab(uiState.activeView);
    const scrollY = viewChanged ? 0 : window.scrollY;
    const focusedEl = document.activeElement;
    const focusId = focusedEl && focusedEl.id ? focusedEl.id : null;
    const focusDataKey = !focusId && focusedEl && focusedEl.dataset ? focusedEl.dataset.ritualLabel || focusedEl.dataset.bookId || null : null;
    const focusTag = focusedEl ? focusedEl.tagName : null;
    const selStart = focusTag === "INPUT" || focusTag === "TEXTAREA" ? focusedEl.selectionStart : null;
    const selEnd = focusTag === "INPUT" || focusTag === "TEXTAREA" ? focusedEl.selectionEnd : null;
    previousView = uiState.activeView;
    switch (uiState.activeView) {
      case "daily":
        renderDaily(app);
        break;
      case "week":
        renderWeek(app);
        break;
      case "progress":
        renderProgress(app);
        break;
      case "reflections":
        renderReflections(app);
        break;
      default:
        renderDaily(app);
        break;
    }
    if (viewChanged) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.scrollTo({ top: scrollY });
    }
    let restored = null;
    if (focusId) restored = document.getElementById(focusId);
    if (!restored && focusDataKey) {
      restored = document.querySelector(`[data-ritual-label="${focusDataKey}"]`) || document.querySelector(`[data-book-id="${focusDataKey}"]`);
    }
    if (restored) {
      restored.focus();
      if (selStart !== null && typeof restored.setSelectionRange === "function") {
        try {
          restored.setSelectionRange(selStart, selEnd);
        } catch (err) {
        }
      }
    }
  }
  var keyboardBound = false;
  function setupKeyboardShortcuts() {
    if (keyboardBound) return;
    keyboardBound = true;
    document.addEventListener("keydown", (event) => {
      if (!state || uiState.activeView !== "daily") return;
      const target = event.target;
      const tagName = target && target.tagName ? target.tagName : "";
      const inInput = tagName === "INPUT" || tagName === "TEXTAREA";
      if (event.key === "e" && !inInput) {
        event.preventDefault();
        const input = document.getElementById("checkin-input");
        if (input) input.focus();
        return;
      }
      if (event.key === "t" && !inInput) {
        uiState.viewDate = todayStr();
        render();
        return;
      }
      if (event.key === "ArrowLeft" && !inInput) {
        uiState.viewDate = addDays(uiState.viewDate, -1);
        render();
        return;
      }
      if (event.key === "ArrowRight" && !inInput) {
        uiState.viewDate = addDays(uiState.viewDate, 1);
        render();
        return;
      }
      if (inInput) return;
      const morningKeys = state.ritualTemplate.morning.map((item) => item.key);
      const eveningKeys = state.ritualTemplate.evening.map((item) => item.key);
      const numKey = parseInt(event.key, 10);
      if (numKey >= 1 && numKey <= morningKeys.length) {
        if (isFuture(uiState.viewDate)) return;
        ensureDay(uiState.viewDate);
        const key = morningKeys[numKey - 1];
        commit((draft) => {
          draft.days[uiState.viewDate].morning[key] = !draft.days[uiState.viewDate].morning[key];
        });
        return;
      }
      if (numKey > morningKeys.length && numKey <= morningKeys.length + eveningKeys.length) {
        if (isFuture(uiState.viewDate)) return;
        ensureDay(uiState.viewDate);
        const key = eveningKeys[numKey - morningKeys.length - 1];
        commit((draft) => {
          draft.days[uiState.viewDate].evening[key] = !draft.days[uiState.viewDate].evening[key];
        });
      }
    });
  }
  function init() {
    setState(loadState());
    setRenderCallback(render);
    setupKeyboardShortcuts();
    if (!state) {
      renderSetup();
      return;
    }
    document.getElementById("nav").style.display = "flex";
    setupNav();
    setActiveTab(uiState.activeView);
    render();
  }
  init();
})();
