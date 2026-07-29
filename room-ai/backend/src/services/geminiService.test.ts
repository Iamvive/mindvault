import { describe, it, expect } from 'vitest';
import { analyzeRoomPhoto } from './geminiService';

describe('geminiService', () => {
  it('returns structured room analysis in offline fallback mode for multi-angle input', async () => {
    const dummyInputs = [
      { buffer: Buffer.from('fake-image-data-1'), mimeType: 'image/jpeg' },
      { buffer: Buffer.from('fake-image-data-2'), mimeType: 'image/jpeg' }
    ];
    const result = await analyzeRoomPhoto(dummyInputs);

    expect(result).toHaveProperty('room_type');
    expect(Array.isArray(result.detected_furniture)).toBe(true);
    expect(result.detected_furniture.length).toBeGreaterThan(0);
    expect(result.estimated_free_space).toHaveProperty('length_ft');
    expect(result.wall_layout_notes.toLowerCase()).toContain('multi-angle');
  });
});
