import catalogData from '../data/furnitureCatalog.json';
import { FurnitureItem } from '../types/room';

export function getRecommendations(
  style: string,
  category: string,
  freeSpace?: { length_ft?: number; width_ft?: number }
): FurnitureItem[] {
  const items = catalogData as FurnitureItem[];

  // Filter by style
  let filtered = items.filter(
    item => item.style.toLowerCase() === (style || 'minimalist').toLowerCase()
  );

  if (filtered.length === 0) {
    filtered = items;
  }

  // Filter or prioritize category
  const targetCategory = (category || 'bed').toLowerCase();
  const categoryMatches = filtered.filter(
    item => item.category.toLowerCase().includes(targetCategory) ||
            targetCategory.includes(item.category.toLowerCase())
  );

  let results = categoryMatches.length > 0 ? categoryMatches : filtered;

  // Spatial sanity check: if space is tight (< 5 ft), prioritize compact items
  if (freeSpace?.length_ft && freeSpace.length_ft < 5) {
    const compactMatches = results.filter(i => i.dimensions.toLowerCase().includes('compact') || i.dimensions.toLowerCase().includes('small'));
    if (compactMatches.length > 0) {
      results = compactMatches;
    }
  }

  return results.slice(0, 3).map(item => ({
    ...item,
    match_reason: freeSpace?.length_ft && freeSpace?.width_ft
      ? `Tailored fit for your estimated ${freeSpace.length_ft}x${freeSpace.width_ft} ft free floor space.`
      : `Ideal aesthetic match for ${style || 'minimalist'} interior styling.`
  }));
}
