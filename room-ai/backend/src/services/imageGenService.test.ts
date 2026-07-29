import { describe, it, expect } from 'vitest';
import { generateMakeoverImage } from './imageGenService';

describe('imageGenService', () => {
  it('generates makeover visualization and recommendation list', async () => {
    const response = await generateMakeoverImage({
      add_item: 'bed',
      keep_items: ['desk', 'mirror'],
      style: 'minimalist',
      dimensions: { length_ft: 8, width_ft: 7 }
    });

    expect(response).toHaveProperty('makeover');
    expect(response.makeover.image_url).toContain('pollinations.ai');
    expect(response.makeover.description).toContain('minimalist');
    expect(Array.isArray(response.recommendations)).toBe(true);
    expect(response.recommendations.length).toBeGreaterThan(0);
  });
});
