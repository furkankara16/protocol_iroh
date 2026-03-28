// ── STATE MANAGEMENT ──
// Persistent state, localStorage I/O, state normalization,
// book metadata pipeline, and the commit() mutation helper.

import { dateFromStr } from './utils.js';
import {
  STORAGE_KEY, readingList, DEFAULT_MORNING_TEMPLATE, DEFAULT_EVENING_TEMPLATE,
  normalizeRitualItem, normalizeReadingBook, createDefaultReadingBooks,
  getTodayPractice, getBookForMonth,
  BOOK_DESCRIPTION_LENGTH, BOOK_LOOKUP_SOURCE, BOOK_DESCRIPTION_FALLBACK_SOURCE,
  BOOK_LOOKUP_SERVICES, BOOK_METADATA_LOOKUP_VERSION
} from './data.js';
import { uiState, getRenderCallback } from './ui-state.js';

// ── CORE STATE ──
export let state = null;
export function setState(s) { state = s; }

// ── NORMALIZE ──
export function normalizeStateShape(rawState) {
  const next = rawState && typeof rawState === 'object' ? rawState : {};
  if (!next.days || typeof next.days !== 'object') next.days = {};
  if (!next.monthlyChallenges || typeof next.monthlyChallenges !== 'object') next.monthlyChallenges = {};
  for (let i = 1; i <= 12; i++) {
    const month = next.monthlyChallenges[i] || {};
    next.monthlyChallenges[i] = {
      completed: !!month.completed,
      note: typeof month.note === 'string' ? month.note : ''
    };
  }
  if (!next.reading || typeof next.reading !== 'object') next.reading = {};
  next.reading.notes = typeof next.reading.notes === 'string' ? next.reading.notes : '';
  if (!next.reading.customBooks || typeof next.reading.customBooks !== 'object') next.reading.customBooks = {};
  if (!Array.isArray(next.reading.books)) {
    next.reading.books = createDefaultReadingBooks().map(baseBook => {
      const custom = next.reading.customBooks[baseBook.id] || {};
      return normalizeReadingBook({
        ...baseBook,
        title: custom.title !== undefined ? custom.title : baseBook.title,
        author: custom.author !== undefined ? custom.author : baseBook.author,
        startDate: custom.startDate || '',
        endDate: custom.endDate || ''
      }, baseBook.id);
    });
  } else {
    let nextId = 1;
    const seenIds = new Set();
    next.reading.books = next.reading.books.map((book, index) => {
      const normalized = normalizeReadingBook(book, index + 1);
      if (!normalized.id || seenIds.has(normalized.id)) {
        while (seenIds.has(nextId)) nextId++;
        normalized.id = nextId;
      }
      seenIds.add(normalized.id);
      return normalized;
    });
  }
  if (!next.reading.bookMeta || typeof next.reading.bookMeta !== 'object') next.reading.bookMeta = {};
  const validBookIds = new Set(next.reading.books.map(book => book.id));
  Object.keys(next.reading.bookMeta).forEach(id => {
    if (!validBookIds.has(parseInt(id, 10))) {
      delete next.reading.bookMeta[id];
      return;
    }
    const meta = next.reading.bookMeta[id] || {};
    next.reading.bookMeta[id] = {
      lookupKey: typeof meta.lookupKey === 'string' ? meta.lookupKey : '',
      coverUrl: typeof meta.coverUrl === 'string' ? meta.coverUrl : '',
      description: typeof meta.description === 'string' ? meta.description : '',
      status: typeof meta.status === 'string' ? meta.status : '',
      source: typeof meta.source === 'string' ? meta.source : '',
      error: typeof meta.error === 'string' ? meta.error : '',
      fetchedAt: typeof meta.fetchedAt === 'string' ? meta.fetchedAt : '',
      lookupVersion: Number.isFinite(meta.lookupVersion) ? meta.lookupVersion : 0
    };
  });
  const currentBookId = parseInt(next.reading.currentBook, 10);
  next.reading.currentBook = validBookIds.has(currentBookId) ? currentBookId : (next.reading.books[0] ? next.reading.books[0].id : null);

  // Ritual template
  if (!next.ritualTemplate || typeof next.ritualTemplate !== 'object') {
    next.ritualTemplate = {
      morning: DEFAULT_MORNING_TEMPLATE.map(i => ({ ...i })),
      evening: DEFAULT_EVENING_TEMPLATE.map(i => ({ ...i }))
    };
  } else {
    if (!Array.isArray(next.ritualTemplate.morning) || next.ritualTemplate.morning.length === 0) {
      next.ritualTemplate.morning = DEFAULT_MORNING_TEMPLATE.map(i => ({ ...i }));
    } else {
      next.ritualTemplate.morning = next.ritualTemplate.morning.map(normalizeRitualItem);
    }
    if (!Array.isArray(next.ritualTemplate.evening) || next.ritualTemplate.evening.length === 0) {
      next.ritualTemplate.evening = DEFAULT_EVENING_TEMPLATE.map(i => ({ ...i }));
    } else {
      next.ritualTemplate.evening = next.ritualTemplate.evening.map(normalizeRitualItem);
    }
  }

  return next;
}

// ── PERSISTENCE ──
export function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try { return normalizeStateShape(JSON.parse(raw)); } catch(e) {}
  }
  return null;
}

export function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// ── COMMIT ──
export function commit(mutator, opts = {}) {
  mutator(state);
  if (opts.silent) return;
  save();
  if (opts.render !== false) {
    const render = getRenderCallback();
    if (render) render();
  }
}

// ── DAY HELPERS ──
export function ensureDay(dateStr) {
  if (!state.days[dateStr]) {
    const dow = dateFromStr(dateStr).getDay();
    const practice = getTodayPractice(dow);
    const morning = {};
    state.ritualTemplate.morning.forEach(item => { morning[item.key] = false; });
    const evening = {};
    state.ritualTemplate.evening.forEach(item => { evening[item.key] = false; });
    state.days[dateStr] = {
      morning,
      evening,
      _ritualKeys: {
        morning: state.ritualTemplate.morning.map(i => i.key),
        evening: state.ritualTemplate.evening.map(i => i.key)
      },
      emotionalCheckins: [],
      eveningReflection: { reacted: '', avoided: '', grateful: '' },
      weeklyPractice: { completed: false, type: practice.type }
    };
    if (dow === 0) {
      state.days[dateStr].weeklyIntegration = { pattern: '', learning: '', carryForward: '' };
    }
  }
  // Ensure weeklyIntegration exists for Sundays (backfill)
  const dow = dateFromStr(dateStr).getDay();
  if (dow === 0 && !state.days[dateStr].weeklyIntegration) {
    state.days[dateStr].weeklyIntegration = { pattern: '', learning: '', carryForward: '' };
  }
  return state.days[dateStr];
}

export function getDayCompletion(dayData) {
  if (!dayData) return { completed: 0, total: 0, rate: 0 };
  let completed = 0;
  const mKeys = dayData._ritualKeys
    ? dayData._ritualKeys.morning
    : state.ritualTemplate.morning.map(i => i.key);
  const eKeys = dayData._ritualKeys
    ? dayData._ritualKeys.evening
    : state.ritualTemplate.evening.map(i => i.key);
  let total = mKeys.length + eKeys.length;
  mKeys.forEach(key => { if (dayData.morning && dayData.morning[key]) completed++; });
  eKeys.forEach(key => { if (dayData.evening && dayData.evening[key]) completed++; });
  if (dayData.weeklyPractice && dayData.weeklyPractice.type) {
    total++;
    if (dayData.weeklyPractice.completed) completed++;
  }
  return { completed, total, rate: total > 0 ? completed / total : 0 };
}

// ── READING BOOK HELPERS ──
export function getReadingBooks() {
  if (!state.reading.books) state.reading.books = createDefaultReadingBooks();
  return state.reading.books;
}

export function getBookDisplay(bookId) {
  return getReadingBooks().find(book => book.id === bookId) || null;
}

export function getBookIndex(bookId) {
  return getReadingBooks().findIndex(book => book.id === bookId);
}

export function getFallbackBookIdForMonth(month) {
  const books = getReadingBooks();
  if (!books.length) return null;
  const defaultIndex = Math.max(0, readingList.findIndex(book => book.id === getBookForMonth(month)));
  return books[Math.min(defaultIndex, books.length - 1)].id;
}

export function getCurrentReadingBookId(month) {
  const books = getReadingBooks();
  if (!books.length) return null;
  const currentBook = parseInt(state.reading.currentBook, 10);
  if (books.some(book => book.id === currentBook)) return currentBook;
  const fallbackId = getFallbackBookIdForMonth(month);
  state.reading.currentBook = fallbackId;
  return fallbackId;
}

export function getNextReadingBookId(bookId) {
  const books = getReadingBooks();
  const index = getBookIndex(bookId);
  if (index === -1) return books[0] ? books[0].id : null;
  return books[index + 1] ? books[index + 1].id : bookId;
}

export function getNewReadingBookId() {
  return getReadingBooks().reduce((maxId, book) => Math.max(maxId, book.id), 0) + 1;
}

// ── BOOK METADATA ──
export const bookLookupRuntime = {};

export function getBookMeta(bookId) {
  if (!state.reading.bookMeta) state.reading.bookMeta = {};
  return state.reading.bookMeta[bookId] || {};
}

export function setBookMeta(bookId, nextMeta) {
  if (!state.reading.bookMeta) state.reading.bookMeta = {};
  state.reading.bookMeta[bookId] = {
    lookupKey: '',
    coverUrl: '',
    description: '',
    status: '',
    source: '',
    error: '',
    fetchedAt: '',
    lookupVersion: 0,
    ...getBookMeta(bookId),
    ...nextMeta
  };
}

export function clearBookMeta(bookId) {
  if (state.reading.bookMeta) delete state.reading.bookMeta[bookId];
  delete bookLookupRuntime[bookId];
}

export function normalizeBookText(value) {
  return (value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function getBookLookupKey(title, author) {
  const normalizedTitle = normalizeBookText(title);
  const normalizedAuthor = normalizeBookText(author);
  return normalizedTitle && normalizedAuthor ? `${normalizedTitle}::${normalizedAuthor}` : '';
}

export function sharedTokenCount(a, b) {
  const aTokens = new Set(normalizeBookText(a).split(' ').filter(Boolean));
  const bTokens = normalizeBookText(b).split(' ').filter(Boolean);
  let matches = 0;
  bTokens.forEach(token => { if (aTokens.has(token)) matches++; });
  return matches;
}

export function getOpenLibraryScore(doc, title, author) {
  const candidateTitle = normalizeBookText(doc.title);
  const candidateAuthors = (doc.author_name || []).map(normalizeBookText).filter(Boolean);
  if (!candidateTitle || candidateAuthors.length === 0) return -1;

  const titleKey = normalizeBookText(title);
  const authorKey = normalizeBookText(author);
  let score = 0;

  if (candidateTitle === titleKey) score += 8;
  else if (candidateTitle.includes(titleKey) || titleKey.includes(candidateTitle)) score += 5;
  score += sharedTokenCount(candidateTitle, titleKey);

  if (candidateAuthors.some(name => name === authorKey)) score += 6;
  else if (candidateAuthors.some(name => name.includes(authorKey) || authorKey.includes(name))) score += 4;
  else score += Math.max(...candidateAuthors.map(name => sharedTokenCount(name, authorKey)), 0);

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
  (docs || []).forEach(doc => {
    const score = getOpenLibraryScore(doc, title, author);
    if (score > bestScore) { bestScore = score; bestDoc = doc; }
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

  if (candidateAuthors.some(name => name === authorKey)) score += 6;
  else if (candidateAuthors.some(name => name.includes(authorKey) || authorKey.includes(name))) score += 4;
  else score += Math.max(...candidateAuthors.map(name => sharedTokenCount(name, authorKey)), 0);

  if (info.description) score += 2;
  return score;
}

function chooseBestGoogleBook(items, title, author) {
  let bestItem = null;
  let bestScore = -1;
  (items || []).forEach(item => {
    const score = getGoogleBooksScore(item, title, author);
    if (score > bestScore) { bestScore = score; bestItem = item; }
  });
  return bestScore >= 6 ? bestItem : null;
}

function collapseWhitespace(text) {
  return (text || '').replace(/\s+/g, ' ').trim();
}

function stripHtml(text) {
  if (!text) return '';
  const probe = document.createElement('div');
  probe.innerHTML = text;
  return probe.textContent || probe.innerText || '';
}

function truncateText(text, maxLength) {
  const cleaned = collapseWhitespace(text);
  if (cleaned.length <= maxLength) return cleaned;
  let shortened = cleaned.slice(0, maxLength + 1);
  const lastSpace = shortened.lastIndexOf(' ');
  if (lastSpace > Math.floor(maxLength * 0.65)) shortened = shortened.slice(0, lastSpace);
  else shortened = shortened.slice(0, maxLength);
  return shortened.replace(/[.,;:!? ]+$/g, '') + '\u2026';
}

function extractOpenLibraryText(value) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.map(extractOpenLibraryText).filter(Boolean).join(' ');
  if (typeof value === 'object') {
    if (typeof value.value === 'string') return value.value;
    if (typeof value.excerpt === 'string') return value.excerpt;
    if (typeof value.text === 'string') return value.text;
    if (typeof value.note === 'string') return value.note;
  }
  return '';
}

function normalizeBookDescription(text) {
  return truncateText(stripHtml(text), BOOK_DESCRIPTION_LENGTH);
}

function looksLikeUsefulBookDescription(text) {
  const cleaned = collapseWhitespace(text);
  if (!cleaned) return false;
  if (cleaned.length < 36 && cleaned.split(' ').length < 6) return false;
  return !/^(includes bibliographical references|includes index|translation of|cover title|previously published|abridged|unabridged)\b/i.test(cleaned);
}

function pickFirstUsableBookDescription(candidates) {
  for (const candidate of candidates) {
    const cleaned = normalizeBookDescription(candidate);
    if (looksLikeUsefulBookDescription(cleaned)) return cleaned;
  }
  return '';
}

function getOpenLibraryDescriptionCandidates(record) {
  if (!record || typeof record !== 'object') return [];
  return [
    extractOpenLibraryText(record.description),
    extractOpenLibraryText(record.first_sentence),
    extractOpenLibraryText(record.excerpts),
    extractOpenLibraryText(record.notes)
  ].filter(Boolean);
}

export function getBookMetaStatus(bookId) {
  const book = getBookDisplay(bookId);
  if (!book) return { tone: '', message: 'No book is selected right now.' };
  const key = getBookLookupKey(book.title, book.author);
  const meta = getBookMeta(bookId);
  const runtime = bookLookupRuntime[bookId];

  if (!key) return { tone: '', message: 'Enter a title and author to auto-fill the cover and description.' };
  if (runtime && runtime.lookupKey === key) return { tone: '', message: `Looking up details from ${BOOK_LOOKUP_SERVICES}...` };
  if (meta.lookupKey !== key || !meta.status) return { tone: '', message: 'Ready to fetch book details automatically.' };
  if (meta.status === 'found') return { tone: 'success', message: `Auto-filled from ${meta.source || BOOK_LOOKUP_SOURCE}.` };
  if (meta.status === 'missing') return { tone: '', message: 'No matching cover or description was found for this title yet.' };
  return { tone: 'error', message: meta.error || `Could not reach ${BOOK_LOOKUP_SERVICES} right now.` };
}

async function fetchJsonWithTimeout(url, timeoutMs = 8000) {
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
  const normalizedKey = workKey.startsWith('/works/') ? workKey : `/works/${String(workKey).replace(/^\/+/, '')}`;
  const data = await fetchJsonWithTimeout(`https://openlibrary.org${normalizedKey}.json`);
  let description = pickFirstUsableBookDescription(getOpenLibraryDescriptionCandidates(data));
  if (description) return description;

  const normalizedEditionKeys = (editionKeys || [])
    .map(key => String(key || '').replace(/^\/+books\//, '').replace(/^\/+/, ''))
    .filter(Boolean);
  for (const editionKey of normalizedEditionKeys.slice(0, 3)) {
    try {
      const editionData = await fetchJsonWithTimeout(`https://openlibrary.org/books/${editionKey}.json`);
      description = pickFirstUsableBookDescription(getOpenLibraryDescriptionCandidates(editionData));
      if (description) return description;
    } catch (err) { /* keep trying */ }
  }
  return '';
}

async function fetchGoogleBooksDescription(title, author) {
  const query = `${title} ${author}`;
  const data = await fetchJsonWithTimeout(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&langRestrict=en&printType=books&maxResults=5`);
  const match = chooseBestGoogleBook(data.items || [], title, author);
  if (!match) return '';
  return pickFirstUsableBookDescription([
    match.volumeInfo && match.volumeInfo.description,
    match.searchInfo && match.searchInfo.textSnippet
  ]);
}

async function fetchBookMetadata(title, author) {
  let match = null;
  let coverUrl = '';
  let description = '';
  let source = '';
  let openLibraryError = null;

  try {
    const searchUrl = `https://openlibrary.org/search.json?q=${encodeURIComponent(`${title} ${author}`)}&fields=key,title,author_name,cover_i,edition_key&limit=10&lang=en`;
    const searchData = await fetchJsonWithTimeout(searchUrl);
    match = chooseBestOpenLibraryDoc(searchData.docs || [], title, author);
    coverUrl = match && match.cover_i ? `https://covers.openlibrary.org/b/id/${match.cover_i}-M.jpg?default=false` : '';
    source = coverUrl ? BOOK_LOOKUP_SOURCE : '';
  } catch (err) {
    openLibraryError = err;
  }

  if (match) {
    try {
      description = await fetchOpenLibraryDescription(match.key, match.edition_key || []);
    } catch (err) {
      openLibraryError = err;
      description = '';
    }
    if (description) source = BOOK_LOOKUP_SOURCE;
  }

  if (!description) {
    try {
      description = await fetchGoogleBooksDescription(title, author);
    } catch (err) {
      description = '';
    }
    if (description) {
      source = coverUrl ? `${BOOK_LOOKUP_SOURCE} + ${BOOK_DESCRIPTION_FALLBACK_SOURCE}` : BOOK_DESCRIPTION_FALLBACK_SOURCE;
    }
  }

  if (openLibraryError && !coverUrl && !description) throw openLibraryError;
  if (!match && !description) return { coverUrl: '', description: '', source: BOOK_LOOKUP_SOURCE };

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
      lookupKey: expectedKey, coverUrl: result.coverUrl || '', description: result.description || '',
      status: result.coverUrl || result.description ? 'found' : 'missing',
      source: result.source || BOOK_LOOKUP_SOURCE, error: '',
      fetchedAt: new Date().toISOString(), lookupVersion: BOOK_METADATA_LOOKUP_VERSION
    });
    save();
  } catch (err) {
    const currentBook = getBookDisplay(bookId);
    if (!currentBook) return;
    if (getBookLookupKey(currentBook.title, currentBook.author) !== expectedKey) return;
    setBookMeta(bookId, {
      lookupKey: expectedKey, coverUrl: '', description: '', status: 'error',
      source: BOOK_LOOKUP_SOURCE, error: `Could not reach ${BOOK_LOOKUP_SERVICES} right now.`,
      fetchedAt: new Date().toISOString(), lookupVersion: BOOK_METADATA_LOOKUP_VERSION
    });
    save();
  } finally {
    const runtime = bookLookupRuntime[bookId];
    if (runtime && runtime.lookupKey === expectedKey) delete bookLookupRuntime[bookId];
    if (uiState.activeView === 'progress') {
      const render = getRenderCallback();
      if (render) render();
    }
  }
}

export function startBookMetadataLookup(bookId, options = {}) {
  const book = getBookDisplay(bookId);
  if (!book) return Promise.resolve(null);
  const lookupKey = getBookLookupKey(book.title, book.author);
  if (!lookupKey) {
    clearBookMeta(bookId);
    save();
    if (options.render !== false && uiState.activeView === 'progress') {
      const render = getRenderCallback();
      if (render) render();
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

  if (options.render !== false && uiState.activeView === 'progress') {
    const render = getRenderCallback();
    if (render) render();
  }
  return promise;
}

export function primeBookMetadataLookups(bookIds) {
  let queued = false;
  bookIds.forEach(bookId => {
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
      if (uiState.activeView === 'progress') {
        const render = getRenderCallback();
        if (render) render();
      }
    });
  }
}
