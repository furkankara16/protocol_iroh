import { afterEach, describe, expect, it, vi } from 'vitest';

import { escHtml, getCurrentMonth, getReflectionThemes } from '../src/utils.js';

afterEach(() => {
  vi.useRealTimers();
});

describe('escHtml', () => {
  it('escapes special HTML characters', () => {
    expect(escHtml(`<tag attr="quote">'&`)).toBe('&lt;tag attr=&quot;quote&quot;&gt;&#39;&amp;');
  });

  it('returns an empty string for falsy input', () => {
    expect(escHtml('')).toBe('');
    expect(escHtml(null)).toBe('');
  });
});

describe('getCurrentMonth', () => {
  it('calculates the current protocol month from today', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-28T12:00:00Z'));

    expect(getCurrentMonth('2026-03-28')).toBe(1);
    expect(getCurrentMonth('2026-02-26')).toBe(2);
  });

  it('caps the protocol month at 12', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-28T12:00:00Z'));

    expect(getCurrentMonth('2024-01-01')).toBe(12);
  });
});

describe('getReflectionThemes', () => {
  it('returns recurring words from the last 30 days only', () => {
    const days = {
      '2026-03-27': {
        eveningReflection: {
          reacted: 'Resistance showed up again',
          avoided: 'I avoided resistance and drift',
          grateful: ''
        },
        emotionalCheckins: [{ label: 'steady', time: '08:00' }],
        weeklyIntegration: { pattern: '', learning: '', carryForward: '' }
      },
      '2026-03-18': {
        eveningReflection: {
          reacted: '',
          avoided: '',
          grateful: 'Steady focus after the walk'
        },
        emotionalCheckins: [{ label: 'steady', time: '18:00' }],
        weeklyIntegration: { pattern: 'Resistance softened', learning: '', carryForward: '' }
      },
      '2026-02-01': {
        eveningReflection: {
          reacted: 'Resistance from long ago should be ignored',
          avoided: '',
          grateful: ''
        },
        emotionalCheckins: [],
        weeklyIntegration: { pattern: '', learning: '', carryForward: '' }
      }
    };

    expect(getReflectionThemes(days, '2026-01-01', '2026-03-28')).toEqual([
      { word: 'resistance', count: 3 },
      { word: 'steady', count: 3 }
    ]);
  });
});
