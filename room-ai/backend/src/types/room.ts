export interface ImageInput {
  buffer: Buffer;
  mimeType: string;
}

export interface DetectedFurniture {
  item: string;
  approx_location: string;
}

export interface EstimatedFreeSpace {
  length_ft: number;
  width_ft: number;
  unit: string;
}

export interface RoomAnalysisResult {
  room_type: string;
  detected_furniture: DetectedFurniture[];
  estimated_free_space: EstimatedFreeSpace;
  wall_layout_notes: string;
  confidence_flag: string;
}

export interface FurnitureItem {
  id: string;
  name: string;
  style: 'minimalist' | 'modern' | 'boho' | 'scandinavian' | 'industrial' | string;
  category: string;
  dimensions: string;
  price_range: string;
  image_url: string;
  description: string;
  match_reason?: string;
}

export interface MakeoverRequest {
  add_item: string;
  keep_items: string[];
  style: 'minimalist' | 'modern' | 'boho' | 'scandinavian' | 'industrial' | string;
  dimensions?: { length_ft?: number; width_ft?: number };
  budget?: string;
}

export interface MakeoverOption {
  image_url: string;
  description: string;
  suggested_item_dimensions: string;
  estimated_price_range: string;
  placement_notes: string;
}

export interface MakeoverResponse {
  makeover: MakeoverOption;
  recommendations: FurnitureItem[];
}
