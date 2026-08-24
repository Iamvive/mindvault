import React, { useState, useEffect, useMemo } from 'react';
import { Monitor, Laptop, Tablet, Move, Sparkles, CheckCircle2, Navigation, ArrowRight, ArrowLeft, ArrowUp, ArrowDown, ExternalLink } from 'lucide-react';

export default function DeskArrangement({ onTriggerAction }) {
  const [positions, setPositions] = useState({
    macmini: { x: 340, y: 50, label: 'Mac mini Monitor (27" 4K)', type: 'macmini', active: true, width: 260, height: 170 },
    ipad: { x: 740, y: 110, label: 'iPad Pro (Right Stand)', type: 'ipad', active: true, width: 180, height: 135 },
    macbook: { x: 40, y: 110, label: 'MacBook Pro (Left Side)', type: 'macbook', active: true, width: 230, height: 150 }
  });

  const [activePreset, setActivePreset] = useState('desk-hub');
  const [draggingId, setDraggingId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [activeDeviceFocus, setActiveDeviceFocus] = useState('macmini');
  const [cursorSimulationLog, setCursorSimulationLog] = useState('Cursor currently on Mac mini display.');

  const presets = [
    {
      id: 'desk-hub',
      name: 'Triple Desk Command Center',
      desc: 'Mac mini center 4K, MacBook left, iPad right on magnetic stand for Universal Control.',
      positions: {
        macmini: { x: 340, y: 50, label: 'Mac mini Monitor (27" 4K)', type: 'macmini', active: true, width: 260, height: 170 },
        ipad: { x: 740, y: 110, label: 'iPad Pro (Right Stand)', type: 'ipad', active: true, width: 180, height: 135 },
        macbook: { x: 40, y: 110, label: 'MacBook Pro (Left Side)', type: 'macbook', active: true, width: 230, height: 150 }
      }
    },
    {
      id: 'creative',
      name: 'Creative Studio (Sidecar & Pencil)',
      desc: 'Mac mini main display with iPad placed flat below for Apple Pencil sketching.',
      positions: {
        macmini: { x: 340, y: 20, label: 'Mac mini Monitor (Color Reference)', type: 'macmini', active: true, width: 260, height: 170 },
        ipad: { x: 380, y: 240, label: 'iPad Pro (Pencil Drawing Surface)', type: 'ipad', active: true, width: 180, height: 135 },
        macbook: { x: 40, y: 80, label: 'MacBook Pro (Auxiliary / Clamshell)', type: 'macbook', active: false, width: 230, height: 150 }
      }
    },
    {
      id: 'mobile-dual',
      name: 'Mobile Dual-Display (On The Go)',
      desc: 'MacBook Pro as primary screen with iPad connected as wireless Sidecar extended display.',
      positions: {
        macbook: { x: 260, y: 80, label: 'MacBook Pro (Primary Laptop)', type: 'macbook', active: true, width: 230, height: 150 },
        ipad: { x: 640, y: 100, label: 'iPad (Sidecar Extended Screen)', type: 'ipad', active: true, width: 180, height: 135 },
        macmini: { x: 40, y: 50, label: 'Mac mini (Headless in Studio)', type: 'macmini', active: false, width: 260, height: 170 }
      }
    }
  ];

  // Dynamic Spatial Relationship Engine
  const spatialRelations = useMemo(() => {
    const main = positions.macmini;
    const relations = [];

    // Calculate position of iPad relative to Mac mini
    const ipad = positions.ipad;
    const ipadCenterX = ipad.x + ipad.width / 2;
    const ipadCenterY = ipad.y + ipad.height / 2;
    const mainCenterX = main.x + main.width / 2;
    const mainCenterY = main.y + main.height / 2;

    const dxIpad = ipadCenterX - mainCenterX;
    const dyIpad = ipadCenterY - mainCenterY;

    let ipadDirection = 'RIGHT';
    if (Math.abs(dyIpad) > Math.abs(dxIpad)) {
      ipadDirection = dyIpad > 0 ? 'BOTTOM' : 'TOP';
    } else {
      ipadDirection = dxIpad > 0 ? 'RIGHT' : 'LEFT';
    }

    relations.push({
      targetId: 'ipad',
      name: 'iPad Pro',
      direction: ipadDirection,
      description: `Push mouse through ${ipadDirection} edge of Mac mini screen to reach iPad Pro`
    });

    // Calculate position of MacBook relative to Mac mini
    const macbook = positions.macbook;
    const mbCenterX = macbook.x + macbook.width / 2;
    const mbCenterY = macbook.y + macbook.height / 2;

    const dxMb = mbCenterX - mainCenterX;
    const dyMb = mbCenterY - mainCenterY;

    let mbDirection = 'LEFT';
    if (Math.abs(dyMb) > Math.abs(dxMb)) {
      mbDirection = dyMb > 0 ? 'BOTTOM' : 'TOP';
    } else {
      mbDirection = dxMb > 0 ? 'RIGHT' : 'LEFT';
    }

    relations.push({
      targetId: 'macbook',
      name: 'MacBook Pro',
      direction: mbDirection,
      description: `Push mouse through ${mbDirection} edge of Mac mini screen to reach MacBook Pro`
    });

    return relations;
  }, [positions]);

  const applyPreset = (preset) => {
    setActivePreset(preset.id);
    setPositions(preset.positions);
    setActiveDeviceFocus('macmini');
    setCursorSimulationLog(`Layout updated to "${preset.name}". Recalculated dynamic edge transitions.`);
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
    const newX = Math.max(15, Math.min(canvasRect.width - 250, e.clientX - dragOffset.x));
    const newY = Math.max(15, Math.min(canvasRect.height - 180, e.clientY - dragOffset.y));

    setPositions((prev) => ({
      ...prev,
      [draggingId]: { ...prev[draggingId], x: newX, y: newY }
    }));
    setActivePreset('custom');
  };

  const handleMouseUp = () => {
    if (draggingId) {
      setCursorSimulationLog(`Custom screen placement saved! Mouse boundaries updated dynamically.`);
    }
    setDraggingId(null);
  };

  const navigateToDevice = (targetId, directionName) => {
    setActiveDeviceFocus(targetId);
    const targetName = targetId === 'ipad' ? 'iPad Pro' : (targetId === 'macbook' ? 'MacBook Pro' : 'Mac mini');
    setCursorSimulationLog(`➡️ Pushed through ${directionName} edge of monitor → Active on ${targetName}!`);
  };

  const getDirectionIcon = (dir) => {
    switch (dir) {
      case 'RIGHT': return <ArrowRight size={14} />;
      case 'LEFT': return <ArrowLeft size={14} />;
      case 'BOTTOM': return <ArrowDown size={14} />;
      case 'TOP': return <ArrowUp size={14} />;
      default: return <ArrowRight size={14} />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Header & Presets */}
      <div className="wealth-panel" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h2 className="display-2">Desk & Display Studio (Dynamic Edge Engine)</h2>
            <p style={{ marginTop: '2px', fontSize: '0.88rem', color: 'var(--sg-mute)' }}>
              Drag any screen to customize its physical position. Mouse navigation boundaries calculate dynamically in real-time.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={() => onTriggerAction && onTriggerAction('open-displays')}
              className="btn-secondary"
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.9rem' }}
              title="Open macOS System Settings > Displays to match arrangement"
            >
              <ExternalLink size={13} />
              Open macOS Displays Settings
            </button>
            <span className="badge-pill badge-alert">
              <Sparkles size={12} />
              Live Edge Calibrator
            </span>
          </div>
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

      {/* Dynamic Spatial Arrangement Canvas */}
      <div 
        className="wealth-panel" 
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          height: '460px',
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
          <Move size={14} /> Drag screens anywhere — mouse navigation edge indicators update dynamically!
        </div>

        {/* Dynamic Edge Indicator Labels on Canvas */}
        {spatialRelations.map((rel) => (
          <div
            key={rel.targetId}
            style={{
              position: 'absolute',
              top: '16px',
              right: rel.targetId === 'ipad' ? '20px' : '200px',
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              background: '#ffffff',
              border: '1px solid var(--border-hairline)',
              fontSize: '0.72rem',
              fontWeight: 600,
              color: 'var(--sg-body)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: 'var(--shadow-subtle)'
            }}
          >
            {getDirectionIcon(rel.direction)}
            <span>{rel.name}: {rel.direction} Edge</span>
          </div>
        ))}

        {/* Renderable Screen Boxes */}
        {Object.entries(positions).map(([id, pos]) => {
          const isMini = pos.type === 'macmini';
          const isMacBook = pos.type === 'macbook';
          const isIpad = pos.type === 'ipad';
          const hasCursorFocus = activeDeviceFocus === id;

          return (
            <div
              key={id}
              onMouseDown={(e) => handleMouseDown(e, id)}
              style={{
                position: 'absolute',
                left: `${pos.x}px`,
                top: `${pos.y}px`,
                width: `${pos.width}px`,
                height: `${pos.height}px`,
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
                transition: draggingId === id ? 'none' : 'all 0.15s ease',
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
                  {hasCursorFocus ? '🎯 Mouse Active' : (pos.active ? 'Linked' : 'Aux')}
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
                <span>Coordinates: ({Math.round(pos.x)}, {Math.round(pos.y)})</span>
                <span style={{ fontWeight: 600, color: 'var(--sg-ink)' }}>{pos.active ? 'Ready' : 'Standby'}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dynamic Directional Navigation Bar (Calculates based on where you dropped screens!) */}
      <div className="wealth-panel" style={{ padding: '1.5rem 2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Navigation size={16} style={{ color: 'var(--border-active)' }} />
              <h3 style={{ fontSize: '0.98rem', fontWeight: 700 }}>Dynamic Mouse Navigation Controls (Auto-Calculated)</h3>
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--sg-body)' }}>
              {cursorSimulationLog}
            </p>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            <button 
              onClick={() => navigateToDevice('macmini', 'CENTER')}
              className={`btn-secondary ${activeDeviceFocus === 'macmini' ? 'active' : ''}`}
              style={{ fontSize: '0.82rem', padding: '0.45rem 1rem' }}
            >
              Center (Mac mini)
            </button>

            {spatialRelations.map((rel) => (
              <button
                key={rel.targetId}
                onClick={() => navigateToDevice(rel.targetId, rel.direction)}
                className={`btn-primary ${activeDeviceFocus === rel.targetId ? 'active' : ''}`}
                style={{ fontSize: '0.82rem', padding: '0.45rem 1rem' }}
              >
                {getDirectionIcon(rel.direction)}
                Push {rel.direction} → {rel.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
