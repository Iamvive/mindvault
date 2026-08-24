import React, { useState } from 'react';
import { Monitor, Laptop, Tablet, Move, Sparkles, CheckCircle2, Navigation, ArrowRight, ArrowLeft } from 'lucide-react';

export default function DeskArrangement() {
  const [positions, setPositions] = useState({
    macmini: { x: 340, y: 50, label: 'Mac mini Monitor (27" 4K)', type: 'macmini', active: true },
    ipad: { x: 740, y: 110, label: 'iPad Pro (Right Stand)', type: 'ipad', active: true },
    macbook: { x: 40, y: 110, label: 'MacBook Pro (Left Side)', type: 'macbook', active: true }
  });

  const [activePreset, setActivePreset] = useState('desk-hub');
  const [draggingId, setDraggingId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [activeDeviceFocus, setActiveDeviceFocus] = useState('macmini');
  const [cursorSimulationLog, setCursorSimulationLog] = useState('Cursor currently centered on Mac mini display.');

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
        ipad: { x: 340, y: 230, label: 'iPad Pro (Pencil Drawing Surface)', type: 'ipad', active: true },
        macbook: { x: 40, y: 80, label: 'MacBook Pro (Auxiliary / Clamshell)', type: 'macbook', active: false }
      }
    },
    {
      id: 'mobile-dual',
      name: 'Mobile Dual-Display (On The Go)',
      desc: 'MacBook Pro as primary screen with iPad connected as wireless Sidecar extended display.',
      positions: {
        macbook: { x: 260, y: 80, label: 'MacBook Pro (Primary Laptop)', type: 'macbook', active: true },
        ipad: { x: 640, y: 100, label: 'iPad (Sidecar Extended Screen)', type: 'ipad', active: true },
        macmini: { x: 40, y: 50, label: 'Mac mini (Headless in Studio)', type: 'macmini', active: false }
      }
    }
  ];

  const applyPreset = (preset) => {
    setActivePreset(preset.id);
    setPositions(preset.positions);
    setActiveDeviceFocus('macmini');
    setCursorSimulationLog(`Preset applied: ${preset.name}. Cursor on primary screen.`);
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

  const testMoveDirection = (direction) => {
    if (direction === 'RIGHT') {
      setActiveDeviceFocus('ipad');
      setCursorSimulationLog('➡️ Pushed through RIGHT edge of Mac mini monitor → Cursor crossed over to iPad Pro!');
    } else if (direction === 'LEFT') {
      setActiveDeviceFocus('macbook');
      setCursorSimulationLog('⬅️ Pushed through LEFT edge of Mac mini monitor → Cursor crossed over to MacBook Pro!');
    } else if (direction === 'CENTER') {
      setActiveDeviceFocus('macmini');
      setCursorSimulationLog('🎯 Cursor returned to center on Mac mini display.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Preset Selector */}
      <div className="wealth-panel" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h2 className="display-2">Desk & Display Studio</h2>
            <p style={{ marginTop: '2px', fontSize: '0.88rem', color: 'var(--sg-mute)' }}>
              Arrange your physical workspace to optimize Universal Control edge transitions and Sidecar positioning
            </p>
          </div>
          <span className="badge-pill badge-alert">
            <Sparkles size={12} />
            Spatial Canvas
          </span>
        </div>

        {/* Presets Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {presets.map((preset) => (
            <div
              key={preset.id}
              onClick={() => applyPreset(preset)}
              className="wealth-card"
              style={{
                padding: '1.25rem',
                cursor: 'pointer',
                border: activePreset === preset.id ? '1px solid var(--border-active)' : '1px solid var(--border-hairline)',
                background: activePreset === preset.id ? 'var(--sg-primary-pale)' : '#ffffff'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--sg-ink)' }}>{preset.name}</h4>
                {activePreset === preset.id && (
                  <CheckCircle2 size={16} style={{ color: 'var(--border-active)' }} />
                )}
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--sg-body)', lineHeight: 1.4 }}>{preset.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Desk Canvas */}
      <div 
        className="wealth-panel" 
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          height: '440px',
          position: 'relative',
          background: 'linear-gradient(180deg, #fcfcfb 0%, #f4f4f0 100%)',
          overflow: 'hidden',
          cursor: draggingId ? 'grabbing' : 'default',
          userSelect: 'none'
        }}
      >
        {/* Subtle Grid */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(rgba(0, 0, 0, 0.06) 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }} />

        {/* Desk Surface Marker */}
        <div style={{
          position: 'absolute',
          bottom: '24px',
          left: '30px',
          right: '30px',
          height: '2px',
          background: 'linear-gradient(90deg, transparent, var(--border-hairline), transparent)',
          borderRadius: 'var(--radius-full)'
        }} />

        <div style={{
          position: 'absolute',
          top: '16px',
          left: '20px',
          fontSize: '0.78rem',
          color: 'var(--sg-mute)',
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
          const hasCursorFocus = activeDeviceFocus === id;

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
                borderRadius: isIpad ? '16px' : '12px',
                background: hasCursorFocus ? '#ffffff' : (pos.active ? '#fafafa' : '#f0f0ec'),
                border: hasCursorFocus ? '2px solid var(--border-active)' : '1px solid var(--border-hairline)',
                boxShadow: hasCursorFocus ? '0 10px 30px rgba(230, 0, 35, 0.15)' : (pos.active ? '0 8px 24px rgba(0, 0, 0, 0.04)' : 'none'),
                cursor: 'grab',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '12px',
                opacity: pos.active ? 1 : 0.6,
                transition: draggingId === id ? 'none' : 'all 0.2s ease',
                zIndex: hasCursorFocus ? 15 : (draggingId === id ? 10 : 2)
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {isMini && <Monitor size={16} style={{ color: 'var(--border-active)' }} />}
                  {isMacBook && <Laptop size={16} style={{ color: 'var(--sg-accent-blue)' }} />}
                  {isIpad && <Tablet size={16} style={{ color: 'var(--sg-accent-purple)' }} />}
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--sg-ink)' }}>
                    {isMini ? 'Mac mini' : (isMacBook ? 'MacBook' : 'iPad')}
                  </span>
                </div>
                <span className={`badge-pill ${hasCursorFocus ? 'badge-alert' : (pos.active ? 'badge-success' : 'badge-warn')}`} style={{ fontSize: '0.62rem', padding: '2px 6px' }}>
                  {hasCursorFocus ? '🎯 Mouse Active' : (pos.active ? 'Connected' : 'Aux')}
                </span>
              </div>

              {/* Screen Mock Frame */}
              <div style={{
                flex: 1,
                margin: '8px 0',
                borderRadius: '8px',
                background: hasCursorFocus ? 'var(--sg-primary-pale)' : 'var(--surface-card)',
                border: hasCursorFocus ? '1px solid var(--border-active)' : '1px dashed var(--border-glow)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.72rem',
                color: hasCursorFocus ? 'var(--border-active)' : 'var(--sg-mute)',
                fontWeight: hasCursorFocus ? 700 : 400,
                textAlign: 'center',
                padding: '4px'
              }}>
                {pos.label}
              </div>

              <div style={{ fontSize: '0.68rem', color: 'var(--sg-mute)', display: 'flex', justifyContent: 'space-between' }}>
                <span>Edge Link: Enabled</span>
                <span style={{ fontWeight: 600, color: 'var(--sg-ink)' }}>{pos.active ? '100% DPI' : 'Standby'}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Navigation Simulator Toolbar */}
      <div className="wealth-panel" style={{ padding: '1.5rem 2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Navigation size={16} style={{ color: 'var(--border-active)' }} />
              <h3 style={{ fontSize: '0.98rem', fontWeight: 700 }}>Interactive Mouse Edge Navigation Tester</h3>
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--sg-mute)' }}>
              {cursorSimulationLog}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={() => testMoveDirection('LEFT')}
              className="btn-secondary"
              style={{ fontSize: '0.82rem', padding: '0.45rem 1rem' }}
            >
              <ArrowLeft size={14} />
              Move Left (to MacBook)
            </button>
            <button 
              onClick={() => testMoveDirection('CENTER')}
              className="btn-secondary"
              style={{ fontSize: '0.82rem', padding: '0.45rem 1rem' }}
            >
              Center (Mac mini)
            </button>
            <button 
              onClick={() => testMoveDirection('RIGHT')}
              className="btn-primary"
              style={{ fontSize: '0.82rem', padding: '0.45rem 1rem' }}
            >
              Move Right (to iPad)
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
