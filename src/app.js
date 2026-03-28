import { state, setState, normalizeStateShape, loadState, save, commit, ensureDay } from './state.js';
import { uiState, setRenderCallback } from './ui-state.js';
import { todayStr, addDays, isFuture, logoSVG } from './utils.js';
import { renderDaily } from './views/daily.js';
import { renderWeek } from './views/week.js';
import { renderProgress } from './views/progress.js';
import { renderReflections } from './views/reflections.js';

function setActiveTab(view) {
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.view === view);
  });
}

function renderSetup() {
  document.getElementById('nav').style.display = 'none';
  const app = document.getElementById('app');
  const today = todayStr();
  app.innerHTML = `
    <div class="setup-shell">
      <div class="journal-card setup">
        ${logoSVG('logo-setup')}
        <div class="view-kicker" style="justify-content:center;">Protocol Iroh</div>
        <h1>When does your protocol begin?</h1>
        <div class="setup-copy">Choose the day the record should start. Everything stays local, quiet, and easy to return to.</div>
        <input type="date" id="start-date" value="${today}">
        <button class="begin-btn" id="begin-btn">Begin</button>
      </div>
    </div>
  `;
  document.getElementById('begin-btn').addEventListener('click', () => {
    const startDate = document.getElementById('start-date').value;
    if (!startDate) return;
    setState(normalizeStateShape({ startDate }));
    uiState.activeView = 'daily';
    uiState.viewDate = todayStr();
    uiState.weekOffset = 0;
    save();
    document.getElementById('nav').style.display = 'flex';
    setupNav();
    setActiveTab('daily');
    render();
  });
}

let navBound = false;
function setupNav() {
  if (navBound) return;
  navBound = true;

  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      uiState.activeView = tab.dataset.view;
      setActiveTab(uiState.activeView);
      if (uiState.activeView === 'daily') uiState.viewDate = todayStr();
      if (uiState.activeView === 'week') uiState.weekOffset = 0;
      render();
    });
  });

  const navLogo = document.getElementById('nav-logo');
  if (navLogo) {
    navLogo.addEventListener('click', () => {
      uiState.activeView = 'daily';
      uiState.viewDate = todayStr();
      setActiveTab('daily');
      render();
    });
  }
}

let previousView = null;
function render() {
  const app = document.getElementById('app');
  const viewChanged = uiState.activeView !== previousView;
  setActiveTab(uiState.activeView);

  const scrollY = viewChanged ? 0 : window.scrollY;
  const focusedEl = document.activeElement;
  const focusId = focusedEl && focusedEl.id ? focusedEl.id : null;
  const focusDataKey = !focusId && focusedEl && focusedEl.dataset
    ? (focusedEl.dataset.ritualLabel || focusedEl.dataset.bookId || null)
    : null;
  const focusTag = focusedEl ? focusedEl.tagName : null;
  const selStart = (focusTag === 'INPUT' || focusTag === 'TEXTAREA') ? focusedEl.selectionStart : null;
  const selEnd = (focusTag === 'INPUT' || focusTag === 'TEXTAREA') ? focusedEl.selectionEnd : null;

  previousView = uiState.activeView;

  switch (uiState.activeView) {
    case 'daily':
      renderDaily(app);
      break;
    case 'week':
      renderWeek(app);
      break;
    case 'progress':
      renderProgress(app);
      break;
    case 'reflections':
      renderReflections(app);
      break;
    default:
      renderDaily(app);
      break;
  }

  if (viewChanged) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    window.scrollTo({ top: scrollY });
  }

  let restored = null;
  if (focusId) restored = document.getElementById(focusId);
  if (!restored && focusDataKey) {
    restored = document.querySelector(`[data-ritual-label="${focusDataKey}"]`)
      || document.querySelector(`[data-book-id="${focusDataKey}"]`);
  }
  if (restored) {
    restored.focus();
    if (selStart !== null && typeof restored.setSelectionRange === 'function') {
      try {
        restored.setSelectionRange(selStart, selEnd);
      } catch (err) {
        // Ignore cursor restore failures for unsupported inputs.
      }
    }
  }
}

let keyboardBound = false;
function setupKeyboardShortcuts() {
  if (keyboardBound) return;
  keyboardBound = true;

  document.addEventListener('keydown', (event) => {
    if (!state || uiState.activeView !== 'daily') return;
    const target = event.target;
    const tagName = target && target.tagName ? target.tagName : '';
    const inInput = tagName === 'INPUT' || tagName === 'TEXTAREA';

    if (event.key === 'e' && !inInput) {
      event.preventDefault();
      const input = document.getElementById('checkin-input');
      if (input) input.focus();
      return;
    }
    if (event.key === 't' && !inInput) {
      uiState.viewDate = todayStr();
      render();
      return;
    }
    if (event.key === 'ArrowLeft' && !inInput) {
      uiState.viewDate = addDays(uiState.viewDate, -1);
      render();
      return;
    }
    if (event.key === 'ArrowRight' && !inInput) {
      uiState.viewDate = addDays(uiState.viewDate, 1);
      render();
      return;
    }

    if (inInput) return;

    const morningKeys = state.ritualTemplate.morning.map(item => item.key);
    const eveningKeys = state.ritualTemplate.evening.map(item => item.key);
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

  document.getElementById('nav').style.display = 'flex';
  setupNav();
  setActiveTab(uiState.activeView);
  render();
}

init();
