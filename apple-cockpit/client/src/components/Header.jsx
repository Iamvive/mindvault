import React from 'react';
import { Radio, RefreshCw, Layers, Layout, Activity, BookOpen, Zap } from 'lucide-react';

export default function Header({ 
  activeTab, 
  setActiveTab, 
  hostInfo, 
  diagnostics, 
  isConnected, 
  isRefreshing, 
  onRefresh 
}) {
  const score = diagnostics?.score ?? 100;
  const isHealthy = score >= 85;
  const isDegraded = score >= 60 && score < 85;

  const tabs = [
    { id: 'radar', label: 'Ecosystem Radar', icon: Radio },
    { id: 'desk', label: 'Desk Studio', icon: Layout },
    { id: 'diagnostics', label: 'Diagnostics & Fix', icon: Activity, badge: !isHealthy ? '!' : null },
    { id: 'playbook', label: 'Master Playbook', icon: BookOpen },
    { id: 'dock', label: 'Quick Dock', icon: Zap }
  ];

  return (
    <header style={{
      marginBottom: '28px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    }}>
      {/* Top Banner */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <img 
            src="/app-icon.jpg" 
            alt="Apple Ecosystem Cockpit Icon" 
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '13px',
              objectFit: 'cover',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-sm)'
            }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1>Apple Ecosystem Cockpit</h1>
              <span className="chip chip-primary" style={{ fontSize: '0.7rem' }}>
                {hostInfo?.deviceType ? `Host: ${hostInfo.deviceType}` : 'Host: macOS'}
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', marginTop: '2px' }}>
              Seamless Orchestration for Mac mini • MacBook • iPad
            </p>
          </div>
        </div>

        {/* Global Health & Live Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Sync Status Badge */}
          <div className="glass-card" style={{
            padding: '8px 16px',
            borderRadius: 'var(--radius-full)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.85rem'
          }}>
            <div className={`status-dot ${isConnected ? 'pulsing' : ''}`} style={{
              backgroundColor: isConnected ? (isHealthy ? 'var(--status-online)' : (isDegraded ? 'var(--status-warn)' : 'var(--status-fail)')) : 'var(--text-muted)'
            }} />
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
              {isConnected ? `${score}% Ecosystem Health` : 'Offline Mode'}
            </span>
          </div>

          {/* Refresh Button */}
          <button 
            onClick={onRefresh}
            disabled={isRefreshing}
            className="btn-secondary"
            style={{ borderRadius: 'var(--radius-full)', padding: '8px 14px' }}
            title="Refresh Diagnostics & Services"
          >
            <RefreshCw size={15} style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }} />
            <span>{isRefreshing ? 'Auditing...' : 'Sync'}</span>
          </button>
        </div>
      </div>

      {/* Navigation Pill Bar */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px',
        background: 'var(--bg-glass)',
        borderRadius: 'var(--radius-full)',
        border: '1px solid var(--border-subtle)',
        overflowX: 'auto'
      }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 20px',
                borderRadius: 'var(--radius-full)',
                border: 'none',
                background: isActive ? 'var(--sg-primary)' : 'transparent',
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.88rem',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                whiteSpace: 'nowrap',
                position: 'relative'
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span style={{
                  position: 'absolute',
                  top: '6px',
                  right: '8px',
                  width: '7px',
                  height: '7px',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--status-warn)'
                }} />
              )}
            </button>
          );
        })}
      </nav>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </header>
  );
}
