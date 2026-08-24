import React from 'react';
import { Monitor, Laptop, Tablet, Wifi, Bluetooth, Zap, ExternalLink, ShieldCheck } from 'lucide-react';

export default function TopologyRadar({ topology, hostInfo, onTriggerAction }) {
  const devices = topology?.devices || [
    { id: 'mac-mini', name: 'Mac mini (Workstation)', type: 'mac-mini', role: 'Desk Anchor & Compute Engine', isHost: true, ip: '192.168.1.102', status: 'ONLINE', services: ['Screen Sharing', 'AirPlay Receiver', 'Handoff'], latencyMs: 0 },
    { id: 'macbook', name: 'MacBook Pro / Air', type: 'macbook', role: 'Portable Twin', isHost: false, ip: '192.168.1.105', status: 'ONLINE', services: ['Handoff', 'Universal Control', 'AirDrop'], latencyMs: 3 },
    { id: 'ipad', name: 'iPad Pro / Air', type: 'ipad', role: 'Touch / Stylus Companion', isHost: false, ip: '192.168.1.110', status: 'ONLINE', services: ['Sidecar Target', 'Universal Control', 'Apple Pencil'], latencyMs: 5 }
  ];

  const getDeviceIcon = (type) => {
    switch (type) {
      case 'mac-mini':
        return <Monitor size={28} style={{ color: 'var(--text-primary)' }} />;
      case 'macbook':
        return <Laptop size={28} style={{ color: 'var(--text-primary)' }} />;
      case 'ipad':
        return <Tablet size={28} style={{ color: 'var(--text-primary)' }} />;
      default:
        return <Monitor size={28} />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Visual Radar Banner */}
      <div className="glass-panel" style={{
        padding: '32px',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(180deg, rgba(28, 28, 36, 0.8) 0%, rgba(18, 18, 24, 0.9) 100%)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <h2 className="display-2">Live Ecosystem Radar</h2>
            <p style={{ marginTop: '4px' }}>
              Active Bonjour mesh & peer continuity across your 3 personal Apple devices
            </p>
          </div>
          <span className="chip chip-online">
            <span className="status-dot pulsing" />
            3 Devices Linked
          </span>
        </div>

        {/* Device Cards Grid */}
        <div className="grid-3" style={{ position: 'relative', zIndex: 2 }}>
          {devices.map((device) => (
            <div 
              key={device.id} 
              className="glass-card" 
              style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: device.isHost ? '1px solid var(--border-primary)' : '1px solid var(--border-subtle)',
                background: device.isHost ? 'linear-gradient(145deg, rgba(230, 0, 35, 0.06), rgba(28, 28, 36, 0.8))' : 'var(--bg-glass-card)'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--gradient-wash-2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid var(--border-subtle)'
                  }}>
                    {getDeviceIcon(device.type)}
                  </div>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    {device.isHost && (
                      <span className="chip chip-primary" style={{ fontSize: '0.68rem' }}>Host</span>
                    )}
                    <span className="chip chip-online" style={{ fontSize: '0.68rem' }}>
                      {device.latencyMs === 0 ? '0 ms' : `${device.latencyMs} ms`}
                    </span>
                  </div>
                </div>

                <h3 style={{ fontSize: '1.2rem', marginBottom: '4px' }}>{device.name}</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '16px' }}>{device.role}</p>

                {/* Network & Specs details */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  padding: '12px',
                  background: 'var(--gradient-wash-1)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.82rem',
                  marginBottom: '16px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Local IP:</span>
                    <span style={{ fontFamily: 'var(--font-family)', fontWeight: 500 }}>{device.ip}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Subnet:</span>
                    <span>255.255.255.0</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Protocol:</span>
                    <span style={{ color: 'var(--status-online)' }}>AWDL / Bonjour</span>
                  </div>
                </div>

                {/* Active Services Badges */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                  {device.services.map((svc, i) => (
                    <span key={i} style={{
                      fontSize: '0.72rem',
                      padding: '3px 8px',
                      borderRadius: 'var(--radius-full)',
                      background: 'var(--gradient-wash-2)',
                      color: 'var(--text-secondary)',
                      border: '1px solid var(--border-subtle)'
                    }}>
                      {svc}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ paddingTop: '12px', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: '8px' }}>
                {device.type === 'mac-mini' ? (
                  <button 
                    onClick={() => onTriggerAction('launch-screenshare')}
                    className="btn-primary" 
                    style={{ width: '100%', justifyContent: 'center', fontSize: '0.82rem', padding: '8px 12px' }}
                  >
                    <ExternalLink size={14} />
                    Remote Screen Share
                  </button>
                ) : (
                  <button 
                    onClick={() => onTriggerAction('clipboard-ping')}
                    className="btn-secondary" 
                    style={{ width: '100%', justifyContent: 'center', fontSize: '0.82rem', padding: '8px 12px' }}
                  >
                    <Zap size={14} />
                    Test Ping Link
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
