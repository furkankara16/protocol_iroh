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

  it('normalizes legacy date strings so progress range filters still include saved days', () => {
    const normalized = normalizeStateShape({
      startDate: '2026-3-28',
      days: {
        '2026-3-28': {
          morning: {},
          evening: {},
          emotionalCheckins: [{ time: '20:59', label: 'grateful' }],
          eveningReflection: { reacted: '', avoided: '', grateful: '' },
          weeklyPractice: { completed: false, type: 'solitude' }
        }
      },
      reading: {
        books: [{ id: 1, title: 'Test', author: 'Author', startDate: '2026-3-28', endDate: '2026-4-2' }]
      }
    });

    expect(normalized.startDate).toBe('2026-03-28');
    expect(Object.keys(normalized.days)).toEqual(['2026-03-28']);
    expect(normalized.reading.books[0].startDate).toBe('2026-03-28');
    expect(normalized.reading.books[0].endDate).toBe('2026-04-02');
  });

  it('pulls protocol start date back to the earliest saved day and normalizes legacy checkins', () => {
    const normalized = normalizeStateShape({
      startDate: '2026-03-28',
      days: {
        '2026-03-26': {
          checkins: [
            'grateful',
            { word: 'peaceful', at: '20:14' }
          ]
        },
        '2026-03-27': {
          emotionalCheckins: [{ label: 'warm', time: '21:15' }]
        }
      }
    });

    expect(normalized.startDate).toBe('2026-03-26');
    expect(normalized.days['2026-03-26'].emotionalCheckins).toEqual([
      { time: '', label: 'grateful' },
      { time: '20:14', label: 'peaceful' }
    ]);
    expect(normalized.days['2026-03-27'].emotionalCheckins).toEqual([
      { time: '21:15', label: 'warm' }
    ]);
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
