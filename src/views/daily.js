// ── DAILY VIEW ──
import { monthContext, monthlyChallenges, meditationProgression, getMeditationStage, getTodayPractice, generateRitualKey, emotionWords } from '../data.js';
import { state, commit, ensureDay, getDayCompletion, getCurrentReadingBookId, getBookDisplay } from '../state.js';
import { uiState, getRenderCallback } from '../ui-state.js';
import { todayStr, isFuture, formatDateLong, dateFromStr, addDays, debounce, escHtml, logoSVG, getCurrentMonth } from '../utils.js';

function requestRender() {
  const render = getRenderCallback();
  if (render) render();
}

export function renderDaily(app) {
  const today = todayStr();
  const future = isFuture(uiState.viewDate);
  const curMonth = getCurrentMonth(state.startDate);
  const day = future ? null : ensureDay(uiState.viewDate);

  // Derive ritual items from template — meditation gets dynamic label from month progression
  const morningItems = state.ritualTemplate.morning.map(item => {
    if (item.key === 'meditation') {
      const stage = meditationProgression[getMeditationStage(curMonth)];
      return { key: item.key, label: `Meditation \u2014 10 min ${stage.technique}`, description: stage.description };
    }
    return { key: item.key, label: item.label, description: item.description };
  });
  const eveningItems = state.ritualTemplate.evening.map(item => ({
    key: item.key, label: item.label, description: item.description
  }));

  const dayCompletion = future
    ? { completed: 0, total: state.ritualTemplate.morning.length + state.ritualTemplate.evening.length + 1 }
    : getDayCompletion(day);
  const isTodayView = uiState.viewDate === today;
  let html = `<div class="page-shell daily-page">`;

  // Header
  html += `<div class="view-hero">
    <div class="view-kicker">${isTodayView ? 'Today' : 'Daily Record'}</div>
    <div class="date-nav">
      <button class="nav-arrow" id="prev-day">\u2190</button>
      <h1>${formatDateLong(uiState.viewDate)}</h1>
      <button class="nav-arrow" id="next-day">\u2192</button>
    </div>
    <div class="view-chip-row">
      <div class="view-chip">Month ${curMonth} of 12</div>
      <div class="view-chip">${future ? 'Future date' : `${dayCompletion.completed}/${dayCompletion.total} completed`}</div>
      ${future ? '' : `<div class="view-chip">${day.emotionalCheckins.length}/3 emotional check-ins</div>`}
    </div>
    <div class="view-copy">${monthContext[curMonth]}</div>
    ${!isTodayView ? '<button class="return-today" id="return-today">\u2190 Return to today</button>' : ''}
  </div>`;

  if (future) {
    html += `<div class="journal-card section">
      ${logoSVG('logo-empty')}
      <div class="future-msg">Not yet.</div>
      <div class="future-note">This page opens when the date becomes current.</div>
    </div></div>`;
    app.innerHTML = html;
    bindDayNav();
    const returnBtn = document.getElementById('return-today');
    if (returnBtn) returnBtn.addEventListener('click', () => { uiState.viewDate = todayStr(); requestRender(); });
    return;
  }

  // Morning
  const mornDone = morningItems.filter(i => day.morning[i.key]).length;
  html += `<div class="journal-card daily-card section">
    <div class="section-header">
      <h2>Morning</h2>`;
  if (uiState.ritualEditMode === 'morning') {
    html += `<button class="ritual-edit-btn active" data-edit-done="morning">done</button>`;
    html += `</div>`;
    state.ritualTemplate.morning.forEach((item, idx) => {
      html += `<div class="ritual-edit-row">
        <button class="ritual-move-btn" data-ritual-move="morning-${idx}-up" title="Move up"${idx === 0 ? ' disabled' : ''}>\u2191</button>
        <button class="ritual-move-btn" data-ritual-move="morning-${idx}-down" title="Move down"${idx === state.ritualTemplate.morning.length - 1 ? ' disabled' : ''}>\u2193</button>
        <input class="ritual-edit-input" data-ritual-label="morning-${idx}" value="${escHtml(item.label)}">
        <button class="ritual-remove-btn" data-ritual-remove="morning-${idx}" title="Remove">\u00d7</button>
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
        <div class="checkbox${checked ? ' checked' : ''}"></div>
        <div class="check-copy">
          <div class="check-label${checked ? ' checked' : ''}">${item.label}</div>
          <div class="check-description${checked ? ' checked' : ''}">${item.description}</div>
        </div>
      </div>`;
    });
  }
  html += `</div>`;

  // Weekly practice
  const dow = dateFromStr(uiState.viewDate).getDay();
  const practice = getTodayPractice(dow);
  html += `<div class="journal-card daily-card section">
    <div class="section-header">
      <h2>Weekly Practice</h2><span class="tag">${practice.duration}</span>
    </div>
    <div class="check-row" data-group="weekly" role="checkbox" aria-checked="${day.weeklyPractice.completed}" tabindex="0">
      <div class="checkbox${day.weeklyPractice.completed ? ' checked' : ''}"></div>
      <div class="check-copy">
        <div class="check-label${day.weeklyPractice.completed ? ' checked' : ''}">${practice.label} \u2014 ${practice.sublabel}</div>
        <div class="check-description${day.weeklyPractice.completed ? ' checked' : ''}">${practice.description}</div>
      </div>
    </div>
  </div>`;

  // Emotional check-ins
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
      <button class="checkin-delete" data-idx="${idx}">\u00d7</button>
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
          const quadrants = ['high-difficult','low-difficult','high-pleasant','low-pleasant'];
          return `<div class="emotion-group" data-quadrant="${quadrants[gi]}"><div class="emotion-group-label">${group.label}</div><div style="display:flex;flex-wrap:wrap;gap:6px;">` +
          group.words.map(w => `<span class="emotion-word">${w}</span>`).join('') +
          `</div></div>`;
        }).join('')}
      </div>
    </div>`;
  } else {
    html += `<div class="checkin-complete">3/3 logged</div>`;
  }
  html += `</div>`;

  // Evening
  const eveDone = eveningItems.filter(i => day.evening[i.key]).length;
  html += `<div class="journal-card daily-card section">
    <div class="section-header">
      <h2>Evening</h2>`;
  if (uiState.ritualEditMode === 'evening') {
    html += `<button class="ritual-edit-btn active" data-edit-done="evening">done</button>`;
    html += `</div>`;
    state.ritualTemplate.evening.forEach((item, idx) => {
      html += `<div class="ritual-edit-row">
        <button class="ritual-move-btn" data-ritual-move="evening-${idx}-up" title="Move up"${idx === 0 ? ' disabled' : ''}>\u2191</button>
        <button class="ritual-move-btn" data-ritual-move="evening-${idx}-down" title="Move down"${idx === state.ritualTemplate.evening.length - 1 ? ' disabled' : ''}>\u2193</button>
        <input class="ritual-edit-input" data-ritual-label="evening-${idx}" value="${escHtml(item.label)}">
        <button class="ritual-remove-btn" data-ritual-remove="evening-${idx}" title="Remove">\u00d7</button>
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
    eveningItems.forEach(item => {
      const checked = day.evening[item.key];
      html += `<div class="check-row" data-group="evening" data-key="${item.key}" role="checkbox" aria-checked="${!!checked}" tabindex="0">
        <div class="checkbox${checked ? ' checked' : ''}"></div>
        <div class="check-copy">
          <div class="check-label${checked ? ' checked' : ''}">${item.label}</div>
          <div class="check-description${checked ? ' checked' : ''}">${item.description}</div>
        </div>
      </div>`;
    });
  }
  html += `</div>`;

  // Evening reflection
  const ref = day.eveningReflection;
  const hasSome = ref.reacted || ref.avoided || ref.grateful;
  html += `<div class="journal-card daily-card section">
    <div class="expandable-header" id="reflection-toggle">
      <span class="chevron" id="reflection-chevron">\u25B6</span>
      <h2>Evening Reflection</h2>
      ${hasSome ? '<span class="filled-dot"></span>' : ''}
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

  // Weekly Integration (Sundays only)
  const isSunday = dateFromStr(uiState.viewDate).getDay() === 0;
  if (isSunday) {
    const wi = day.weeklyIntegration || { pattern: '', learning: '', carryForward: '' };
    const hasWI = wi.pattern || wi.learning || wi.carryForward;
    html += `<div class="journal-card daily-card section weekly-integration">
      <div class="expandable-header" id="integration-toggle">
        <span class="chevron" id="integration-chevron">\u25B6</span>
        <h2>Weekly Integration</h2>
        ${hasWI ? '<span class="filled-dot"></span>' : ''}
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

  // Reading
  const bookId = getCurrentReadingBookId(curMonth);
  const book = bookId ? getBookDisplay(bookId) : null;
  html += `<div class="journal-card section reading-block">
    <h3>Current Reading</h3>
    ${book
      ? `<div>${book.title} \u2014 ${book.author}${book.translation ? ' (' + book.translation + ' translation)' : ''}</div>
         <div style="color:var(--text-tertiary);margin-top:2px;">${book.instruction || 'Set the next book from Progress when you are ready.'}</div>`
      : `<div style="color:var(--text-tertiary);">No book added yet.</div>`}
  </div>`;

  // Monthly challenge
  const mc = state.monthlyChallenges[curMonth] || { completed: false, note: '' };
  html += `<div class="journal-card daily-card section challenge-block">
    <h3>Monthly Challenge \u2014 Month ${curMonth}</h3>
    <div style="margin:6px 0;line-height:1.5;">${monthlyChallenges[curMonth]}</div>
    <div class="check-row" data-group="challenge" role="checkbox" aria-checked="${mc.completed}" tabindex="0">
      <div class="checkbox${mc.completed ? ' checked' : ''}"></div>
      <span class="check-label${mc.completed ? ' checked' : ''}">Completed</span>
    </div>
    <div class="challenge-note">
      <textarea id="challenge-note" placeholder="Optional note...">${escHtml(mc.note)}</textarea>
    </div>
  </div></div>`;

  app.innerHTML = html;
  bindDaily(day, curMonth);
}

function bindDayNav() {
  document.getElementById('prev-day').addEventListener('click', () => { uiState.viewDate = addDays(uiState.viewDate, -1); requestRender(); });
  document.getElementById('next-day').addEventListener('click', () => { uiState.viewDate = addDays(uiState.viewDate, 1); requestRender(); });
}

function bindDaily(day, curMonth) {
  bindDayNav();

  // Return to today
  const returnBtn = document.getElementById('return-today');
  if (returnBtn) returnBtn.addEventListener('click', () => { uiState.viewDate = todayStr(); requestRender(); });

  // Checkboxes — click + keyboard (Space/Enter)
  function bindCheckRow(selector, handler) {
    document.querySelectorAll(selector).forEach(row => {
      row.addEventListener('click', handler);
      row.addEventListener('keydown', e => {
        if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); handler.call(row, e); }
      });
    });
  }
  bindCheckRow('.check-row[data-group="morning"]', function() {
    const key = this.dataset.key;
    commit(s => { s.days[uiState.viewDate].morning[key] = !s.days[uiState.viewDate].morning[key]; });
  });
  bindCheckRow('.check-row[data-group="evening"]', function() {
    const key = this.dataset.key;
    commit(s => { s.days[uiState.viewDate].evening[key] = !s.days[uiState.viewDate].evening[key]; });
  });
  bindCheckRow('.check-row[data-group="weekly"]', function() {
    commit(s => { s.days[uiState.viewDate].weeklyPractice.completed = !s.days[uiState.viewDate].weeklyPractice.completed; });
  });
  bindCheckRow('.check-row[data-group="challenge"]', function() {
    commit(s => { s.monthlyChallenges[curMonth].completed = !s.monthlyChallenges[curMonth].completed; });
  });

  // Emotional check-ins
  const logBtn = document.getElementById('log-checkin');
  const checkinInput = document.getElementById('checkin-input');
  function logCheckin() {
    if (!checkinInput) return;
    const val = checkinInput.value.trim();
    if (!val) return;
    const now = new Date();
    const time = String(now.getHours()).padStart(2,'0') + ':' + String(now.getMinutes()).padStart(2,'0');
    commit(s => { s.days[uiState.viewDate].emotionalCheckins.push({ time, label: val }); });
  }
  if (logBtn) logBtn.addEventListener('click', logCheckin);
  if (checkinInput) checkinInput.addEventListener('keydown', e => { if (e.key === 'Enter') logCheckin(); });

  document.querySelectorAll('.checkin-delete').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const idx = parseInt(btn.dataset.idx, 10);
      commit(s => { s.days[uiState.viewDate].emotionalCheckins.splice(idx, 1); });
    });
  });

  // Reflection toggle
  const toggle = document.getElementById('reflection-toggle');
  const body = document.getElementById('reflection-body');
  const chevron = document.getElementById('reflection-chevron');
  if (toggle) {
    toggle.addEventListener('click', () => {
      body.classList.toggle('open');
      chevron.classList.toggle('open');
    });
  }

  // Reflection auto-save (blur: immediate; input: debounced 300ms)
  ['reacted', 'avoided', 'grateful'].forEach(field => {
    const el = document.getElementById('ref-' + field);
    if (el) {
      const persist = () => commit(s => { s.days[uiState.viewDate].eveningReflection[field] = el.value; }, { render: false });
      el.addEventListener('blur', persist);
      el.addEventListener('input', debounce(persist, 300));
    }
  });

  // Emotion scaffold toggle + word click
  const emotionToggle = document.getElementById('emotion-toggle');
  const emotionGrid = document.getElementById('emotion-grid');
  if (emotionToggle && emotionGrid) {
    emotionToggle.addEventListener('click', () => {
      emotionGrid.classList.toggle('open');
      emotionToggle.textContent = emotionGrid.classList.contains('open') ? '\u25BE emotion vocabulary' : '\u25B8 emotion vocabulary';
    });
    emotionGrid.querySelectorAll('.emotion-word').forEach(word => {
      word.addEventListener('click', () => {
        const input = document.getElementById('checkin-input');
        if (input) {
          const current = input.value.trim();
          input.value = current ? current + ', ' + word.textContent : word.textContent;
          input.focus();
        }
      });
    });
  }

  // Weekly Integration toggle + auto-save (Sundays)
  const wiToggle = document.getElementById('integration-toggle');
  const wiBody = document.getElementById('integration-body');
  const wiChevron = document.getElementById('integration-chevron');
  if (wiToggle) {
    wiToggle.addEventListener('click', () => {
      wiBody.classList.toggle('open');
      wiChevron.classList.toggle('open');
    });
  }
  ['pattern', 'learning', 'carryForward'].forEach(field => {
    const el = document.getElementById('wi-' + field);
    if (el) {
      const persist = () => commit(s => {
        if (!s.days[uiState.viewDate].weeklyIntegration) s.days[uiState.viewDate].weeklyIntegration = { pattern: '', learning: '', carryForward: '' };
        s.days[uiState.viewDate].weeklyIntegration[field] = el.value;
      }, { render: false });
      el.addEventListener('blur', persist);
      el.addEventListener('input', debounce(persist, 300));
    }
  });

  // Ritual edit mode — start / done
  document.querySelectorAll('[data-edit-start]').forEach(btn => {
    btn.addEventListener('click', () => { uiState.ritualEditMode = btn.dataset.editStart; requestRender(); });
  });
  document.querySelectorAll('[data-edit-done]').forEach(btn => {
    btn.addEventListener('click', () => { uiState.ritualEditMode = null; requestRender(); });
  });

  // Ritual edit — reorder
  document.querySelectorAll('[data-ritual-move]').forEach(btn => {
    btn.addEventListener('click', () => {
      const [group, idxStr, dir] = btn.dataset.ritualMove.split('-');
      const idx = parseInt(idxStr, 10);
      const swap = dir === 'up' ? idx - 1 : idx + 1;
      const arr = state.ritualTemplate[group];
      if (swap < 0 || swap >= arr.length) return;
      commit(s => {
        const temp = s.ritualTemplate[group][idx];
        s.ritualTemplate[group][idx] = s.ritualTemplate[group][swap];
        s.ritualTemplate[group][swap] = temp;
      });
    });
  });

  // Ritual edit — remove
  document.querySelectorAll('[data-ritual-remove]').forEach(btn => {
    btn.addEventListener('click', () => {
      const [group, idxStr] = btn.dataset.ritualRemove.split('-');
      const idx = parseInt(idxStr, 10);
      const item = state.ritualTemplate[group][idx];
      if (!item) return;
      if (state.ritualTemplate[group].length <= 1) return; // keep at least 1
      commit(s => { s.ritualTemplate[group].splice(idx, 1); });
    });
  });

  // Ritual edit — add
  ['morning', 'evening'].forEach(group => {
    const input = document.getElementById('ritual-add-' + group + '-input');
    const btn = document.getElementById('ritual-add-' + group + '-btn');
    if (!input || !btn) return;
    function addRitual() {
      const label = input.value.trim();
      if (!label) return;
      commit(s => {
        s.ritualTemplate[group].push({
          key: generateRitualKey(),
          label,
          description: ''
        });
      });
    }
    btn.addEventListener('click', addRitual);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') addRitual(); });
  });

  // Ritual edit — label save on blur
  document.querySelectorAll('[data-ritual-label]').forEach(input => {
    input.addEventListener('blur', () => {
      const [group, idxStr] = input.dataset.ritualLabel.split('-');
      const idx = parseInt(idxStr, 10);
      const newLabel = input.value.trim();
      if (!newLabel) return; // don't save empty labels
      commit(s => {
        if (s.ritualTemplate[group][idx]) s.ritualTemplate[group][idx].label = newLabel;
      }, { render: false });
    });
  });

  // Challenge note auto-save (blur: immediate; input: debounced 300ms)
  const cn = document.getElementById('challenge-note');
  if (cn) {
    const persistNote = () => commit(s => { s.monthlyChallenges[curMonth].note = cn.value; }, { render: false });
    cn.addEventListener('blur', persistNote);
    cn.addEventListener('input', debounce(persistNote, 300));
  }
}


