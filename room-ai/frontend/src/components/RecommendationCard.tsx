import React from 'react';
import { FurnitureItem } from '../types/room';
import { ShoppingBag, CheckCircle } from 'lucide-react';

interface Props {
  item: FurnitureItem;
}

export const RecommendationCard: React.FC<Props> = ({ item }) => {
  return (
    <div className="card-container" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ borderRadius: '12px', overflow: 'hidden', height: '200px', background: '#10121a', position: 'relative' }}>
        <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <span style={{ 
          position: 'absolute', 
          top: '12px', 
          right: '12px', 
          background: 'rgba(15,17,23,0.85)', 
          backdropFilter: 'blur(8px)',
          color: '#ffffff', 
          padding: '4px 12px', 
          borderRadius: '9999px', 
          fontSize: '12px', 
          fontWeight: 700 
        }}>
          {item.style}
        </span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h4 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>{item.name}</h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Dimensions: {item.dimensions}</p>
        </div>
        <span style={{ color: 'var(--sg-primary)', fontSize: '16px', fontWeight: 800 }}>
          {item.price_range}
        </span>
      </div>

      <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
        {item.description}
      </p>

      {item.match_reason && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(52,211,153,0.1)', color: 'var(--accent-green)', padding: '10px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: 600 }}>
          <CheckCircle size={15} />
          {item.match_reason}
        </div>
      )}

      <button className="pill-button-secondary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '4px' }}>
        <ShoppingBag size={15} />
        View Curated Recommendation
      </button>
    </div>
  );
};
