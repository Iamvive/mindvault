import React, { useState } from 'react';
import { Monitor, Laptop, Tablet, Move, RotateCcw, Sparkles, CheckCircle2 } from 'lucide-react';

export default function DeskArrangement() {
  const [positions, setPositions] = useState({
    macmini: { x: 340, y: 50, label: 'Mac mini Monitor (27" 4K)', type: 'macmini', active: true },
    ipad: { x: 740, y: 110, label: 'iPad Pro (Right Stand)', type: 'ipad', active: true },
    macbook: { x: 40, y: 110, label: 'MacBook Pro (Left Companion)', type: 'macbook', active: true }
  });

  const [activePreset, setActivePreset] = useState('desk-hub');
  const [draggingId, setDraggingId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const presets = [
    {
      id: 'desk-hub',
      name: 'Triple Desk Command Center',
      desc: 'Mac mini center 4K, MacBook left, iPad right on magnetic stand for Universal Control.',
      positions: {
        macmini: { x: 340, y: 50, label: 'Mac mini Monitor (27" 4K)', type: 'macmini', active: true },
        ipad: { x: 740, y: 110, label: 'iPad Pro (Right Stand)', type: 'ipad', active: true },
        macbook: { x: 40, y: 110, label: 'MacBook Pro (Left Side)', type: 'macbook', active: true }
      }
    },
    {
      id: 'creative',
      name: 'Creative Studio (Sidecar & Pencil)',
      desc: 'Mac mini main display with iPad tilted flat in front for Apple Pencil sketching.',
      positions: {
        macmini: { x: 340, y: 20, label: 'Mac mini Monitor (Color Reference)', type: 'macmini', active: true },
        ipad: { x: 360, y: 240, label: 'iPad Pro (Pencil Drawing Surface)', type: 'ipad', active: true },
        macbook: { x: 60, y: 80, label: 'MacBook Pro (Clamshell / Aux)', type: 'macbook', active: false }
      }
    },
    {
      id: 'mobile-dual',
      name: 'Mobile Dual-Display (On The Go)',
      desc: 'MacBook Pro as primary screen with iPad connected as wireless Sidecar extended display.',
      positions: {
        macbook: { x: 260, y: 80, label: 'MacBook Pro (Primary Laptop)', type: 'macbook', active: true },
        ipad: { x: 640, y: 100, label: 'iPad (Sidecar Extended Screen)', type: 'ipad', active: true },
        macmini: { x: 50, y: 50, label: 'Mac mini (Headless in Studio)', type: 'macmini', active: false }
      }
    }
  ];

  const applyPreset = (preset) => {
    setActivePreset(preset.id);
    setPositions(preset.positions);
  };

  const handleMouseDown = (e, id) => {
    setDraggingId(id);
    setDragOffset({
      x: e.clientX - positions[id].x,
      y: e.clientY - positions[id].y
    });
  };

  const handleMouseMove = (e) => {
    if (!draggingId) return;
    const canvasRect = e.currentTarget.getBoundingClientRect();
    const newX = Math.max(20, Math.min(canvasRect.width - 240, e.clientX - dragOffset.x));
    const newY = Math.max(20, Math.min(canvasRect.height - 180, e.clientY - dragOffset.y));

    setPositions((prev) => ({
      ...prev,
      [draggingId]: { ...prev[draggingId], x: newX, y: newY }
    }));
  };

  const handleMouseUp = () => {
    setDraggingId(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Preset Selector */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h2 className="display-2">Desk & Display Studio</h2>
            <p style={{ marginTop: '2px' }}>
              Arrange your physical workspace to optimize Universal Control edge transitions and Sidecar positioning
            </p>
          </div>
          <span className="chip chip-primary">
            <Sparkles size={13} />
            Interactive Spatial Canvas
          </span>
        </div>

        {/* Presets Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
          {presets.map((preset) => (
            <div
              key={preset.id}
              onClick={() => applyPreset(preset)}
              className="glass-card"
              style={{
                padding: '16px 20px',
                cursor: 'pointer',
                border: activePreset === preset.id ? '1px solid var(--sg-primary)' : '1px solid var(--border-subtle)',
                background: activePreset === preset.id ? 'var(--gradient-wash-3)' : 'var(--bg-glass-card)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>{preset.name}</h4>
                {activePreset === preset.id && (
                  <CheckCircle2 size={16} style={{ color: 'var(--sg-primary)' }} />
                )}
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{preset.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Desk Canvas */}
      <div 
        className="glass-panel" 
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          height: '460px',
          position: 'relative',
          background: 'radial-gradient(ellipse at center, rgba(35, 35, 48, 0.4) 0%, rgba(14, 14, 18, 0.95) 100%)',
          overflow: 'hidden',
          cursor: draggingId ? 'grabbing' : 'default',
          userSelect: 'none'
        }}
      >
        {/* Desk Grid & Visual Boundary */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          opacity: 0.5
        }} />

        {/* Desk Surface Marker */}
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '30px',
          right: '30px',
          height: '4px',
          background: 'linear-gradient(90deg, transparent, var(--border-subtle), transparent)',
          borderRadius: 'var(--radius-full)'
        }} />

        <div style={{
          position: 'absolute',
          top: '16px',
          left: '20px',
          fontSize: '0.78rem',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <Move size={14} /> Drag screens to reorder Universal Control boundaries
        </div>

        {/* Renderable Screens */}
        {Object.entries(positions).map(([id, pos]) => {
          const isMini = pos.type === 'macmini';
          const isMacBook = pos.type === 'macbook';
          const isIpad = pos.type === 'ipad';

          const width = isMini ? 260 : (isMacBook ? 230 : 180);
          const height = isMini ? 170 : (isMacBook ? 150 : 135);

          return (
            <div
              key={id}
              onMouseDown={(e) => handleMouseDown(e, id)}
              style={{
                position: 'absolute',
                left: `${pos.x}px`,
                top: `${pos.y}px`,
                width: `${width}px`,
                height: `${height}px`,
                borderRadius: isIpad ? '20px' : '12px',
                background: pos.active 
                  ? (isMini ? 'linear-gradient(180deg, #1f1f2a, #13131c)' : '#181822')
                  : 'rgba(30, 30, 40, 0.4)',
                border: isMini ? '2px solid var(--border-primary)' : '1px solid var(--border-focus)',
                boxShadow: 'var(--shadow-md)',
                cursor: 'grab',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '14px',
                opacity: pos.active ? 1 : 0.45,
                transition: draggingId === id ? 'none' : 'transform 0.1s ease',
                zIndex: draggingId === id ? 10 : 2
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {isMini && <Monitor size={18} style={{ color: 'var(--sg-primary)' }} />}
                  {isMacBook && <Laptop size={18} style={{ color: '#64d2ff' }} />}
                  {isIpad && <Tablet size={18} style={{ color: '#ffd60a' }} />}
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {isMini ? 'Mac mini' : (isMacBook ? 'MacBook' : 'iPad')}
                  </span>
                </div>
                <span className={`chip ${pos.active ? 'chip-online' : 'chip-warning'}`} style={{ fontSize: '0.65rem', padding: '2px 8px' }}>
                  {pos.active ? 'Active' : 'Auxiliary'}
                </span>
              </div>

              {/* Screen Mock Graphic */}
              <div style={{
                flex: 1,
                margin: '8px 0',
                borderRadius: '6px',
                background: 'var(--gradient-wash-1)',
                border: '1px dashed var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.72rem',
                color: 'var(--text-muted)',
                textAlign: 'center',
                padding: '4px'
              }}>
                {pos.label}
              </div>

              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                <span>Edge Link: Enabled</span>
                <span>{pos.active ? '100% DPI' : 'Standby'}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
