// ── PROGRESS VIEW ──
import {
  monthContext,
  monthlyChallenges,
  trainingFocus,
  getEmotionQuadrant,
  QUADRANT_LABELS,
  QUADRANT_COLORS,
  QUADRANT_Y_RATIOS
} from '../data.js';
import {
  state,
  setState,
  normalizeStateShape,
  save,
  commit,
  bookLookupRuntime,
  getReadingBooks,
  getBookDisplay,
  getCurrentReadingBookId,
  getBookIndex,
  getDayCompletion,
  getBookMeta,
  getBookMetaStatus,
  startBookMetadataLookup,
  primeBookMetadataLookups,
  clearBookMeta,
  getBookLookupKey,
  getNewReadingBookId,
  getNextReadingBookId
} from '../state.js';
import { uiState, getRenderCallback } from '../ui-state.js';
import { todayStr, dateFromStr, formatDateShort, escHtml, logoSVG, getCurrentMonth } from '../utils.js';

function requestRender() {
  const render = getRenderCallback();
  if (render) render();
}

export function renderProgress(app) {
  const curMonth = getCurrentMonth(state.startDate);
  const today = todayStr();
  const startDate = dateFromStr(state.startDate);
  const todayDate = dateFromStr(today);
  const trackedDates = Object.keys(state.days)
    .filter(ds => ds >= state.startDate && ds <= today)
    .sort();
  const readingBooks = getReadingBooks();
  const curBookId = getCurrentReadingBookId(curMonth);
  const currentBookIndex = getBookIndex(curBookId);
  const completedBooks = currentBookIndex === -1 ? 0 : currentBookIndex;
  const activeMonthChallenge = state.monthlyChallenges[curMonth];
  let totalCompletedAcrossProtocol = 0;
  let totalPossibleAcrossProtocol = 0;
  trackedDates.forEach(ds => {
    const comp = getDayCompletion(state.days[ds]);
    totalCompletedAcrossProtocol += comp.completed;
    totalPossibleAcrossProtocol += comp.total;
  });
  const overallRate = totalPossibleAcrossProtocol > 0
    ? Math.round(totalCompletedAcrossProtocol / totalPossibleAcrossProtocol * 100)
    : 0;
  const trackedDaysLabel = `${trackedDates.length} tracked day${trackedDates.length === 1 ? '' : 's'}`;
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
      ${readingBooks.length ? `<div class="progress-chip">${completedBooks}/${readingBooks.length} books marked read</div>` : ''}
    </div>
  </div>`;

  // Heatmap
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
  // Build weeks
  let cur = new Date(startDate);
  // Align to Monday
  const startDow = cur.getDay();
  const alignOffset = startDow === 0 ? -6 : 1 - startDow;
  cur.setDate(cur.getDate() + alignOffset);

  while (cur <= todayDate || cur.getDay() !== 1) {
    html += `<div class="heatmap-col">`;
    for (let r = 0; r < 7; r++) {
      const ds = cur.getFullYear() + '-' + String(cur.getMonth()+1).padStart(2,'0') + '-' + String(cur.getDate()).padStart(2,'0');
      const inRange = ds >= state.startDate && ds <= today;
      if (inRange) {
        const dayData = state.days[ds];
        const comp = getDayCompletion(dayData);
        let level = '';
        if (comp.rate === 0) level = '';
        else if (comp.rate <= 0.4) level = 'level-1';
        else if (comp.rate <= 0.7) level = 'level-2';
        else if (comp.rate < 1) level = 'level-3';
        else level = 'level-4';
        const tip = `${formatDateShort(ds)} \u2014 ${comp.completed}/${comp.total} completed`;
        html += `<div class="heatmap-cell ${level}" data-tip="${escHtml(tip)}" aria-label="${escHtml(tip)}"></div>`;
      } else {
        html += `<div class="heatmap-cell"></div>`;
      }
      cur.setDate(cur.getDate() + 1);
    }
    html += `</div>`;
    if (cur > todayDate) break;
  }
  html += `</div></div><div class="heatmap-tooltip-floating" id="heatmap-tooltip-floating"></div></div>`;

  // Streaks
  let currentStreak = 0, longestStreak = 0, tempStreak = 0;
  let checkDate = new Date(todayDate);
  // Calculate from today backwards
  while (true) {
    const ds = checkDate.getFullYear() + '-' + String(checkDate.getMonth()+1).padStart(2,'0') + '-' + String(checkDate.getDate()).padStart(2,'0');
    if (ds < state.startDate) break;
    const dayData = state.days[ds];
    if (dayData && dayData.morning && dayData.morning.meditation) {
      currentStreak++;
    } else {
      break;
    }
    checkDate.setDate(checkDate.getDate() - 1);
  }
  // Calculate longest streak across all days
  let d2 = dateFromStr(state.startDate);
  tempStreak = 0;
  while (d2 <= todayDate) {
    const ds = d2.getFullYear() + '-' + String(d2.getMonth()+1).padStart(2,'0') + '-' + String(d2.getDate()).padStart(2,'0');
    const dayData = state.days[ds];
    if (dayData && dayData.morning && dayData.morning.meditation) {
      tempStreak++;
      if (tempStreak > longestStreak) longestStreak = tempStreak;
    } else {
      tempStreak = 0;
    }
    d2.setDate(d2.getDate() + 1);
  }

  // Per-habit completion breakdown — derive from template
  const habitKeys = [
    ...state.ritualTemplate.morning.map(item => ({ key: item.key, group: 'morning', label: item.label.split(' \u2014 ')[0] || item.label })),
    ...state.ritualTemplate.evening.map(item => ({ key: item.key, group: 'evening', label: item.label.split(' \u2014 ')[0] || item.label })),
    { key: 'weeklyPractice', group: 'weekly', label: 'Weekly practice' }
  ];
  let totalTrackedDays = 0;
  const habitCounts = {};
  habitKeys.forEach(h => habitCounts[h.key] = 0);
  Object.keys(state.days).forEach(ds => {
    if (ds > today || ds < state.startDate) return;
    totalTrackedDays++;
    const dd = state.days[ds];
    habitKeys.forEach(h => {
      if (h.group === 'morning' && dd.morning && dd.morning[h.key]) habitCounts[h.key]++;
      else if (h.group === 'evening' && dd.evening && dd.evening[h.key]) habitCounts[h.key]++;
      else if (h.group === 'weekly' && dd.weeklyPractice && dd.weeklyPractice.completed) habitCounts[h.key]++;
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
    habitKeys.forEach(h => {
      const pct = Math.round(habitCounts[h.key] / totalTrackedDays * 100);
      const isLow = pct > 0 && pct < 30;
      html += `<div class="habit-bar-row">
        <div class="habit-bar-label">${h.label}</div>
        <div class="habit-bar-track"><div class="habit-bar-fill${isLow ? ' low' : ''}" style="width:${pct}%"></div></div>
        <div class="habit-bar-pct${isLow ? ' low' : ''}">${pct}%</div>
      </div>`;
    });
    html += `</div>`;
  }
  html += `</div>`;

  // ── EMOTION TIMELINE ──
  const emotionPoints = [];
  const quadrantCounts = [0, 0, 0, 0];
  trackedDates.forEach(ds => {
    const dd = state.days[ds];
    if (!dd || !dd.emotionalCheckins || !dd.emotionalCheckins.length) return;
    dd.emotionalCheckins.forEach((ci, i) => {
      const word = (ci.label || '').trim().toLowerCase();
      if (!word) return;
      const qi = getEmotionQuadrant(ci.label);
      emotionPoints.push({ date: ds, word: ci.label || word, time: ci.time || '', quadrant: qi, idx: i });
      if (qi >= 0) quadrantCounts[qi]++;
    });
  });

  html += `<div class="progress-card section">
    <div class="progress-card-header">
      <div class="progress-card-title">
        <h2>Emotional Landscape</h2>
        <div class="progress-card-note">Each dot is a logged check-in, placed by its affect quadrant over time.</div>
      </div>
      <div class="progress-card-aside">${emotionPoints.length} check-in${emotionPoints.length === 1 ? '' : 's'}</div>
    </div>`;

  if (!emotionPoints.length) {
    html += `<div class="no-data-note">Log an emotional check-in to see your pattern emerge here.</div>`;
  } else {
    // SVG scatter chart
    const TL_W = 600, TL_H = 180;
    const TL_PAD = { l: 10, r: 12, t: 14, b: 22 };
    const plotW = TL_W - TL_PAD.l - TL_PAD.r;
    const plotH = TL_H - TL_PAD.t - TL_PAD.b;
    const startMs = dateFromStr(state.startDate).getTime();
    const endMs = dateFromStr(today).getTime();
    const rangeMs = Math.max(endMs - startMs, 86400000);

    function tlXPos(ds) {
      return TL_PAD.l + ((dateFromStr(ds).getTime() - startMs) / rangeMs) * plotW;
    }

    // Deterministic jitter from word+date hash
    function tlHash(str) {
      let h = 0;
      for (let i = 0; i < str.length; i++) h = ((h << 5) - h + str.charCodeAt(i)) | 0;
      return h;
    }

    const dotR = emotionPoints.length > 200 ? 2 : (emotionPoints.length > 80 ? 2.8 : 3.5);

    let svg = '<svg viewBox="0 0 ' + TL_W + ' ' + TL_H + '" class="emotion-timeline-svg" role="img" aria-label="Emotion timeline chart">';

    // Zone background tints
    svg += '<rect x="' + TL_PAD.l + '" y="' + TL_PAD.t + '" width="' + plotW + '" height="' + (plotH * 0.5) + '" fill="rgba(90,160,120,0.03)" rx="2"/>';
    svg += '<rect x="' + TL_PAD.l + '" y="' + (TL_PAD.t + plotH * 0.5) + '" width="' + plotW + '" height="' + (plotH * 0.5) + '" fill="rgba(180,80,80,0.03)" rx="2"/>';

    // Center divider
    svg += '<line x1="' + TL_PAD.l + '" y1="' + (TL_PAD.t + plotH * 0.5) + '" x2="' + (TL_W - TL_PAD.r) + '" y2="' + (TL_PAD.t + plotH * 0.5) + '" stroke="rgba(255,255,255,0.06)" stroke-dasharray="4 4"/>';

    // Zone labels
    svg += '<text x="' + (TL_PAD.l + 4) + '" y="' + (TL_PAD.t + 12) + '" fill="rgba(90,160,120,0.4)" font-size="9" font-family="Lora,serif" letter-spacing="0.08em">PLEASANT</text>';
    svg += '<text x="' + (TL_PAD.l + 4) + '" y="' + (TL_PAD.t + plotH - 4) + '" fill="rgba(180,80,80,0.4)" font-size="9" font-family="Lora,serif" letter-spacing="0.08em">DIFFICULT</text>';

    // Month boundary lines
    let mCur = dateFromStr(state.startDate);
    mCur.setDate(1);
    mCur.setMonth(mCur.getMonth() + 1);
    while (mCur.getTime() <= endMs) {
      const mds = mCur.getFullYear() + '-' + String(mCur.getMonth() + 1).padStart(2, '0') + '-01';
      const mx = tlXPos(mds);
      if (mx > TL_PAD.l + 24 && mx < TL_W - TL_PAD.r - 10) {
        svg += '<line x1="' + mx.toFixed(1) + '" y1="' + TL_PAD.t + '" x2="' + mx.toFixed(1) + '" y2="' + (TL_H - TL_PAD.b) + '" stroke="rgba(255,255,255,0.04)"/>';
        const mLabel = mCur.toLocaleDateString('en-GB', { month: 'short' });
        svg += '<text x="' + mx.toFixed(1) + '" y="' + (TL_H - TL_PAD.b + 14) + '" fill="rgba(255,255,255,0.18)" font-size="9" text-anchor="middle" font-family="Lora,serif">' + mLabel + '</text>';
      }
      mCur.setMonth(mCur.getMonth() + 1);
    }

    // Data dots
    const unknownY = TL_PAD.t + plotH * 0.5;
    const unknownColor = '#8b8377';
    emotionPoints.forEach(pt => {
      const x = tlXPos(pt.date);
      const baseY = pt.quadrant >= 0 ? (TL_PAD.t + plotH * QUADRANT_Y_RATIOS[pt.quadrant]) : unknownY;
      const jitter = ((tlHash(pt.word + pt.date) % 13) - 6) * 1.2;
      const y = Math.max(TL_PAD.t + 3, Math.min(TL_H - TL_PAD.b - 3, baseY + jitter));
      const color = pt.quadrant >= 0 ? QUADRANT_COLORS[pt.quadrant] : unknownColor;
      const opacity = pt.quadrant >= 0 ? 0.65 : 0.4;
      const tipText = escHtml(pt.word) + (pt.time ? ' · ' + escHtml(pt.time) : '') + ' — ' + formatDateShort(pt.date);
      svg += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + dotR + '" fill="' + color + '" opacity="' + opacity + '" data-tip="' + tipText + '" style="cursor:default;transition:r 0.1s,opacity 0.1s"/>';
    });

    svg += '</svg>';
    html += '<div class="emotion-timeline-wrap">' + svg + '<div class="emotion-dot-tooltip" id="emotion-dot-tooltip"></div></div>';

    // Quadrant legend
    html += '<div class="emotion-timeline-legend">';
    [2, 3, 1, 0].forEach(qi => {
      html += '<span class="emotion-timeline-legend-item"><span class="emotion-timeline-swatch" style="background:' + QUADRANT_COLORS[qi] + '"></span>' + QUADRANT_LABELS[qi] + '</span>';
    });
    html += '</div>';

    // Summary stats — most frequent quadrant, check-in days count
    const checkinDays = new Set(emotionPoints.map(p => p.date)).size;
    const maxQi = quadrantCounts.indexOf(Math.max(...quadrantCounts));
    const dominantLabel = quadrantCounts[maxQi] > 0 ? QUADRANT_LABELS[maxQi].toLowerCase() : null;
    html += '<div class="emotion-timeline-summary">';
    html += '<span class="emotion-timeline-stat">' + checkinDays + ' day' + (checkinDays === 1 ? '' : 's') + ' with check-ins</span>';
    if (dominantLabel) {
      html += '<span class="emotion-timeline-stat">Most logged: ' + dominantLabel + '</span>';
    }
    html += '</div>';
  }
  html += '</div>';

  // Monthly challenges
  html += `<div class="progress-card section">
    <div class="progress-card-header">
      <div class="progress-card-title">
        <h2>Monthly Challenges</h2>
        <div class="progress-card-note">Open any month to revisit the prompt and your note.</div>
      </div>
      <div class="progress-card-aside">${activeMonthChallenge && activeMonthChallenge.completed ? 'Marked complete' : `Month ${curMonth} active`}</div>
    </div>
    <div class="monthly-circles">`;
  for (let i = 1; i <= 12; i++) {
    const mc = state.monthlyChallenges[i];
    const cls = mc && mc.completed ? 'completed' : (i === curMonth ? 'current' : '');
    html += `<div class="month-circle ${cls}" data-month="${i}">${i}</div>`;
  }
  html += `</div><div id="challenge-detail"></div></div>`;

  // Training focus
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

  // Reading progress
  html += `<div class="progress-card reading-progress-block section">
    <div class="progress-card-header">
      <div class="progress-card-title">
        <div class="reading-progress-header">
          <h2>Reading Progress</h2>
          <button class="book-action-btn" id="add-book">Add Book</button>
        </div>
        <div class="progress-card-note">Covers are fetched once. Descriptions are cached when available.</div>
      </div>
      <div class="progress-card-aside">${readingBooks.length ? `${completedBooks}/${readingBooks.length} read` : 'No books yet'}</div>
    </div>
    <div>`;
  if (!readingBooks.length) {
    html += `<div class="no-data-note">No books yet. Add one to start tracking.</div>`;
  }
  readingBooks.forEach((book, index) => {
    const isPast = currentBookIndex !== -1 && index < currentBookIndex;
    const isCur = book.id === curBookId;
    const cls = isCur ? 'current' : (isPast ? 'past' : '');
    const checkCls = isPast ? 'done' : (isCur ? 'current-book' : '');
    const stageLabel = isCur ? 'Current' : (isPast ? 'Completed' : 'Up Next');
    const stageClass = isPast ? ' completed' : (isCur ? '' : ' up-next');
    const display = getBookDisplay(book.id);
    const lookupKey = getBookLookupKey(display.title, display.author);
    const meta = getBookMeta(book.id);
    const metaMatchesBook = meta.lookupKey === lookupKey;
    const status = getBookMetaStatus(book.id);
    const isLookupRunning = !!(bookLookupRuntime[book.id] && bookLookupRuntime[book.id].lookupKey === lookupKey);
    const description = metaMatchesBook ? meta.description : '';
    const coverUrl = metaMatchesBook ? meta.coverUrl : '';
    const descriptionText = description
      || (isLookupRunning
        ? 'Searching for a brief description...'
        : lookupKey
          ? 'A short description will appear here automatically once the lookup completes.'
          : 'Add a title and author and the app will fill this in automatically.');
    const coverPlaceholder = isLookupRunning ? 'Searching...' : (lookupKey ? 'No cover yet' : 'Add book info');
    const refreshLabel = isLookupRunning ? 'Searching...' : ((metaMatchesBook && meta.status === 'found') ? 'Refresh' : 'Retry');
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
          <div class="book-cover-shell${isLookupRunning ? ' cover-loading' : ''}">
            ${coverUrl
              ? `<img class="book-cover-img" data-cover-id="${book.id}" src="${escHtml(coverUrl)}" alt="Cover of ${escHtml(display.title || 'book')}" loading="lazy" referrerpolicy="no-referrer">
                 <div class="book-cover-placeholder" data-cover-fallback="${book.id}" style="display:none;">No cover</div>`
              : `<div class="book-cover-placeholder">${coverPlaceholder}</div>`}
          </div>
          <div class="book-meta-copy">
            <div class="book-description${description ? '' : ' empty'}">${escHtml(descriptionText)}</div>
            <div class="book-meta-row">
              <div class="book-meta-status${status.tone ? ' ' + status.tone : ''}">${escHtml(status.message)}</div>
              ${lookupKey ? `<button class="book-meta-refresh" data-book-refresh="${book.id}"${isLookupRunning ? ' disabled' : ''}>${refreshLabel}</button>` : ''}
            </div>
          </div>
        </div>
      </div>
    </div>`;
  });
  html += `</div></div>`;

  // Behavioral marker
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

  // Export / Import
  html += `${logoSVG('logo-footer')}
  <div class="export-row">
    <button class="export-link" id="export-btn">Export</button>
    <button class="export-link" id="import-btn">Import</button>
    <input type="file" id="import-file" accept=".json">
  </div></div>`;

  app.innerHTML = html;

  // Emotion dot tooltips
  const emotionSvg = document.querySelector('.emotion-timeline-svg');
  const emotionTip = document.getElementById('emotion-dot-tooltip');
  if (emotionSvg && emotionTip) {
    let lastCircle = null;
    emotionSvg.addEventListener('mouseover', e => {
      const circle = e.target.closest ? e.target.closest('circle') : null;
      if (!circle || !circle.dataset.tip) {
        emotionTip.classList.remove('visible');
        if (lastCircle) { lastCircle.setAttribute('r', lastCircle.dataset.baseR || '3.5'); lastCircle.setAttribute('opacity', lastCircle.dataset.baseOp || '0.65'); lastCircle = null; }
        return;
      }
      // Parse tooltip: "word · time — date" → highlight word
      const tip = circle.dataset.tip;
      const parts = tip.split(' — ');
      const wordPart = parts[0];
      const datePart = parts[1] || '';
      emotionTip.innerHTML = '<strong>' + wordPart + '</strong>' + (datePart ? ' <span style="color:var(--text-tertiary)">&mdash; ' + datePart + '</span>' : '');
      emotionTip.classList.add('visible');
      // Enlarge dot
      if (lastCircle && lastCircle !== circle) {
        lastCircle.setAttribute('r', lastCircle.dataset.baseR || '3.5');
        lastCircle.setAttribute('opacity', lastCircle.dataset.baseOp || '0.65');
      }
      if (!circle.dataset.baseR) {
        circle.dataset.baseR = circle.getAttribute('r');
        circle.dataset.baseOp = circle.getAttribute('opacity');
      }
      circle.setAttribute('r', parseFloat(circle.dataset.baseR) * 1.8);
      circle.setAttribute('opacity', '1');
      lastCircle = circle;
    });
    emotionSvg.addEventListener('mousemove', e => {
      const rect = emotionSvg.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const tipW = emotionTip.offsetWidth || 120;
      // Clamp so tooltip doesn't overflow the container
      const clampedX = Math.max(tipW / 2 + 4, Math.min(rect.width - tipW / 2 - 4, x));
      emotionTip.style.left = clampedX + 'px';
      emotionTip.style.top = (y - 34) + 'px';
    });
    emotionSvg.addEventListener('mouseout', e => {
      const related = e.relatedTarget;
      if (!related || !related.closest || !related.closest('.emotion-timeline-svg')) {
        emotionTip.classList.remove('visible');
        if (lastCircle) { lastCircle.setAttribute('r', lastCircle.dataset.baseR || '3.5'); lastCircle.setAttribute('opacity', lastCircle.dataset.baseOp || '0.65'); lastCircle = null; }
      }
    });
  }

  // Book cover error handling — JS binding instead of inline onerror
  document.querySelectorAll('.book-cover-img[data-cover-id]').forEach(img => {
    const id = img.dataset.coverId;
    img.addEventListener('error', () => {
      img.style.display = 'none';
      const fallback = document.querySelector(`.book-cover-placeholder[data-cover-fallback="${id}"]`);
      if (fallback) fallback.style.display = 'flex';
    });
  });

  // Book checkboxes — click to mark read / unread
  document.querySelectorAll('.book-check[data-book-check]').forEach(check => {
    check.addEventListener('click', () => {
      const id = parseInt(check.dataset.bookCheck, 10);
      const cur = getCurrentReadingBookId(curMonth);
      commit(s => {
        if (getBookIndex(id) !== -1 && getBookIndex(cur) !== -1 && getBookIndex(id) < getBookIndex(cur)) {
          s.reading.currentBook = id;
        } else {
          s.reading.currentBook = getNextReadingBookId(id);
        }
      });
    });
  });

  // Book edits — save on blur
  const addBookButton = document.getElementById('add-book');
  if (addBookButton) {
    addBookButton.addEventListener('click', () => {
      const newBookId = getNewReadingBookId();
      uiState.pendingBookFocusId = newBookId;
      commit(s => {
        s.reading.books.push(normalizeReadingBook({
          id: newBookId, title: '', author: '', translation: null,
          months: '', instruction: '', startDate: '', endDate: ''
        }, newBookId));
        if (!s.reading.currentBook) s.reading.currentBook = newBookId;
      });
    });
  }

  document.querySelectorAll('[data-remove-book]').forEach(button => {
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = parseInt(button.dataset.removeBook, 10);
      const bookToRemove = getBookDisplay(id);
      const bookName = bookToRemove && bookToRemove.title ? bookToRemove.title : 'this book';
      if (!confirm(`Remove "${bookName}" and its cover data? This cannot be undone.`)) return;
      if (uiState.pendingBookFocusId === id) uiState.pendingBookFocusId = null;
      commit(s => {
        const books = s.reading.books;
        const index = books.findIndex(book => book.id === id);
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

  // Book edits — save on blur
  document.querySelectorAll('.book-edit').forEach(input => {
    input.addEventListener('blur', () => {
      const id = parseInt(input.dataset.bookId, 10);
      const field = input.dataset.field;
      const previousBook = getBookDisplay(id);
      if (!previousBook) return;
      const previousTitle = previousBook.title;
      const previousAuthor = previousBook.author;
      commit(s => {
        const book = s.reading.books.find(b => b.id === id);
        if (book) book[field] = input.value;
      }, { render: false });
      const nextBook = getBookDisplay(id);
      const bookIdentityChanged = previousTitle !== nextBook.title || previousAuthor !== nextBook.author;
      if ((field === 'title' || field === 'author') && bookIdentityChanged) {
        clearBookMeta(id);
        save();
        if (getBookLookupKey(nextBook.title, nextBook.author)) {
          startBookMetadataLookup(id, { force: true });
        } else if (uiState.activeView === 'progress') {
          requestRender();
        }
      }
    });
    input.addEventListener('keydown', e => { if (e.key === 'Enter') input.blur(); });
  });

  document.querySelectorAll('.book-meta-refresh[data-book-refresh]').forEach(button => {
    button.addEventListener('click', () => {
      startBookMetadataLookup(parseInt(button.dataset.bookRefresh, 10), { force: true });
    });
  });

  // Challenge detail click
  document.querySelectorAll('.month-circle').forEach(circle => {
    circle.addEventListener('click', () => {
      const m = parseInt(circle.dataset.month);
      const detail = document.getElementById('challenge-detail');
      const mc = state.monthlyChallenges[m];
      if (detail.dataset.active === String(m)) {
        detail.innerHTML = '';
        detail.dataset.active = '';
        return;
      }
      detail.dataset.active = String(m);
      detail.innerHTML = `<div class="challenge-expand">
        <div class="challenge-expand-title">Month ${m}</div>
        <div>${monthlyChallenges[m]}</div>
        ${mc && mc.note ? '<div style="margin-top:6px;color:var(--text-tertiary);">' + escHtml(mc.note) + '</div>' : ''}
        ${mc && mc.completed ? '<div style="margin-top:4px;color:var(--accent);">Completed</div>' : ''}
      </div>`;
    });
  });

  // Export
  document.getElementById('export-btn').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `iroh_protocol_backup_${todayStr()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  document.getElementById('import-btn').addEventListener('click', () => {
    document.getElementById('import-file').click();
  });
  document.getElementById('import-file').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!confirm('This will replace all current data. Continue?')) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        setState(normalizeStateShape(JSON.parse(ev.target.result)));
        save();                // full state replacement — direct save
        requestRender();
      } catch(err) {
        alert('Invalid JSON file.');
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

  primeBookMetadataLookups(getReadingBooks().map(book => book.id));

  const heatmapTooltip = document.getElementById('heatmap-tooltip-floating');
  const heatmapCells = document.querySelectorAll('.heatmap-cell[data-tip]');
  if (heatmapTooltip && heatmapCells.length) {
    const hideHeatmapTooltip = () => {
      heatmapTooltip.classList.remove('visible');
      heatmapTooltip.removeAttribute('data-placement');
    };
    const showHeatmapTooltip = (cell) => {
      const tip = cell?.dataset?.tip;
      if (!tip) {
        hideHeatmapTooltip();
        return;
      }
      heatmapTooltip.textContent = tip;
      heatmapTooltip.classList.add('visible');
      const rect = cell.getBoundingClientRect();
      const tipRect = heatmapTooltip.getBoundingClientRect();
      const margin = 10;
      const fitsAbove = rect.top >= tipRect.height + 18;
      const placement = fitsAbove ? 'top' : 'bottom';
      const top = fitsAbove ? rect.top - tipRect.height - 10 : rect.bottom + 10;
      const idealLeft = rect.left + (rect.width / 2) - (tipRect.width / 2);
      const maxLeft = Math.max(margin, window.innerWidth - tipRect.width - margin);
      const left = Math.max(margin, Math.min(maxLeft, idealLeft));
      heatmapTooltip.dataset.placement = placement;
      heatmapTooltip.style.top = `${Math.max(margin, top)}px`;
      heatmapTooltip.style.left = `${left}px`;
    };

    heatmapCells.forEach(cell => {
      cell.addEventListener('mouseenter', () => showHeatmapTooltip(cell));
      cell.addEventListener('mousemove', () => showHeatmapTooltip(cell));
      cell.addEventListener('mouseleave', () => {
        if (!cell.classList.contains('tapped')) hideHeatmapTooltip();
      });
      cell.addEventListener('click', (e) => {
        const wasActive = cell.classList.contains('tapped');
        heatmapCells.forEach(c => c.classList.remove('tapped'));
        if (wasActive) {
          hideHeatmapTooltip();
        } else {
          cell.classList.add('tapped');
          showHeatmapTooltip(cell);
        }
        e.stopPropagation();
      });
    });

    if (!renderProgress._clickBound) {
      renderProgress._clickBound = true;
      document.addEventListener('click', () => {
        document.querySelectorAll('.heatmap-cell.tapped').forEach(c => c.classList.remove('tapped'));
        hideHeatmapTooltip();
      });
      window.addEventListener('scroll', () => {
        const activeCell = document.querySelector('.heatmap-cell.tapped');
        if (activeCell) showHeatmapTooltip(activeCell);
      }, true);
      window.addEventListener('resize', () => {
        const activeCell = document.querySelector('.heatmap-cell.tapped');
        if (activeCell) showHeatmapTooltip(activeCell);
        else hideHeatmapTooltip();
      });
    }
  }

}


