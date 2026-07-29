import React, { useState } from 'react';
import { MakeoverResponse } from '../types/room';
import { RecommendationCard } from './RecommendationCard';
import { RotateCcw, Sliders, Layers } from 'lucide-react';

interface Props {
  originalPreviewUrl: string;
  makeoverResponse: MakeoverResponse;
  onReset: () => void;
}

export const MakeoverView: React.FC<Props> = ({ originalPreviewUrl, makeoverResponse, onReset }) => {
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const { makeover, recommendations } = makeoverResponse;
  const recommendedItem = recommendations.length > 0 ? recommendations[0] : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Top Section: Real Room Canvas Visualization */}
      <div className="major-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(52,211,153,0.15)', color: '#34d399', padding: '4px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: 700, marginBottom: '8px' }}>
              ✓ Real Photo Canvas Overlay
            </div>
            <h2 style={{ fontSize: '28px', fontWeight: 800 }}>Photorealistic Room Preview</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
              {makeover.description}
            </p>
          </div>

          <button 
            className="pill-button-secondary"
            onClick={onReset}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <RotateCcw size={16} /> New Makeover
          </button>
        </div>

        {/* Interactive Before / After Split Image Slider */}
        <div 
          style={{ 
            borderRadius: '20px', 
            overflow: 'hidden', 
            height: '480px', 
            background: '#0b0d13', 
            border: '1px solid var(--bg-card-border)', 
            position: 'relative',
            userSelect: 'none'
          }}
        >
          {/* Base: Makeover Layer */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
            <img 
              src={makeover.image_url} 
              alt="Makeover room" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
            {recommendedItem && (
              <div 
                style={{
                  position: 'absolute',
                  bottom: '30%',
                  right: '15%',
                  width: '280px',
                  background: 'rgba(20,23,34,0.92)',
                  backdropFilter: 'blur(12px)',
                  border: '2px solid var(--sg-primary)',
                  borderRadius: '16px',
                  padding: '12px',
                  boxShadow: '0 12px 30px rgba(0,0,0,0.5)'
                }}
              >
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <img src={recommendedItem.image_url} alt={recommendedItem.name} style={{ width: '60px', height: '60px', borderRadius: '10px', objectFit: 'cover' }} />
                  <div>
                    <span style={{ fontSize: '10px', background: 'var(--sg-primary)', color: '#fff', padding: '2px 6px', borderRadius: '9999px', fontWeight: 700 }}>
                      Added Item
                    </span>
                    <h5 style={{ fontSize: '13px', fontWeight: 700, color: '#fff', marginTop: '2px' }}>{recommendedItem.name}</h5>
                    <p style={{ fontSize: '11px', color: 'var(--accent-green)', fontWeight: 600 }}>{recommendedItem.price_range}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Overlay: Original Photo (Clipped by Slider) */}
          <div 
            style={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              bottom: 0, 
              width: `${sliderPosition}%`, 
              overflow: 'hidden',
              borderRight: '3px solid #ffffff',
              boxShadow: '4px 0 20px rgba(0,0,0,0.4)'
            }}
          >
            <img 
              src={originalPreviewUrl || makeover.image_url} 
              alt="Original room photo" 
              style={{ 
                width: '1000px', 
                height: '480px', 
                maxWidth: 'none', 
                objectFit: 'cover' 
              }} 
            />
            <span style={{ position: 'absolute', top: '16px', left: '16px', background: 'rgba(0,0,0,0.75)', color: '#fff', padding: '4px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: 700 }}>
              Original Photo
            </span>
          </div>

          <span style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(230,0,35,0.85)', color: '#fff', padding: '4px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: 700 }}>
            Makeover Overlay
          </span>

          {/* Interactive Range Input Slider handle */}
          <input 
            type="range"
            min="0"
            max="100"
            value={sliderPosition}
            onChange={(e) => setSliderPosition(Number(e.target.value))}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              opacity: 0,
              cursor: 'ew-resize',
              zIndex: 20
            }}
          />

          <div style={{ 
            position: 'absolute', 
            bottom: '16px', 
            left: '50%', 
            transform: 'translateX(-50%)', 
            background: 'rgba(15,17,23,0.85)', 
            backdropFilter: 'blur(10px)',
            color: 'var(--text-muted)',
            padding: '6px 16px', 
            borderRadius: '9999px', 
            fontSize: '12px', 
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            pointerEvents: 'none',
            zIndex: 10
          }}>
            <Sliders size={14} /> Drag slider left/right to compare original photo vs makeover
          </div>
        </div>
      </div>

      {/* Recommendations Section */}
      <div>
        <h3 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>
          Curated Furniture Recommendation List
        </h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '14px' }}>
          Real functional furniture verified to fit your exact room dimensions without crowding your preserved items.
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
