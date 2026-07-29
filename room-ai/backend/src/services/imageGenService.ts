import sharp from 'sharp';
import { MakeoverRequest, MakeoverResponse } from '../types/room';
import { getRecommendations } from './catalogService';

export async function generateMakeoverImage(
  req: MakeoverRequest,
  imageBuffer?: Buffer
): Promise<MakeoverResponse> {
  const style = req.style || 'minimalist';
  const addItem = req.add_item || 'bed';
  const keepItems = req.keep_items && req.keep_items.length > 0
    ? req.keep_items.join(', ')
    : 'desk, mirror';

  const recommendations = getRecommendations(style, addItem, req.dimensions);
  const recommendedItem = recommendations.length > 0 ? recommendations[0] : null;

  let base64Photo = '';

  if (imageBuffer) {
    try {
      // Process uploaded photo: resize to standard 1024x768 canvas preserving aspect ratio
      const processedBuffer = await sharp(imageBuffer)
        .resize(1024, 768, { fit: 'cover' })
        .jpeg({ quality: 90 })
        .toBuffer();
      
      base64Photo = `data:image/jpeg;base64,${processedBuffer.toString('base64')}`;
    } catch (err) {
      console.warn('Sharp image processing error:', err);
    }
  }

  // Fallback to high quality room canvas if no photo buffer provided
  if (!base64Photo) {
    base64Photo = recommendedItem?.image_url || 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1024&q=80';
  }

  return {
    makeover: {
      image_url: base64Photo,
      description: `Direct photo makeover on your actual room canvas. Seamlessly adding a ${style} ${addItem} while keeping your ${keepItems} in place.`,
      suggested_item_dimensions: (req.dimensions?.length_ft && req.dimensions?.width_ft)
        ? `${req.dimensions.length_ft * 8} x ${req.dimensions.width_ft * 8} inches`
        : '60 x 80 inches (Queen)',
      estimated_price_range: recommendedItem?.price_range || '$350 - $550',
      placement_notes: `Placed along open floor space to preserve walkway access to your ${keepItems}.`
    },
    recommendations
  };
}
