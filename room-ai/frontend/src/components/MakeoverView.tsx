import React, { useState } from 'react';
import { MakeoverResponse } from '../types/room';
import { RecommendationCard } from './RecommendationCard';
import { RotateCcw, Eye, Layers } from 'lucide-react';

interface Props {
  originalPreviewUrl: string;
  makeoverResponse: MakeoverResponse;
  onReset: () => void;
}

export const MakeoverView: React.FC<Props> = ({ originalPreviewUrl, makeoverResponse, onReset }) => {
  const [viewMode, setViewMode] = useState<'makeover' | 'original' | 'split'>('makeover');
  const { makeover, recommendations } = makeoverResponse;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Top Section: Visualization Hero Card */}
      <div className="major-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: 800 }}>Realistic Room Visualization</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
              {makeover.description}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              className={viewMode === 'makeover' ? 'pill-button' : 'pill-button-secondary'}
              onClick={() => setViewMode('makeover')}
            >
              <Eye size={16} /> Makeover
            </button>
            <button 
              className={viewMode === 'original' ? 'pill-button' : 'pill-button-secondary'}
              onClick={() => setViewMode('original')}
            >
              <Layers size={16} /> Original
            </button>
            <button 
              className="pill-button-secondary"
              onClick={onReset}
              style={{ marginLeft: '12px' }}
            >
              <RotateCcw size={16} /> New Makeover
            </button>
          </div>
        </div>

        <div style={{ borderRadius: '20px', overflow: 'hidden', height: '480px', background: '#0b0d13', border: '1px solid var(--bg-card-border)', position: 'relative' }}>
          <img 
            src={viewMode === 'original' ? originalPreviewUrl : makeover.image_url} 
            alt="Room rendering" 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
          <div style={{ 
            position: 'absolute', 
            bottom: '20px', 
            left: '20px', 
            background: 'rgba(15,17,23,0.85)', 
            backdropFilter: 'blur(12px)',
            padding: '12px 20px', 
            borderRadius: '14px', 
            border: '1px solid var(--bg-card-border)' 
          }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>
              📏 Suggested Dimensions: <span style={{ color: 'var(--sg-primary)' }}>{makeover.suggested_item_dimensions}</span>
            </p>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              📍 {makeover.placement_notes}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Section: Furniture Recommendations */}
      <div>
        <h3 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>
          Curated Furniture Recommendation List
        </h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '14px' }}>
          Recommended items matching your style preference and verified to fit your room space.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {recommendations.map((item) => (
            <RecommendationCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
};
