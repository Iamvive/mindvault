import React from 'react';
import { Monitor, Laptop, Tablet, ExternalLink, Zap } from 'lucide-react';

export default function TopologyRadar({ topology, hostInfo, onTriggerAction }) {
  const devices = topology?.devices || [
    { id: 'mac-mini', name: 'Mac mini (Workstation)', type: 'mac-mini', role: 'Desk Anchor & Compute Engine', isHost: true, ip: '192.168.1.102', status: 'ONLINE', services: ['Screen Sharing (5900)', 'AirPlay Receiver', 'Handoff'], latencyMs: 0 },
    { id: 'macbook', name: 'MacBook Pro / Air', type: 'macbook', role: 'Portable Twin', isHost: false, ip: '192.168.1.105', status: 'ONLINE', services: ['Handoff', 'Universal Control', 'AirDrop'], latencyMs: 3 },
    { id: 'ipad', name: 'iPad Pro / Air', type: 'ipad', role: 'Touch / Stylus Companion', isHost: false, ip: '192.168.1.110', status: 'ONLINE', services: ['Sidecar Target', 'Universal Control', 'Apple Pencil'], latencyMs: 5 }
  ];

  const getDeviceIcon = (type) => {
    switch (type) {
      case 'mac-mini':
        return <Monitor size={24} style={{ color: 'var(--border-active)' }} />;
      case 'macbook':
        return <Laptop size={24} style={{ color: 'var(--sg-accent-blue)' }} />;
      case 'ipad':
        return <Tablet size={24} style={{ color: 'var(--sg-accent-purple)' }} />;
      default:
        return <Monitor size={24} />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Visual Radar Container */}
      <div className="wealth-panel" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 className="display-2">Live Ecosystem Radar</h2>
            <p style={{ marginTop: '4px', fontSize: '0.88rem', color: 'var(--sg-mute)' }}>
              Active Bonjour mesh & peer continuity across your 3 personal Apple devices
            </p>
          </div>
          <span className="badge-pill badge-success">
            <span className="live-dot" style={{ backgroundColor: 'var(--sg-success)' }} />
            3 Devices Linked
          </span>
        </div>

        {/* Device Cards Grid */}
        <div className="grid-3">
          {devices.map((device) => (
            <div 
              key={device.id} 
              className="wealth-card" 
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: device.isHost ? '1px solid var(--border-active)' : '1px solid var(--border-hairline)',
                background: device.isHost ? 'linear-gradient(180deg, var(--sg-primary-pale) 0%, #ffffff 100%)' : '#ffffff'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '12px',
                    background: 'var(--surface-card)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid var(--border-glow)'
                  }}>
                    {getDeviceIcon(device.type)}
                  </div>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    {device.isHost && (
                      <span className="badge-pill badge-alert" style={{ fontSize: '0.65rem' }}>Host</span>
                    )}
                    <span className="badge-pill badge-success" style={{ fontSize: '0.65rem' }}>
                      {device.latencyMs === 0 ? '0 ms' : `${device.latencyMs} ms`}
                    </span>
                  </div>
                </div>

                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '4px' }}>{device.name}</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--sg-mute)', marginBottom: '1.25rem' }}>{device.role}</p>

                {/* Network Specs */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  padding: '12px 14px',
                  background: 'var(--surface-card)',
                  borderRadius: '12px',
                  fontSize: '0.82rem',
                  marginBottom: '1.25rem',
                  border: '1px solid var(--border-glow)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--sg-mute)' }}>Local IP:</span>
                    <span style={{ fontWeight: 600, color: 'var(--sg-ink)' }}>{device.ip}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--sg-mute)' }}>Subnet:</span>
                    <span style={{ color: 'var(--sg-body)' }}>255.255.255.0</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--sg-mute)' }}>Protocol:</span>
                    <span style={{ color: 'var(--sg-success)', fontWeight: 600 }}>AWDL / Bonjour</span>
                  </div>
                </div>

                {/* Active Services Badges */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '1.25rem' }}>
                  {device.services.map((svc, i) => (
                    <span key={i} className="badge-pill" style={{
                      background: '#f1f1ed',
                      color: 'var(--sg-body)',
                      border: '1px solid var(--border-glow)',
                      fontSize: '0.68rem'
                    }}>
                      {svc}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ paddingTop: '1rem', borderTop: '1px dashed var(--border-hairline)', display: 'flex', gap: '8px' }}>
                {device.type === 'mac-mini' ? (
                  <button 
                    onClick={() => onTriggerAction('launch-screenshare')}
                    className="btn-primary" 
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    <ExternalLink size={14} />
                    Remote Screen Share
                  </button>
                ) : (
                  <button 
                    onClick={() => onTriggerAction('clipboard-ping')}
                    className="btn-secondary" 
                    style={{ width: '100%', justifyContent: 'center' }}
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
