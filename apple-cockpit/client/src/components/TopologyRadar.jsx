import React from 'react';
import { Monitor, Laptop, Tablet, Wifi, Zap, AlertCircle, CheckCircle2, RefreshCw, PowerOff, ShieldAlert } from 'lucide-react';

export default function TopologyRadar({ topology, onRefresh, isRefreshing }) {
  if (!topology || !topology.devices) {
    return (
      <div className="wealth-panel" style={{ padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--sg-mute)' }}>Scanning Apple local mesh...</p>
      </div>
    );
  }

  const getDeviceIcon = (type, isOnline) => {
    const iconStyle = { opacity: isOnline ? 1 : 0.45 };
    switch (type) {
      case 'mac-mini':
        return <Monitor size={22} style={{ ...iconStyle, color: isOnline ? 'var(--border-active)' : 'var(--sg-mute)' }} />;
      case 'macbook':
        return <Laptop size={22} style={{ ...iconStyle, color: isOnline ? 'var(--sg-accent-blue)' : 'var(--sg-mute)' }} />;
      case 'ipad':
        return <Tablet size={22} style={{ ...iconStyle, color: isOnline ? 'var(--sg-accent-purple)' : 'var(--sg-mute)' }} />;
      default:
        return <Monitor size={22} style={iconStyle} />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Banner */}
      <div className="wealth-panel" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <h2 className="display-2">Ecosystem Topology Radar</h2>
              <span className="live-indicator">
                <span className="live-dot" />
                Live Mesh
              </span>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--sg-mute)' }}>
              Real-time Apple Companion Link & AWDL Discovery (Bonjour mDNS Subnet: {topology.activeSubnet || '192.168.0'}.x)
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--sg-mute)' }}>Discovered Active Peers</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--sg-ink)' }}>
                {topology.onlineDevicesCount} / {topology.totalDevices} Online
              </div>
            </div>

            <button 
              onClick={onRefresh}
              disabled={isRefreshing}
              className="btn-secondary"
              style={{ padding: '0.5rem 0.9rem', fontSize: '0.82rem' }}
              title="Rescan Apple Bonjour Network"
            >
              <RefreshCw size={14} className={isRefreshing ? 'spin' : ''} />
              {isRefreshing ? 'Scanning...' : 'Rescan Mesh'}
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Devices */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {topology.devices.map((device) => {
          const isOnline = device.status === 'ONLINE';

          return (
            <div 
              key={device.id} 
              className="wealth-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '1.75rem',
                border: isOnline 
                  ? (device.isHost ? '1px solid var(--border-active)' : '1px solid var(--border-hairline)') 
                  : '1px dashed #d0d0c8',
                background: isOnline ? '#ffffff' : '#f8f8f5',
                opacity: isOnline ? 1 : 0.82,
                transition: 'all 0.2s ease'
              }}
            >
              <div>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ 
                      width: '44px', 
                      height: '44px', 
                      borderRadius: '12px', 
                      background: isOnline ? 'var(--sg-primary-pale)' : '#eaeae4', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}>
                      {getDeviceIcon(device.type, isOnline)}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: isOnline ? 'var(--sg-ink)' : 'var(--sg-mute)' }}>
                          {device.name}
                        </h3>
                        {device.isHost && (
                          <span className="badge-pill badge-alert" style={{ fontSize: '0.62rem', padding: '2px 6px' }}>
                            Host
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: '0.78rem', color: 'var(--sg-mute)', marginTop: '2px' }}>
                        {device.role}
                      </p>
                    </div>
                  </div>

                  {/* Status Pill */}
                  <span 
                    className={`badge-pill ${isOnline ? 'badge-success' : 'badge-warn'}`}
                    style={{ 
                      fontSize: '0.72rem',
                      background: isOnline ? 'rgba(34, 197, 94, 0.1)' : '#eaeae4',
                      color: isOnline ? '#16a34a' : '#787870',
                      border: isOnline ? '1px solid rgba(34, 197, 94, 0.25)' : '1px solid #dadad3'
                    }}
                  >
                    {isOnline ? (
                      <>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} />
                        Online
                      </>
                    ) : (
                      <>
                        <PowerOff size={10} />
                        Disconnected
                      </>
                    )}
                  </span>
                </div>

                {/* Status Detail & Warning Banner */}
                <div style={{ 
                  padding: '0.75rem 1rem', 
                  borderRadius: '10px', 
                  background: isOnline ? 'var(--surface-page)' : '#f0f0eb', 
                  marginBottom: '1rem',
                  border: isOnline ? '1px solid var(--border-hairline)' : '1px solid #e2e2dc',
                  fontSize: '0.8rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: isOnline ? 'var(--sg-body)' : 'var(--sg-mute)', fontWeight: 500 }}>
                    {isOnline ? <CheckCircle2 size={14} style={{ color: '#16a34a' }} /> : <AlertCircle size={14} style={{ color: '#d97706' }} />}
                    <span>{device.statusDetail}</span>
                  </div>

                  {!isOnline && device.reconnectGuide && (
                    <p style={{ marginTop: '6px', fontSize: '0.75rem', color: '#854d0e', lineHeight: 1.4 }}>
                      💡 {device.reconnectGuide}
                    </p>
                  )}
                </div>

                {/* Services List */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--sg-mute)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                    {isOnline ? 'Advertised Bonjour Services' : 'Expected Services'}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {device.services.map((srv, idx) => (
                      <span 
                        key={idx}
                        style={{
                          fontSize: '0.72rem',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: isOnline ? '#ffffff' : '#f0f0ec',
                          border: '1px solid var(--border-hairline)',
                          color: isOnline ? 'var(--sg-body)' : 'var(--sg-mute)',
                          fontWeight: 500
                        }}
                      >
                        {srv}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer Info */}
              <div style={{ 
                borderTop: '1px solid var(--border-hairline)', 
                paddingTop: '1rem', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                fontSize: '0.76rem',
                color: 'var(--sg-mute)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Wifi size={13} style={{ opacity: isOnline ? 1 : 0.4 }} />
                  <span>IP: <strong style={{ color: isOnline ? 'var(--sg-ink)' : 'inherit' }}>{device.ip}</strong></span>
                </div>

                {isOnline && device.latencyMs !== null && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#16a34a', fontWeight: 600 }}>
                    <Zap size={12} />
                    <span>{device.latencyMs}ms Ping</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
