import { describe, it, expect } from 'vitest';
import { getRecommendations } from './catalogService';

describe('catalogService', () => {
  it('returns furniture matching requested style and category', () => {
    const recs = getRecommendations('minimalist', 'bed');
    expect(recs.length).toBeGreaterThan(0);
    expect(recs[0].style).toBe('minimalist');
  });

  it('filters or prioritizes compact items when floor space is tight', () => {
    const recs = getRecommendations('minimalist', 'bed', { length_ft: 4, width_ft: 4 });
    expect(recs.length).toBeGreaterThan(0);
    expect(recs[0].match_reason).toContain('4x4 ft');
  });
});
