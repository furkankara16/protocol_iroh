// ── WEEK VIEW ──
import { getTodayPractice } from '../data.js';
import { state, getDayCompletion } from '../state.js';
import { uiState, getRenderCallback } from '../ui-state.js';
import { todayStr, dateFromStr, formatDateShort, addDays, isFuture } from '../utils.js';

function requestRender() {
  const render = getRenderCallback();
  if (render) render();
}

export function renderWeek(app) {
  const today = todayStr();
  const todayDate = dateFromStr(today);
  // Get Monday of current week + offset
  const d = new Date(todayDate);
  const dayOfWeek = d.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  d.setDate(d.getDate() + mondayOffset + uiState.weekOffset * 7);
  const monday = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');

  const days = [];
  for (let i = 0; i < 7; i++) days.push(addDays(monday, i));

  const sunStr = days[6];
  let totalCompleted = 0, totalPossible = 0;
  const dayNames = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const weekEntries = days.map((ds, idx) => {
    const isToday = ds === today;
    const future = isFuture(ds);
    const beforeProtocol = ds < state.startDate;
    const dayData = state.days[ds];
    const comp = getDayCompletion(dayData);
    // For past protocol days with no data yet, count 9 possible (6 morning + 2 evening + 1 weekly)
    const isPastProtocolNoData = !future && !beforeProtocol && comp.total === 0;
    totalCompleted += comp.completed;
    totalPossible += isPastProtocolNoData ? (state.ritualTemplate.morning.length + state.ritualTemplate.evening.length + 1) : comp.total;

    const dow = dateFromStr(ds).getDay();
    const practice = getTodayPractice(dow);
    const checkins = dayData ? (dayData.emotionalCheckins || []).length : 0;

    const mornCount = dayData ? state.ritualTemplate.morning.filter(i => dayData.morning && dayData.morning[i.key]).length : 0;
    const eveCount = dayData ? state.ritualTemplate.evening.filter(i => dayData.evening && dayData.evening[i.key]).length : 0;
    const wpDone = dayData && dayData.weeklyPractice && dayData.weeklyPractice.completed;
    return { ds, idx, isToday, future, beforeProtocol, practice, checkins, mornCount, eveCount, wpDone };
  });
  const pct = totalPossible > 0 ? Math.round(totalCompleted / totalPossible * 100) : 0;
  const activeDays = weekEntries.filter(entry => !entry.future && !entry.beforeProtocol).length;
  const fullyCompleteDays = weekEntries.filter(entry => {
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
        <div class="view-chip">${activeDays} active day${activeDays === 1 ? '' : 's'}</div>
        <div class="view-chip">${fullyCompleteDays} fully completed</div>
      </div>
      <div class="week-nav">
        <button class="nav-arrow" id="week-prev">\u2190</button>
        <span class="week-nav-label">${uiState.weekOffset === 0 ? 'This week' : 'Shifted week'}</span>
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
  weekEntries.forEach(entry => {
    const { ds, idx, isToday, future, beforeProtocol, practice, checkins, mornCount, eveCount, wpDone } = entry;
    html += `<div class="week-col${isToday ? ' today' : ''}" data-date="${ds}">
      <div class="week-day">${dayNames[idx]}</div>
      <div class="week-date">${dateFromStr(ds).getDate()}</div>
      ${(future || beforeProtocol) ? '<div class="week-stat" style="color:var(--text-tertiary)">\u2014</div>' : `
      <div class="week-stat">AM <span class="${mornCount===state.ritualTemplate.morning.length?'done':''}">${mornCount}/${state.ritualTemplate.morning.length}</span></div>
      <div class="week-stat">PM <span class="${eveCount===state.ritualTemplate.evening.length?'done':''}">${eveCount}/${state.ritualTemplate.evening.length}</span></div>
      <div class="week-stat">${practice.label.split(' ')[0]} ${wpDone ? '<span class="done">\u2713</span>' : '\u2013'}</div>
      <div class="week-stat">EC ${checkins}/3</div>`}
    </div>`;
  });
  html += `</div>
    <div class="week-completion">
    <div class="week-completion-label">Weekly completion rate: ${pct}%</div>
    <div class="week-bar"><div class="week-bar-fill" style="width:${pct}%"></div></div>
  </div></div></div>`;

  app.innerHTML = html;

  document.getElementById('week-prev').addEventListener('click', () => { uiState.weekOffset--; requestRender(); });
  document.getElementById('week-next').addEventListener('click', () => { uiState.weekOffset++; requestRender(); });
  document.getElementById('week-today').addEventListener('click', () => { uiState.weekOffset = 0; requestRender(); });
  document.querySelectorAll('.week-col').forEach(col => {
    col.addEventListener('click', () => {
      uiState.viewDate = col.dataset.date;
      uiState.activeView = 'daily';
      document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
      document.querySelector('[data-view="daily"]').classList.add('active');
      requestRender();
    });
  });
}


