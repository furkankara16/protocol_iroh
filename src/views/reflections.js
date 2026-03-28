// ── REFLECTIONS VIEW ──
import { state } from '../state.js';
import { todayStr, formatDateLong, escHtml, logoSVG, getReflectionThemes } from '../utils.js';

export function renderReflections(app) {
  const today = todayStr();
  const themes = getReflectionThemes(state.days, state.startDate, today);
  const reflectionEntryCount = Object.keys(state.days).filter(ds => {
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
        <div class="view-glance">${reflectionEntryCount} dated entr${reflectionEntryCount === 1 ? 'y' : 'ies'}</div>
      </div>
      <div class="view-copy">Search evening reflections, emotional check-ins, and weekly integration notes without turning the page into a dashboard.</div>
    </div>
    <div class="journal-card section">
      <div class="journal-card-header">
        <div>
          <h2>Search</h2>
          <div class="journal-card-note">Use a phrase or tap a recurring word from the last 30 days.</div>
        </div>
        <div class="journal-card-aside">${themes.length ? `${themes.length} recurring theme${themes.length === 1 ? '' : 's'}` : 'No recurring themes yet'}</div>
      </div>
      <div class="search-input">
        <input type="text" id="reflection-search" placeholder="Search reflections..." aria-label="Search reflections">
      </div>`;
  if (themes.length > 0) {
    html += `<div style="margin-top:14px;">
      <div style="font-size:10px;color:var(--text-tertiary);margin-bottom:8px;letter-spacing:0.06em;text-transform:uppercase;">Recurring words \u2014 last 30 days</div>
      <div class="theme-tags" id="theme-tags">
        ${themes.map(t => `<span class="theme-tag" data-theme="${escHtml(t.word)}">${t.word} <span style="color:var(--text-tertiary)">${t.count}</span></span>`).join('')}
      </div>
    </div>`;
  }
  html += `</div><div id="reflection-list" class="reflection-list"></div></div>`;
  app.innerHTML = html;

  function renderList(filter) {
    const list = document.getElementById('reflection-list');
    const dates = Object.keys(state.days).sort().reverse();
    let out = '';
    const q = (filter || '').toLowerCase();

    dates.forEach(ds => {
      const day = state.days[ds];
      const ref = day.eveningReflection || {};
      const checkins = day.emotionalCheckins || [];
      const wi = day.weeklyIntegration || {};
      const hasRef = ref.reacted || ref.avoided || ref.grateful;
      const hasCheckins = checkins.length > 0;
      const hasWI = wi.pattern || wi.learning || wi.carryForward;
      if (!hasRef && !hasCheckins && !hasWI) return;

      // Check filter
      if (q) {
        const allText = [ref.reacted, ref.avoided, ref.grateful, wi.pattern, wi.learning, wi.carryForward, ...checkins.map(c => c.label)].join(' ').toLowerCase();
        if (!allText.includes(q)) return;
      }

      out += `<div class="journal-card reflection-entry">
        <div class="reflection-entry-header">
          <div class="reflection-date">${formatDateLong(ds)}</div>
          <div class="reflection-meta">${checkins.length ? `${checkins.length} check-in${checkins.length === 1 ? '' : 's'}` : (hasWI ? 'Weekly integration' : 'Reflection')}</div>
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
        checkins.forEach(c => {
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

    if (!out) out = `<div class="journal-card" style="color:var(--text-tertiary);text-align:center;">${logoSVG('logo-empty')}No reflections yet.</div>`;
    list.innerHTML = out;
  }

  renderList('');
  document.getElementById('reflection-search').addEventListener('input', (e) => {
    document.querySelectorAll('.theme-tag').forEach(t => t.classList.remove('active'));
    renderList(e.target.value);
  });

  // Theme tag click → filter
  document.querySelectorAll('.theme-tag').forEach(tag => {
    tag.addEventListener('click', () => {
      const word = tag.dataset.theme;
      const searchInput = document.getElementById('reflection-search');
      const isActive = tag.classList.contains('active');
      document.querySelectorAll('.theme-tag').forEach(t => t.classList.remove('active'));
      if (isActive) {
        searchInput.value = '';
        renderList('');
      } else {
        tag.classList.add('active');
        searchInput.value = word;
        renderList(word);
      }
    });
  });
}


