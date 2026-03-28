# Iroh Protocol Tracker — Build Specification

> **Purpose:** This document is a complete build spec for Claude Code. It contains every data structure, view, interaction, and design decision needed to build a local web app that tracks the Iroh Protocol — a 12-month personal development system. Read this entire file before writing any code.

---

## 1. PROJECT OVERVIEW

**What this is:** A single-page local web application for tracking daily, weekly, and monthly practices from a 12-month personal development protocol. The user opens it in their browser like a bookmark. It runs entirely client-side with no server, no build step, no framework dependencies.

**Tech stack:**
- Single `index.html` file containing all HTML, CSS, and JS
- Vanilla JavaScript (no React, no Vue, no frameworks)
- Data persistence via `localStorage` (JSON serialized)
- No external dependencies, no CDN imports, no build tools
- Must work offline after first load

**Target:** Desktop browser (Chrome/Firefox). Mobile responsiveness is not required but don't break it.

**Core UX principle:** This app should feel like opening a well-made leather journal, not a fitness app. The user interacts with it twice a day (morning + evening), briefly. Friction must be near zero. No modals blocking interaction. No confirmation dialogs for routine actions. No animations that delay input.

---

## 2. DATA MODEL

All data is stored in `localStorage` under a single key `iroh_protocol_data`. The value is a JSON object with this structure:

```javascript
{
  // Protocol start date — set once on first use
  "startDate": "2026-04-01", // ISO date string

  // Daily entries keyed by ISO date
  "days": {
    "2026-04-01": {
      "morning": {
        "noPhone": false,        // No phone for first 20 min
        "coldExposure": false,   // Cold water (face/forearms or shower)
        "breathwork": false,     // 4-7-8 pattern × 6 cycles
        "meditation": false,     // 10 min seated meditation
        "journaling": false,     // Stream of consciousness writing
        "philosophyRead": false  // One passage from current book
      },
      "evening": {
        "dailyReview": false,    // Three written questions
        "bodyScan": false        // 10 min body scan
      },
      "emotionalCheckins": [
        // Up to 3 entries per day
        // { "time": "09:30", "label": "restless anticipation" }
      ],
      "eveningReflection": {
        "reacted": "",    // "Where did I react instead of respond?"
        "avoided": "",    // "What did I avoid?"
        "grateful": ""    // "What am I grateful for that I didn't create?"
      },
      "weeklyPractice": {
        // Only populated if today has a weekly practice
        "completed": false,
        "type": "" // "strength" | "walk" | "craft" | "solitude" | "philosophy"
      }
    }
  },

  // Monthly challenge completion
  "monthlyChallenges": {
    "1": { "completed": false, "note": "" },
    "2": { "completed": false, "note": "" },
    // ... through 12
  },

  // Reading tracker
  "reading": {
    "currentBook": 1, // 1-7, index into reading list
    "notes": ""       // Optional freeform note on progress
  }
}
```

### Helper: Determining Current Protocol Month

```javascript
function getCurrentMonth(startDate) {
  const start = new Date(startDate);
  const now = new Date();
  const diffMs = now - start;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return Math.min(12, Math.max(1, Math.floor(diffDays / 30) + 1));
}
```

### Helper: Determining Today's Weekly Practice

```javascript
function getTodayPractice(dayOfWeek) {
  // 0 = Sunday, 1 = Monday, ...
  const map = {
    0: { type: "philosophy", label: "Philosophy Study", sublabel: "Deep read + written reflection", duration: "60 min" },
    1: { type: "strength", label: "Strength Training", sublabel: "Compound lifts", duration: "45 min" },
    2: { type: "walk", label: "Silent Walk", sublabel: "No headphones, no destination", duration: "30 min" },
    3: { type: "strength", label: "Strength Training", sublabel: "Compound lifts", duration: "45 min" },
    4: { type: "craft", label: "Craft Practice", sublabel: "Hands-on skill, no audience", duration: "45 min" },
    5: { type: "strength", label: "Strength Training", sublabel: "Compound lifts", duration: "45 min" },
    6: { type: "solitude", label: "Extended Solitude + Nature", sublabel: "Hike, water, forest — no phone", duration: "90 min" }
  };
  return map[dayOfWeek];
}
```

---

## 3. VIEWS

The app has **four views**, navigated by tabs or a minimal sidebar. The Daily View is the default.

---

### 3.1 DAILY VIEW (default, primary screen)

This is 90% of all interaction. Layout is a single scrollable column, comfortably narrow (max-width ~640px, centered).

**Header section:**
- Today's date, formatted long: "Friday, 27 March 2026"
- Current protocol month: "Month 3 of 12"
- A short context line from the protocol's progression timeline for the current month (see Section 6 for exact text per month)

**Morning Routine block:**
- Title: "Morning" with a small "35 min" tag
- 6 checkboxes in a vertical list, each with its label:
  1. "No phone — first 20 minutes"
  2. "Cold exposure"
  3. "Breathwork — 4-7-8 × 6 cycles"
  4. "Meditation — 10 min open awareness"
  5. "Journaling — stream of consciousness"
  6. "Philosophy reading — one passage"
- Clicking a checkbox toggles it and saves immediately (no submit button)
- Show completion as a subtle fraction: "4/6" next to the title

**Today's Weekly Practice block:**
- Automatically determined by day of week (see helper above)
- Shows: practice name, sublabel, duration
- Single checkbox to mark complete
- Example: on Monday, shows "Strength Training — Compound lifts — 45 min ☐"

**Emotional Check-ins block:**
- Title: "Emotional Check-ins" with count "1/3"
- Up to 3 check-in slots
- Each slot: a text input field with placeholder "What exactly am I feeling right now?"
- When the user types and presses Enter (or clicks a small "+" or "Log" button), it saves with the current time
- Logged entries show as: "09:42 — restless anticipation" (non-editable after logging, but deletable with a small × icon)
- If all 3 are logged, the input disappears and shows "3/3 logged"

**Evening Routine block:**
- Title: "Evening" with "15 min" tag
- 2 checkboxes:
  1. "Daily review — three questions"
  2. "Body scan — 10 min"
- Completion fraction: "1/2"

**Evening Reflection block (expandable):**
- Collapsed by default with the label "Evening Reflection" and a chevron
- When expanded, shows 3 text areas:
  1. Label: "Where did I react instead of respond?" — textarea, 2-3 rows
  2. Label: "What did I avoid?" — textarea, 2-3 rows
  3. Label: "What am I grateful for that I didn't create?" — textarea, 2-3 rows
- Auto-saves on blur (when the user clicks away). No save button.
- If any field has content, show a small filled dot indicator on the collapsed header so the user knows they already wrote something

**Current Reading block (small, bottom of page):**
- Shows current book based on protocol month:
  - Months 1–2: "Meditations — Marcus Aurelius (Hays translation)"
  - Months 2–3: "Tao Te Ching — Lao Tzu (Mitchell translation)"
  - Months 3–4: "The Body Keeps the Score — Bessel van der Kolk"
  - Month 5: "Man's Search for Meaning — Viktor Frankl"
  - Months 6–7: "The Analects — Confucius (Slingerland translation)"
  - Months 7–8: "Letting Go — David Hawkins"
  - Months 9–12: "The Master and His Emissary — Iain McGilchrist"
- Small text, not interactive — just a quiet reminder

**Monthly Challenge block (small, bottom of page):**
- Shows this month's challenge text
- Single checkbox to mark complete
- Small text area for an optional note
- The 12 challenges (verbatim):
  1. "Eat alone at a restaurant. No phone."
  2. "Have a conversation with someone you'd normally avoid."
  3. "24-hour fast (water only)."
  4. "Write a letter to someone you've wronged."
  5. "Spend a full day in silence."
  6. "Do something you're bad at in public."
  7. "Cold immersion — 2 minutes minimum."
  8. "Revisit the letter from month 4. Write another if needed."
  9. "Mentor someone. Teach a skill."
  10. "Spend 48 hours without any screen."
  11. "Have a difficult conversation you've been postponing."
  12. "Read your journal cover to cover. Write one page: who were you, who are you now."

---

### 3.2 WEEK VIEW

A 7-column grid showing the current week (Monday–Sunday).

**Each column contains:**
- Day name and date (e.g., "Mon 24")
- Morning completion: filled/empty circle or fraction (e.g., "6/6" or "4/6")
- Evening completion: filled/empty circle or fraction
- Weekly practice: name + completed/not icon
- Emotional check-ins: count (e.g., "3/3" or "1/3")
- Clicking any day navigates the Daily View to that date

**Bottom of Week View:**
- "Weekly completion rate: 78%" — calculated as (total completed items across all 7 days) / (total possible items across all 7 days)
- A simple horizontal bar showing this percentage, filled in the accent color

**Navigation:**
- Left/right arrows to move between weeks
- "This week" button to return to current week

---

### 3.3 PROGRESS VIEW

The long-range view. Shows the 12-month arc.

**Heatmap Calendar:**
- A GitHub-style contribution grid showing every day since `startDate`
- Each cell colored by daily completion rate:
  - 0%: empty/darkest background
  - 1–40%: dim shade
  - 41–70%: medium shade
  - 71–99%: bright shade
  - 100%: full accent color
- Hovering a cell shows a tooltip: "Tue 15 Apr — 6/8 completed"

**Streak Counter:**
- "Current streak: 14 days" (consecutive days with at least 1 morning item completed)
- "Longest streak: 23 days"
- A streak is defined as: a day counts if the daily non-negotiable (meditation) was checked. This aligns with Section 10 of the protocol — the single daily non-negotiable.

**Monthly Challenges Progress:**
- A horizontal row of 12 circles, numbered 1–12
- Completed months are filled with accent color
- Current month is outlined/highlighted
- Clicking a circle shows the challenge text and completion note in a small inline expansion below the row (not a modal)

**Fitness Phase Indicator:**
- Based on current month, show the current fitness phase:
  - Months 1–2: "Bodyweight Fundamentals"
  - Months 3–4: "Barbell Introduction"
  - Months 5–8: "Linear Progression"
  - Months 9–12: "Intermediate Programming"

**Reading Progress:**
- Visual list of all 7 books
- Current book highlighted
- Completed books shown as checked/dimmed
- Use the same month-to-book mapping from the Daily View

**Month Behavioral Markers:**
- For the current month, display the "Internal Reality" text from the protocol's progression timeline (Section 8). This gives the user context for what they're likely experiencing. Exact text per month provided in Section 6 below.

---

### 3.4 REFLECTIONS VIEW

A searchable, scrollable archive of all evening reflections and emotional check-ins.

**Layout:**
- Reverse chronological list (newest first)
- Each entry shows the date as a header
- Under the date: the 3 evening reflection answers (if any were written)
- Under those: the emotional check-in labels with timestamps

**Search:**
- A search input at the top
- Filters entries by text match across all fields (reflection answers + emotional labels)
- Real-time filtering as the user types

**This view exists because:** Over months, the accumulated reflection data becomes the most valuable part of the app. Being able to search for patterns ("when did I last feel dread?", "what have I been avoiding?") is where the tracking pays off.

---

## 4. VISUAL DESIGN

### Direction: Quiet Utility

The aesthetic is **dark, typographic, and deliberately plain** — closer to a terminal or a well-set book page than to a modern SaaS dashboard. No rounded cards with drop shadows. No gradient backgrounds. No emoji. No illustrations. The app should feel like a tool that respects your time.

### Color Palette (CSS Custom Properties)

```css
:root {
  --bg-primary: #0f0f0f;       /* Near black, main background */
  --bg-secondary: #1a1a1a;     /* Slightly lighter, for blocks/cards */
  --bg-tertiary: #252525;      /* Input fields, hover states */
  --border: #2a2a2a;           /* Subtle borders between sections */
  --text-primary: #d4d4d4;     /* Main text — not pure white, slightly warm */
  --text-secondary: #777777;   /* Labels, sublabels, meta text */
  --text-tertiary: #4a4a4a;    /* Placeholders, disabled text */
  --accent: #c19a6b;           /* Warm muted gold — used sparingly: active states, streaks, completion fills */
  --accent-dim: #8b7355;       /* Dimmed accent for partial completion */
  --success: #5a7a5a;          /* Muted green — completed items in heatmap */
  --danger: #7a4a4a;           /* Muted red — only for delete confirmation on emotional check-ins */
}
```

**The accent color (`#c19a6b`)** is used only for: the filled state of checkboxes, streak counters, heatmap high-completion cells, the current month indicator, and the weekly completion bar. Nowhere else. Restraint is the point.

### Typography

```css
/* Use a single monospace or near-monospace font for everything.
   Prioritize: JetBrains Mono, IBM Plex Mono, or SF Mono.
   Load from Google Fonts (JetBrains Mono) as a single import. */

body {
  font-family: 'JetBrains Mono', 'SF Mono', 'Consolas', monospace;
  font-size: 13px;
  line-height: 1.6;
  letter-spacing: 0.01em;
}

h1 { font-size: 16px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.12em; }
h2 { font-size: 14px; font-weight: 500; letter-spacing: 0.08em; }
h3 { font-size: 13px; font-weight: 400; color: var(--text-secondary); }
```

**Why monospace:** It reinforces the journal/tool aesthetic. It prevents the app from looking like a consumer product. Every character occupying equal width creates a grid-like visual discipline that matches the protocol's structure.

### Layout Rules

- Max content width: 640px, centered horizontally
- Page padding: 40px top, 24px sides
- Section spacing: 32px between major blocks
- No cards with visible borders/shadows — use spacing and subtle background color shifts to separate sections
- Checkboxes: custom-styled, square, 16×16px, 1px border in `--border`, filled with `--accent` when checked. No checkmark icon — just filled square vs empty square
- Text inputs and textareas: no visible border. Background `--bg-tertiary`. Subtle bottom border only (1px `--border`). Focus state: bottom border becomes `--accent`
- All interactive elements get a subtle transition: `transition: all 0.15s ease`
- No hover animations on checkboxes — instant feedback only

### Navigation

- Top of page: horizontal tab bar with 4 labels: "Today", "Week", "Progress", "Reflections"
- Active tab: `--text-primary` color + 2px bottom border in `--accent`
- Inactive tabs: `--text-secondary` color, no border
- Tab bar has a bottom border: 1px `--border`
- Tab bar is sticky (stays visible on scroll)

### Custom Checkbox Implementation

Do NOT use default browser checkboxes. Build custom ones:

```css
/* Checkbox: a square that fills with accent color when checked */
.checkbox {
  width: 16px;
  height: 16px;
  border: 1px solid var(--border);
  background: transparent;
  cursor: pointer;
  transition: background 0.1s ease;
  flex-shrink: 0;
}
.checkbox.checked {
  background: var(--accent);
  border-color: var(--accent);
}
```

### Responsive Behavior

- Below 768px width: reduce page padding to 16px, reduce font size to 12px
- The week view columns can scroll horizontally on narrow screens
- No other responsive changes needed — this is a desktop-primary tool

---

## 5. INTERACTION PATTERNS

### Data Saving
- Every state change saves immediately to `localStorage`. No save buttons anywhere.
- On page load, read from `localStorage` and hydrate the UI.
- If no data exists (first launch), show a one-time setup screen (see Section 7).

### Date Navigation
- The Daily View defaults to today's date
- Include small left/right arrows next to the date to navigate to previous/next days
- Navigating to a past day shows that day's data (read-only for checkboxes? No — allow editing past days. The user should be able to retroactively check items they forgot to log.)
- Navigating to a future date shows an empty state with the text "Not yet."

### Keyboard Shortcuts
- `1` through `6`: toggle morning routine items 1–6
- `7`, `8`: toggle evening routine items 1–2
- `e`: focus the emotional check-in input
- `←` / `→`: navigate days (when not focused on a text input)
- `t`: return to today

### Emotional Check-in Flow
1. User clicks the input or presses `e`
2. Types their emotional label (e.g., "quiet dread")
3. Presses Enter
4. Entry appears below with timestamp, input clears
5. After 3 entries, input is hidden for the day

### First Launch
- If `localStorage` has no `iroh_protocol_data`, show a simple setup:
  - Heading: "When does your protocol begin?"
  - A date input, defaulting to today
  - A single button: "Begin"
  - This sets `startDate` and creates the initial data structure

### Data Export
- In the Progress view, include a small "Export" link at the bottom
- Clicking it downloads the entire `localStorage` JSON as `iroh_protocol_backup_YYYY-MM-DD.json`
- Also include an "Import" link that accepts a JSON file and replaces `localStorage` data (with a confirmation: "This will replace all current data. Continue?")

---

## 6. PROTOCOL CONTENT — EXACT TEXT TO EMBED

### Monthly Context Lines (shown in Daily View header)

These are drawn from Section 8 of the protocol. Show the one matching the current month.

```javascript
const monthContext = {
  1: "Novelty phase. High motivation. Enjoy it — but don't trust it. It's not discipline yet, it's enthusiasm.",
  2: "The resistance. Motivation drops. The routines feel mechanical. This is the most important month. Most people quit here.",
  3: "The valley. You may feel more emotionally volatile than before. This is a positive sign — you're feeling things you previously suppressed. Stay the course.",
  4: "Stabilization. The routines start to feel like yours, not like something you're performing.",
  5: "First integration. You'll notice the gap between stimulus and response in real time — not just in review.",
  6: "First integration continues. A new kind of confidence that doesn't need to announce itself.",
  7: "Deepening. The practices become a genuine source of pleasure, not obligation.",
  8: "Deepening continues. You're becoming someone you didn't plan. The archetype is a compass, not a mould.",
  9: "Generativity. You begin to orient outward. Others start coming to you — for advice, for steadiness, for presence.",
  10: "Generativity continues. The shift from self-construction to contribution.",
  11: "Integration. Not completion — the work is permanent. But the foundation is built.",
  12: "Integration. You stop thinking about 'becoming' anything. You are simply operating from a broader base."
};
```

### Monthly Challenges (shown in Daily View)

```javascript
const monthlyChallenges = {
  1: "Eat alone at a restaurant. No phone.",
  2: "Have a conversation with someone you'd normally avoid — a stranger, someone intimidating, someone you disagree with. Seek to understand, not to persuade.",
  3: "24-hour fast (water only).",
  4: "Write a letter to someone you've wronged. Send it or don't — the writing is the practice.",
  5: "Spend a full day in silence. No speech, no texting, no social media.",
  6: "Do something you're bad at in public — dance class, open mic, art class.",
  7: "Cold immersion — lake, river, or ice bath. 2 minutes minimum.",
  8: "Revisit the letter from month 4. Write another if needed.",
  9: "Mentor someone. Teach a skill you have to someone who wants it.",
  10: "Spend 48 hours without any screen.",
  11: "Have a difficult conversation you've been postponing.",
  12: "Sit with your journal from the past year. Read it cover to cover. Write a single page: who were you, who are you now, what remains."
};
```

### Reading List (shown in Daily View + Progress View)

```javascript
const readingList = [
  { id: 1, title: "Meditations", author: "Marcus Aurelius", translation: "Hays", months: "1–2", instruction: "One entry per morning. Open to any page." },
  { id: 2, title: "Tao Te Ching", author: "Lao Tzu", translation: "Mitchell", months: "2–3", instruction: "One chapter per morning. 81 short chapters." },
  { id: 3, title: "The Body Keeps the Score", author: "Bessel van der Kolk", translation: null, months: "3–4", instruction: "One chapter per week." },
  { id: 4, title: "Man's Search for Meaning", author: "Viktor Frankl", translation: null, months: "5", instruction: "Read in two sittings." },
  { id: 5, title: "The Analects", author: "Confucius", translation: "Slingerland", months: "6–7", instruction: "One section per week with Sunday study." },
  { id: 6, title: "Letting Go", author: "David Hawkins", translation: null, months: "7–8", instruction: "Practice the technique as you encounter it." },
  { id: 7, title: "The Master and His Emissary", author: "Iain McGilchrist", translation: null, months: "9–12", instruction: "Long book. No rush. It's the capstone." }
];

// Map month number to book ID
function getBookForMonth(month) {
  if (month <= 2) return 1;
  if (month <= 3) return 2; // Overlap: month 2 has both books 1 and 2
  if (month <= 4) return 3;
  if (month === 5) return 4;
  if (month <= 7) return 5;
  if (month <= 8) return 6;
  return 7;
}
```

### Fitness Phase (shown in Progress View)

```javascript
const fitnessPhase = {
  1: "Bodyweight Fundamentals — push-ups, squats, rows, planks",
  2: "Bodyweight Fundamentals — push-ups, squats, rows, planks",
  3: "Barbell Introduction — squat, deadlift, press, row",
  4: "Barbell Introduction — squat, deadlift, press, row",
  5: "Linear Progression — strength gains accelerating",
  6: "Linear Progression — strength gains accelerating",
  7: "Linear Progression — discipline becomes enjoyable",
  8: "Linear Progression — discipline becomes enjoyable",
  9: "Intermediate Programming — habit is self-sustaining",
  10: "Intermediate Programming — habit is self-sustaining",
  11: "Intermediate Programming — habit is self-sustaining",
  12: "Intermediate Programming — habit is self-sustaining"
};
```

---

## 7. FILE STRUCTURE

```
iroh-tracker/
├── index.html          ← The entire application (HTML + CSS + JS in one file)
├── README.md           ← Brief usage instructions
└── iroh_protocol.md    ← The source protocol document (reference copy)
```

That's it. One file. The `index.html` should be fully self-contained. The only external resource is the Google Fonts import for JetBrains Mono.

---

## 8. IMPLEMENTATION NOTES

### State Management Pattern

Use a simple reactive pattern: a central state object, a `save()` function that writes to localStorage, and a `render()` function that re-renders the active view. Don't build a virtual DOM — just re-render the content area on state change. With this app's complexity level, full re-renders are fast enough.

```javascript
let state = loadState(); // from localStorage or default

function save() {
  localStorage.setItem('iroh_protocol_data', JSON.stringify(state));
}

function render() {
  // Re-render the current view based on activeView variable
}
```

### Calculating Completion Rates

```javascript
function getDayCompletion(dayData) {
  if (!dayData) return { completed: 0, total: 0, rate: 0 };
  let completed = 0;
  let total = 8; // 6 morning + 2 evening

  // Morning items
  Object.values(dayData.morning).forEach(v => { if (v) completed++; });
  // Evening items
  Object.values(dayData.evening).forEach(v => { if (v) completed++; });
  // Weekly practice (if applicable for this day)
  if (dayData.weeklyPractice && dayData.weeklyPractice.type) {
    total++;
    if (dayData.weeklyPractice.completed) completed++;
  }

  return { completed, total, rate: total > 0 ? completed / total : 0 };
}
```

### Heatmap Generation

- Calculate the number of weeks between `startDate` and today
- Render a grid: 7 rows (Mon–Sun) × N columns (weeks)
- Each cell is a small square (12×12px with 2px gap)
- Color each cell using the completion rate for that date and the 4-tier color scale described in Section 4

### Date Utilities

- Use native `Date` objects throughout. No date libraries.
- Store all dates as ISO strings (`YYYY-MM-DD`)
- Helper to get ISO date string: `new Date().toISOString().split('T')[0]`
- Helper to get day of week: `new Date(dateStr).getDay()`

---

## 9. WHAT NOT TO BUILD

Explicit list of features to **exclude**. These are tempting but counterproductive:

- **No gamification.** No points, no badges, no levels, no XP. The protocol explicitly warns against ego inflation.
- **No notifications or reminders.** This is a passive tool. The user comes to it; it doesn't chase the user.
- **No social features.** No sharing, no leaderboards.
- **No analytics dashboard with charts.** The heatmap is sufficient. Don't add line graphs of "emotional wellness over time" or similar nonsense.
- **No dark/light theme toggle.** Dark only. The design is the design.
- **No onboarding tutorial.** The interface is self-explanatory. If it needs a tutorial, it's too complex.
- **No loading states or skeleton screens.** Everything is local and instant.
- **No settings page** beyond the initial start date setup. The protocol is not configurable — that's by design.
- **No motivational quotes or pop-up encouragements.** The monthly context line is the only protocol text that appears. The rest is functional.

---

## 10. TESTING CHECKLIST

After building, verify:

- [ ] First launch shows date picker, sets start date, transitions to Daily View
- [ ] All 6 morning checkboxes toggle and persist across page reload
- [ ] All 2 evening checkboxes toggle and persist across page reload
- [ ] Emotional check-in: can type, press Enter, see timestamped entry, limit of 3
- [ ] Emotional check-in: can delete with × button
- [ ] Evening reflection textareas auto-save on blur
- [ ] Evening reflection collapsed state shows dot indicator when content exists
- [ ] Day navigation arrows work, past days show saved data
- [ ] Future dates show "Not yet."
- [ ] Week view shows correct 7 days with accurate completion data
- [ ] Week view arrows navigate between weeks
- [ ] Progress view heatmap renders correctly from start date to today
- [ ] Streak counter accurately calculates based on meditation checkbox
- [ ] Monthly challenges show correct challenge for current protocol month
- [ ] Reading section shows correct book for current protocol month
- [ ] Reflections view lists all entries reverse chronologically
- [ ] Reflections search filters entries by text match
- [ ] Export downloads valid JSON
- [ ] Import restores data correctly
- [ ] Keyboard shortcuts work (1-8, e, arrows, t)
- [ ] All data survives browser restart (localStorage persistence)
- [ ] No console errors during normal use
