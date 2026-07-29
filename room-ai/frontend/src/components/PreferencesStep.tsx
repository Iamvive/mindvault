import React, { useState } from 'react';
import { RoomAnalysisResult, MakeoverRequest } from '../types/room';
import { Sparkles, ShieldCheck, Maximize2 } from 'lucide-react';

interface Props {
  previewUrl: string;
  analysis: RoomAnalysisResult | null;
  onSubmit: (request: MakeoverRequest) => void;
  loading: boolean;
}

export const PreferencesStep: React.FC<Props> = ({ previewUrl, analysis, onSubmit, loading }) => {
  const [addItem, setAddItem] = useState('queen bed');
  const [style, setStyle] = useState('minimalist');
  const [keepItemsStr, setKeepItemsStr] = useState(
    analysis?.detected_furniture.map(f => f.item).join(', ') || 'desk, mirror'
  );
  const [manualLength, setManualLength] = useState(analysis?.estimated_free_space.length_ft || 8);
  const [manualWidth, setManualWidth] = useState(analysis?.estimated_free_space.width_ft || 7);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const keepItems = keepItemsStr.split(',').map(s => s.trim()).filter(Boolean);
    onSubmit({
      add_item: addItem,
      keep_items: keepItems,
      style,
      dimensions: {
        length_ft: Number(manualLength),
        width_ft: Number(manualWidth)
      }
    });
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
      {/* Left side: Uploaded photo & Gemini detection card */}
      <div className="card-container" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ fontSize: '20px', fontWeight: 700 }}>Original Photo & Detection</h3>
        <div style={{ borderRadius: '12px', overflow: 'hidden', height: '240px', background: '#10121a' }}>
          <img src={previewUrl} alt="Original room" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>

        {analysis && (
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', fontSize: '13px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: 'var(--sg-primary)', fontWeight: 600 }}>
              <ShieldCheck size={16} />
              Detected Protected Furniture
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
              {analysis.detected_furniture.map((item, idx) => (
                <span key={idx} className="tag-chip">
                  🛡️ {item.item} ({item.approx_location})
                </span>
              ))}
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '12px', lineHeight: 1.5 }}>
              💡 {analysis.wall_layout_notes}
            </p>
          </div>
        )}
      </div>

      {/* Right side: Preferences Form */}
      <div className="card-container">
        <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '20px' }}>Makeover Preferences</h3>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
              What would you like to add?
            </label>
            <input 
              type="text" 
              className="form-input" 
              value={addItem}
              onChange={(e) => setAddItem(e.target.value)}
              placeholder="e.g. queen bed, sectional sofa, accent armchair"
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
              Items to keep untouched (comma separated):
            </label>
            <input 
              type="text" 
              className="form-input" 
              value={keepItemsStr}
              onChange={(e) => setKeepItemsStr(e.target.value)}
              placeholder="e.g. desk, mirror, closet"
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
              Design Style Preference:
            </label>
            <select 
              className="form-select" 
              value={style}
              onChange={(e) => setStyle(e.target.value)}
            >
              <option value="minimalist">Minimalist</option>
              <option value="modern">Modern</option>
              <option value="boho">Boho</option>
              <option value="scandinavian">Scandinavian</option>
              <option value="industrial">Industrial</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
              <Maximize2 size={14} />
              Free Floor Space Dimensions (ft):
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <input 
                type="number" 
                className="form-input" 
                value={manualLength}
                onChange={(e) => setManualLength(Number(e.target.value))}
                placeholder="Length (ft)"
              />
              <input 
                type="number" 
                className="form-input" 
                value={manualWidth}
                onChange={(e) => setManualWidth(Number(e.target.value))}
                placeholder="Width (ft)"
              />
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              * Estimated by Gemini Vision — adjust if needed to ensure spatial fit
            </p>
          </div>

          <button 
            type="submit" 
            className="pill-button" 
            style={{ marginTop: '10px' }}
            disabled={loading}
          >
            <Sparkles size={18} />
            {loading ? 'Rendering Realistic Makeover...' : 'Generate Makeover Visualization'}
          </button>
        </form>
      </div>
    </div>
  );
};
