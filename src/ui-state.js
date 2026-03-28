// ── UI STATE ──
// Shared mutable UI variables. Kept separate from persistent state
// to break circular dependencies between state.js and views.

import { todayStr } from './utils.js';

export const uiState = {
  activeView: 'daily',
  viewDate: todayStr(),
  weekOffset: 0,
  pendingBookFocusId: null,
  ritualEditMode: null // null | 'morning' | 'evening'
};

export function setActiveView(v) { uiState.activeView = v; }
export function setViewDate(d) { uiState.viewDate = d; }
export function setWeekOffset(n) { uiState.weekOffset = n; }
export function setPendingBookFocusId(id) { uiState.pendingBookFocusId = id; }
export function setRitualEditMode(mode) { uiState.ritualEditMode = mode; }

// ── RENDER CALLBACK ──
// Injected by app.js to avoid circular imports.
let _renderCallback = null;
export function setRenderCallback(fn) { _renderCallback = fn; }
export function getRenderCallback() { return _renderCallback; }
