import { afterEach, describe, expect, it } from 'vitest';

import { DEFAULT_EVENING_TEMPLATE, DEFAULT_MORNING_TEMPLATE } from '../src/data.js';
import { getDayCompletion, getOpenLibraryScore, normalizeStateShape, setState } from '../src/state.js';

afterEach(() => {
  setState(null);
});

describe('normalizeStateShape', () => {
  it('fills defaults for missing sections', () => {
    const normalized = normalizeStateShape({ startDate: '2026-03-01' });

    expect(Object.keys(normalized.monthlyChallenges)).toHaveLength(12);
    expect(normalized.reading.books).toHaveLength(7);
    expect(normalized.reading.currentBook).toBe(normalized.reading.books[0].id);
    expect(normalized.ritualTemplate.morning).toHaveLength(DEFAULT_MORNING_TEMPLATE.length);
    expect(normalized.ritualTemplate.evening).toHaveLength(DEFAULT_EVENING_TEMPLATE.length);
  });

  it('deduplicates reading book ids and removes orphaned metadata', () => {
    const normalized = normalizeStateShape({
      startDate: '2026-03-01',
      reading: {
        books: [
          { id: 1, title: 'A', author: 'Alpha' },
          { id: 1, title: 'B', author: 'Beta' }
        ],
        bookMeta: {
          1: { description: 'keep' },
          99: { description: 'remove' }
        },
        currentBook: 99
      }
    });

    const ids = normalized.reading.books.map((book) => book.id);
    expect(new Set(ids).size).toBe(2);
    expect(normalized.reading.bookMeta[99]).toBeUndefined();
    expect(ids).toContain(normalized.reading.currentBook);
  });
});

describe('getDayCompletion', () => {
  it('uses the day snapshot keys when they exist', () => {
    setState(normalizeStateShape({ startDate: '2026-03-01' }));

    const completion = getDayCompletion({
      morning: { oldMorning: true, extraCurrentMorning: false },
      evening: { oldEvening: true, extraCurrentEvening: false },
      weeklyPractice: { completed: true, type: 'walk' },
      _ritualKeys: {
        morning: ['oldMorning'],
        evening: ['oldEvening']
      }
    });

    expect(completion).toEqual({ completed: 3, total: 3, rate: 1 });
  });
});

describe('getOpenLibraryScore', () => {
  it('scores a strong title and author match higher than a weak one', () => {
    const exact = getOpenLibraryScore(
      { title: 'Meditations', author_name: ['Marcus Aurelius'], cover_i: 123 },
      'Meditations',
      'Marcus Aurelius'
    );
    const weak = getOpenLibraryScore(
      { title: 'Random Essays', author_name: ['Someone Else'] },
      'Meditations',
      'Marcus Aurelius'
    );

    expect(exact).toBeGreaterThan(weak);
    expect(exact).toBeGreaterThanOrEqual(15);
  });
});
