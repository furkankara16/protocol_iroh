import { describe, expect, it } from 'vitest';

import { getEmotionQuadrant } from '../src/data.js';

describe('getEmotionQuadrant', () => {
  it('matches exact vocabulary words', () => {
    expect(getEmotionQuadrant('calm')).toBe(3);
    expect(getEmotionQuadrant('anxious')).toBe(0);
  });

  it('matches comma-separated emotion selections', () => {
    expect(getEmotionQuadrant('calm, grounded')).toBe(3);
    expect(getEmotionQuadrant('frustrated, overwhelmed')).toBe(0);
  });

  it('matches known words inside short free-text labels', () => {
    expect(getEmotionQuadrant('I feel grateful but tired')).toBe(3);
  });

  it('returns -1 when no vocabulary word is present', () => {
    expect(getEmotionQuadrant('thinking about work')).toBe(-1);
  });
});
