import { describe, it, expect } from 'vitest';
import { analyzeRoomPhoto } from './geminiService';

describe('geminiService', () => {
  it('returns structured room analysis in offline fallback mode', async () => {
    const dummyBuffer = Buffer.from('fake-image-data');
    const result = await analyzeRoomPhoto(dummyBuffer, 'image/jpeg');

    expect(result).toHaveProperty('room_type');
    expect(Array.isArray(result.detected_furniture)).toBe(true);
    expect(result.detected_furniture.length).toBeGreaterThan(0);
    expect(result.estimated_free_space).toHaveProperty('length_ft');
    expect(result.confidence_flag).toContain('estimated');
  });
});
